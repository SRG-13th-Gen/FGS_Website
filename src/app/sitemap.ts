import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/content/reads";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.SITE_INDEXABLE !== "true") return [];

  const urls: MetadataRoute.Sitemap = [
    { url: "https://flordegraceschoolinc.com/", priority: 1 },
    { url: "https://flordegraceschoolinc.com/alumni" },
    { url: "https://flordegraceschoolinc.com/pta" },
  ];
  // Every published article, whatever its category.
  const result = await getPublishedArticles();
  if (result.status !== "ok") return urls;
  for (const article of result.articles) {
    urls.push({
      url: `https://flordegraceschoolinc.com/news/${article.slug}`,
      lastModified: article.publishedAt
        ? new Date(article.publishedAt)
        : undefined,
    });
  }
  return urls;
}
