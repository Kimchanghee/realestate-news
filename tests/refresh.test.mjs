import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBokBaseRate } from '../scripts/refresh.parse.mjs';

test('BOK 기준금리 표 파서: 연도·월일·금리 셀을 날짜 내림차순으로', () => {
  const html = `<table><tr><th>연도</th></tr><tr><td>2026</td><td>07월 16일</td><td>2.75</td></tr>
  <tr><td>2026</td><td>08월 27일</td><td>3.00</td></tr><tr><td>bad</td><td>x</td><td>y</td></tr></table>`;
  assert.deepEqual(parseBokBaseRate(html), [
    { date: '2026-08-27', rate: 3 },
    { date: '2026-07-16', rate: 2.75 },
  ]);
});
