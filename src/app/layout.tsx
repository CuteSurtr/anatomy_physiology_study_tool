import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/Toaster";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Anatomy & Physiology - free and public",
  description:
    "A free, public anatomy and physiology reference. Twelve body systems, openly licensed figures, clinical correlations, and quizzes on every page.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
        <SiteHeader />
        {children}
        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 mt-16">
          <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-zinc-500 dark:text-zinc-400">
            <p>
              Built on open content - OpenStax Anatomy &amp; Physiology 2e (CC-BY), Wikimedia
              Commons (PD / CC-BY-SA), Gray&apos;s Anatomy (1918, PD), Sobotta&apos;s Atlas (1909, PD).
            </p>
            <p className="mt-2">
              Educational use only. Not medical advice.
            </p>
          </div>
        </footer>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
