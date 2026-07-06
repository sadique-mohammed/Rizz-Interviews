import { MetadataRoute } from 'next';

import rolesData from '@/data/seo-roles.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const roleUrls = rolesData.map((role) => ({
    url: `${baseUrl}/practice/${role.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...roleUrls,
  ];
}
