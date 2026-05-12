import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anatomy.cutesurtr.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/study", "/review", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
