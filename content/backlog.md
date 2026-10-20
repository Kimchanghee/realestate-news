# Question backlog — 집계산서 (korearealestatenews.online)

규칙: 한 질문 = 한 URL. 법령·공공기관 원문으로 확인 가능한 질문만 착수. 수치는 기준일+출처 필수. 데이터는 한국은행 기준금리(BOK)만 사용.
게시 전 `pnpm build && pnpm gate` 통과 필수. 상태: `live` / `next` / `hold(사유)`.

| 질문 | 근거 | 유형 | 상태 | URL |
|---|---|---|---|---|
| 생애최초 취득세 감면은 얼마까지 되나? | 지특법 제36조의3 | 가이드 (제1호 서식 연결) | live | /guide/first-home-acquisition-tax-relief/ |
| 취득세율 1~3%·8%·12%는 어떻게 정해지나? | 지방세법 제11조·제13조의2 | 가이드 (제1호) | live | /guide/acquisition-tax-rate-structure/ |
| 전세 계약 때 어떤 서류를 확인하나? | 주택임대차보호법, 인터넷등기소 | 가이드 (제3호) | live | /guide/jeonse-contract-documents/ |
| 확정일자와 전입신고는 언제 효력이 생기나? | 주택임대차보호법 제3조·제3조의2 | 가이드 (제3호) | live | /guide/fixed-date-and-move-in-report/ |
| 전세보증금 반환보증 가입 조건은? | HUG 상품 안내 | 가이드 (제3호) | live | /guide/jeonse-deposit-guarantee/ |
| 중개보수는 어떻게 협의하나? | 공인중개사법 시행규칙 별표1 | 가이드 (제2호) | live | /guide/negotiating-brokerage-fee/ |
| DSR·스트레스 DSR은 어떻게 계산하나? | 금융위원회 | 가이드 (제4호) | live | /guide/how-dsr-is-calculated/ |
| 전월세 전환율 상한은 어떻게 정해지나? | 시행령 제9조, 한국은행 | 가이드 (제3호) | live | /guide/jeonse-to-monthly-conversion-cap/ |
| 원리금균등과 원금균등 중 이자가 적은 것은? | 금융수학, 금감원 파인 | 가이드 (제5호) | live | /guide/mortgage-repayment-methods/ |
| 주택 재산세는 어떻게 계산하나? | 지방세법 제110~112조, 시행령 제109조 | 가이드 (제6호) | live | /guide/property-tax-how-calculated/ |
| 일시적 2주택 취득세 중과 배제 요건과 처분 기한은? | 지방세법 시행령 제28조의5 | 가이드 (제1호) | next | /guide/temporary-two-homes-acquisition-tax/ |
| 종합부동산세는 언제, 공시가 얼마부터 내나? | 종합부동산세법 | 가이드 (제6호) | next | /guide/comprehensive-real-estate-tax-basics/ |
| 계약갱신청구권과 5% 상한은 어떻게 쓰나? | 주택임대차보호법 제6조의3·제7조 | 가이드 (제3호) | next | /guide/lease-renewal-right-5-percent/ |
| 등기부등본 갑구·을구에서 무엇을 보나? | 대법원 인터넷등기소 | 가이드 | next | /guide/reading-property-register/ |
| 디딤돌·보금자리론 소득·주택가격 요건은? | 주택도시기금, HF | 가이드 (제4호) | next | /guide/policy-mortgage-eligibility/ |
| 2027~28 양도세 다주택 중과 완화는 어떻게 바뀌나? | 2026 세제개편안 | 가이드 | hold(국회 통과 전) | — |
| 오피스텔 생애최초 감면 포함·청년 300만원 | 2026 지방세제 개편안 | 가이드 (제1호) | hold(입법예고) | — |
| 우리 동네 아파트 실거래 중위가격 | 국토부 실거래가 API (DATA_GO_KR_SERVICE_KEY) | 데이터 | hold(데이터 키 필요, 현재 데이터는 한국은행 기준금리만) | /data/... |

## 갱신·병합 정책
- 원문(법령·고시·기준금리)이 바뀌거나 노출이 30% 이상 줄면 갱신 대상.
- dateModified·sitemap lastmod는 실제 내용 변경 때만 바꾼다.
- 같은 질문 중복 페이지는 강한 쪽으로 301 + canonical, 410은 마지막 수단.
