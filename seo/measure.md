# Measurement plan — 집계산서 (re-measure at launch +14 days and +28 days)

Owner/parent performs these after deployment; nothing here is measured yet.

## Google Search Console (property: https://korearealestatenews.online/)
1. Sitemaps: submit `/sitemap-index.xml`; record discovered vs indexed count (target: 25 URLs discovered; indexed count recorded as-is).
2. Pages report: list any "Crawled – currently not indexed" / "Duplicate without user-selected canonical" URLs.
3. Performance (last 14 days, web): impressions, clicks, CTR, avg position per page; top 20 queries. Compare calc pages vs guides.
4. Enhancements: Breadcrumbs / FAQ structured-data errors = 0 expected.
5. URL inspection on `/`, `/calc/acquisition-tax/`, `/guide/how-dsr-is-calculated/`: rendered HTML contains answer paragraph.

## Naver Search Advisor (NEO)
1. Verify site with `PUBLIC_NAVER_VERIFICATION`; submit `/sitemap-index.xml` and `/rss.xml`.
2. 수집 현황 / 검색 노출 페이지 수 at +14d; robots 검사 결과.

## GA4 (when `PUBLIC_GA4_ID` set)
1. Events: `tool_used` by `tool_name` (6 calculators) — users and events per page.
2. Landing pages from Organic Search; engagement time per landing page.
3. Consent: share of EEA/UK/CH sessions with denied analytics (modelled vs observed).

## AdSense (after approval only)
Auto-ads impressions per page type; CLS check that reserved slots (`.ad-slot` min-height) do not shift.

## AI / LLM visibility
At +14d ask ChatGPT/Perplexity/Gemini/Clova X the 10 live backlog questions; record whether 집계산서 is cited and which URL.
Check server/CF analytics for GPTBot, ClaudeBot, PerplexityBot, Yeti (Naver) hits on `/llms.txt`.

## Decision rules
- A guide with 0 impressions at +28d: re-check title/answer vs actual SERP wording before writing new pages.
- Any data page with stale `asOf` > 60 days: investigate `pnpm refresh` logs before anything else.

## 재측정 2026-11-03 (2026-10-20 5레인 작업 기준)
- 수치 기준선: 콘솔 데이터 대기 중(GSC·Bing·네이버 서치어드바이저 내보내기 전에는 숫자를 기록하지 않음).
- 2026-10-20 반영: 모든 페이지 첫 문단 = 직답(기준금리 표시줄·서식 번호·작성 정보는 문단이 아닌 요소로 이동), robots에 Claude-SearchBot·Perplexity-User 추가, llms.txt 최종 갱신일 표기, 푸터 브랜드 표기 "집계산서는" 수정.
- 2026-11-03 기록 항목: 변경 URL별 색인 여부, 노출·클릭·평균 순위(GSC), 네이버 수집 여부, Bing 색인 여부.
- 인용 점검(O/X, 날짜·정확한 질문 기록): 일시적 2주택 취득세 중과 배제 요건과 처분 기한은? / 종합부동산세는 언제, 공시가 얼마부터 내나? / 계약갱신청구권과 5% 상한은 어떻게 쓰나? / 집계산서는 무엇인가?
- AI 크롤러 방문(GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot): Cloudflare 분석에서 확인 가능할 때만 기록.
