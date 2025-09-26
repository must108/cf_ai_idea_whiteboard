export type Note = {
  id: string;
  text: string;
  author?: string;
  votes?: number;
  ts: number;
};

export function isNote(x: unknown): x is Note {
  return !!x
    && typeof (x as Record<string, unknown>).id === "string"
    && typeof (x as Record<string, unknown>).text === "string"
    && typeof (x as Record<string, unknown>).ts === "number";
}
