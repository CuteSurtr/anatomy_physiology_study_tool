import type { MetadataRoute } from "next";
import { structures, processes, clinical, systems } from "@/lib/content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anatomy.cutesurtr.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/practice`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  const systemUrls = systems.map((s) => ({
    url: `${BASE}${s.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  const contentUrls = [...structures, ...processes, ...clinical].map((p) => ({
    url: `${BASE}${p.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...systemUrls, ...contentUrls];
}
