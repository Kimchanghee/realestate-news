import type { APIRoute } from 'astro';
import { site } from '../site.config.ts';
import { allUrls } from '../lib/urls.ts';
export const GET: APIRoute = async () => {
  const last = (await allUrls()).map((u) => u.lastmod).sort().at(-1);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${site.url}/sitemap-0.xml</loc><lastmod>${last}</lastmod></sitemap>\n</sitemapindex>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
