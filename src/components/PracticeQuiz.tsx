"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { type PracticeQ, PRACTICE_TAGS, type PracticeTag, defaultTagsFor } from "@/lib/practice-questions";

const SYSTEMS = [
  "all",
  "cardiovascular",
  "respiratory",
  "digestive",
  "nervous",
  "muscular",
  "skeletal",
  "urinary",
  "endocrine",
  "reproductive",
  "lymphatic",
  "integumentary",
  "foundations",
] as const;

type SysFilter = (typeof SYSTEMS)[number];

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function PracticeQuiz({ pool }: { pool: PracticeQ[] }) {
  const [filter, setFilter] = useState<SysFilter>("all");
  const [tagFilter, setTagFilter] = useState<PracticeTag | "all">("all");
  const [size, setSize] = useState<number>(10);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    let filtered = filter === "all" ? pool : pool.filter((q) => q.system === filter);
    if (tagFilter !== "all") {
      filtered = filtered.filter((q) => defaultTagsFor(q).includes(tagFilter));
    }
    const shuffled = shuffle(filtered, seed);
    return shuffled.slice(0, Math.min(size, shuffled.length)).map((q, i) => ({
      ...q,
      choices: shuffle(q.choices, seed + i + 1),
    }));
  }, [filter, tagFilter, size, seed, pool]);

  const restart = (
    nextFilter?: SysFilter,
    nextSize?: number,
    nextTag?: PracticeTag | "all",
  ) => {
    if (nextFilter !== undefined) setFilter(nextFilter);
    if (nextSize !== undefined) setSize(nextSize);
    if (nextTag !== undefined) setTagFilter(nextTag);
    setSeed(Math.floor(Math.random() * 100000));
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswered(new Set());
    setFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        No questions match this filter. Try a different system.
      </div>
    );
  }

  const q = questions[idx];

  const choose = (c: string) => {
    if (revealed) return;
    setSelected(c);
    setRevealed(true);
    if (!answered.has(idx) && c.trim() === q.a.trim()) {
      setScore((s) => s + 1);
    }
    setAnswered((prev) => new Set(prev).add(idx));
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 pb-4">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          System
        </label>
        <select
          value={filter}
          onChange={(e) => restart(e.target.value as SysFilter, undefined, undefined)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {SYSTEMS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All systems" : s}
            </option>
          ))}
        </select>
        <label className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Tag
        </label>
        <select
          value={tagFilter}
          onChange={(e) =>
            restart(undefined, undefined, e.target.value as PracticeTag | "all")
          }
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="all">Any</option>
          {PRACTICE_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Length
        </label>
        <select
          value={size}
          onChange={(e) => restart(undefined, Number(e.target.value), undefined)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} questions
            </option>
          ))}
        </select>
        <button
          onClick={() => restart()}
          className="ml-auto rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium hover:bg-zinc-50"
        >
          New shuffle
        </button>
      </div>

      {finished ? (
        <div className="py-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
            Session complete
          </div>
          <div className="mt-3 font-sans text-4xl font-bold text-zinc-900">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            {score === questions.length
              ? "Flawless. Ship it."
              : score >= questions.length * 0.8
                ? "Strong score - minor gaps."
                : score >= questions.length * 0.6
                  ? "Solid base. Reread the missed topics."
                  : "Worth another pass through the relevant chapters."}
          </p>
          <button
            onClick={() => restart()}
            className="mt-6 rounded-lg bg-rose-700 px-5 py-2 text-sm font-medium text-white hover:bg-rose-800"
          >
            Run another set
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Question {idx + 1} / {questions.length} · {q.system} · {q.topic}
            </span>
            <span>
              Score: {score} / {answered.size}
            </span>
          </div>
          <p className="mt-3 text-base font-medium text-zinc-900">{q.q}</p>
          <ul className="mt-4 space-y-2">
            {q.choices.map((c) => {
              const isAnswer = c.trim() === q.a.trim();
              const isPicked = selected === c;
              return (
                <li key={c}>
                  <button
                    onClick={() => choose(c)}
                    disabled={revealed}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                      !revealed && "border-zinc-200 hover:border-rose-300 hover:bg-rose-50/40",
                      revealed && isAnswer && "border-emerald-400 bg-emerald-50 text-emerald-900",
                      revealed && isPicked && !isAnswer && "border-rose-400 bg-rose-50 text-rose-900",
                      revealed && !isAnswer && !isPicked && "border-zinc-200 text-zinc-500",
                    )}
                  >
                    {c}
                  </button>
                </li>
              );
            })}
          </ul>
          {revealed && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-zinc-600">
                {selected === q.a ? "✓ Correct" : `Answer: ${q.a}`}
              </span>
              <button
                onClick={next}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {idx + 1 >= questions.length ? "Finish" : "Next →"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
