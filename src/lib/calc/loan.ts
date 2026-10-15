import { LENDING } from '../rules.ts';
import { annuityPayment } from './repayment.ts';
import type { CalcError } from './acquisition.ts';

export interface LoanInput {
  income: number; // 연소득 (원)
  value: number; // 주택 가격 (시가·감정가, 원)
  amount: number; // 희망 대출금 (원)
  ratePct: number; // 대출 금리 %
  years: number; // 만기 (년)
  method: 'annuity' | 'equalPrincipal';
  stressPct: number; // 스트레스 금리 %p
  dsrLimit: number; // % (은행 40, 2금융 50)
  ltvPct: number; // 적용 LTV %
  existingAnnual: number; // 기존 대출 연간 원리금 상환액 (DSR용)
  otherInterest: number; // 기존 기타대출 연간 이자 (DTI용)
  metroCap: boolean; // 수도권·규제지역 주담대 한도(6/4/2억) 적용
}

export interface LoanResult {
  ok: true;
  annualActual: number; // 희망 대출의 연 원리금 (실제 금리)
  annualStress: number; // 스트레스 금리 적용 연 원리금
  dsr: number; // %
  stressDsr: number; // %
  dti: number; // %
  ltv: number; // %
  maxByDsr: number;
  maxByLtv: number;
  maxByCap: number | null;
  maxLoan: number;
  binding: 'dsr' | 'ltv' | 'cap';
  dsrPass: boolean;
  ltvPass: boolean;
}

/** 1원 대출당 첫 1년 원리금 (방식별) */
export function annualPerWon(ratePct: number, years: number, method: 'annuity' | 'equalPrincipal'): number {
  const r = ratePct / 100 / 12;
  const n = Math.round(years * 12);
  if (method === 'annuity') return annuityPayment(1, r, n) * 12;
  // 원금균등: 첫 12개월 원금 + 이자 합계
  let bal = 1;
  let sum = 0;
  for (let m = 1; m <= Math.min(12, n); m++) {
    const interest = bal * r;
    const principal = 1 / n;
    sum += principal + interest;
    bal -= principal;
  }
  return sum;
}

export function metroCapFor(value: number): number {
  for (const [upto, cap] of LENDING.metroCaps) if (value <= upto) return cap;
  return LENDING.metroCaps[LENDING.metroCaps.length - 1][1];
}

export function calcLoan(i: LoanInput): LoanResult | CalcError {
  if (!Number.isFinite(i.income) || i.income <= 0) return { ok: false, field: 'income', message: '연소득을 입력하세요.' };
  if (!Number.isFinite(i.value) || i.value <= 0) return { ok: false, field: 'value', message: '주택 가격을 입력하세요.' };
  if (!Number.isFinite(i.amount) || i.amount <= 0) return { ok: false, field: 'amount', message: '희망 대출금을 입력하세요.' };
  if (!Number.isFinite(i.ratePct) || i.ratePct <= 0 || i.ratePct > 30)
    return { ok: false, field: 'ratePct', message: '금리는 0~30% 사이로 입력하세요.' };
  if (!Number.isFinite(i.years) || i.years < 1 || i.years > 50)
    return { ok: false, field: 'years', message: '만기는 1~50년으로 입력하세요.' };
  if (!Number.isFinite(i.stressPct) || i.stressPct < 0 || i.stressPct > 10)
    return { ok: false, field: 'stressPct', message: '스트레스 금리는 0~10%p로 입력하세요.' };
  if (!Number.isFinite(i.ltvPct) || i.ltvPct <= 0 || i.ltvPct > 100)
    return { ok: false, field: 'ltvPct', message: 'LTV는 0~100% 사이로 입력하세요.' };
  const existing = Number.isFinite(i.existingAnnual) && i.existingAnnual > 0 ? i.existingAnnual : 0;
  const otherInt = Number.isFinite(i.otherInterest) && i.otherInterest > 0 ? i.otherInterest : 0;

  const perActual = annualPerWon(i.ratePct, i.years, i.method);
  const perStress = annualPerWon(i.ratePct + i.stressPct, i.years, i.method);
  const annualActual = Math.round(i.amount * perActual);
  const annualStress = Math.round(i.amount * perStress);
  const pct = (x: number) => Math.round(x * 10_000) / 100; // 소수 둘째 자리 %
  const dsr = pct((existing + annualActual) / i.income);
  const stressDsr = pct((existing + annualStress) / i.income);
  const dti = pct((annualActual + otherInt) / i.income);
  const ltv = pct(i.amount / i.value);

  const room = Math.max(0, (i.income * i.dsrLimit) / 100 - existing);
  const maxByDsr = Math.floor(room / perStress / 1_000_000) * 1_000_000; // 백만원 단위 내림
  const maxByLtv = Math.floor((i.value * i.ltvPct) / 100);
  const maxByCap = i.metroCap ? metroCapFor(i.value) : null;
  const candidates: [number, LoanResult['binding']][] = [
    [maxByDsr, 'dsr'],
    [maxByLtv, 'ltv'],
  ];
  if (maxByCap !== null) candidates.push([maxByCap, 'cap']);
  candidates.sort((a, b) => a[0] - b[0]);
  const [maxLoan, binding] = candidates[0];
  return {
    ok: true,
    annualActual,
    annualStress,
    dsr,
    stressDsr,
    dti,
    ltv,
    maxByDsr,
    maxByLtv,
    maxByCap,
    maxLoan,
    binding,
    dsrPass: stressDsr <= i.dsrLimit,
    ltvPass: ltv <= i.ltvPct,
  };
}
