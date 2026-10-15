import type { CalcError } from './acquisition.ts';

export type Method = 'annuity' | 'equalPrincipal' | 'bullet';

export const METHOD_LABEL: Record<Method, string> = {
  annuity: '원리금균등',
  equalPrincipal: '원금균등',
  bullet: '만기일시',
};

export interface RepayInput {
  principal: number;
  ratePct: number; // 연 금리 %
  months: number;
  method: Method;
}

export interface RepayRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface RepayResult {
  ok: true;
  method: Method;
  firstPayment: number;
  lastPayment: number;
  totalInterest: number;
  totalPayment: number;
  firstYearPayment: number; // 첫 12개월 원리금 합계 (DSR 근사용)
  yearly: { year: number; principal: number; interest: number; balance: number }[];
  rows: RepayRow[];
}

/** 원리금균등 월 상환액 (반올림 전 실수) */
export function annuityPayment(P: number, monthlyRate: number, n: number): number {
  if (monthlyRate === 0) return P / n;
  const f = Math.pow(1 + monthlyRate, n);
  return (P * monthlyRate * f) / (f - 1);
}

export function calcRepayment(i: RepayInput): RepayResult | CalcError {
  if (!Number.isFinite(i.principal) || i.principal <= 0) {
    return { ok: false, field: 'principal', message: '대출금을 0보다 큰 금액으로 입력하세요.' };
  }
  if (!Number.isFinite(i.ratePct) || i.ratePct < 0 || i.ratePct > 30) {
    return { ok: false, field: 'ratePct', message: '금리는 0~30% 사이로 입력하세요.' };
  }
  if (!Number.isInteger(i.months) || i.months < 1 || i.months > 600) {
    return { ok: false, field: 'months', message: '기간은 1~600개월(50년) 사이 정수로 입력하세요.' };
  }
  const P = i.principal;
  const r = i.ratePct / 100 / 12;
  const n = i.months;
  const rows: RepayRow[] = [];
  let bal = P;
  const pay = annuityPayment(P, r, n);
  for (let m = 1; m <= n; m++) {
    const interest = bal * r;
    let principal: number;
    if (i.method === 'annuity') principal = m === n ? bal : pay - interest;
    else if (i.method === 'equalPrincipal') principal = m === n ? bal : P / n;
    else principal = m === n ? bal : 0;
    bal = Math.max(0, bal - principal);
    rows.push({
      month: m,
      payment: Math.round(principal + interest),
      principal: Math.round(principal),
      interest: Math.round(interest),
      balance: Math.round(bal),
    });
  }
  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  const totalPayment = rows.reduce((s, x) => s + x.payment, 0);
  const firstYearPayment = rows.slice(0, 12).reduce((s, x) => s + x.payment, 0);
  const yearly: RepayResult['yearly'] = [];
  for (let y = 0; y * 12 < n; y++) {
    const slice = rows.slice(y * 12, y * 12 + 12);
    yearly.push({
      year: y + 1,
      principal: slice.reduce((s, x) => s + x.principal, 0),
      interest: slice.reduce((s, x) => s + x.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }
  return {
    ok: true,
    method: i.method,
    firstPayment: rows[0].payment,
    lastPayment: rows[rows.length - 1].payment,
    totalInterest,
    totalPayment,
    firstYearPayment,
    yearly,
    rows,
  };
}
