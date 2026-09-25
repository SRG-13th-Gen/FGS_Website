import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/wordpress/reads";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.SITE_INDEXABLE !== "true") return [];

  const urls: MetadataRoute.Sitemap = [
    { url: "https://flordegraceschoolinc.com/", priority: 1 },
  ];
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
