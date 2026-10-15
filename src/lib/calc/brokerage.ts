import { BROKER_LEASE, BROKER_OFFICETEL, BROKER_OTHER_MAX, BROKER_SALE, type Band } from '../rules.ts';
import { won } from './util.ts';
import type { CalcError } from './acquisition.ts';

export type Deal = 'sale' | 'lease' | 'monthly';
export type Kind = 'house' | 'officetel' | 'other';

export interface BrokerInput {
  deal: Deal;
  kind: Kind;
  price: number; // 매매가 또는 전세 보증금 또는 월세 보증금
  monthly: number; // 월차임 (월세만)
  vat: boolean; // 일반과세자 부가가치세 10% 별도
}

export interface BrokerResult {
  ok: true;
  base: number; // 거래금액
  baseNote: string;
  rate: number;
  cap: number | null;
  fee: number; // 상한 중개보수 (부가세 제외)
  vatAmount: number;
  total: number;
  capped: boolean;
  negotiable: boolean; // 0.9% 이내 협의 구간
}

export function band(amount: number, table: readonly Band[]): Band {
  for (const b of table) if (amount < b[0]) return b;
  return table[table.length - 1];
}

/** 월세 거래금액 환산 (별표1 비고): 보증금 + 월차임×100, 5천만원 미만이면 보증금 + 월차임×70 */
export function monthlyBase(deposit: number, monthly: number): { base: number; note: string } {
  const b100 = deposit + monthly * 100;
  if (b100 < 50_000_000) {
    return { base: deposit + monthly * 70, note: '보증금 + 월세×100이 5천만원 미만이라 보증금 + 월세×70을 적용' };
  }
  return { base: b100, note: '보증금 + 월세×100' };
}

export function calcBrokerage(i: BrokerInput): BrokerResult | CalcError {
  if (!Number.isFinite(i.price) || i.price < 0) {
    return { ok: false, field: 'price', message: '금액을 0 이상으로 입력하세요.' };
  }
  if (i.deal === 'monthly' && (!Number.isFinite(i.monthly) || i.monthly <= 0)) {
    return { ok: false, field: 'monthly', message: '월세 금액을 입력하세요.' };
  }
  if (i.deal !== 'monthly' && i.price <= 0) {
    return { ok: false, field: 'price', message: '거래금액을 0보다 큰 금액으로 입력하세요.' };
  }
  let base = Math.floor(i.price);
  let baseNote = i.deal === 'sale' ? '매매가' : '전세 보증금';
  if (i.deal === 'monthly') {
    const m = monthlyBase(Math.floor(i.price), Math.floor(i.monthly));
    base = m.base;
    baseNote = m.note;
  }
  const isSale = i.deal === 'sale';
  let rate: number;
  let cap: number | null = null;
  let negotiable = false;
  if (i.kind === 'house') {
    const b = band(base, isSale ? BROKER_SALE : BROKER_LEASE);
    rate = b[1];
    cap = b[2];
  } else if (i.kind === 'officetel') {
    rate = isSale ? BROKER_OFFICETEL.sale : BROKER_OFFICETEL.lease;
  } else {
    rate = BROKER_OTHER_MAX;
    negotiable = true;
  }
  const raw = won(base * rate);
  const fee = cap !== null ? Math.min(raw, cap) : raw;
  const vatAmount = i.vat ? won(fee * 0.1) : 0;
  return {
    ok: true,
    base,
    baseNote,
    rate,
    cap,
    fee,
    vatAmount,
    total: fee + vatAmount,
    capped: cap !== null && raw > cap,
    negotiable,
  };
}
