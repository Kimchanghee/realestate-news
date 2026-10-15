// Registry of the calculator "forms" (서식). Single source for nav, home register, sitemap and llms.txt.
import baseRate from '../data/base-rate.json';
import { CHECKED } from './rules.ts';

export interface FormEntry {
  no: string; // 서식 번호
  short: string; // nav label
  title: string; // 서식명
  path: string;
  question: string;
  law: string;
  updated: string; // lastmod (rules checked / data asOf)
  og: string;
}

const dataDate = baseRate.asOf > CHECKED ? baseRate.asOf : CHECKED;

export const FORMS: FormEntry[] = [
  {
    no: '제1호',
    short: '취득세',
    title: '주택 취득세 계산서',
    path: '/calc/acquisition-tax/',
    question: '집을 사면 취득세·지방교육세·농특세가 모두 얼마인가?',
    law: '지방세법 제11조·제13조의2, 지특법 제36조의3',
    updated: CHECKED,
    og: '/og/acquisition-tax.png',
  },
  {
    no: '제2호',
    short: '중개보수',
    title: '중개보수 상한 계산서',
    path: '/calc/brokerage-fee/',
    question: '매매·전세·월세 복비 상한은 얼마이고 부가세는 붙는가?',
    law: '공인중개사법 시행규칙 [별표 1]',
    updated: CHECKED,
    og: '/og/brokerage-fee.png',
  },
  {
    no: '제3호',
    short: '전월세 전환',
    title: '전월세 전환 계산서',
    path: '/calc/jeonse-conversion/',
    question: '보증금을 낮추면 월세를 최대 얼마까지 올릴 수 있는가?',
    law: '주택임대차보호법 시행령 제9조',
    updated: dataDate,
    og: '/og/jeonse-conversion.png',
  },
  {
    no: '제4호',
    short: 'DSR·LTV',
    title: '대출 한도(DSR·LTV) 계산서',
    path: '/calc/loan-limit/',
    question: '내 소득과 집값으로 주담대를 얼마까지 받을 수 있는가?',
    law: '금융위원회 스트레스 DSR·LTV 행정지도',
    updated: CHECKED,
    og: '/og/loan-limit.png',
  },
  {
    no: '제5호',
    short: '상환액',
    title: '주담대 상환 3방식 계산서',
    path: '/calc/mortgage-repayment/',
    question: '원리금균등·원금균등·만기일시 중 월 상환액과 총이자는?',
    law: '표준 금융수학 (대출 약정서 기준 확인)',
    updated: CHECKED,
    og: '/og/mortgage-repayment.png',
  },
  {
    no: '제6호',
    short: '재산세',
    title: '주택 재산세 계산서',
    path: '/calc/property-tax/',
    question: '공시가격 기준 올해 재산세는 7월·9월에 얼마씩 내는가?',
    law: '지방세법 제110조~제112조, 시행령 제109조',
    updated: CHECKED,
    og: '/og/property-tax.png',
  },
];

export const DATA_PAGE = {
  path: '/data/conversion-rate-cap/',
  title: '전월세 전환율 상한 변동표',
  updated: baseRate.asOf,
  og: '/og/conversion-rate-cap.png',
};
