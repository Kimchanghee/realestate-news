import type { APIRoute } from 'astro';
import { site } from '../site.config.ts';
export const GET: APIRoute = () =>
  new Response(`${['Googlebot', 'Bingbot', 'Yeti', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'].map((a) => `User-agent: ${a}\nAllow: /\n`).join('\n')}\nUser-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
