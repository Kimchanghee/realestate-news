// Pure parsers (no side effects) so tests can import them.
/** 한국은행 기준금리 추이 표: <td>2026</td><td>08월 27일</td><td>3.00</td> */
export function parseBokBaseRate(html) {
  const rows = [];
  const tr = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = tr.exec(html))) {
    const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    if (cells.length < 3) continue;
    const y = cells[0].match(/^(\d{4})$/);
    const md = cells[1].match(/(\d{1,2})월\s*(\d{1,2})일/);
    const rate = cells[2].match(/^(\d+(?:\.\d+)?)$/);
    if (!y || !md || !rate) continue;
    const date = `${y[1]}-${md[1].padStart(2, '0')}-${md[2].padStart(2, '0')}`;
    rows.push({ date, rate: Number(rate[1]) });
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

