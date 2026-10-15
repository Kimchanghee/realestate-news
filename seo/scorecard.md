# Phase 0 scorecard — korearealestatenews.online (집계산서)

Playbook: fire-your-seo-agency v1.2.1 (5f7249f), Phase 0 format (lane ✅/⚠️/❌ + one-line evidence).
Raw crawler-eye output (curl, no JS): `seo/before-evidence.txt`, `seo/after-evidence.txt`.

## BEFORE — live domain, 2026-10-15 23:48 KST

Every path (`/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/no-such-page-xyz`) returned
**HTTP 402 Payment Required** (`Server: Vercel`, `X-Vercel-Error: DEPLOYMENT_DISABLED`, 78-byte text body).

| Lane | Status | Evidence |
|---|---|---|
| SEO | ❌ | 402 on every URL; no HTML, title, canonical, robots.txt or sitemap reachable |
| AEO | ❌ | No answerable content, no JSON-LD |
| GEO | ❌ | No citable content, no entity description |
| LLMO | ❌ | `/llms.txt` → 402 |
| NEO (Naver) | ❌ | No page, no RSS, no naver-site-verification meta |
| Content ops | ❌ | Old repo held a 3,064-file auto news archive (removed on this branch); nothing served |

## AFTER — local `astro preview` (:4321), 2026-10-16 01:36 KST

Not deployed. Results describe the built `dist/` only; indexing/traffic are unmeasured (see `seo/measure.md`).

| Lane | Status | Evidence |
|---|---|---|
| SEO | ✅ | 25 sitemap URLs all 200 with full SSR body; titles 50–60 / descriptions 150–160 (gate-enforced); absolute canonicals; 1200×630 OG PNG per key page (18) + default; `sitemap-index.xml` → `sitemap-0.xml` with real lastmod; robots `Allow: /` + sitemap; `/no-such-page-xyz/` → **404**; no `noindex` meta on any page (static assets, no X-Robots-Tag) |
| AEO | ✅ | Question-shaped H1/H2 (e.g. "내 소득으로 주담대는 얼마까지 나오나요?"); ~40-word direct answer as first paragraph on every calc/guide page (gate-checked); JSON-LD parses: Organization, WebSite, WebPage / WebApplication / Article / Dataset / BreadcrumbList; FAQPage only where FAQ is visible and text matches |
| GEO | ✅ | Each result/guide cites statute article + 기준일 + official link (law.go.kr, bok.or.kr, fsc.go.kr); methodology + data-sources page; consistent entity line on About, Organization LD and llms.txt; stable `/calc/*`, `/guide/*`, `/data/*` URLs |
| LLMO | ✅ | `/llms.txt` (7.8 KB) and `/llms-full.txt` (44.6 KB) 200 text/plain; AI crawlers not blocked |
| NEO (Naver) | ⚠️ | Korean mobile-first pages, `/rss.xml` (10 guides) and sitemap ready; `naver-site-verification` meta renders only when `PUBLIC_NAVER_VERIFICATION` is set — owner must register in Naver Search Advisor |
| Content ops | ✅ | `src/content/guides` collection (10 sourced guides, frontmatter question/answer/data_asof/sources/faq/updated); `content/backlog.md` question backlog; `pnpm gate` = PASS (25 pages); IndexNow key `/9d4f933b26315f835a969b509128ba5a.txt` |

## UX QA (Playwright, local preview)

`qa/shots.json` (not committed): home, `/calc/loan-limit/`, `/guide/how-dsr-is-calculated/` at 1440 and 390 —
horizontal overflow none, layout-shift sum 0, keyboard focus outline 3px solid #1D3B78. Wide tables scroll inside
`.tbl-wrap` on 390 px. Screenshots: `qa/shots/*.png`.

## Remaining (owner / post-deploy)
- Set `PUBLIC_GA4_ID`, `PUBLIC_GSC_VERIFICATION`, `PUBLIC_NAVER_VERIFICATION`; register in GSC + Naver Search Advisor; submit sitemap; ping IndexNow after deploy.
- Re-run this scorecard against the production URL after deployment (curl the same paths; 404 must stay 404 on Cloudflare `404-page` handling).
