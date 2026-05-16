import Link from "next/link";
import { getSystemsSorted, getBySystem } from "@/lib/content";
import { systemPreviews } from "@/lib/previews";
import { SearchBox } from "@/components/SearchBox";
import { getSearchDocs } from "@/lib/search-docs";

export default function HomePage() {
  const systems = getSystemsSorted();
  const docs = getSearchDocs();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <section className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          Open anatomy &amp; physiology
        </div>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          Anatomy &amp; physiology,{" "}
          <span className="text-rose-700">open reference.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          Twelve body systems with anatomy, physiology, histology, clinical correlations,
          and quizzes on every page. All figures are openly licensed - OpenStax CC-BY,
          Wikimedia public domain, and classic atlases.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-rose-700 px-5 py-2 text-sm font-medium text-white hover:bg-rose-800"
          >
            Mixed practice quiz →
          </Link>
        </div>
        <div className="mt-8 max-w-2xl">
          <SearchBox docs={docs} />
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-zinc-900">
            Body systems
          </h2>
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Click any to dive in
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((s) => {
            const buckets = getBySystem(s.slug);
            const preview = systemPreviews[s.slug];
            const counts = buckets.anatomy.length + buckets.physiology.length;
            return (
              <Link
                key={s.slug}
                href={s.href}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200/60"
              >
                <div
                  className="relative h-40 w-full overflow-hidden"
                  style={{ backgroundColor: preview?.bg ?? "#f4f4f5" }}
                >
                  {preview && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={preview.src}
                      alt=""
                      className="h-full w-full object-contain p-3 transition group-hover:scale-105"
                      style={{ objectPosition: preview.objectPosition }}
                    />
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-sans text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-rose-700">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                      {buckets.anatomy.length} anatomy
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                      {buckets.physiology.length} physiology
                    </span>
                    <span className="ml-auto">{counts} pages</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
