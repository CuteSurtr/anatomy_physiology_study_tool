import Link from "next/link";
import { getDueCards, getProgressStats } from "@/lib/actions";
import { ReviewClient } from "./ReviewClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spaced Repetition Review" };

export default async function ReviewPage() {
  const [cards, stats] = await Promise.all([getDueCards(50), getProgressStats()]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
        Review
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900">
        Spaced repetition
      </h1>
      <p className="mt-3 text-zinc-600">
        Questions you got wrong come back tomorrow, then 6 days, then on a schedule that
        stretches as you nail them. Total attempts: {stats.total} · Accuracy{" "}
        {stats.accuracy}% · {stats.dueCount} due.
      </p>

      {cards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="text-2xl">All caught up</div>
          <p className="mt-2 text-sm text-zinc-600">
            Nothing due right now. Take a{" "}
            <Link href="/practice" className="text-rose-700 hover:underline">
              mixed practice quiz
            </Link>{" "}
            or browse a system page - missed questions land here automatically.
          </p>
        </div>
      ) : (
        <ReviewClient cards={cards.map(c => ({
          id: c.id,
          questionKey: c.questionKey,
          pagePath: c.pagePath,
          interval: c.interval,
          repetitions: c.repetitions,
          lapses: c.lapses,
        }))} />
      )}
    </main>
  );
}
