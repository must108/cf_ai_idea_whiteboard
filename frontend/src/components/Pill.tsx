"use client";

import React from 'react';

export function Pill(
    { children, state }: 
    { children: React.ReactNode, 
        state?: "connected" | "disconnected" | "error" 
    }) {
    const cls = state === "connected" ? "bg-emerald-500/15 border-emerald-400/40"
        : state === "error" ? "bg-rose-500/15 border-rose-400/40" : "bg-sky-500/15 border-sky-400/40";

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-slate-200 ${cls}`}>
            {children}
        </span>
    );
}