import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, abs } from '../site.config.ts';
import { FORMS, DATA_PAGE } from '../lib/forms.ts';
import baseRate from '../data/base-rate.json';
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const cap = Math.min(10, baseRate.current.rate + 2);
  const lines = [
    `# ${site.name} (${site.domain})`,
    '',
    `> ${site.description}`,
    '',
    `운영 원칙: 계산 결과마다 근거 법령 조문과 확인 기준일을 표시합니다. 개인 맞춤 세무·법률·투자 자문이 아닙니다. 데이터 기준일: 한국은행 기준금리 ${baseRate.current.rate.toFixed(2)}% (${baseRate.current.date} 결정, ${baseRate.asOf} 확인), 전월세 전환율 상한 ${cap.toFixed(2)}%.`,
    '',
    '## 계산 서식',
    ...FORMS.map((f) => `- [${f.title}](${abs(f.path)}): ${f.question} 근거: ${f.law}. 기준일 ${f.updated}.`),
    '',
    '## 데이터',
    `- [${DATA_PAGE.title}](${abs(DATA_PAGE.path)}): 한국은행 기준금리 결정일별 법정 전환율 상한 이력. 출처 ${baseRate.sourceUrl}. 기준일 ${DATA_PAGE.updated}.`,
    '',
    '## 가이드',
    ...guides.map((g) => `- [${g.data.h1}](${abs(`/guide/${g.id}/`)}): ${g.data.answer} (갱신 ${g.data.updated})`),
    '',
    '## 운영 정보',
    `- [소개·편집 원칙](${abs('/about/')})`,
    `- [계산 방법·데이터 출처](${abs('/methodology/')})`,
    `- [면책 고지](${abs('/disclaimer/')})`,
    `- 문의: ${site.contactEmail}`,
    `- 전체 텍스트: ${abs('/llms-full.txt')}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
