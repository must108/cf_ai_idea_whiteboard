import type { Env } from ".";
import type { Note } from "./ideaRoom";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

type ChatResponse =
  | { response: string }
  | { result: { response?: string } }
  | { output_text?: string };    

function pickResponse(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const o = x as { response?: string; result?: { response?: string }; output_text?: string };
    if (o.response) return o.response;
    if (o.result?.response) return o.result.response;
    if (o.output_text) return o.output_text;
  }
  return "Summary unavailable.";
}

export async function summarizeRoom(env: Env, roomId: string, notes: Note[]): Promise<string> {
    if (!notes.length) {
        return "No ideas yet...";
    }

    const bulletList = notes
        .map(n => `- ${sanitize(n.text)} (votes: ${n.votes ?? 0})`)
        .join("\n");

    const system = `You are an expert facilitator. 
        Cluster ideas into 3-6 themes with short titles, then list
        the top actionable next steps. Keep it under 180 words.`;
    const user = `Room: ${roomId}\nIdeas:\n${bulletList}`;

    const res: ChatResponse = (await env.AI.run(CHAT_MODEL, {
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        max_tokens: 320,
        temperature: 0.2
    })) as unknown as ChatResponse;

    const text = pickResponse(res);
    return text.trim();
}

function sanitize(s: string) {
    return s.replace(/\s_/g, " ").slice(0, 500);
}