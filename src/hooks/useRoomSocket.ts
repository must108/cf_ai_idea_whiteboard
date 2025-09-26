"use client";

import { useEffect, useRef, useState } from "react";
import { Note } from "@/types/note";

export function useRoomSocket(room: string) {
    const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected");
    const [notes, setNotes] = useState<Note[]>([]);
    const [summary, setSummary] = useState<string>("");

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const proto = typeof window !== "undefined" && window.location.protocol == "https:" ? "wss:" : "ws:";
        const url = `${proto}//${window.location.host}/join?room=${encodeURIComponent(room)}`;

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
                    setNotes((prev) => [{ id: crypto.randomUUID(), votes: 0, ...msg}, ...prev]);
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
    }, [room]);

    const sendNote = (text: string, author?: string) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== 1) {
            return;
        }

        ws.send(JSON.stringify({ type: "note", text, author: author ?? "anon"}));
    };

    return { status, notes, summary, setSummary, sendNote };
}