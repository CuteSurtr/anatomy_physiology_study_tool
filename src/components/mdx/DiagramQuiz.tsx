"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Label } from "./LabeledImage";

export type DiagramQuizData = {
  src: string;
  alt?: string;
  viewBox: [number, number, number, number];
  labels: Label[];
  license?: { type: string; attribution: string; url?: string };
  /** If true, image already has visible numbers - don't overlay pin circles. */
  imageHasNumbers?: boolean;
};

type Props = {
  data: DiagramQuizData;
  title?: string;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/[.,;:!?'"`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\bartery\b/g, "a")
    .replace(/\bvein\b/g, "v")
    .replace(/\bnerve\b/g, "n");
}

function isCorrect(input: string, label: Label): boolean {
  if (!input.trim()) return false;
  const n = normalize(input);
  if (n === normalize(label.label)) return true;
  if (label.synonyms?.some((syn) => normalize(syn) === n)) return true;
  return false;
}

export function DiagramQuiz({ data, title }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [, , w, h] = data.viewBox;

  const numbered = useMemo(
    () => data.labels.map((l, i) => ({ ...l, n: i + 1 })),
    [data.labels],
  );

  const score = useMemo(() => {
    if (!checked) return 0;
    return numbered.filter((l) => isCorrect(answers[l.id] ?? "", l)).length;
  }, [checked, numbered, answers]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const reset = () => {
    setAnswers({});
    setChecked(false);
  };

  const total = numbered.length;
  const allFilled = numbered.every((l) => (answers[l.id] ?? "").trim() !== "");

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">
            Diagram quiz · fill in the blanks
          </div>
          {title && (
            <h3 className="mt-1 font-sans text-lg font-semibold text-zinc-900">{title}</h3>
          )}
        </div>
        {checked && (
          <div className="text-right">
            <div className="font-sans text-2xl font-bold text-zinc-900">
              {score}
              <span className="text-zinc-400">/{total}</span>
            </div>
            <div className="text-xs text-zinc-500">
              {score === total ? "Perfect!" : score >= total * 0.7 ? "Solid" : "Keep going"}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {data.imageHasNumbers ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={data.src}
              alt={data.alt}
              className="block h-auto w-full"
            />
          ) : (
            <svg
              viewBox={data.viewBox.join(" ")}
              className="block h-auto w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <image
                href={data.src}
                x={0}
                y={0}
                width={w}
                height={h}
                preserveAspectRatio="xMidYMid meet"
              />
              {numbered.map((l) => {
                const correct = checked && isCorrect(answers[l.id] ?? "", l);
                const isActive = hoverId === l.id || focusId === l.id;
                const fill = checked
                  ? correct
                    ? "#16a34a"
                    : "#dc2626"
                  : isActive
                    ? "#7c3aed"
                    : "#52525b";
                return (
                  <g
                    key={l.id}
                    onMouseEnter={() => setHoverId(l.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={l.x}
                      cy={l.y}
                      r={isActive ? 16 : 13}
                      fill={fill}
                      fillOpacity={0.9}
                      stroke="white"
                      strokeWidth={3}
                      className="transition-all"
                    />
                    <text
                      x={l.x}
                      y={l.y + 5}
                      textAnchor="middle"
                      fontSize={15}
                      fontWeight={700}
                      fill="white"
                      pointerEvents="none"
                      style={{ userSelect: "none" }}
                    >
                      {l.n}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <ol className="space-y-2 text-sm">
          {numbered.map((l) => {
            const value = answers[l.id] ?? "";
            const correct = checked && isCorrect(value, l);
            const wrong = checked && !correct;
            return (
              <li
                key={l.id}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-2 py-1.5 transition",
                  !checked && "border-zinc-200",
                  checked && correct && "border-emerald-300 bg-emerald-50",
                  checked && wrong && "border-rose-300 bg-rose-50",
                  (hoverId === l.id || focusId === l.id) &&
                    !checked &&
                    "border-violet-400 bg-violet-50",
                )}
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <span
                  className={cn(
                    "mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    !checked && "bg-zinc-700",
                    checked && correct && "bg-emerald-600",
                    checked && wrong && "bg-rose-600",
                  )}
                >
                  {l.n}
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(l.id, e.target.value)}
                    onFocus={() => setFocusId(l.id)}
                    onBlur={() => setFocusId(null)}
                    placeholder="type the structure…"
                    disabled={checked && correct}
                    className={cn(
                      "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 font-sans text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100",
                      checked && correct && "border-emerald-300 bg-emerald-50 text-emerald-900",
                      checked && wrong && "border-rose-300 bg-rose-50 text-rose-900",
                    )}
                  />
                  {checked && wrong && (
                    <div className="mt-1 text-xs text-rose-700">
                      Answer: <strong>{l.label}</strong>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {checked ? (
          <>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                const filled: Record<string, string> = {};
                numbered.forEach((l) => (filled[l.id] = l.label));
                setAnswers(filled);
              }}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Reveal all
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setChecked(true)}
              disabled={!allFilled}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-white transition",
                allFilled ? "bg-violet-700 hover:bg-violet-600" : "bg-zinc-300 cursor-not-allowed",
              )}
            >
              Check answers
            </button>
          </>
        )}
      </div>

      {data.license && (
        <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          {data.license.type} · {data.license.attribution}
        </div>
      )}
    </div>
  );
}
