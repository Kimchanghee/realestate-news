import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../site.config.ts';
export async function GET(context: APIContext) {
  const guides = (await getCollection('guides')).sort((a, b) => (b.data.updated + b.data.published).localeCompare(a.data.updated + a.data.published));
  return rss({
    title: `${site.name} 가이드`,
    description: site.description,
    site: context.site ?? site.url,
    customData: '<language>ko-kr</language>',
    items: guides.map((g) => ({
      title: g.data.h1,
      link: `/guide/${g.id}/`,
      description: g.data.answer,
      pubDate: new Date(g.data.published + 'T09:00:00+09:00'),
    })),
  });
}
