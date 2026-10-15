# PROGRESS — korearealestatenews.online v2 (집계산서)

Resume notes for a restarted run. Branch: `v2-cloudflare-static` (clone was `--depth 1 --no-checkout --filter=blob:none`,
so the old 3,064-file news archive is never checked out; the first commit on this branch deletes it from the tree).

## Verified legal/rate facts (checked 2026-10-15 KST)
- 한국은행 기준금리 3.00% (2026-08-27 변경; 직전 2.75% 2026-07-16). 다음 결정 2026-10-22. Source: bok.or.kr baseRate list.
- 전월세 전환율 상한 = min(10%, 기준금리 + 2%p) (주택임대차보호법 시행령 제9조) → 5.00%.
- 중개보수 별표1 (2021-10-19 신설, 2026-08-28 개정 시행분에서도 요율 동일; 2026 개정은 오피스텔 '협의' 문구·협회 명칭).
- 생애최초 취득세 감면 지특법 제36조의3: 12억 이하, 200만 / 소형·인구감소지역 300만, 일몰 2028-12-31 (시행 2026-06-02 법률 제21738호).
  2026 지방세제 개편안(오피스텔 포함·청년 300만)은 입법예고 단계 → 미반영, 표기만.
- 재산세 1세대1주택 공정시장가액비율 2026: 3억 이하 43%, 6억 이하 44%, 초과 45% (지방세법 시행령 제109조, 2026-05-29 개정).
- 스트레스 DSR 3단계 1.5% (2025-07-01), 수도권·규제지역 주담대 하한 3.0% (2025-10-16), 행정지도 유효 2026-07-01~12-31.
- LTV 규제지역 40% / 비규제 70%, 수도권·규제지역 주담대 한도 6/4/2억 (시가 15억 이하/25억 이하/초과). 8·13(2026) 대책도 비율 유지.
- 양도세: 다주택 중과 2026-05-10 재개; 2026 세제개편안(2027~28 완화)은 국회 제출 단계.

## Milestones
- [x] M1 scaffold + calc libs + tests (24 node:test pass; BOK base-rate refresh → src/data/base-rate.json asOf 2026-10-15). Old archive removal committed 7e74381 and pushed.
- [x] M2 pages/layout/design (6 calc pages, data page, home, about/methodology/contact/privacy/terms/disclaimer/404; 등기부/관공서 서식 design in src/styles/global.css)
- [x] M3 guides (10: +mortgage-repayment-methods, +property-tax-how-calculated) + legal pages (done in M2)
- [x] M4 SEO — GATE PASS (25 pages). done: robots/sitemap-index/sitemap-0 (src/lib/urls.ts registry), rss.xml, llms.txt, llms-full.txt, IndexNow key file. scripts/gate.mjs written; all titles 50–60 / descs 150–160 fixed; broken related links fixed; gate now fails ONLY on missing OG PNGs. OG: scripts/og.mjs (pnpm og) renders 18 PNGs via _qa-tools playwright + installed ms-playwright headless shell. Remaining small: content/backlog.md, DESIGN_REFERENCES.md, seo/measure.md
- [ ] M5 QA (build, check, gate, curl, screenshots) + scorecard
- [ ] M6 push + report

## Notes
- _pw-browsers folder does not exist; Playwright browsers live in %LOCALAPPDATA%\ms-playwright (use those, do not download).
- Verified 2026-10-15: 생애최초 300만 한도 = 지특법 36조의3①1 가~라목 (60㎡ 이하·3억(수도권 6억) 이하 비아파트 공동주택/도시형생활주택/다가구 호수, 또는 인구감소지역). 재산세 1주택 특례세율(9억 이하) 2029년까지 연장 개편안(2026-08-26 발표).
