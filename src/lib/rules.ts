// Statutory parameters used by the calculators.
// Every value here was checked against the official text on `checked` (KST).
// When a law changes, update the value, its `effective` date and `checked`, then re-run `pnpm test`.

export interface Basis {
  label: string;
  law: string;
  url: string;
  effective: string; // date the cited version took effect
  checked: string; // date we last compared against the official text
}

export const CHECKED = '2026-10-15';

export const basis = {
  acquisition: {
    label: '주택 유상취득 취득세율',
    law: '지방세법 제11조 제1항 제8호, 제13조의2, 제151조 / 농어촌특별세법 제5조',
    url: 'https://www.law.go.kr/법령/지방세법',
    effective: '2026-07-01',
    checked: CHECKED,
  },
  firstHome: {
    label: '생애최초 주택 구입 취득세 감면',
    law: '지방세특례제한법 제36조의3 (법률 제21738호, 2026-06-02 시행)',
    url: 'https://www.law.go.kr/법령/지방세특례제한법',
    effective: '2026-06-02',
    checked: CHECKED,
  },
  brokerage: {
    label: '주택 중개보수 상한요율',
    law: '공인중개사법 시행규칙 제20조 제1항 [별표 1]',
    url: 'https://www.law.go.kr/법령/공인중개사법시행규칙',
    effective: '2021-10-19',
    checked: CHECKED,
  },
  conversion: {
    label: '보증금의 월차임 전환 시 산정률 상한',
    law: '주택임대차보호법 제7조의2, 같은 법 시행령 제9조',
    url: 'https://www.law.go.kr/법령/주택임대차보호법시행령',
    effective: '2021-01-01',
    checked: CHECKED,
  },
  propertyTax: {
    label: '주택 재산세 과세표준·세율',
    law: '지방세법 제110조·제111조·제111조의2·제112조·제151조, 같은 법 시행령 제109조',
    url: 'https://www.law.go.kr/법령/지방세법시행령',
    effective: '2026-05-29',
    checked: CHECKED,
  },
  lending: {
    label: 'DSR·스트레스 DSR·LTV 행정지도',
    law: '금융위원회 가계부채 관리방안·주택시장 안정화 대책 (2025-07-01 스트레스 DSR 3단계, 2025-10-16 수도권·규제지역 하한 상향)',
    url: 'https://www.fsc.go.kr/no010101',
    effective: '2025-10-16',
    checked: CHECKED,
  },
} satisfies Record<string, Basis>;

// ── 취득세 (지방세법 제11조①8, 제13조의2) ─────────────────────────────
export const ACQ = {
  low: 600_000_000, // 6억 이하 1%
  high: 900_000_000, // 9억 초과 3%
  surcharge8: 0.08,
  surcharge12: 0.12,
  eduSurcharged: 0.004, // 중과 시 지방교육세 (4%-2%)×20%
  ruralBase: 0.002, // 농특세 (전용 85㎡ 초과): 일반 0.2%
  rural8: 0.006,
  rural12: 0.01,
  ruralOnRelief: 0.2, // 감면세액의 20% (서민주택 85㎡ 이하는 비과세)
  firstHomeMaxPrice: 1_200_000_000,
  firstHomeLimit: 2_000_000,
  firstHomeLimitSmall: 3_000_000,
} as const;

// ── 중개보수 [별표 1] ───────────────────────────────────────────────
// [upper bound exclusive, rate, cap(원) or null]
export type Band = readonly [number, number, number | null];
export const BROKER_SALE: readonly Band[] = [
  [50_000_000, 0.006, 250_000],
  [200_000_000, 0.005, 800_000],
  [900_000_000, 0.004, null],
  [1_200_000_000, 0.005, null],
  [1_500_000_000, 0.006, null],
  [Infinity, 0.007, null],
];
export const BROKER_LEASE: readonly Band[] = [
  [50_000_000, 0.005, 200_000],
  [100_000_000, 0.004, 300_000],
  [600_000_000, 0.003, null],
  [1_200_000_000, 0.004, null],
  [1_500_000_000, 0.005, null],
  [Infinity, 0.006, null],
];
export const BROKER_OFFICETEL = { sale: 0.005, lease: 0.004 } as const; // 전용 85㎡ 이하 등 요건 충족 오피스텔
export const BROKER_OTHER_MAX = 0.009; // 주택 외 (요건 미충족 오피스텔·상가·토지 등): 0.9% 이내 협의

// ── 전월세 전환율 (주임법 시행령 제9조) ──────────────────────────────
export const CONVERSION = { fixedCap: 10, spread: 2 } as const; // min(10%, 기준금리 + 2%p)

// ── 재산세 (지방세법 제111조, 제111조의2, 시행령 제109조) ────────────
export const PROPERTY = {
  ratioGeneral: 0.6,
  ratioOneHouse: [
    [300_000_000, 0.43],
    [600_000_000, 0.44],
    [Infinity, 0.45],
  ] as const,
  specialRateMaxPrice: 900_000_000, // 1세대1주택 특례세율: 공시가격 9억 이하
  standard: [
    // [과표 상한, 기본세액, 초과분 세율, 구간 하한]
    [60_000_000, 0, 0.001, 0],
    [150_000_000, 60_000, 0.0015, 60_000_000],
    [300_000_000, 195_000, 0.0025, 150_000_000],
    [Infinity, 570_000, 0.004, 300_000_000],
  ] as const,
  special: [
    [60_000_000, 0, 0.0005, 0],
    [150_000_000, 30_000, 0.001, 60_000_000],
    [300_000_000, 120_000, 0.002, 150_000_000],
    [Infinity, 420_000, 0.0035, 300_000_000],
  ] as const,
  cityRate: 0.0014, // 도시지역분 (제112조)
  eduRate: 0.2, // 지방교육세 = 재산세 × 20%
  splitThreshold: 200_000, // 주택분 재산세 20만원 이하면 7월 일괄 부과 (제115조②)
  compTaxOneHouse: 1_200_000_000, // 종부세 공제: 1세대1주택 12억
  compTaxGeneral: 900_000_000, // 일반 9억
} as const;

// ── 대출 행정지도 (기본값; 사용자가 바꿀 수 있음) ───────────────────
export const LENDING = {
  dsrBank: 40,
  dsrNonBank: 50,
  stressBase: 1.5, // 3단계 스트레스 DSR 기본 (2025-07-01)
  stressMetroFloor: 3.0, // 수도권·규제지역 주담대 하한 (2025-10-16)
  ltvRegulated: 40,
  ltvNonRegulated: 70,
  // 수도권·규제지역 주택담보대출 최대 한도 (시가 기준)
  metroCaps: [
    [1_500_000_000, 600_000_000],
    [2_500_000_000, 400_000_000],
    [Infinity, 200_000_000],
  ] as const,
} as const;
