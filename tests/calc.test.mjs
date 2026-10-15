// Hand-computed cases. Each comment shows the arithmetic done by hand from the statute.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcAcquisition, middleRate } from '../src/lib/calc/acquisition.ts';
import { calcBrokerage, monthlyBase } from '../src/lib/calc/brokerage.ts';
import { calcConversion, conversionCap } from '../src/lib/calc/conversion.ts';
import { calcRepayment } from '../src/lib/calc/repayment.ts';
import { calcLoan, metroCapFor } from '../src/lib/calc/loan.ts';
import { calcProperty } from '../src/lib/calc/property.ts';
import { parseWon, fmtKorean } from '../src/lib/calc/util.ts';

const acq = (o) =>
  calcAcquisition({ houses: 1, regulated: false, over85: false, temporary: false, firstHome: false, firstHomeSmall: false, ...o });

test('취득세: 5억 1주택 85㎡ 이하 = 취득세 1% 500만 + 지방교육세 0.1% 50만', () => {
  const r = acq({ price: 500_000_000 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.lines.map((l) => l.amount), [5_000_000, 500_000, 0]);
  assert.equal(r.total, 5_500_000);
});

test('취득세: 6억~9억 구간 세율 (7억 → 7×2/3−3 = 1.6667 → 1.67%, 8억 → 2.33%)', () => {
  assert.equal(middleRate(700_000_000), 0.0167);
  assert.equal(middleRate(800_000_000), 0.0233);
  assert.equal(middleRate(750_000_000), 0.02);
});

test('취득세: 7억 1주택 85㎡ 초과 = 1,169만 + 116.9만 + 농특 140만 = 1,425.9만', () => {
  const r = acq({ price: 700_000_000, over85: true });
  assert.deepEqual(r.lines.map((l) => l.amount), [11_690_000, 1_169_000, 1_400_000]);
  assert.equal(r.total, 14_259_000);
});

test('취득세: 10억 조정대상지역 2주택(일시적 아님) 85㎡ 초과 = 8% + 0.4% + 0.6%', () => {
  const r = acq({ price: 1_000_000_000, houses: 2, regulated: true, over85: true });
  assert.equal(r.mode, 'surcharge8');
  assert.equal(r.total, 80_000_000 + 4_000_000 + 6_000_000);
});

test('취득세: 비조정 2주택·조정 일시적 2주택은 일반세율, 비조정 3주택 8%, 비조정 4주택 12%', () => {
  assert.equal(acq({ price: 300_000_000, houses: 2 }).mode, 'general');
  assert.equal(acq({ price: 300_000_000, houses: 2, regulated: true, temporary: true }).mode, 'general');
  assert.equal(acq({ price: 300_000_000, houses: 3 }).mode, 'surcharge8');
  assert.equal(acq({ price: 300_000_000, houses: 4 }).mode, 'surcharge12');
  assert.equal(acq({ price: 300_000_000, houses: 3, regulated: true }).mode, 'surcharge12');
});

test('생애최초: 3억 → 산출 300만 − 200만 공제, 지방교육세 30만 → 130만 / 300만 한도면 30만', () => {
  assert.equal(acq({ price: 300_000_000, firstHome: true }).total, 1_300_000);
  assert.equal(acq({ price: 300_000_000, firstHome: true, firstHomeSmall: true }).total, 300_000);
});

test('생애최초: 2억 → 산출 200만 전액 면제, 12억 초과·2주택이면 감면 없음', () => {
  const r = acq({ price: 200_000_000, firstHome: true });
  assert.equal(r.relief, 2_000_000);
  assert.equal(r.total, 200_000);
  assert.equal(acq({ price: 1_300_000_000, firstHome: true }).relief, 0);
  assert.equal(acq({ price: 300_000_000, houses: 2, firstHome: true }).relief, 0);
});

test('생애최초: 85㎡ 초과면 감면세액의 20% 농특세 (200만 × 20% = 40만)', () => {
  const r = acq({ price: 500_000_000, firstHome: true, over85: true });
  assert.equal(r.reliefRural, 400_000);
  assert.equal(r.total, 5_000_000 + 500_000 + 1_000_000 - 2_000_000 + 400_000);
});

test('취득세: 잘못된 입력은 오류', () => {
  assert.equal(acq({ price: 0 }).ok, false);
  assert.equal(acq({ price: NaN }).ok, false);
});

const br = (o) => calcBrokerage({ deal: 'sale', kind: 'house', price: 0, monthly: 0, vat: false, ...o });

test('중개보수 매매: 1억 0.5% = 50만, 1.8억 = 90만 → 한도 80만, 9억 0.5% = 450만, 10억 = 500만', () => {
  assert.equal(br({ price: 100_000_000 }).fee, 500_000);
  const c = br({ price: 180_000_000 });
  assert.equal(c.fee, 800_000);
  assert.equal(c.capped, true);
  assert.equal(br({ price: 900_000_000 }).fee, 4_500_000);
  assert.equal(br({ price: 1_000_000_000 }).fee, 5_000_000);
  assert.equal(br({ price: 1_600_000_000 }).fee, 11_200_000);
});

test('중개보수 임대: 전세 3억 0.3% = 90만, 부가세 10% = 9만', () => {
  const r = br({ deal: 'lease', price: 300_000_000, vat: true });
  assert.equal(r.fee, 900_000);
  assert.equal(r.vatAmount, 90_000);
  assert.equal(r.total, 990_000);
});

test('중개보수 월세: 1천/50만 → 6천만 × 0.4% = 24만, 500/30만 → 2,600만 × 0.5% = 13만', () => {
  assert.equal(monthlyBase(10_000_000, 500_000).base, 60_000_000);
  assert.equal(br({ deal: 'monthly', price: 10_000_000, monthly: 500_000 }).fee, 240_000);
  assert.equal(monthlyBase(5_000_000, 300_000).base, 26_000_000);
  assert.equal(br({ deal: 'monthly', price: 5_000_000, monthly: 300_000 }).fee, 130_000);
});

test('중개보수 오피스텔: 매매 3억 0.5% = 150만, 임대 2억 0.4% = 80만', () => {
  assert.equal(br({ kind: 'officetel', price: 300_000_000 }).fee, 1_500_000);
  assert.equal(br({ kind: 'officetel', deal: 'lease', price: 200_000_000 }).fee, 800_000);
});

test('전환율 상한 = min(10%, 기준금리 + 2%p)', () => {
  assert.equal(conversionCap(3.0), 5);
  assert.equal(conversionCap(2.75), 4.75);
  assert.equal(conversionCap(9), 10);
});

test('전월세 전환: 보증금 3억→2억, 5% → 연 500만, 월 416,666원 / 월 50만 제시 = 6% 초과', () => {
  const r = calcConversion({ oldDeposit: 300_000_000, newDeposit: 200_000_000, currentMonthly: 0, ratePct: 5, proposedMonthly: 500_000 });
  assert.equal(r.annual, 5_000_000);
  assert.equal(r.addMonthly, 416_666);
  assert.equal(r.implied, 6);
  assert.equal(r.exceeds, true);
  assert.equal(calcConversion({ oldDeposit: 1, newDeposit: 2, currentMonthly: 0, ratePct: 5 }).ok, false);
});

test('상환: 1억 4% 30년 원리금균등 월 477,415원 (표준 공식)', () => {
  const r = calcRepayment({ principal: 100_000_000, ratePct: 4, months: 360, method: 'annuity' });
  assert.ok(Math.abs(r.firstPayment - 477_415) <= 1);
  assert.equal(r.yearly.length, 30);
  assert.equal(r.yearly[29].balance, 0);
});

test('상환: 원금균등 첫 달 = 277,778 + 333,333 = 611,111원, 총이자 ≈ P·r·(n+1)/2', () => {
  const r = calcRepayment({ principal: 100_000_000, ratePct: 4, months: 360, method: 'equalPrincipal' });
  assert.ok(Math.abs(r.firstPayment - 611_111) <= 1);
  const expected = (100_000_000 * (0.04 / 12) * 361) / 2; // 60,166,667
  assert.ok(Math.abs(r.totalInterest - expected) < 400);
});

test('상환: 만기일시 월 이자 333,333원, 마지막 달 원금 1억 + 이자', () => {
  const r = calcRepayment({ principal: 100_000_000, ratePct: 4, months: 360, method: 'bullet' });
  assert.equal(r.firstPayment, 333_333);
  assert.equal(r.lastPayment, 100_333_333);
});

test('대출: 연소득 6천만, 3억 4% 30년 → DSR 28.64%, 스트레스 1.5%p → 34.07%', () => {
  const r = calcLoan({
    income: 60_000_000, value: 500_000_000, amount: 300_000_000, ratePct: 4, years: 30, method: 'annuity',
    stressPct: 1.5, dsrLimit: 40, ltvPct: 70, existingAnnual: 0, otherInterest: 0, metroCap: false,
  });
  assert.equal(r.dsr, 28.64);
  assert.equal(r.stressDsr, 34.07);
  assert.equal(r.ltv, 60);
  assert.equal(r.maxByLtv, 350_000_000);
  // DSR 한도: 2,400만 / (5.5% 30년 1원당 연 원리금 0.0681355) = 3억 5,224만 → 백만원 내림 3억 5,200만
  assert.equal(r.maxByDsr, 352_000_000);
  assert.equal(r.maxLoan, 350_000_000);
  assert.equal(r.binding, 'ltv');
});

test('수도권 주담대 한도: 15억 이하 6억, 25억 이하 4억, 초과 2억', () => {
  assert.equal(metroCapFor(1_500_000_000), 600_000_000);
  assert.equal(metroCapFor(2_000_000_000), 400_000_000);
  assert.equal(metroCapFor(3_000_000_000), 200_000_000);
});

test('재산세: 공시 3억 1세대1주택 → 과표 1.29억(43%), 특례세율 9.9만, 도시 18.06만, 교육 1.98만', () => {
  const r = calcProperty({ price: 300_000_000, oneHouse: true, city: true });
  assert.equal(r.taxBase, 129_000_000);
  assert.equal(r.special, true);
  assert.equal(r.propertyTax, 99_000);
  assert.equal(r.cityTax, 180_600);
  assert.equal(r.eduTax, 19_800);
  assert.equal(r.total, 299_400);
  assert.equal(r.september, 0);
});

test('재산세: 공시 10억 1주택 → 과표 4.5억(45%), 표준세율 117만 / 공시 5억 다주택 → 과표 3억 57만', () => {
  const a = calcProperty({ price: 1_000_000_000, oneHouse: true, city: true });
  assert.equal(a.special, false);
  assert.equal(a.propertyTax, 1_170_000);
  assert.equal(a.compTaxPossible, false);
  const b = calcProperty({ price: 500_000_000, oneHouse: false, city: true });
  assert.equal(b.taxBase, 300_000_000);
  assert.equal(b.propertyTax, 570_000);
  assert.equal(b.july + b.september, b.total);
});

test('금액 입력 파서: 12억, 3.5억, 5000만, 1억 2천만, 1,234', () => {
  assert.equal(parseWon('12억'), 1_200_000_000);
  assert.equal(parseWon('3.5억'), 350_000_000);
  assert.equal(parseWon('5000만'), 50_000_000);
  assert.equal(parseWon('1억2천만'), 120_000_000);
  assert.equal(parseWon('1,234'), 1234);
  assert.ok(Number.isNaN(parseWon('abc')));
  assert.equal(fmtKorean(1_234_560_000), '12억 3,456만원');
});
