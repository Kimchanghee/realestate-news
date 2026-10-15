// JSON-LD builders. Everything passed in must also be visible on the page (gate checks this).
import { site, orgId, websiteId, abs } from '../site.config.ts';

export const organization = () => ({
  '@type': 'Organization',
  '@id': orgId,
  name: site.name,
  alternateName: site.nameEn,
  url: site.url + '/',
  logo: abs('/logo.png'),
  email: site.contactEmail,
  description: site.description,
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': websiteId,
  name: site.name,
  url: site.url + '/',
  inLanguage: 'ko-KR',
  publisher: { '@id': orgId },
});

export const breadcrumb = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const faqPage = (faq: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const webApp = (o: { name: string; path: string; description: string; dateModified: string }) => ({
  '@type': 'WebApplication',
  '@id': abs(o.path) + '#app',
  name: o.name,
  url: abs(o.path),
  description: o.description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any (web browser)',
  inLanguage: 'ko-KR',
  isAccessibleForFree: true,
  dateModified: o.dateModified,
  publisher: { '@id': orgId },
});

export const article = (o: {
  headline: string;
  path: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image: string;
}) => ({
  '@type': 'Article',
  '@id': abs(o.path) + '#article',
  headline: o.headline,
  description: o.description,
  url: abs(o.path),
  mainEntityOfPage: abs(o.path),
  image: abs(o.image),
  inLanguage: 'ko-KR',
  datePublished: o.datePublished,
  dateModified: o.dateModified,
  author: { '@id': orgId },
  publisher: { '@id': orgId },
});

export const webPage = (o: { name: string; path: string; description: string; dateModified: string; type?: string }) => ({
  '@type': o.type ?? 'WebPage',
  '@id': abs(o.path) + '#page',
  name: o.name,
  url: abs(o.path),
  description: o.description,
  inLanguage: 'ko-KR',
  dateModified: o.dateModified,
  isPartOf: { '@id': websiteId },
  publisher: { '@id': orgId },
});

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
