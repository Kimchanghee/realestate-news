import type { Locale } from './i18n';

export type Category = { slug: string; name: Partial<Record<Locale, string>>; };
export type RSSSource = { url: string; category: string; weight?: number; };

export const channel = {
  id: 'REALESTATE',
  name: '코리아부동산데일리',
  tagline: '한국 부동산 시세 · 정책 · 분양 소식을 매일 5분 안에',
  description: '아파트 시세, 청약, 정부 부동산 정책, 분양·재건축 뉴스를 초등생도 이해할 수 있게 정리합니다.',
  domain: 'korearealestatenews.online',
  accent: 'blue',
  keywords: ['부동산', '아파트', '청약', '분양', '시세', '재건축'],
  geo: { country: 'KR', region: 'Asia', primaryCity: 'Seoul' },
  rssSources: [
    { url: 'https://www.mk.co.kr/rss/50300009/', category: 'market' },
    { url: 'https://www.hankyung.com/feed/realestate', category: 'breaking' },
    { url: 'https://rss.mt.co.kr/mt_realestate.xml', category: 'policy' },
    { url: 'https://rss.donga.com/economy.xml', category: 'analysis' },
    { url: 'https://www.yna.co.kr/rss/economy.xml', category: 'analysis' }
  ] as RSSSource[],
  categories: [
    { slug: 'breaking', name: { ko: '속보', en: 'Breaking', ja: '速報', zh: '快讯', es: 'Última hora', pt: 'Última hora', de: 'Eilmeldung', fr: 'Dernières', ar: 'عاجل', hi: 'ब्रेकिंग', id: 'Terbaru' } },
    { slug: 'market',   name: { ko: '시세', en: 'Market', ja: '相場', zh: '行情', es: 'Mercado', pt: 'Mercado', de: 'Markt', fr: 'Marché', ar: 'السوق', hi: 'बाज़ार', id: 'Pasar' } },
    { slug: 'policy',   name: { ko: '정책', en: 'Policy', ja: '政策', zh: '政策', es: 'Política', pt: 'Política', de: 'Politik', fr: 'Politique', ar: 'سياسات', hi: 'नीति', id: 'Kebijakan' } },
    { slug: 'analysis', name: { ko: '분석', en: 'Analysis', ja: '分析', zh: '分析', es: 'Análisis', pt: 'Análise', de: 'Analyse', fr: 'Analyse', ar: 'تحليل', hi: 'विश्लेषण', id: 'Analisis' } }
  ] as Category[]
};

export type ChannelConfig = typeof channel;
