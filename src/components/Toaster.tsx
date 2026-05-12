"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type Toast } from "@/lib/toast";

const TONES: Record<Toast["kind"], string> = {
  info: "bg-zinc-900 text-white",
  success: "bg-emerald-700 text-white",
  error: "bg-rose-700 text-white",
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-lg px-4 py-2 text-sm shadow-lg ${TONES[t.kind]}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
