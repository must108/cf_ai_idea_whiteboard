import type {
  ExportedHandler,
  Request as CfRequest,
  Response as CfResponse,
  DurableObjectNamespace,
  D1Database,
} from "@cloudflare/workers-types";
import type { VectorizeIndex, Ai } from "@cloudflare/workers-types";
import { summarizeRoom } from "./summarize";
import type { Note } from "./types";
export { IdeaRoom } from "./ideaRoom";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export interface Env {
  ROOM_DO: DurableObjectNamespace;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
}

const worker: ExportedHandler<Env> = {

  async fetch(req: CfRequest, env: Env): Promise<CfResponse> {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/{2,}/g, "/");
    const room = url.searchParams.get("room") || "default";

    if (pathname === "/join") {
      const id = env.ROOM_DO.idFromName(room);
      const stub = env.ROOM_DO.get(id);

      return (await stub.fetch(req)) as CfResponse;
    }

    if (pathname === "/workflow/summarize" && req.method === "OPTIONS") {
      return new Response(null, { headers: CORS }) as unknown as CfResponse;
    }

    if (pathname === "/workflow/summarize" && req.method === "POST") {      const id = env.ROOM_DO.idFromName(room);
      const stub = env.ROOM_DO.get(id);

      const stateUrl = new URL("/state", url).toString();
      const stateRes = await stub.fetch(stateUrl, { method: "GET" });
      if (!stateRes.ok) {
        return new Response("Failed to fetch room state", { status: 500, headers: CORS }) as unknown as CfResponse;
      }
      const { notes } = (await stateRes.json()) as { notes: Note[] };

      const summary = await summarizeRoom(env, room, notes);

      await env.DB.prepare(
        "INSERT INTO summaries (room_id, summary) VALUES (?, ?)"
      ).bind(room, summary).run();

      const summaryUrl = new URL("/summary", url).toString();
      await stub.fetch(summaryUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: summary }),
      });

      return new Response(JSON.stringify({ summary }), {
        headers: { "content-type": "application/json", ...CORS },
      }) as unknown as CfResponse;
    }

    return new Response("Not found", { status: 404, headers: CORS }) as unknown as CfResponse;
  },
};

export default worker;
