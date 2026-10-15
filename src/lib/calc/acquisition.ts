import { ACQ } from '../rules.ts';
import { won } from './util.ts';

export interface AcqInput {
  price: number; // 취득당시가액 (원)
  houses: number; // 취득 후 1세대 보유 주택 수 (이 주택 포함), 1~4 (4 = 4채 이상)
  regulated: boolean; // 조정대상지역 소재
  over85: boolean; // 전용면적 85㎡ 초과
  temporary: boolean; // 일시적 2주택 (종전 주택 처분 예정)
  firstHome: boolean; // 생애최초 감면 신청
  firstHomeSmall: boolean; // 300만원 한도 요건 (지특법 제36조의3①1 가~라목)
}

export interface AcqLine {
  key: string;
  label: string;
  rate: number; // 과세표준 대비 실효 비율
  amount: number;
}

export interface AcqResult {
  ok: true;
  mode: 'general' | 'surcharge8' | 'surcharge12';
  acqRate: number;
  lines: AcqLine[];
  relief: number; // 생애최초 감면액
  reliefRural: number; // 감면분 농특세
  reliefNote: string | null;
  total: number;
}

export interface CalcError {
  ok: false;
  field: string;
  message: string;
}

/** 지방세법 제11조①8: 6억 초과 9억 이하 구간 세율. 소수점 이하 다섯째 자리에서 반올림. */
export function middleRate(price: number): number {
  const r = ((price * 2) / 300_000_000 - 3) / 100;
  return Math.round(r * 10_000) / 10_000;
}

export function baseRate(price: number): number {
  if (price <= ACQ.low) return 0.01;
  if (price <= ACQ.high) return middleRate(price);
  return 0.03;
}

export function acqMode(i: Pick<AcqInput, 'houses' | 'regulated' | 'temporary'>): AcqResult['mode'] {
  const n = Math.min(Math.max(Math.trunc(i.houses), 1), 4);
  if (i.regulated) {
    if (n === 2) return i.temporary ? 'general' : 'surcharge8';
    if (n >= 3) return 'surcharge12';
    return 'general';
  }
  if (n === 3) return 'surcharge8';
  if (n >= 4) return 'surcharge12';
  return 'general';
}

export function calcAcquisition(i: AcqInput): AcqResult | CalcError {
  if (!Number.isFinite(i.price) || i.price <= 0) {
    return { ok: false, field: 'price', message: '취득가액을 0보다 큰 금액으로 입력하세요.' };
  }
  if (i.price > 1e13) {
    return { ok: false, field: 'price', message: '1조원 이하로 입력하세요.' };
  }
  const p = Math.floor(i.price);
  const mode = acqMode(i);
  const general = baseRate(p);
  let acqRate = general;
  let edu: number;
  let rural: number;
  if (mode === 'general') {
    edu = general * 0.5 * 0.2; // 해당 세율 × 50% × 20%
    rural = ACQ.ruralBase;
  } else if (mode === 'surcharge8') {
    acqRate = ACQ.surcharge8;
    edu = ACQ.eduSurcharged;
    rural = ACQ.rural8;
  } else {
    acqRate = ACQ.surcharge12;
    edu = ACQ.eduSurcharged;
    rural = ACQ.rural12;
  }
  const acqTax = won(p * acqRate);
  const eduTax = won(p * edu);
  const ruralTax = i.over85 ? won(p * rural) : 0;

  let relief = 0;
  let reliefRural = 0;
  let reliefNote: string | null = null;
  if (i.firstHome) {
    const n = Math.trunc(i.houses);
    if (n !== 1) {
      reliefNote = '생애최초 감면은 취득 후 1주택(본인·배우자 모두 무주택 이력)일 때만 적용됩니다.';
    } else if (p > ACQ.firstHomeMaxPrice) {
      reliefNote = '취득당시가액이 12억원을 넘으면 생애최초 감면 대상이 아닙니다.';
    } else {
      const limit = i.firstHomeSmall ? ACQ.firstHomeLimitSmall : ACQ.firstHomeLimit;
      // 감면 기준 산출세액 = 제11조①8 세율로 산출한 취득세액
      const base = won(p * general);
      relief = Math.min(base, limit);
      reliefRural = i.over85 ? won(relief * ACQ.ruralOnRelief) : 0;
      reliefNote =
        relief === base
          ? `산출세액이 한도(${limit / 10_000}만원) 이하라 취득세 본세가 면제됩니다.`
          : `취득세 본세에서 ${limit / 10_000}만원을 공제합니다.`;
    }
  }

  const lines: AcqLine[] = [
    { key: 'acq', label: '취득세', rate: acqRate, amount: acqTax },
    { key: 'edu', label: '지방교육세', rate: edu, amount: eduTax },
    { key: 'rural', label: '농어촌특별세', rate: i.over85 ? rural : 0, amount: ruralTax },
  ];
  const total = acqTax + eduTax + ruralTax - relief + reliefRural;
  return { ok: true, mode, acqRate, lines, relief, reliefRural, reliefNote, total };
}
