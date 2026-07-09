import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "", priority: 1 },
    { path: "/guide", priority: 0.8 },
    { path: "/guide/how-to-track", priority: 0.7 },
    { path: "/guide/returned", priority: 0.7 },
    { path: "/guide/bulk-send", priority: 0.7 },
    { path: "/guide/mail-types", priority: 0.7 },
    { path: "/guide/tracking-number", priority: 0.7 },
    { path: "/how-to-use", priority: 0.6 },
    { path: "/faq", priority: 0.6 },
    { path: "/about", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
  ];

  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
