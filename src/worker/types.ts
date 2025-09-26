export interface Note {
    id: string;
    text: string;
    author?: string;
    votes?: number;
    ts: number;
}