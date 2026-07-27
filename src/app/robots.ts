import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/tasks', '/settings', '/api/', '/_next/'],
    },
    sitemap: 'https://taskskill.vercel.app/sitemap.xml',
  };
}
