import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anatomy + Physio",
    short_name: "Anat+Phys",
    description: "Open anatomy and physiology reference with quizzes + spaced repetition.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#be123c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
