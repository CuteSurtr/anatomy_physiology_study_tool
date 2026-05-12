export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl animate-pulse px-6 py-12">
      <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 h-56 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </main>
  );
}
