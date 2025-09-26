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
    <div>
      <header>
        <div>
          <h1>Idea Whiteboard</h1>
          <div>
            <label>Room</label>
            <select name="" id="">
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