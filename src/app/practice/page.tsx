import { PracticeQuiz } from "@/components/PracticeQuiz";
import { practiceQuestions } from "@/lib/practice-questions";
import Link from "next/link";

export const metadata = { title: "Practice Quiz" };

export default function PracticePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Practice
      </div>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-zinc-900">
        Mixed practice quiz
      </h1>
      <p className="mt-4 text-zinc-600">
        {practiceQuestions.length} board-style questions sampled from every body
        system. Each session shuffles questions + choices. Filter by system below, or
        run the full mix.
      </p>

      <PracticeQuiz pool={practiceQuestions} />

      <div className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
        Want section-specific quizzes? Each system page has its own end-of-chapter
        quizzes. <Link href="/" className="text-rose-700 hover:underline">Back to home</Link>.
      </div>
    </main>
  );
}
