import Link from "next/link";
import type { Metadata } from "next";
import { getPharmacologyByCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pharmacology - Anatomy + Physio",
  description:
    "Comprehensive pharmacology reference: pharmacokinetics, pharmacodynamics, autonomics, cardiovascular drugs, antimicrobials, CNS drugs, antineoplastics, and more.",
};

export default function PharmacologyIndex() {
  const groups = getPharmacologyByCategory();
  const totalCount = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Reference
      </div>
      <h1 className="mt-3 font-sans text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Pharmacology
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
        Mechanism-first reference for every major drug class: receptors, indications, key
        side effects, and the contraindications that get tested. Built for board prep
        (USMLE, NAPLEX, NCLEX) and pharmacology coursework.
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        {totalCount} pages across {groups.length} categories
      </p>

      <div className="mt-10 space-y-10">
        {groups.map((g) => (
          <section key={g.category}>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-8 rounded-full bg-rose-600" aria-hidden />
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400">
                {g.category}
              </h2>
              <span className="text-xs text-zinc-400">{g.items.length}</span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={p.href}
                    className="group block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-700 dark:hover:bg-rose-950/30"
                  >
                    <div className="font-sans text-sm font-medium text-zinc-900 group-hover:text-rose-700 dark:text-zinc-100 dark:group-hover:text-rose-400">
                      {p.title}
                    </div>
                    {p.summary && (
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {p.summary}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
