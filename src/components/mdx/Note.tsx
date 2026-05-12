import type { ReactNode } from "react";

export function Note({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <aside className="my-6 rounded-lg border-l-4 border-sky-400 bg-sky-50/60 px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">
        {title ?? "Note"}
      </div>
      <div className="mt-2 text-sm text-zinc-800 [&>p]:my-1">{children}</div>
    </aside>
  );
}
