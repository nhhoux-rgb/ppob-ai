import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";
import { TYPE_KEYS } from "./types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "", priority: 1 },
    { path: "/guide", priority: 0.8 },
    { path: "/sources", priority: 0.7 },
    { path: "/how-to-use", priority: 0.6 },
    { path: "/faq", priority: 0.6 },
    { path: "/privacy", priority: 0.3 },
    // 결과 유형별 공유 페이지
    ...TYPE_KEYS.map((k) => ({ path: `/r/${k}`, priority: 0.7 })),
  ];

  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
