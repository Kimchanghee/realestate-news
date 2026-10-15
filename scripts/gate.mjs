// Publish gate: checks every URL in dist/sitemap-0.xml (plus 404) against CONTRACT §4.
// Usage: pnpm build && pnpm gate   (exit 1 on any failure)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://korearealestatenews.online';
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const len = (s) => [...s].length;

const failures = [];
const fail = (path, msg) => failures.push(`${path}: ${msg}`);

const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8').includes(`${SITE}/sitemap-0.xml`)) fail('sitemap-index', 'missing sitemap-0');
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`) || /Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt', 'bad robots');
for (const f of ['llms.txt', 'llms-full.txt', 'rss.xml', 'ads.txt', '404.html']) if (!existsSync(join(DIST, f))) fail(f, 'missing');
if (!readFileSync(join(DIST, 'ads.txt'), 'utf8').includes('google.com, pub-4490818204529253, DIRECT, f08c47fec0942fa0')) fail('ads.txt', 'wrong content');

const PLACEHOLDER = /lorem ipsum|\bTODO\b|\bTBD\b|placeholder text|준비 ?중입니다|xxx+|\{\{|undefined|NaN원|\[object Object\]/i;
let pages = 0;

for (const loc of locs) {
  const path = loc.slice(SITE.length);
  if (!loc.startsWith(SITE + '/')) { fail(loc, 'loc not absolute on site'); continue; }
  const file = join(DIST, path, 'index.html');
  if (!existsSync(file)) { fail(path, 'no built file'); continue; }
  pages++;
  const html = readFileSync(file, 'utf8');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (len(title) < 50 || len(title) > 60) fail(path, `title length ${len(title)} (50–60): ${title}`);
  if (len(desc) < 150 || len(desc) > 160) fail(path, `description length ${len(desc)} (150–160)`);
  if (canon !== loc) fail(path, `canonical ${canon} != ${loc}`);
  if (/noindex/i.test(html)) fail(path, 'noindex present');
  if (!/<meta property="og:image" content="https:\/\/[^"]+\.png"/.test(html)) fail(path, 'og:image missing');
  const og = html.match(/<meta property="og:image" content="https:\/\/[^/]+(\/[^"]+)"/)?.[1];
  if (og && !existsSync(join(DIST, og))) fail(path, `og image file missing ${og}`);

  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  const visible = norm(text(main));
  const bodyVisible = norm(text(html.replace(/<head>[\s\S]*?<\/head>/, '')));
  if (!main) fail(path, 'no <main>');
  if (PLACEHOLDER.test(visible)) fail(path, `placeholder text: ${visible.match(PLACEHOLDER)[0]}`);

  // direct answer: first element with data-answer, 40+ chars
  const ans = main.match(/<p[^>]*data-answer[^>]*>([\s\S]*?)<\/p>/);
  if (!ans || len(norm(text(ans[1]))) < 40) fail(path, 'direct answer (p[data-answer] ≥40 chars) missing');

  // internal links in main
  const internal = new Set([...main.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]).filter((h) => h !== path));
  if (internal.size < 2) fail(path, `internal links ${internal.size} < 2`);
  for (const h of internal) {
    const clean = h.split('?')[0];
    if (/\.(png|svg|txt|xml)$/.test(clean)) continue;
    if (!existsSync(join(DIST, clean, 'index.html')) && !existsSync(join(DIST, clean))) fail(path, `broken internal link ${h}`);
  }

  // sources: at least one external https link for content pages
  if (!/^\/(about|contact|privacy|terms|disclaimer)\/$/.test(path) && path !== '/guide/' && path !== '/') {
    const ext = [...main.matchAll(/href="(https:\/\/[^"]+)"/g)].filter((m) => !m[1].startsWith(SITE));
    if (ext.length < 1) fail(path, 'no external source link');
  }

  // JSON-LD: valid JSON, matches visible text
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length < 1) fail(path, 'no JSON-LD');
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b[1]); } catch (e) { fail(path, `LD invalid JSON: ${e.message}`); continue; }
    const nodes = data['@graph'] ?? [data];
    for (const n of nodes) {
      const type = [].concat(n['@type']);
      if (type.some((t) => ['Review', 'AggregateRating', 'Offer'].includes(t))) fail(path, `forbidden LD type ${type}`);
      if (n.aggregateRating || n.review || n.offers) fail(path, 'forbidden LD property');
      if (type.includes('FAQPage')) {
        for (const q of n.mainEntity ?? []) {
          if (!visible.includes(norm(q.name))) fail(path, `FAQ question not visible: ${q.name}`);
          if (!visible.includes(norm(q.acceptedAnswer?.text ?? ''))) fail(path, `FAQ answer not visible: ${q.name}`);
        }
      }
      if (type.includes('BreadcrumbList')) {
        for (const it of n.itemListElement ?? []) if (!bodyVisible.includes(norm(it.name))) fail(path, `breadcrumb not visible: ${it.name}`);
      }
      for (const k of ['headline']) if (n[k] && !visible.includes(norm(n[k]))) fail(path, `${k} not visible: ${n[k]}`);
      if ((type.includes('Article') || type.includes('TechArticle')) && !n.dateModified) fail(path, 'Article without dateModified');
      if (type.includes('Dataset') && !(n.dateModified || n.temporalCoverage)) fail(path, 'Dataset without date');
    }
  }
}

// 404 page
const nf = readFileSync(join(DIST, '404.html'), 'utf8');
if (/<link rel="canonical"/.test(nf)) fail('/404', 'canonical on 404');

// RSS lists every guide
const rssXml = readFileSync(join(DIST, 'rss.xml'), 'utf8');
for (const loc of locs.filter((l) => l.includes('/guide/') && !l.endsWith('/guide/'))) if (!rssXml.includes(loc)) fail('rss.xml', `missing ${loc}`);

if (failures.length) {
  console.error(`GATE FAIL (${failures.length} issues across ${pages} pages)`);
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log(`GATE PASS: ${pages} sitemap pages + 404/robots/sitemaps/llms/rss/ads.txt checked`);
