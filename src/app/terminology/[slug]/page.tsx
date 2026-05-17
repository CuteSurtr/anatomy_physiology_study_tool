import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { terminology, getTerminology } from "@/lib/content";
import { MDXContent } from "@/lib/mdx";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PageTOC } from "@/components/PageTOC";
import { estimateReadingMinutes, extractHeadings } from "@/lib/reading-time";

function readRawMdx(p: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "content", `${p}.mdx`), "utf-8");
  } catch {
    return "";
  }
}

export function generateStaticParams() {
  return terminology.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getTerminology(slug);
  if (!page) return { title: "Not found" };
  const title = `${page.title} - Medical Terminology`;
  const description = page.summary ?? `${page.title} - medical terminology reference.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TerminologyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getTerminology(slug);
  if (!page) notFound();

  const sorted = [...terminology].sort(
    (a, b) =>
      a.categoryOrder - b.categoryOrder ||
      a.category.localeCompare(b.category) ||
      a.order - b.order,
  );
  const idx = sorted.findIndex((p) => p.slug === page.slug);
  const prev = idx > 0 ? sorted[idx - 1] : undefined;
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined;

  const rawMdx = readRawMdx(page.path);
  const readingMin = estimateReadingMinutes(rawMdx);
  const headings = extractHeadings(rawMdx);

  return (
    <main>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-rose-700 dark:hover:text-rose-400">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/terminology"
              className="hover:text-rose-700 dark:hover:text-rose-400"
            >
              Terminology
            </Link>
            <span>/</span>
            <span className="text-rose-700">{page.category}</span>
          </nav>
          <div className="mt-4 flex items-start gap-3">
            <span
              className="mt-2 h-3 w-3 shrink-0 rounded-full bg-rose-600"
              aria-hidden
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-sans text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
                  {page.title}
                </h1>
                <BookmarkButton pagePath={page.href} title={page.title} />
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                {readingMin} min read · {headings.length} sections
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <article className="prose max-w-none">
            <MDXContent code={page.body} />

            <hr />
            <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    ← Previous
                  </div>
                  <div className="mt-1 font-sans text-sm font-medium text-zinc-900 group-hover:text-rose-700 dark:text-zinc-100">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 text-right transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    Next →
                  </div>
                  <div className="mt-1 font-sans text-sm font-medium text-zinc-900 group-hover:text-rose-700 dark:text-zinc-100">
                    {next.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <PageTOC headings={headings} />
            {page.sources.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Sources
                </div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {page.sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
