import {
  structures,
  processes,
  clinical,
  systems,
  pharmacology,
  terminology,
} from "#site/content";

export { structures, processes, clinical, systems, pharmacology, terminology };

export function getPharmacologyByCategory() {
  const map = new Map<string, { categoryOrder: number; items: typeof pharmacology }>();
  for (const p of pharmacology) {
    if (!map.has(p.category)) map.set(p.category, { categoryOrder: p.categoryOrder, items: [] as unknown as typeof pharmacology });
    map.get(p.category)!.items.push(p);
  }
  for (const v of map.values()) v.items.sort((a, b) => a.order - b.order);
  return Array.from(map.entries())
    .map(([category, { categoryOrder, items }]) => ({ category, categoryOrder, items }))
    .sort((a, b) => a.categoryOrder - b.categoryOrder);
}

export function getTerminologyByCategory() {
  const map = new Map<string, { categoryOrder: number; items: typeof terminology }>();
  for (const t of terminology) {
    if (!map.has(t.category)) map.set(t.category, { categoryOrder: t.categoryOrder, items: [] as unknown as typeof terminology });
    map.get(t.category)!.items.push(t);
  }
  for (const v of map.values()) v.items.sort((a, b) => a.order - b.order);
  return Array.from(map.entries())
    .map(([category, { categoryOrder, items }]) => ({ category, categoryOrder, items }))
    .sort((a, b) => a.categoryOrder - b.categoryOrder);
}

export function getPharmacology(slug: string) {
  return pharmacology.find((p) => p.slug === slug);
}

export function getTerminology(slug: string) {
  return terminology.find((t) => t.slug === slug);
}

export type AnyContent =
  | (typeof structures)[number]
  | (typeof processes)[number]
  | (typeof clinical)[number];

export function getSystem(slug: string) {
  return systems.find((s) => s.slug === slug);
}

export function getSystemsSorted() {
  return [...systems].sort((a, b) => a.order - b.order);
}

export function getBySystem(systemSlug: string) {
  return {
    anatomy: structures.filter((x) => x.system === systemSlug),
    physiology: processes.filter((x) => x.system === systemSlug),
    clinical: clinical.filter((x) => x.system === systemSlug),
  };
}

export function getPage(
  system: string,
  type: "anatomy" | "physiology" | "clinical",
  slug: string,
): AnyContent | undefined {
  const pool: AnyContent[] =
    type === "anatomy"
      ? (structures as unknown as AnyContent[])
      : type === "physiology"
        ? (processes as unknown as AnyContent[])
        : (clinical as unknown as AnyContent[]);
  return pool.find((x) => x.system === system && x.slug === slug);
}

export function findStructure(slug: string) {
  return structures.find((s) => s.slug === slug);
}
