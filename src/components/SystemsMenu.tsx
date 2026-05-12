"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Sys = { slug: string; title: string; href: string; color: string };

export function SystemsMenu({ systems }: { systems: Sys[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      >
        Systems
        <svg
          viewBox="0 0 12 12"
          width="10"
          height="10"
          aria-hidden
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-[min(560px,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
        >
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            All 12 body systems
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {systems.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                role="menuitem"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-700 transition hover:bg-rose-50 hover:text-rose-800"
              >
                <span
                  className="h-2 w-2 flex-none rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <span className="truncate">
                  {s.title.replace(" System", "").replace(" & Immune", " / Immune")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
