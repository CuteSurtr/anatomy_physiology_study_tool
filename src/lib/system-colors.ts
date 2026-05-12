import { systems } from "@/lib/content";

export const systemColors: Record<string, string> = Object.fromEntries(
  systems.map((s) => [s.slug, s.color]),
);
