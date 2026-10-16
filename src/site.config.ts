// Site-wide configuration. Public, non-secret values only.
// Analytics / verification IDs come from PUBLIC_* env vars at build time (see .env.example).

const env = (import.meta as any).env ?? {};

export const site = {
  domain: 'korearealestatenews.online',
  url: 'https://korearealestatenews.online',
  name: '집계산서',
  nameEn: 'Jipgyesanseo',
  tagline: '내 집 마련·전월세 비용 계산 데스크',
  description:
    '집계산서는 주택 취득세, 중개보수, 전월세 전환율, DSR·LTV, 주담대 상환액, 재산세를 현행 법령·고시 기준으로 계산하고 근거 조문과 기준일을 함께 보여주는 한국어 계산 서식 모음입니다.',
  locale: 'ko_KR',
  lang: 'ko',
  ga4Id: (env.PUBLIC_GA4_ID as string) || '',
  gscVerification: (env.PUBLIC_GSC_VERIFICATION as string) || '',
  naverVerification: (env.PUBLIC_NAVER_VERIFICATION as string) || '',
  adsenseClient: 'ca-pub-4490818204529253',
  // Enable only after publisher account and required certified CMP are verified.
  adsEnabled: env.PUBLIC_ADS_ENABLED === 'true',
  contactEmail: 'contact@korearealestatenews.online',
  // IndexNow key; the matching key file is public/<key>.txt
  indexNowKey: '9d4f933b26315f835a969b509128ba5a',
  // Affiliate URLs: empty until the owner signs up. Empty = neutral official links only.
  affiliates: {} as Record<string, string>,
  // AdSense manual ad-slot IDs (numeric strings from the AdSense UI). Empty = no reserved unit rendered.
  adSlots: { 'calc-below': '', 'guide-mid': '', 'guide-end': '' } as Record<string, string>,
  // Consent Mode v2: regions defaulting to denied (EEA + UK + CH)
  consentDeniedRegions: [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI',
    'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH',
  ],
} as const;

export const orgId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;

export function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return site.url + (path.startsWith('/') ? path : '/' + path);
}
