// Inline SVG charts, generated as strings (same code on the server and in the browser).

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** 연도별 원금·이자 막대 (원장 스타일: 먹색 원금, 빗금 이자) */
export function yearlyBars(yearly: { year: number; principal: number; interest: number }[], label: string): string {
  const W = 720;
  const H = 240;
  const padL = 56;
  const padB = 28;
  const padT = 12;
  const n = yearly.length || 1;
  const max = Math.max(1, ...yearly.map((y) => y.principal + y.interest));
  const bw = Math.max(2, (W - padL - 8) / n - 2);
  const scale = (H - padB - padT) / max;
  const man = (v: number) => (v >= 1e8 ? `${(v / 1e8).toFixed(1)}억` : `${Math.round(v / 1e4).toLocaleString('ko-KR')}만`);
  let bars = '';
  yearly.forEach((y, i) => {
    const x = padL + i * (bw + 2);
    const hp = y.principal * scale;
    const hi = y.interest * scale;
    const base = H - padB;
    bars += `<rect x="${x.toFixed(1)}" y="${(base - hp).toFixed(1)}" width="${bw.toFixed(1)}" height="${hp.toFixed(1)}" fill="#18191c"/>`;
    bars += `<rect x="${x.toFixed(1)}" y="${(base - hp - hi).toFixed(1)}" width="${bw.toFixed(1)}" height="${hi.toFixed(1)}" fill="url(#hatch)" stroke="#a3231b" stroke-width="0.6"/>`;
  });
  const ticks = [0, 0.5, 1]
    .map((t) => {
      const y = H - padB - t * max * scale;
      return `<line x1="${padL - 4}" x2="${W}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#c8c4b8" stroke-width="0.6"/><text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#4a4d55">${man(t * max)}</text>`;
    })
    .join('');
  const step = n > 20 ? 5 : n > 10 ? 2 : 1;
  const xl = yearly
    .filter((y) => y.year === 1 || y.year % step === 0)
    .map((y) => `<text x="${(padL + (y.year - 1) * (bw + 2) + bw / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#4a4d55">${y.year}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMinYMin meet" style="width:100%;height:auto"><defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#f6e4e1"/><line x1="0" y1="0" x2="0" y2="5" stroke="#a3231b" stroke-width="1.4"/></pattern></defs>${ticks}${bars}${xl}<line x1="${padL}" x2="${W}" y1="${H - padB}" y2="${H - padB}" stroke="#18191c"/></svg>`;
}

/** 계단형 선 (기준금리·전환율 상한 이력) */
export function stepLine(points: { date: string; v: number }[], opts: { label: string; second?: { date: string; v: number }[] }): string {
  const W = 720;
  const H = 260;
  const padL = 40;
  const padB = 28;
  const padT = 14;
  const pts = [...points].sort((a, b) => (a.date < b.date ? -1 : 1));
  const all = [...pts, ...(opts.second ?? [])];
  const t0 = Date.parse(pts[0].date);
  const t1 = Date.parse(pts[pts.length - 1].date) + 365 * 864e5 * 0.6;
  const vmax = Math.ceil(Math.max(...all.map((p) => p.v)) + 0.5);
  const x = (d: string) => padL + ((Date.parse(d) - t0) / (t1 - t0)) * (W - padL - 8);
  const y = (v: number) => H - padB - (v / vmax) * (H - padB - padT);
  const path = (arr: { date: string; v: number }[]) => {
    const s = [...arr].sort((a, b) => (a.date < b.date ? -1 : 1));
    let d = `M${x(s[0].date).toFixed(1)},${y(s[0].v).toFixed(1)}`;
    for (let i = 1; i < s.length; i++) d += `H${x(s[i].date).toFixed(1)}V${y(s[i].v).toFixed(1)}`;
    d += `H${(W - 8).toFixed(1)}`;
    return d;
  };
  let grid = '';
  for (let v = 0; v <= vmax; v += vmax > 6 ? 2 : 1) {
    grid += `<line x1="${padL}" x2="${W - 8}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#c8c4b8" stroke-width="0.6"/><text x="${padL - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#4a4d55">${v}%</text>`;
  }
  const y0 = new Date(t0).getUTCFullYear();
  const y1 = new Date(t1).getUTCFullYear();
  let xl = '';
  for (let yr = Math.ceil(y0 / 5) * 5; yr <= y1; yr += 5) {
    xl += `<text x="${x(`${yr}-01-01`).toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#4a4d55">${yr}</text>`;
  }
  const second = opts.second ? `<path d="${path(opts.second)}" fill="none" stroke="#a3231b" stroke-width="2" stroke-dasharray="5 3"/>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opts.label)}" style="width:100%;height:auto">${grid}${second}<path d="${path(pts)}" fill="none" stroke="#18191c" stroke-width="2"/>${xl}<line x1="${padL}" x2="${W - 8}" y1="${H - padB}" y2="${H - padB}" stroke="#18191c"/></svg>`;
}
