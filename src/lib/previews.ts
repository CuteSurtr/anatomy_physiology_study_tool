export const systemPreviews: Record<
  string,
  { src: string; objectPosition?: string; bg?: string }
> = {
  foundations: { src: "/figures/foundations/anatomical-position.jpg", bg: "#f1f5f9" },
  cardiovascular: { src: "/figures/cardiovascular/heart-wapcaplet.svg", bg: "#fff5f5" },
  skeletal: { src: "/figures/skeletal/skeleton-anterior.svg", bg: "#fffbeb" },
  muscular: { src: "/figures/muscular/muscles-overview.jpg", bg: "#fef2f2" },
  nervous: { src: "/figures/nervous/nervous-overview.svg", bg: "#f5f3ff" },
  respiratory: { src: "/figures/respiratory/respiratory-overview.svg", bg: "#ecfeff" },
  digestive: { src: "/figures/digestive/digestive-overview.svg", bg: "#f7fee7" },
  urinary: { src: "/figures/urinary/urinary-overview.png", bg: "#fefce8" },
  endocrine: { src: "/figures/endocrine/endocrine-overview.jpg", bg: "#fdf4ff" },
  lymphatic: { src: "/figures/lymphatic/lymphatic-overview.png", bg: "#f0fdfa" },
  reproductive: { src: "/figures/reproductive/female-reproductive.svg", bg: "#fdf2f8" },
  integumentary: { src: "/figures/integumentary/skin-layers.png", bg: "#fff7ed", objectPosition: "center top" },
};
