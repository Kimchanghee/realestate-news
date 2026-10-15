import { PROPERTY } from '../rules.ts';
import { won } from './util.ts';
import type { CalcError } from './acquisition.ts';

export interface PropInput {
  price: number; // 주택 공시가격 (시가표준액)
  oneHouse: boolean; // 1세대 1주택
  city: boolean; // 도시지역분 과세 지역
}

export interface PropResult {
  ok: true;
  ratio: number;
  taxBase: number;
  special: boolean; // 1세대1주택 특례세율 적용
  propertyTax: number;
  cityTax: number;
  eduTax: number;
  total: number;
  july: number;
  september: number;
  compTaxThreshold: number;
  compTaxPossible: boolean;
}

export function fairRatio(price: number, oneHouse: boolean): number {
  if (!oneHouse) return PROPERTY.ratioGeneral;
  for (const [upto, r] of PROPERTY.ratioOneHouse) if (price <= upto) return r;
  return 0.45;
}

export function bracketTax(base: number, table: typeof PROPERTY.standard | typeof PROPERTY.special): number {
  for (const [upto, fixed, rate, floor] of table) {
    if (base <= upto) return won(fixed + (base - floor) * rate);
  }
  return 0;
}

export function calcProperty(i: PropInput): PropResult | CalcError {
  if (!Number.isFinite(i.price) || i.price <= 0) return { ok: false, field: 'price', message: '공시가격을 입력하세요.' };
  if (i.price > 1e12) return { ok: false, field: 'price', message: '1조원 이하로 입력하세요.' };
  const price = Math.floor(i.price);
  const ratio = fairRatio(price, i.oneHouse);
  const taxBase = won(price * ratio);
  const special = i.oneHouse && price <= PROPERTY.specialRateMaxPrice;
  const propertyTax = bracketTax(taxBase, special ? PROPERTY.special : PROPERTY.standard);
  const cityTax = i.city ? won(taxBase * PROPERTY.cityRate) : 0;
  const eduTax = won(propertyTax * PROPERTY.eduRate);
  const total = propertyTax + cityTax + eduTax;
  // 주택분 재산세: 20만원 이하면 7월 일괄, 초과면 7월·9월 절반씩 (부가세 포함 비례 배분)
  let july = total;
  let september = 0;
  if (propertyTax > PROPERTY.splitThreshold) {
    july = Math.ceil(total / 2);
    september = total - july;
  }
  const compTaxThreshold = i.oneHouse ? PROPERTY.compTaxOneHouse : PROPERTY.compTaxGeneral;
  return {
    ok: true,
    ratio,
    taxBase,
    special,
    propertyTax,
    cityTax,
    eduTax,
    total,
    july,
    september,
    compTaxThreshold,
    compTaxPossible: price > compTaxThreshold,
  };
}
