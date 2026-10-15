import { CONVERSION } from '../rules.ts';
import { won } from './util.ts';
import type { CalcError } from './acquisition.ts';

/** 주임법 시행령 제9조: min(연 10%, 한국은행 기준금리 + 연 2%p). 단위: % */
export function conversionCap(baseRatePct: number): number {
  const v = Math.min(CONVERSION.fixedCap, baseRatePct + CONVERSION.spread);
  return Math.round(v * 10_000) / 10_000;
}

export interface ConvInput {
  oldDeposit: number; // 현재 보증금
  newDeposit: number; // 바꿀 보증금 (더 적음)
  currentMonthly: number; // 현재 월세 (전세면 0)
  ratePct: number; // 적용할 전환율 (%)
  proposedMonthly?: number; // 집주인이 제시한 새 월세 (선택)
}

export interface ConvResult {
  ok: true;
  converted: number; // 월세로 바뀌는 보증금
  addMonthly: number; // 상한 전환율로 계산한 추가 월세
  maxMonthly: number; // 상한 기준 새 월세 합계
  annual: number;
  implied: number | null; // 제시 월세의 실제 전환율 (%)
  exceeds: boolean | null;
}

export function calcConversion(i: ConvInput): ConvResult | CalcError {
  if (!Number.isFinite(i.oldDeposit) || i.oldDeposit <= 0) {
    return { ok: false, field: 'oldDeposit', message: '현재 보증금을 입력하세요.' };
  }
  if (!Number.isFinite(i.newDeposit) || i.newDeposit < 0) {
    return { ok: false, field: 'newDeposit', message: '바꿀 보증금을 0 이상으로 입력하세요.' };
  }
  if (i.newDeposit >= i.oldDeposit) {
    return { ok: false, field: 'newDeposit', message: '바꿀 보증금은 현재 보증금보다 적어야 월세 전환 계산이 됩니다.' };
  }
  if (!Number.isFinite(i.ratePct) || i.ratePct <= 0 || i.ratePct > 20) {
    return { ok: false, field: 'ratePct', message: '전환율은 0~20% 사이로 입력하세요.' };
  }
  const cur = Number.isFinite(i.currentMonthly) && i.currentMonthly > 0 ? Math.floor(i.currentMonthly) : 0;
  const converted = Math.floor(i.oldDeposit) - Math.floor(i.newDeposit);
  const annual = won((converted * i.ratePct) / 100);
  const addMonthly = won(annual / 12);
  let implied: number | null = null;
  let exceeds: boolean | null = null;
  if (i.proposedMonthly !== undefined && Number.isFinite(i.proposedMonthly) && i.proposedMonthly > 0) {
    const extra = i.proposedMonthly - cur;
    implied = Math.round(((extra * 12) / converted) * 100 * 100) / 100;
    exceeds = implied > i.ratePct + 1e-9;
  }
  return { ok: true, converted, addMonthly, maxMonthly: cur + addMonthly, annual, implied, exceeds };
}
