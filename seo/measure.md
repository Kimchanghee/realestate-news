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
