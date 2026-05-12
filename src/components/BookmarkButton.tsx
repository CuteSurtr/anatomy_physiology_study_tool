"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/actions";

type Props = {
  pagePath: string;
  title?: string;
};

export function BookmarkButton({ pagePath, title }: Props) {
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void isBookmarked(pagePath).then((v) => {
      if (!cancelled) setBookmarked(v);
    });
    return () => {
      cancelled = true;
    };
  }, [pagePath]);

  const onClick = () => {
    if (bookmarked === null) return;
    const optimistic = !bookmarked;
    setBookmarked(optimistic);
    startTransition(async () => {
      const res = await toggleBookmark({ pagePath, title });
      if (res.ok) setBookmarked(res.bookmarked);
      else setBookmarked(!optimistic);
    });
  };

  const isOn = bookmarked === true;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || bookmarked === null}
      aria-pressed={isOn}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        isOn
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
      } ${bookmarked === null ? "opacity-40" : ""}`}
    >
      <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden>
        <path
          d="M5 3h10v14l-5-3-5 3V3z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={isOn ? "currentColor" : "none"}
          strokeLinejoin="round"
        />
      </svg>
      {isOn ? "Saved" : "Save"}
    </button>
  );
}
