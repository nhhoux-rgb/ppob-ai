import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "", priority: 1 },
    { path: "/guide", priority: 0.8 },
    { path: "/guide/wealth", priority: 0.8 },
    { path: "/guide/focus", priority: 0.8 },
    { path: "/how-to-use", priority: 0.6 },
    { path: "/faq", priority: 0.6 },
    { path: "/privacy", priority: 0.3 },
  ];

  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
