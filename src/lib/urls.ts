// Single registry of every indexable URL with its real lastmod (content/rule/data date).
import { getCollection } from 'astro:content';
import { FORMS, DATA_PAGE } from './forms.ts';
import { CHECKED } from './rules.ts';
import baseRate from '../data/base-rate.json';

export interface UrlEntry { path: string; lastmod: string; title: string; kind: 'home' | 'calc' | 'data' | 'guide' | 'page' }

const latest = (...d: string[]) => d.sort().at(-1)!;

export async function allUrls(): Promise<UrlEntry[]> {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const guideLatest = latest(...guides.map((g) => g.data.updated));
  return [
    { path: '/', lastmod: latest(CHECKED, baseRate.asOf), title: '집계산서 홈', kind: 'home' },
    ...FORMS.map((f) => ({ path: f.path, lastmod: f.updated, title: f.title, kind: 'calc' as const })),
    { path: DATA_PAGE.path, lastmod: DATA_PAGE.updated, title: DATA_PAGE.title, kind: 'data' },
    { path: '/guide/', lastmod: guideLatest, title: '가이드 목록', kind: 'page' },
    ...guides.map((g) => ({ path: `/guide/${g.id}/`, lastmod: g.data.updated, title: g.data.h1, kind: 'guide' as const })),
    { path: '/about/', lastmod: CHECKED, title: '집계산서 소개', kind: 'page' },
    { path: '/methodology/', lastmod: latest(CHECKED, baseRate.asOf), title: '계산 방법·데이터 출처', kind: 'page' },
    { path: '/contact/', lastmod: CHECKED, title: '문의', kind: 'page' },
    { path: '/privacy/', lastmod: CHECKED, title: '개인정보처리방침', kind: 'page' },
    { path: '/terms/', lastmod: CHECKED, title: '이용약관', kind: 'page' },
    { path: '/disclaimer/', lastmod: CHECKED, title: '면책 고지', kind: 'page' },
  ];
}
