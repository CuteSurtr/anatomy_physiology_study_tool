import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";

const structures = defineCollection({
  name: "Structure",
  pattern: "systems/*/anatomy/*.mdx",
  schema: s
    .object({
      title: s.string(),
      latin: s.string().optional(),
      system: s.string(),
      region: s.string().optional(),
      related: s.array(s.string()).default([]),
      innervation: s.array(s.string()).default([]),
      bloodSupply: s.array(s.string()).default([]),
      figures: s.array(s.string()).default([]),
      sources: s.array(s.string()).default([]),
      level: s.enum(["undergrad", "nursing", "med-school"]).default("undergrad"),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const parts = data.path.split("/");
      const slug = parts[parts.length - 1];
      return {
        ...data,
        slug,
        type: "anatomy" as const,
        href: `/${data.system}/anatomy/${slug}`,
      };
    }),
});

const processes = defineCollection({
  name: "Process",
  pattern: "systems/*/physiology/*.mdx",
  schema: s
    .object({
      title: s.string(),
      system: s.string(),
      related: s.array(s.string()).default([]),
      figures: s.array(s.string()).default([]),
      sources: s.array(s.string()).default([]),
      level: s.enum(["undergrad", "nursing", "med-school"]).default("undergrad"),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const parts = data.path.split("/");
      const slug = parts[parts.length - 1];
      return {
        ...data,
        slug,
        type: "physiology" as const,
        href: `/${data.system}/physiology/${slug}`,
      };
    }),
});

const clinical = defineCollection({
  name: "Clinical",
  pattern: "systems/*/clinical/*.mdx",
  schema: s
    .object({
      title: s.string(),
      system: s.string(),
      related: s.array(s.string()).default([]),
      figures: s.array(s.string()).default([]),
      sources: s.array(s.string()).default([]),
      level: s.enum(["undergrad", "nursing", "med-school"]).default("nursing"),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const parts = data.path.split("/");
      const slug = parts[parts.length - 1];
      return {
        ...data,
        slug,
        type: "clinical" as const,
        href: `/${data.system}/clinical/${slug}`,
      };
    }),
});

const systems = defineCollection({
  name: "System",
  pattern: "systems/*/overview.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      color: s.string().default("#dc2626"),
      order: s.number().default(99),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const slug = data.path.split("/")[1];
      return { ...data, slug, href: `/${slug}` };
    }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  collections: { structures, processes, clinical, systems },
  mdx: {
    rehypePlugins: [rehypeSlug],
  },
});
