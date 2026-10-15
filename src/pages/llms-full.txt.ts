import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, abs } from '../site.config.ts';
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const parts = [`# ${site.name} 가이드 전문 (${site.domain})\n\n${site.description}\n`];
  for (const g of guides) {
    const src = g.data.sources.map((s) => `- ${s.name}: ${s.url}`).join('\n');
    parts.push(`\n---\n\n# ${g.data.h1}\n\nURL: ${abs(`/guide/${g.id}/`)}\n갱신: ${g.data.updated} · 데이터 기준일: ${g.data.data_asof}\n\n${g.data.answer}\n\n${g.body ?? ''}\n\n출처:\n${src}\n`);
  }
  return new Response(parts.join(''), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
