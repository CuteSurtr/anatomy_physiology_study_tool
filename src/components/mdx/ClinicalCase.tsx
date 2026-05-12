"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Question = {
  q: string;
  a: string;
  choices: string[];
  explanation?: string;
};

type Props = {
  vignette: string;
  questions: Question[];
  title?: string;
};

export function ClinicalCase({ vignette, questions, title }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const total = questions.length;
  const q = questions[idx];
  if (!q) return null;

  const sel = selected[idx];
  const isRevealed = revealed.has(idx);
  const correct = sel?.trim().toLowerCase() === q.a.trim().toLowerCase();

  const score = questions.reduce((acc, qx, i) => {
    if (!revealed.has(i)) return acc;
    return (selected[i]?.trim().toLowerCase() === qx.a.trim().toLowerCase()) ? acc + 1 : acc;
  }, 0);

  const choose = (choice: string) => {
    if (isRevealed) return;
    setSelected((prev) => ({ ...prev, [idx]: choice }));
    setRevealed((prev) => new Set(prev).add(idx));
  };

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50/30 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
            Clinical case
          </div>
          {title && (
            <h3 className="mt-1 font-sans text-lg font-semibold text-zinc-900">{title}</h3>
          )}
        </div>
        <div className="text-right text-sm">
          <div className="text-zinc-500">
            Question <span className="font-bold text-zinc-900">{idx + 1}</span> / {total}
          </div>
          <div className="text-zinc-500">
            Score: <span className="font-bold text-zinc-900">{score}</span> / {revealed.size}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 text-[0.95rem] leading-relaxed text-zinc-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Vignette
        </div>
        <div className="mt-1">{vignette}</div>
      </div>

      <div className="mt-5">
        <p className="font-medium text-zinc-900">{q.q}</p>
        <ul className="mt-3 space-y-2">
          {q.choices.map((c, ci) => {
            const isThis = sel === c;
            const isCorrect = c.trim().toLowerCase() === q.a.trim().toLowerCase();
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => choose(c)}
                  className={cn(
                    "w-full text-left rounded-md border px-3 py-2.5 text-sm transition",
                    !isRevealed && "border-zinc-200 hover:bg-zinc-50",
                    isRevealed && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                    isRevealed && !isCorrect && isThis && "border-rose-400 bg-rose-50 text-rose-900",
                    isRevealed && !isCorrect && !isThis && "border-zinc-200 text-zinc-500",
                  )}
                >
                  <span className="mr-2 inline-block w-5 font-bold text-zinc-600">
                    {String.fromCharCode(65 + ci)}.
                  </span>
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {isRevealed && q.explanation && (
        <div
          className={cn(
            "mt-4 rounded-md border-l-4 px-4 py-3 text-sm",
            correct
              ? "border-emerald-500 bg-emerald-50 text-emerald-900"
              : "border-rose-500 bg-rose-50 text-rose-900",
          )}
        >
          <div className="text-xs font-semibold uppercase tracking-wider">
            {correct ? "Correct" : "Explanation"}
          </div>
          <div className="mt-1">{q.explanation}</div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx >= total - 1}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
