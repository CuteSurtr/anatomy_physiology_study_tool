import type { ReactNode } from "react";

type Exam = "nclex" | "step1" | "step2" | "pharm" | "boards";

const EXAM_META: Record<Exam, { label: string; color: string; bg: string; border: string }> = {
  nclex: {
    label: "High-yield for NCLEX",
    color: "#0e7490",
    bg: "#ecfeff",
    border: "#06b6d4",
  },
  step1: {
    label: "High-yield for USMLE Step 1",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#8b5cf6",
  },
  step2: {
    label: "High-yield for USMLE Step 2",
    color: "#7c2d12",
    bg: "#fef3c7",
    border: "#f59e0b",
  },
  pharm: {
    label: "Pharmacology pearls",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#10b981",
  },
  boards: {
    label: "High-yield for boards",
    color: "#1e3a8a",
    bg: "#eff6ff",
    border: "#3b82f6",
  },
};

export function HighYield({
  exam = "boards",
  children,
  title,
}: {
  exam?: Exam;
  children: ReactNode;
  title?: string;
}) {
  const meta = EXAM_META[exam];
  return (
    <aside
      className="my-6 rounded-lg border-l-4 px-5 py-4"
      style={{ backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-[0.14em]"
        style={{ color: meta.color }}
      >
        {title ?? meta.label}
      </div>
      <div className="mt-2 text-sm text-zinc-800 [&>p]:my-1 [&>ul]:my-1">{children}</div>
    </aside>
  );
}
