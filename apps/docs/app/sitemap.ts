import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/demo`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/docs`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/docs/self-hosting`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/docs/api`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/docs/security`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/login`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
