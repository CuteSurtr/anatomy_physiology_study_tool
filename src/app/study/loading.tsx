export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl animate-pulse px-6 py-12">
      <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 h-8 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="mt-10 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </main>
  );
}
