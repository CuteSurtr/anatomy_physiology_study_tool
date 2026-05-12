"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(t: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = t === "dark" || (t === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
    setTheme(stored);
  }, []);

  const cycle = () => {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const icon =
    theme === "dark"
      ? (
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
          <path
            d="M14 10A8 8 0 0 1 6 2a8 8 0 1 0 8 8z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      )
      : theme === "light"
        ? (
          <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
            <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path
              d="M10 1v2 M10 17v2 M1 10h2 M17 10h2 M3.5 3.5l1.4 1.4 M15.1 15.1l1.4 1.4 M3.5 16.5l1.4-1.4 M15.1 4.9l1.4-1.4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )
        : (
          <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
            <rect x="2" y="4" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M7 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}`}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      title={mounted ? `Theme: ${theme} (click to cycle)` : "Theme"}
    >
      {icon}
    </button>
  );
}
