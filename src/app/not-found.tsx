import Link from "next/link";
import { getSystemsSorted } from "@/lib/content";

export default function NotFound() {
  const systems = getSystemsSorted();
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        404
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900">
        Page not found.
      </h1>
      <p className="mt-3 text-zinc-600">
        The URL you followed doesn&apos;t match any page on this site. Try a body system instead:
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {systems.map((s) => (
          <li key={s.slug}>
            <Link
              href={s.href}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition hover:border-rose-300 hover:bg-rose-50/40"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-sm text-rose-700 hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
