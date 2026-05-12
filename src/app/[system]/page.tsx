import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSystem, getBySystem, systems } from "@/lib/content";
import { MDXContent } from "@/lib/mdx";
import { systemPreviews } from "@/lib/previews";

export function generateStaticParams() {
  return systems.map((s) => ({ system: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system } = await params;
  const sys = getSystem(system);
  if (!sys) return { title: "Not found" };
  const title = `${sys.title} - Anatomy + Physio`;
  const description = `Anatomy, physiology, clinical correlations, and quizzes for the ${sys.title.toLowerCase()}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

type SectionProps = {
  title: string;
  items: { title: string; slug: string; href: string }[];
  emptyHint: string;
  color: string;
};

function Section({ title, items, emptyHint, color }: SectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span
          className="h-1.5 w-8 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
          {title}
        </h2>
        <span className="text-xs text-zinc-400">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">{emptyHint}</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.slug}>
              <Link
                href={i.href}
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition hover:border-rose-300 hover:bg-rose-50/40"
              >
                <span className="font-medium text-zinc-900 group-hover:text-rose-700">
                  {i.title}
                </span>
                <span className="text-zinc-400 group-hover:text-rose-600">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system } = await params;
  const sys = getSystem(system);
  if (!sys) notFound();

  const buckets = getBySystem(system);
  const preview = systemPreviews[system];

  return (
    <main>
      <div
        className="relative border-b border-zinc-200"
        style={{ backgroundColor: preview?.bg ?? "#fafafa" }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
              <Link href="/" className="hover:text-rose-700">
                Home
              </Link>
              <span>/</span>
              <span>System</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: sys.color }}
                aria-hidden
              />
              <h1 className="font-sans text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                {sys.title}
              </h1>
            </div>
            <p className="mt-4 max-w-2xl text-zinc-600 sm:text-lg">{sys.description}</p>
          </div>
          {preview && (
            <div className="hidden h-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.src}
                alt=""
                className="h-full w-full object-contain p-3"
                style={{ objectPosition: preview.objectPosition }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <article className="prose max-w-3xl">
          <MDXContent code={sys.body} />
        </article>

        <div className="mt-12 grid gap-10">
          <Section
            title="Anatomy"
            items={buckets.anatomy}
            emptyHint="No anatomy pages yet."
            color={sys.color}
          />
          <Section
            title="Physiology"
            items={buckets.physiology}
            emptyHint="No physiology pages yet."
            color={sys.color}
          />
          {buckets.clinical.length > 0 && (
            <Section
              title="Clinical correlations"
              items={buckets.clinical}
              emptyHint=""
              color={sys.color}
            />
          )}
        </div>
      </div>
    </main>
  );
}
