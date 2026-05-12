"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Label = {
  id: string;
  x: number;
  y: number;
  label: string;
  href?: string;
  synonyms?: string[];
};

export type LabeledImageData = {
  src: string;
  alt?: string;
  viewBox: [number, number, number, number];
  labels: Label[];
  license?: { type: string; attribution: string; url?: string };
};

type Props = {
  data: LabeledImageData;
  caption?: string;
  quizable?: boolean;
};

export function LabeledImage({ data, caption, quizable = true }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [, , w, h] = data.viewBox;

  const onPinClick = (id: string) => {
    if (!quizMode) return;
    setRevealed((prev) => new Set(prev).add(id));
  };

  return (
    <figure className="my-8">
      <div className="relative rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden">
        <div className="absolute right-2 top-2 z-10 flex gap-2">
          {quizable && (
            <button
              type="button"
              onClick={() => {
                setQuizMode((q) => !q);
                setRevealed(new Set());
              }}
              className={cn(
                "px-3 py-1 text-xs rounded-md border transition",
                quizMode
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100",
              )}
            >
              {quizMode ? "Quiz mode: ON" : "Quiz mode"}
            </button>
          )}
        </div>

        <svg
          viewBox={data.viewBox.join(" ")}
          className="w-full h-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <image href={data.src} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
          {data.labels.map((l) => {
            const isHover = hoverId === l.id;
            const isRevealed = !quizMode || revealed.has(l.id);
            return (
              <g
                key={l.id}
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => onPinClick(l.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={l.x}
                  cy={l.y}
                  r={isHover ? 14 : 10}
                  fill={isRevealed ? "#dc2626" : "#71717a"}
                  fillOpacity={0.85}
                  stroke="white"
                  strokeWidth={3}
                  className="transition-all"
                />
                {isHover && isRevealed && (
                  <g pointerEvents="none">
                    {/* Leader line from pin to label */}
                    <line
                      x1={l.x}
                      y1={l.y}
                      x2={l.x + 38}
                      y2={l.y - 38}
                      stroke="#dc2626"
                      strokeWidth={2}
                    />
                    {/* Drop shadow for legibility */}
                    <rect
                      x={l.x + 35}
                      y={l.y - 56}
                      rx={8}
                      ry={8}
                      width={Math.max(160, l.label.length * 11)}
                      height={36}
                      fill="rgba(0,0,0,0.18)"
                    />
                    {/* Label background */}
                    <rect
                      x={l.x + 33}
                      y={l.y - 58}
                      rx={8}
                      ry={8}
                      width={Math.max(160, l.label.length * 11)}
                      height={36}
                      fill="white"
                      stroke="#dc2626"
                      strokeWidth={2}
                    />
                    <text
                      x={l.x + 33 + 12}
                      y={l.y - 34}
                      fontSize={17}
                      fontWeight={600}
                      fill="#18181b"
                    >
                      {l.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {quizMode && (
        <div className="mt-2 text-sm text-zinc-600">
          Click each pin to reveal. Revealed: {revealed.size}/{data.labels.length}
        </div>
      )}

      {(caption || data.license) && (
        <figcaption className="mt-3 text-sm text-zinc-600">
          {caption && <div>{caption}</div>}
          {data.license && (
            <div className="mt-1 text-xs text-zinc-500">
              {data.license.type} ·{" "}
              {data.license.url ? (
                <Link href={data.license.url} className="underline">
                  {data.license.attribution}
                </Link>
              ) : (
                data.license.attribution
              )}
            </div>
          )}
        </figcaption>
      )}

      {!quizMode && (
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
          {data.labels.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(null)}
                className={cn(
                  "text-left w-full px-2 py-1 rounded transition",
                  hoverId === l.id ? "bg-red-50 text-red-700" : "text-zinc-700 hover:bg-zinc-100",
                )}
              >
                {l.href ? (
                  <Link href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                ) : (
                  l.label
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
