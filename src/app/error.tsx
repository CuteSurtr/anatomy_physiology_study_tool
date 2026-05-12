"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Something went wrong
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900">
        We hit an unexpected error.
      </h1>
      <p className="mt-3 text-zinc-600">
        The page failed to render. Try again, or head back home.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-zinc-400">ref: {error.digest}</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-rose-700 px-5 py-2 text-sm font-medium text-white hover:bg-rose-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
