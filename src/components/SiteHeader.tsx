import Link from "next/link";
import { getSystemsSorted } from "@/lib/content";
import { MobileNav } from "./MobileNav";
import { SystemsMenu } from "./SystemsMenu";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const systems = getSystemsSorted();
  const navData = systems.map((s) => ({
    slug: s.slug,
    title: s.title,
    href: s.href,
    color: s.color,
  }));
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link
          href="/"
          className="font-sans text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Anatomy<span className="text-rose-600">+</span>Physio
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
          <SystemsMenu systems={navData} />
          <Link
            href="/pharmacology"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Pharmacology
          </Link>
          <Link
            href="/terminology"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Terminology
          </Link>
          <Link
            href="/practice"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Practice
          </Link>
          <Link
            href="/review"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Review
          </Link>
          <Link
            href="/study"
            className="rounded-md px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          <ThemeToggle />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav systems={navData} />
        </div>
      </div>
    </header>
  );
}
