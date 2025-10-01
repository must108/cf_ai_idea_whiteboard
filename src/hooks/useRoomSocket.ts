"use client";

import { useEffect, useRef, useState } from "react";
import { Note } from "../types/note";

export function useRoomSocket(room: string) {
    const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected");
    const [notes, setNotes] = useState<Note[]>([]);
    const [summary, setSummary] = useState<string>("");

    const wsRef = useRef<WebSocket | null>(null);
    const ENV_ORIGIN = (process.env.NEXT_PUBLIC_WORKER_ORIGIN || "").trim();

    useEffect(() => {
        const httpBase =
        ENV_ORIGIN && /^https?:\/\//i.test(ENV_ORIGIN)
            ? ENV_ORIGIN
            : (typeof window !== "undefined" ? window.location.origin : "");

        const u = new URL("/join", httpBase);
        u.searchParams.set("room", room);
        u.protocol = u.protocol.replace(/^http/i, "ws");
        const url = u.toString();

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setStatus("connected");
        ws.onclose = () => setStatus("disconnected");
        ws.onerror = () => setStatus("error");

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);

                if (msg.type === "init") {
                    setNotes(msg.notes ?? []);
                } else if (msg.type === "note") {
                    setNotes((prev) => [{ ...msg } as Note, ...prev]);
                } else if (msg.type === "summary") {
                    setSummary(msg.text ?? "");
                } else if (msg.type === "vote") {
                    setNotes((prev) => prev.map((n: Note) => n.id === msg.id ? { ...n, votes: msg.votes }: n));
                }
            } catch (err) {
                console.error("WS message error", err);
            }
        };
        
        return () => { 
            try {
                ws.close(); 
            } catch {} 
        };
    }, [room, ENV_ORIGIN]);

    const sendNote = (text: string, author?: string) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }

        ws.send(JSON.stringify({ type: "note", text, author: author ?? "anon"}));
    };

    return { status, notes, summary, setSummary, sendNote };
}