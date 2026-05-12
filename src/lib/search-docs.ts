import fs from "node:fs";
import path from "node:path";
import { structures, processes, clinical } from "@/lib/content";

export type SearchDoc = {
  title: string;
  system: string;
  type: string;
  href: string;
  body: string;
};

function readSourceText(relPath: string): string {
  const full = path.join(process.cwd(), "content", `${relPath}.mdx`);
  try {
    const raw = fs.readFileSync(full, "utf-8");
    const noFront = raw.replace(/^---[\s\S]*?---\n/, "");
    return noFront
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .replace(/[#*_>`~|\\]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 1200);
  } catch {
    return "";
  }
}

export function getSearchDocs(): SearchDoc[] {
  const a = structures.map((x) => ({
    title: x.title,
    system: x.system,
    type: "anatomy",
    href: x.href,
    body: readSourceText(x.path),
  }));
  const p = processes.map((x) => ({
    title: x.title,
    system: x.system,
    type: "physiology",
    href: x.href,
    body: readSourceText(x.path),
  }));
  const c = clinical.map((x) => ({
    title: x.title,
    system: x.system,
    type: "clinical",
    href: x.href,
    body: readSourceText(x.path),
  }));
  return [...a, ...p, ...c];
}
