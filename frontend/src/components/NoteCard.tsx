"use client";

import React from 'react';

export function NoteCard(
    { id, text, author, votes, ts }: 
    { 
        id: string, text: string, author?: string, 
        votes?: number, ts?: number 
    }) {

    const date = new Date(ts ?? Date.now())
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div data-id={id} className="relative rounded-xl border border-white/10 bg-slate-800/60 p-3 shadow-xl">
            <div className='absolute right-2 top-2 text-xs text-amber-300'>▲ {votes ?? 0}</div>
            <div className='whitespace-pre-wrap text-slate-100'>{text}</div>
            <div className='mt-2 text-xs text-slate-400'> by {author ?? "anon"} • {date}</div>
        </div>
    );
}