import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPage,
  getSystem,
  structures,
  processes,
  clinical,
  findStructure,
  getBySystem,
} from "@/lib/content";
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

const VALID_TYPES = ["anatomy", "physiology", "clinical"] as const;
type ContentType = (typeof VALID_TYPES)[number];

export function generateStaticParams() {
  return [
    ...structures.map((s) => ({ system: s.system, type: "anatomy", slug: s.slug })),
    ...processes.map((s) => ({ system: s.system, type: "physiology", slug: s.slug })),
    ...clinical.map((s) => ({ system: s.system, type: "clinical", slug: s.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string; type: string; slug: string }>;
}): Promise<Metadata> {
  const { system, type, slug } = await params;
  if (!(VALID_TYPES as readonly string[]).includes(type)) return { title: "Not found" };
  const page = getPage(system, type as ContentType, slug);
  const sys = getSystem(system);
  if (!page || !sys) return { title: "Not found" };

  const title = `${page.title} - ${sys.title}`;
  const desc = `${page.title} - anatomy/physiology reference with figures, function tables, and exam-style quiz. Part of ${sys.title}.`;
  const ogImage = `/api/og?title=${encodeURIComponent(page.title)}&system=${encodeURIComponent(sys.title)}&color=${encodeURIComponent(sys.color)}`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "article",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [ogImage] },
  };
}

const TYPE_LABEL: Record<ContentType, string> = {
  anatomy: "Anatomy",
  physiology: "Physiology",
  clinical: "Clinical",
};

export default async function ContentPage({
  params,
}: {
  params: Promise<{ system: string; type: string; slug: string }>;
}) {
  const { system, type, slug } = await params;
  if (!(VALID_TYPES as readonly string[]).includes(type)) notFound();

  const page = getPage(system, type as ContentType, slug);
  const sys = getSystem(system);
  if (!page || !sys) notFound();

  const isAnatomy = page.type === "anatomy";
  const related = page.related
    .map((r) => findStructure(r))
    .filter((r): r is NonNullable<ReturnType<typeof findStructure>> => Boolean(r));

  const buckets = getBySystem(system);
  const samePool =
    page.type === "anatomy"
      ? buckets.anatomy
      : page.type === "physiology"
        ? buckets.physiology
        : buckets.clinical;
  const idx = samePool.findIndex((p) => p.slug === page.slug);
  const prev = idx > 0 ? samePool[idx - 1] : undefined;
  const next = idx >= 0 && idx < samePool.length - 1 ? samePool[idx + 1] : undefined;

  const pagePath = page.href;
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
            <Link href={sys.href} className="hover:text-rose-700 dark:hover:text-rose-400">
              {sys.title}
            </Link>
            <span>/</span>
            <span style={{ color: sys.color }}>{TYPE_LABEL[page.type as ContentType]}</span>
          </nav>
          <div className="mt-4 flex items-start gap-3">
            <span
              className="mt-2 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: sys.color }}
              aria-hidden
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-sans text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
                  {page.title}
                </h1>
                <BookmarkButton pagePath={pagePath} title={page.title} />
              </div>
              {"latin" in page && page.latin && (
                <p className="mt-1 font-serif text-base italic text-zinc-500 dark:text-zinc-400">{page.latin}</p>
              )}
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
                  className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50/40"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    ← Previous
                  </div>
                  <div className="mt-1 font-sans text-sm font-medium text-zinc-900 group-hover:text-rose-700">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 text-right transition hover:border-rose-300 hover:bg-rose-50/40"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    Next →
                  </div>
                  <div className="mt-1 font-sans text-sm font-medium text-zinc-900 group-hover:text-rose-700">
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
            {isAnatomy && "region" in page && page.region && (
              <SidebarBlock label="Region" value={page.region} />
            )}
            {isAnatomy && "innervation" in page && page.innervation.length > 0 && (
              <SidebarList label="Innervation" items={page.innervation} />
            )}
            {isAnatomy && "bloodSupply" in page && page.bloodSupply.length > 0 && (
              <SidebarList label="Blood supply" items={page.bloodSupply} />
            )}
            {related.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Related
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={r.href} className="text-zinc-700 hover:text-rose-700">
                        → {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.sources.length > 0 && (
              <SidebarList label="Sources" items={page.sources} muted />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function SidebarBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm capitalize text-zinc-800">{value}</div>
    </div>
  );
}

function SidebarList({
  label,
  items,
  muted,
}: {
  label: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <ul
        className={`mt-2 space-y-1 text-sm ${muted ? "text-zinc-500" : "text-zinc-700"}`}
      >
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
