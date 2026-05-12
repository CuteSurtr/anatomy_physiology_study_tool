"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Doc = {
  title: string;
  system: string;
  type: string;
  href: string;
  body: string;
};

export function SearchBox({ docs }: { docs: Doc[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const tokens = term.split(/\s+/).filter(Boolean);
    const scored = docs
      .map((d) => {
        const hay = `${d.title} ${d.system} ${d.body}`.toLowerCase();
        let score = 0;
        for (const t of tokens) {
          if (!hay.includes(t)) return null;
          if (d.title.toLowerCase().includes(t)) score += 5;
          if (d.system.toLowerCase().includes(t)) score += 2;
          const occ = hay.split(t).length - 1;
          score += occ;
        }
        return { d, score };
      })
      .filter((x): x is { d: Doc; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    return scored.map((s) => s.d);
  }, [q, docs]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search anatomy &amp; physiology…  (⌘K)"
          aria-label="Search"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 pl-10 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <svg
          viewBox="0 0 20 20"
          width="16"
          height="16"
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M14 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {open && q.trim() !== "" && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">No matches.</div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {results.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                    }}
                    className="block px-4 py-3 transition hover:bg-rose-50"
                  >
                    <div className="text-sm font-medium text-zinc-900">{r.title}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">
                      {r.system} · {r.type}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
