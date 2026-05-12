"use client";

import { useState } from "react";
import Link from "next/link";
import { reviewCard } from "@/lib/actions";
import type { Grade } from "@/lib/srs";

type Card = {
  id: string;
  questionKey: string;
  pagePath: string | null;
  interval: number;
  repetitions: number;
  lapses: number;
};

export function ReviewClient({ cards }: { cards: Card[] }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(0);
  const card = cards[idx];

  if (!card) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-2xl">Session complete · {done} reviewed</div>
        <p className="mt-2 text-sm text-emerald-800">
          Come back tomorrow for the next batch.
        </p>
      </div>
    );
  }

  const grade = (g: Grade) => {
    void reviewCard({ questionKey: card.questionKey, pagePath: card.pagePath ?? undefined, grade: g });
    setDone((d) => d + 1);
    setIdx((i) => i + 1);
  };

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Card {idx + 1} / {cards.length}
        </span>
        <span>
          Interval {card.interval}d · Reps {card.repetitions} · Lapses {card.lapses}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          From page
        </div>
        {card.pagePath ? (
          <Link href={card.pagePath} className="mt-1 block text-sm text-rose-700 hover:underline">
            {card.pagePath}
          </Link>
        ) : (
          <div className="mt-1 text-sm text-zinc-500">unknown page</div>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Open the page link above, find the question on that page, and answer it. Then rate
        how it went below - that schedules the next review.
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <GradeButton onClick={() => grade("again")} label="Again" sub="< 1d" tone="rose" />
        <GradeButton onClick={() => grade("hard")} label="Hard" sub="short" tone="amber" />
        <GradeButton onClick={() => grade("good")} label="Good" sub="normal" tone="emerald" />
        <GradeButton onClick={() => grade("easy")} label="Easy" sub="longer" tone="violet" />
      </div>
    </div>
  );
}

function GradeButton({
  onClick,
  label,
  sub,
  tone,
}: {
  onClick: () => void;
  label: string;
  sub: string;
  tone: "rose" | "amber" | "emerald" | "violet";
}) {
  const tones = {
    rose: "border-rose-300 hover:bg-rose-50 text-rose-800",
    amber: "border-amber-300 hover:bg-amber-50 text-amber-800",
    emerald: "border-emerald-300 hover:bg-emerald-50 text-emerald-800",
    violet: "border-violet-300 hover:bg-violet-50 text-violet-800",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-white px-4 py-3 text-left ${tones[tone]}`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-0.5 text-xs opacity-70">{sub}</div>
    </button>
  );
}
