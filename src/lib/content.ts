import {
  structures,
  processes,
  clinical,
  systems,
} from "#site/content";

export { structures, processes, clinical, systems };

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
