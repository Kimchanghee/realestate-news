# DESIGN_REFERENCES — 집계산서 (korearealestatenews.online)

## Metaphor
**관공서 서식 / 등기부·세금 계산서 용지.** Each calculator is a numbered government-style form (`[서식 제1호]`…`제6호`):
grey label cells (입력란) beside white value cells, a double-ruled 합계 row like a tax notice, a red 직인(seal) colour used
only for totals and warnings, and a "근거·시행·대조일" basis box like the 근거 법령 footer of an official notice.
Guides are 안내문 (notices) with 작성/최종 수정/자료 기준일 metadata lines. The data page is a 자료표 (ledger table).
Nothing decorative: hierarchy comes from rules, label/value grids, serif headings and numbering — not cards, gradients or shadows.

## Tokens (src/styles/global.css)
- Paper `#f4f2ec`, sheet `#fffefa`, ink `#18191c`, label cell `#ecebe3`, soft rule `#c8c4b8`
- Seal red `#a3231b` (totals, errors, stamp only), 공문서 남색 `#1d3b78` (links, focus ring), ok `#24603a`, warn bg `#fff5d6`
- Type: headings serif (Nanum Myeongjo → Noto Serif KR → Batang), body sans (Pretendard → Apple SD Gothic Neo → Malgun Gothic),
  numbers/form numbers mono (D2Coding → Consolas). System/locally-installed stacks only; no web-font download (no CLS, no licence risk).
- Scale `--fs-0..5` with `clamp()` H1; measure 42rem; `--gap: clamp(1rem, 2.4vw, 1.75rem)`.
- Square corners (border-radius 0) on inputs and sheets; 1–3 px rules, `3px double` for 합계 lines.
- Focus: `:focus-visible { outline: 3px solid #1d3b78; outline-offset: 2px }`; touch targets ≥44 px (nav, radio/checkbox labels).
- Charts: build-time inline SVG bars (src/lib/chart.ts), monochrome ink + seal accent.
- OG cards: same form metaphor rendered at build time (scripts/og.mjs) — form number cell, serif title, 비고 row, red stamp.

## States designed
Invalid input (field-level `role="alert"` message in seal red), empty/zero, overflow (Korean 만원/억 echo under money inputs;
wide ledgers scroll inside `.tbl-wrap`), stale data (asOf printed beside every rate-derived number; refresh failure keeps last
snapshot), source unavailable (실거래가 key absent → no prices rendered, stated on methodology), 404 form ("찾는 서식이 없습니다").

## Principles borrowed (no code copied)
- KRDS 대한민국 정부 디자인 시스템 — label/field grouping, error message placement, 44px targets. https://www.krds.go.kr (public-sector guidance; principles only)
- GOV.UK Design System — "one thing per page", error summary near field, plain-language answers first. https://design-system.service.gov.uk (MIT for code, OGL for content; principles only)
- WCAG 2.2 AA — contrast (ink on paper ≈ 16:1; seal red on sheet ≈ 7:1), focus visible, reduced motion.

## Rejected defaults
Gradient SaaS hero, glass blur, rounded cards, pill tags, metric tiles, hover-lift, testimonials, stock imagery.
