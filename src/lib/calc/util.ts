/** 원 미만 절사. 부동소수점 오차(예: 11689999.9999)를 흡수한다. */
export function won(x: number): number {
  return Math.floor(x + 1e-6);
}

/** 1,234,567원 */
export function fmtWon(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

/** 12억 3,400만원 처럼 읽기 쉬운 금액 */
export function fmtKorean(n: number): string {
  const v = Math.round(n);
  if (v === 0) return '0원';
  const sign = v < 0 ? '-' : '';
  let a = Math.abs(v);
  const eok = Math.floor(a / 100_000_000);
  a -= eok * 100_000_000;
  const man = Math.floor(a / 10_000);
  const rest = a - man * 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${eok.toLocaleString('ko-KR')}억`);
  if (man) parts.push(`${man.toLocaleString('ko-KR')}만`);
  if (rest && !eok) parts.push(`${rest.toLocaleString('ko-KR')}`);
  return sign + parts.join(' ') + '원';
}

/** 0.0167 -> "1.67%" (불필요한 0 제거) */
export function fmtPct(rate: number, digits = 4): string {
  const s = (rate * 100).toFixed(digits).replace(/\.?0+$/, '');
  return s + '%';
}

/** "1,234,000" / "12억" / "3.5억" / "5000만" 형태 입력을 원 단위 숫자로 */
export function parseWon(raw: string): number {
  const s = String(raw ?? '').replace(/[,\s원]/g, '').trim();
  if (!s) return NaN;
  const m = s.match(/^(?:(\d+(?:\.\d+)?)억)?(?:(\d+(?:\.\d+)?)천만)?(?:(\d+(?:\.\d+)?)만)?(\d+)?$/);
  if (m && (m[1] || m[2] || m[3])) {
    const eok = m[1] ? parseFloat(m[1]) * 1e8 : 0;
    const chun = m[2] ? parseFloat(m[2]) * 1e7 : 0;
    const man = m[3] ? parseFloat(m[3]) * 1e4 : 0;
    const one = m[4] ? parseInt(m[4], 10) : 0;
    return Math.round(eok + chun + man + one);
  }
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s));
  return NaN;
}
