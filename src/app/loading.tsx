export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl animate-pulse px-6 py-12">
      <div className="h-3 w-24 rounded bg-zinc-200" />
      <div className="mt-4 h-8 w-2/3 rounded bg-zinc-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-zinc-200" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full rounded bg-zinc-200" />
        <div className="h-4 w-11/12 rounded bg-zinc-200" />
        <div className="h-4 w-10/12 rounded bg-zinc-200" />
        <div className="h-4 w-9/12 rounded bg-zinc-200" />
      </div>
    </main>
  );
}
