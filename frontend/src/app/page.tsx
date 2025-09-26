"use client";

import React, { useMemo, useState } from "react";
import { Pill } from "@/components/Pill";
import { NoteCard } from "@/components/NoteCard";
import { useRoomSocket } from "@/hooks/useRoomSocket";

export default function Page() {
  const [room, setRoom] = useState("default");
  const { status, notes, summary, setSummary, sendNote } = useRoomSocket(room);
  const [text, setText] = useState("");

  const grouped = useMemo(() => notes, [notes]);

  const submit = () => {
    const t = text.trim();

    if (!t) {
      return;
    }

    sendNote(t, "anon");
    setText("");
  };

  const summarize = async () => {
    try {
      const res = await fetch(`/workflow/summarize?room=${encodeURIComponent(room)}`, { method: "POST" });
      const data = await res.json();

      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed summarize:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/60 backdrop-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-semibold">Idea Whiteboard</h1>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Room</label>
            <select 
              value={room} 
              onChange={(e) => setRoom(e.target.value)} 
              className="h-9 rounded-lg border border-white/19 bg-slate-800 px-2 text-sm"
            >
              <option value="default">default</option>
              <option value="marketing">marketing</option>
              <option value="product">product</option>
            </select>
            <Pill state={status}>{status}</Pill>
          </div>
        </div>
      </header>

      <main>
        <section>
          <div>Sticky Notes</div>
          <div>
            {grouped.map((n: any) => (
              <NoteCard key={n.id} {...n} />
            ))}
          </div>
        </section>

        <aside>
          <div>
            <div>Add Idea</div>
            <textarea name="" id=""></textarea>
            <div>
              <button></button>
              <button></button>
            </div>
          </div>

          <div>
            <div>Summary</div>
            <div>{summary || "No summary yet."}</div>
          </div>
        </aside>
      </main>

      <footer>sample footer</footer>
    </div>
  )
}