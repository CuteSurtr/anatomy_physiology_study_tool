import Link from "next/link";
import {
  getProgressStats,
  getRecentMisses,
  listBookmarks,
  getActivityHeatmap,
  getStreak,
  getMastery,
} from "@/lib/actions";
import { Heatmap } from "@/components/Heatmap";
import { systemColors } from "@/lib/system-colors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Study Dashboard" };

export default async function StudyPage() {
  const [stats, misses, marks, heatmap, streak, mastery] = await Promise.all([
    getProgressStats(),
    getRecentMisses(15),
    listBookmarks(),
    getActivityHeatmap(91),
    getStreak(),
    getMastery(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-400">
        Study
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Your dashboard
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Everything tracked anonymously per device. <Link href="/sync" className="text-rose-700 hover:underline dark:text-rose-400">Pair another device</Link> ·{" "}
        <a href="/api/anki" className="text-rose-700 hover:underline dark:text-rose-400" download>Export to Anki (CSV)</a>
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Attempts" value={stats.total} />
        <Stat label="Accuracy" value={`${stats.accuracy}%`} />
        <Stat label="Streak" value={`${streak.current} d`} sub={`best ${streak.longest}`} />
        <Stat
          label="Due to review"
          value={stats.dueCount}
          href={stats.dueCount > 0 ? "/review" : undefined}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Last 91 days
        </h2>
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <Heatmap data={heatmap} days={91} />
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            Less
            <span className="h-3 w-3 rounded-[2px] bg-zinc-200 dark:bg-zinc-800" />
            <span className="h-3 w-3 rounded-[2px] bg-rose-200 dark:bg-rose-900" />
            <span className="h-3 w-3 rounded-[2px] bg-rose-300 dark:bg-rose-800" />
            <span className="h-3 w-3 rounded-[2px] bg-rose-400 dark:bg-rose-700" />
            <span className="h-3 w-3 rounded-[2px] bg-rose-600 dark:bg-rose-500" />
            More
          </div>
        </div>
      </section>

      {mastery.length > 0 && (
        <section className="mt-10">
          <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            System mastery
          </h2>
          <ul className="mt-3 space-y-2">
            {mastery.map((m) => {
              const color = systemColors[m.system] ?? "#a1a1aa";
              return (
                <li key={m.system} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                      {m.system}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {m.correct}/{m.total} · {m.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full"
                      style={{ width: `${m.accuracy}%`, backgroundColor: color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recent misses
        </h2>
        {misses.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Nothing here yet. Take a quiz - wrong answers land here so you can revisit.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {misses.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.pagePath ?? "#"}
                  className="block rounded-lg border border-zinc-200 bg-white p-3 text-sm transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-700 dark:hover:bg-rose-950/30"
                >
                  <div className="text-zinc-900 dark:text-zinc-100">{m.pagePath}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(m.createdAt).toLocaleString()} ·{" "}
                    {m.selectedAnswer ? `you: ${m.selectedAnswer}` : "no answer"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Bookmarks
        </h2>
        {marks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No saved pages yet. Click &ldquo;Save&rdquo; on any page header.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {marks.map((b) => (
              <li key={b.id}>
                <Link
                  href={b.pagePath}
                  className="block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-700"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{b.title ?? b.pagePath}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-500 dark:text-zinc-500">{sub}</div>}
    </>
  );
  return href ? (
    <Link
      href={href}
      className="rounded-2xl border border-rose-200 bg-rose-50 p-4 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900"
    >
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">{body}</div>
  );
}
