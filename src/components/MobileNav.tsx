"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Sys = { slug: string; title: string; href: string; color: string };

export function MobileNav({ systems }: { systems: Sys[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
      >
        {open ? (
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
            <path
              d="M3 6h14M3 10h14M3 14h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      {open && (
        <div
          className="fixed inset-x-0 top-[57px] z-40 border-b border-zinc-200 bg-white shadow-lg lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link
              href="/practice"
              className="mb-3 block rounded-lg bg-rose-700 px-4 py-2 text-center text-sm font-medium text-white"
            >
              Mixed practice quiz →
            </Link>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Link
                href="/pharmacology"
                className="rounded-md border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Pharmacology
              </Link>
              <Link
                href="/terminology"
                className="rounded-md border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Terminology
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {systems.map((s) => (
                <Link
                  key={s.slug}
                  href={s.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  {s.title.replace(" System", "").replace(" & Immune", "")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
