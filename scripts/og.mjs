// Renders 1200x630 OG cards (서식/관공서 form look) to public/og/*.png with Playwright.
// Usage: pnpm og   (uses the shared _qa-tools Playwright; no browser download)
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const QA = process.env.QA_TOOLS || join(ROOT, '..', '_qa-tools');
const require = createRequire(join(QA, 'package.json'));
const { chromium } = require('playwright');
const OUT = join(ROOT, 'public', 'og');
mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rate = JSON.parse(readFileSync(join(ROOT, 'src/data/base-rate.json'), 'utf8'));
const cap = Math.min(10, rate.current.rate + 2).toFixed(2);

const cards = [
  { file: 'default', no: '집계산서', title: '내 집 마련·전월세 비용 계산 서식', sub: '취득세 · 중개보수 · 전월세 전환 · DSR·LTV · 상환액 · 재산세', stamp: '법령 대조' },
];
const forms = readFileSync(join(ROOT, 'src/lib/forms.ts'), 'utf8');
for (const m of forms.matchAll(/no: '([^']+)',[\s\S]*?title: '([^']+)',[\s\S]*?question: '([^']+)',[\s\S]*?law: '([^']+)',[\s\S]*?og: '\/og\/([^.]+)\.png'/g)) {
  cards.push({ file: m[5], no: `서식 ${m[1]}`, title: m[2], sub: m[3], foot: `근거: ${m[4]}`, stamp: '계산서' });
}
cards.push({ file: 'conversion-rate-cap', no: '자료표', title: '전월세 전환율 상한 변동표', sub: `현재 상한 ${cap}% = 기준금리 ${rate.current.rate.toFixed(2)}% + 2%p`, foot: `한국은행 기준금리 · ${rate.asOf} 확인`, stamp: '자료' });
const gdir = join(ROOT, 'src/content/guides');
for (const f of readdirSync(gdir).filter((x) => x.endsWith('.md'))) {
  const t = readFileSync(join(gdir, f), 'utf8');
  const h1 = t.match(/^h1: "(.*)"$/m)[1];
  const upd = t.match(/^updated: "(.*)"$/m)[1];
  cards.push({ file: `guide-${f.replace(/\.md$/, '')}`, no: '안내문', title: h1, sub: '', foot: `최종 수정 ${upd} · 법령·공공기관 원문 출처 표기`, stamp: '안내' });
}

const html = (c) => `<!doctype html><html lang="ko"><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;word-break:keep-all;overflow-wrap:break-word}
body{width:1200px;height:630px;background:#f4f2ec;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;color:#18191c;padding:44px 56px}
.sheet{position:relative;height:100%;background:#fffefa;border:3px solid #18191c;display:grid;grid-template-rows:auto 1fr auto}
.head{display:flex;border-bottom:3px double #18191c}
.head div{padding:14px 22px;font-size:26px}
.no{background:#ecebe3;border-right:2px solid #18191c;font-weight:700;letter-spacing:.06em}
.site{margin-left:auto;font-family:'Batang','Nanum Myeongjo',serif;font-size:26px}
.body{padding:34px 40px 0;display:flex;flex-direction:column;gap:22px}
h1{font-family:'Batang','Nanum Myeongjo',serif;font-weight:700;font-size:${c.title.length > 34 ? 46 : c.title.length > 22 ? 54 : 62}px;line-height:1.28;letter-spacing:-.01em;max-width:900px}
.sub{font-size:28px;color:#2b2d33;line-height:1.45;max-width:900px}
.foot{border-top:2px solid #18191c;display:flex}
.foot div{padding:14px 22px;font-size:22px}
.foot .l{background:#ecebe3;border-right:2px solid #18191c;font-weight:700}
.stamp{position:absolute;right:46px;bottom:86px;width:150px;height:150px;border:5px solid #a3231b;border-radius:50%;color:#a3231b;display:grid;place-items:center;font-family:'Batang',serif;font-weight:700;font-size:34px;transform:rotate(-12deg);opacity:.9}
</style><body><div class="sheet">
<div class="head"><div class="no">${esc(c.no)}</div><div class="site">집계산서 · korearealestatenews.online</div></div>
<div class="body"><h1>${esc(c.title)}</h1>${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}</div>
<div class="foot"><div class="l">비고</div><div>${esc(c.foot ?? '모든 결과에 근거 조문과 기준일 표기 · 무료 · 회원가입 없음')}</div></div>
<div class="stamp">${esc(c.stamp)}</div></div></body></html>`;

// Reuse an already-installed headless shell (never download). Override with PW_CHROMIUM.
import { existsSync } from 'node:fs';
const pwDir = join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
const found = existsSync(pwDir) ? readdirSync(pwDir).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse().map((d) => join(pwDir, d, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe')).find((p) => existsSync(p)) : undefined;
const browser = await chromium.launch(process.env.PW_CHROMIUM || found ? { executablePath: process.env.PW_CHROMIUM || found } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of cards) {
  await page.setContent(html(c));
  await page.screenshot({ path: join(OUT, `${c.file}.png`), type: 'png' });
}
await browser.close();
console.log(`OG: ${cards.length} cards → public/og/`);
