import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guarantees for the content library.
 *
 * These are the invariants that fail silently: a figure whose sidecar is missing renders an
 * amber "Missing figure metadata" box, a DiagramQuiz without labels renders a "needs viewBox +
 * labels" box, and a licence recorded as Public Domain when the upstream file is CC BY-SA is
 * invisible until somebody checks. None of that shows up in a typecheck or a build, so it is
 * pinned here instead.
 */

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const FIGURES = path.join(ROOT, "public", "figures");

type Sidecar = {
  src?: string;
  alt?: string;
  viewBox?: [number, number, number, number];
  labels?: Array<{ x?: number; y?: number; answer?: string; name?: string }>;
  license?: { type?: string; attribution?: string; url?: string };
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const toPosix = (p: string) => p.split(path.sep).join("/");

const mdxFiles = walk(CONTENT).filter((f) => f.endsWith(".mdx"));
const sidecarFiles = walk(FIGURES).filter((f) => f.endsWith(".json"));

const sidecarName = (f: string) => toPosix(path.relative(FIGURES, f)).slice(0, -".json".length);

const sidecars = new Map<string, Sidecar>();
for (const file of sidecarFiles) {
  sidecars.set(sidecarName(file), JSON.parse(fs.readFileSync(file, "utf-8")) as Sidecar);
}

/** Collect `<Tag name="..." />` references out of every MDX page. */
function references(tag: string): Array<{ name: string; page: string }> {
  const pattern = new RegExp("<" + tag + "[^>]*name=\"([^\"]+)\"", "g");
  const found: Array<{ name: string; page: string }> = [];
  for (const file of mdxFiles) {
    const text = fs.readFileSync(file, "utf-8");
    const page = toPosix(path.relative(ROOT, file));
    for (const match of text.matchAll(pattern)) found.push({ name: match[1], page });
  }
  return found;
}

const figureRefs = references("Figure");
const quizRefs = references("DiagramQuiz");

describe("content library structure", () => {
  it("finds the content and figure trees", () => {
    expect(mdxFiles.length).toBeGreaterThan(100);
    expect(sidecars.size).toBeGreaterThan(400);
  });

  it("every <Figure> resolves to a sidecar", () => {
    const missing = figureRefs.filter((r) => !sidecars.has(r.name));
    expect(missing.map((m) => `${m.name} (${m.page})`)).toEqual([]);
  });

  it("every <DiagramQuiz> resolves to a sidecar", () => {
    const missing = quizRefs.filter((r) => !sidecars.has(r.name));
    expect(missing.map((m) => `${m.name} (${m.page})`)).toEqual([]);
  });

  it("every sidecar points at an image file that exists", () => {
    const broken: string[] = [];
    for (const [name, data] of sidecars) {
      if (!data.src) {
        broken.push(`${name}: no src`);
        continue;
      }
      const file = path.join(ROOT, "public", data.src.replace(/^\//, ""));
      if (!fs.existsSync(file)) broken.push(`${name}: ${data.src}`);
    }
    expect(broken).toEqual([]);
  });

  it("every sidecar has non-empty alt text", () => {
    const bad = [...sidecars.entries()]
      .filter(([, d]) => !d.alt || !d.alt.trim())
      .map(([n]) => n);
    expect(bad).toEqual([]);
  });
});

describe("diagram quizzes render rather than warn", () => {
  // DiagramQuizFromName renders a visible amber warning box unless all three are present.
  it("every quiz target has src, viewBox and labels", () => {
    const broken: string[] = [];
    for (const ref of quizRefs) {
      const data = sidecars.get(ref.name);
      if (!data) continue;
      const missing: string[] = [];
      if (!data.src) missing.push("src");
      if (!data.viewBox) missing.push("viewBox");
      if (!data.labels || data.labels.length === 0) missing.push("labels");
      if (missing.length) broken.push(`${ref.name}: missing ${missing.join("+")}`);
    }
    expect(broken).toEqual([]);
  });

  it("every label sits inside its own viewBox", () => {
    const outside: string[] = [];
    for (const [name, data] of sidecars) {
      if (!data.viewBox || !data.labels) continue;
      const [vx, vy, vw, vh] = data.viewBox;
      for (const label of data.labels) {
        const { x, y } = label;
        if (typeof x !== "number" || typeof y !== "number") {
          outside.push(`${name}: "${label.answer ?? label.name ?? "?"}" has no numeric x/y`);
          continue;
        }
        if (x < vx || x > vx + vw || y < vy || y > vy + vh) {
          outside.push(`${name}: "${label.answer ?? label.name ?? "?"}" at (${x},${y})`);
        }
      }
    }
    expect(outside).toEqual([]);
  });
});

describe("licence metadata is complete and specific", () => {
  it("every sidecar carries a licence object, not a bare string", () => {
    const bad: string[] = [];
    for (const [name, data] of sidecars) {
      if (!data.license) bad.push(`${name}: no licence block`);
      else if (typeof data.license !== "object") bad.push(`${name}: licence is not an object`);
      else if (!data.license.type) bad.push(`${name}: no licence type`);
      else if (!data.license.attribution) bad.push(`${name}: no attribution`);
    }
    expect(bad).toEqual([]);
  });

  // A Commons *category* page cannot establish the licence of any single image in it.
  it("no licence URL points at a Wikimedia category", () => {
    const categories = [...sidecars.entries()]
      .filter(([, d]) => d.license?.url?.includes("/wiki/Category:"))
      .map(([n]) => n);
    expect(categories).toEqual([]);
  });

  // Unversioned or self-contradictory strings are not verifiable claims.
  it("licence strings are specific and versioned", () => {
    // Every published Creative Commons version, plus the two public-domain markers. A bare
    // "CC BY" or a "Public Domain / CC-BY" is not a verifiable claim: the version determines
    // whether ShareAlike applies and how attribution must be given.
    const allowed = new Set([
      "Public Domain",
      "CC0",
      "CC BY 1.0",
      "CC BY 2.0",
      "CC BY 2.5",
      "CC BY 3.0",
      "CC BY 4.0",
      "CC BY-SA 1.0",
      "CC BY-SA 2.0",
      "CC BY-SA 2.5",
      "CC BY-SA 3.0",
      "CC BY-SA 4.0",
    ]);
    const vague = [...sidecars.entries()]
      .filter(([, d]) => d.license?.type && !allowed.has(d.license.type))
      .map(([n, d]) => `${n}: "${d.license?.type}"`);
    expect(vague).toEqual([]);
  });
});
