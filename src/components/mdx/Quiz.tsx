"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logAttempt, reviewCard, getQuestionAggregate } from "@/lib/actions";
import type { Grade } from "@/lib/srs";
import { toast } from "@/lib/toast";

type QA = { q: string; a: string; choices?: string[] };

type Props = {
  questions: QA[];
};

function hashQuestion(q: string): string {
  let h = 2166136261;
  for (let i = 0; i < q.length; i++) {
    h ^= q.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function Quiz({ questions }: Props) {
  const pathname = usePathname();
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [grading, setGrading] = useState<number | null>(null);
  const [aggregate, setAggregate] = useState<{ total: number; accuracy: number } | null>(null);

  const q = questions[idx];

  const choose = useCallback(
    (choice: string) => {
      if (revealed || !q) return;
      setSelected(choice);
      setRevealed(true);
      const correct = choice.trim().toLowerCase() === q.a.trim().toLowerCase();
      if (!answered.has(idx) && correct) setScore((s) => s + 1);
      if (!answered.has(idx)) {
        const questionKey = `${pathname}#${hashQuestion(q.q)}`;
        void logAttempt({
          questionKey,
          pagePath: pathname,
          correct,
          selectedAnswer: choice,
        }).then((res) => {
          if (res && "ok" in res && res.ok === false) {
            toast(`Couldn't save (${res.error})`, "error");
          } else {
            void getQuestionAggregate(questionKey).then((agg) => {
              if (agg && agg.total >= 3) setAggregate(agg);
            });
          }
        });
        if (!correct) setGrading(idx);
      }
      setAnswered((prev) => new Set(prev).add(idx));
    },
    [revealed, q, answered, idx, pathname],
  );

  const submitGrade = useCallback(
    (grade: Grade) => {
      if (!q) return;
      const questionKey = `${pathname}#${hashQuestion(q.q)}`;
      void reviewCard({ questionKey, pagePath: pathname, grade }).then((res) => {
        if (res && "ok" in res && res.ok === false) {
          toast(`Couldn't save (${res.error})`, "error");
        } else {
          toast(`Scheduled for review`, "success");
        }
      });
      setGrading(null);
    },
    [pathname, q],
  );

  const next = useCallback(() => {
    setRevealed(false);
    setSelected(null);
    setGrading(null);
    setAggregate(null);
    setIdx((i) => (i + 1) % questions.length);
  }, [questions.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (!q) return;

      if (grading !== null) {
        const grades: Grade[] = ["again", "hard", "good", "easy"];
        const ix = ["1", "2", "3", "4"].indexOf(e.key);
        if (ix >= 0) {
          e.preventDefault();
          submitGrade(grades[ix]);
        }
        return;
      }

      if (revealed) {
        if (e.key === "Enter" || e.key === "ArrowRight" || e.key === "j") {
          e.preventDefault();
          next();
        }
        return;
      }

      if (q.choices) {
        const ix = ["1", "2", "3", "4", "5", "6"].indexOf(e.key);
        if (ix >= 0 && q.choices[ix]) {
          e.preventDefault();
          choose(q.choices[ix]);
        }
      } else if (e.key === "r" || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, revealed, grading, choose, submitGrade, next]);

  if (!q) return null;

  return (
    <div className="my-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Question {idx + 1} / {questions.length}
        </span>
        <span>
          Score: {score} / {answered.size}
          <span className="ml-3 hidden sm:inline opacity-60">1-4 = answer · r = reveal · ↵ = next</span>
        </span>
      </div>
      <p className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">{q.q}</p>

      {q.choices ? (
        <ul className="mt-4 space-y-2">
          {q.choices.map((c, ci) => {
            const isCorrect = c.trim().toLowerCase() === q.a.trim().toLowerCase();
            const isSelected = selected === c;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => choose(c)}
                  className={cn(
                    "w-full text-left rounded-md border px-3 py-2 text-sm transition flex items-baseline gap-3",
                    !revealed && "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
                    revealed && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
                    revealed &&
                      !isCorrect &&
                      isSelected &&
                      "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
                    revealed && !isCorrect && !isSelected && "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500",
                  )}
                >
                  <span className="text-xs font-mono opacity-50">{ci + 1}</span>
                  <span>{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Reveal answer (r)
            </button>
          ) : (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
              {q.a}
            </div>
          )}
        </div>
      )}

      {revealed && aggregate && (
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {aggregate.accuracy}% of {aggregate.total} attempts got this right.
        </div>
      )}

      {revealed && grading === idx && (
        <div className="mt-4 rounded-md border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-200">
            Add to spaced repetition? (1-4)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["again", "hard", "good", "easy"] as const).map((g, gi) => (
              <button
                key={g}
                type="button"
                onClick={() => submitGrade(g)}
                className="rounded-md border border-violet-300 bg-white px-3 py-1 text-xs font-medium capitalize hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900 dark:text-violet-100 dark:hover:bg-violet-800"
              >
                <span className="opacity-50 mr-1">{gi + 1}</span>
                {g}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setGrading(null)}
              className="ml-auto text-xs text-violet-700 hover:underline dark:text-violet-300"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={next}
          className="text-sm rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
