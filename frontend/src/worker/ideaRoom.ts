import { VectorizeIndex, Ai, DurableObjectState, WebSocketPair } from "@cloudflare/workers-types/experimental";

export interface Env {
    VECTORIZE: VectorizeIndex;
    AI: Ai
}

export interface Note {
    id: string;
    text: string;
    author?: string;
    votes?: number;
    ts: number;
}

const EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";

export class IdeaRoom {
    private state: DurableObjectState;
    private env: Env;
    private sockets: WebSocket[] = [];
    private lastSummary: string | null = null;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);

        if (url.pathname === "/join" && req.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

            await this.handleSocket(server);
            return new Response(null, { status: 101, webSocket: client});
        }
        
        if (url.pathname === "/state" && req.method === "GET") {
            const notes = await this.listNotes();
        
            return Response.json({ notes, summary: this.lastSummary });
        }

        if (url.pathname === "/summary" && req.method === "POST") {
            const body = (await req.json()) as { text: string };

            this.lastSummary = body.text ?? "";
            this.broadcast({ type: "summary", text: this.lastSummary });

            return new Response("ok");
        }

        return new Response("Not found", { status: 404 });
    }

    private async handleSocket(server: WebSocket) {
        server.accept();
        this.sockets.push(server);

        const notes = await this.listNotes();
        server.send(JSON.stringify({ type: "init", notes, summary: this.lastSummary }));

        server.addEventListener("message", async (e: MessageEvent) => {
            try {
                const msg = JSON.parse(e.data as string);
                if (msg.type === "note" && typeof msg.text === "string") {
                    const note: Note = {
                        id: crypto.randomUUID(),
                        text: msg.text,
                        author: (msg.author as string) ?? "anon",
                        votes: 0,
                        ts: Date.now(),
                    };

                    await this.state.storage.put(`note:${note.id}`, note);

                    await this.embedAndUpsert(note);

                    this.broadcast({ type: "note", ...note });
                }

                if (msg.type === "vote" && typeof msg.id === "string") {
                    const note = (await this.state.storage.get<Note>(`note:${msg.id}`));

                    if (note) {
                        note.votes = (note.votes ?? 0) + 1;
                        await this.state.storage.put(`note:${note.id}`, note);

                        this.broadcast({ type: "vote", id: note.id, votes: note.votes });
                    }
                }
            } catch (e) {}
        });

        server.addEventListener("close", () => {
            this.sockets = this.sockets.filter(s => s !== server);
        });
    }

    private broadcast(payload: unknown) {
        const data = JSON.stringify(payload);

        for (const ws of this.sockets) {
            try {
                ws.send(data);
            } catch {}
        }
    }

    private async listNotes(): Promise<Note[]> {
        const list = await this.state.storage.list<Note>({ prefix: "note:" });
        const resultingList = [...list.values()].sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
        
        return resultingList;
    }

    private async embedAndUpsert(note: Note) {
        try {
            const emb = await this.env.AI.run(EMBED_MODEL, { text: note.text });
            
            const values = emb?.data?.[0]?.embedding || emb?.data?.[0] || emb?.embedding || emb;

            await this.env.VECTORIZE.upsert([
                {
                    id: note.id,
                    values,
                    metadata: {
                        author: note.author ?? "anon",
                        ts: note.ts,
                        votes: note.votes ?? 0,
                    },
                },
            ]);
        } catch (e) {}
    }
}