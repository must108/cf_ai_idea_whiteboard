"use client";

import React, { KeyboardEvent, useMemo, useState } from "react";
import { Pill } from "@/components/Pill";
import { NoteCard } from "@/components/NoteCard";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import type { Note } from "@/types/note";

interface DataProps {
  summary: string;
}

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
      const data: DataProps = await res.json();

      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed summarize:", e);
    }
  };

  const ideaKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

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

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_340px]">
        <section className="min-h-[60vh] rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm uppercase tracking-wide text-slate-400">Sticky Notes</div>
          <div className="grid grid-cols[repeat(auto-fill, minmax(220px, 1fr))] gap-3">
            {grouped.map((n: Note) => (
              <NoteCard key={n.id} {...n} />
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Add Idea</div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e: KeyboardEvent) => ideaKeyDown(e)}
              placeholder="Type an idea... (Enter to submit)"
              className="h-28 w-full resize-y rounded-xl border border-white/10 bg-slate-900/70 p-3 outline-none placeholder:text-slate-500"
            />
            <div className="mt-3 flex items-center justify-between">
              <button 
                onClick={submit}
                className="rounded-xl border border-transparent bg-blue-600 px-3 py-2 font-semibold hover:brightness-110 active:translate-y-[1px]"
              >
                Add Idea
              </button>
              <button
                onClick={summarize}
                className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 hover:bg-slate-700"
              >
                Summarize
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Summary</div>
            <div className="whitespace-pre-wrap text-sm text-slate-200">{summary || "No summary yet."}</div>
          </div>
        </aside>
      </main>

      {/* <footer>sample footer</footer> */}
    </div>
  )
}