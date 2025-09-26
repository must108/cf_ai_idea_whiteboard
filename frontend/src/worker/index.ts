import { Ai, D1Database, DurableObjectNamespace, VectorizeIndex } from "@cloudflare/workers-types/experimental"

export interface Env {
    ROOM_DO: DurableObjectNamespace;
    DB: D1Database;
    VECTORIZE: VectorizeIndex;
    AI: Ai;
}

