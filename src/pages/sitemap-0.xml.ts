import type { APIRoute } from 'astro';
import { abs } from '../site.config.ts';
import { allUrls } from '../lib/urls.ts';
export const GET: APIRoute = async () => {
  const rows = (await allUrls()).map((u) => `  <url><loc>${abs(u.path)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
