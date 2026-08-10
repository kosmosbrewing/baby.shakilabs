# 12.baby — 2026 육아·출산 지원금 계산기

부모급여·아동수당·첫만남이용권 남은 총 수령액을 자녀 생년월 기준으로 계산하는 정적 SPA(shakilabs.com/baby/).

## 실행 명령 (client/ 안에서)

```
npm install        # 최초 1회
npm run dev        # 로컬 개발 서버 (포트 6213)
npm run typecheck  # vue-tsc
npm run test       # vitest
npm run build      # sitemap 생성 → vite-ssg build → 정적 산출물 검증
npm run check      # typecheck + test + build
npm run sbom:prod  # 프로덕션 SBOM 생성 (client/artifacts/sbom, 커밋하지 않음 · CI 아티팩트로 보관)
npm run verify:supply-chain  # vendor tgz·README·package.json 3자 대조 + SBOM 신원 검증 (CI 필수)
```

## 디렉토리 맵

```
client/
  scripts/        seo-routes.mjs(라우트 목록) · build.mjs(sitemap+ssg) · validate-static-output.mjs
                  sbom.mjs(SBOM 생성) · verify-sbom-identity.mjs · verify-vendor-readme.mjs(공급망 가드)
  src/
    data/         benefitRates2026.ts(2026 지원금 상수+출처) · babyPresets.ts · seoGuides.ts · crossLinks.ts
    utils/        babyCalculator.ts(순수 계산 함수) · timelineStages.ts(타임라인 압축) + *.test.ts
    composables/  useBenefitTimeline · useParentalBenefitCalc · useChildAllowanceCalc · useFirstMeetingCalc
    components/baby/  각 계산기 UI (Calculator.vue) + TimelineTable/TimelineSimulator
    components/common/ SEOHead · FaqAccordionPanel · SeoRichGuide · NextStepsLinks 등 재사용 컴포넌트
    views/        HomeView(킬러 기능) · ParentalBenefitView · ChildAllowanceView · FirstMeetingView 등
```

## 주의사항

- 모든 개월수는 "개월수" 기준(출생월=0개월)이며 만 나이가 아니다. `monthsBetween()` 참조.
- 상수는 반드시 `benefitRates2026.ts`에 출처 URL 주석과 함께 추가한다. 수치를 임의로 바꾸지 말 것.
- FAQ는 `FaqAccordionPanel`의 `extra`로만 병합한다. `SeoRichGuide`에 `:faqs`를 넘기면 이중 노출된다.
- `/child-allowance/YYYY` 9개는 canonical을 `/child-allowance`로 통합했다(`seo-routes.mjs`의 `PARAM_ROUTES`). 프리렌더는 유지하고 사이트맵에서만 뺀다 — 프리렌더에서 빼면 SPA 빈 셸 soft-404가 된다. 고유 콘텐츠가 생기면 `PARAM_ROUTES`에서 빼는 것만으로 되돌릴 수 있다.
- 사이트맵에 실리는 라우트는 본문 1,500자 이상이어야 한다(`validate-static-output.mjs`의 `MIN_BODY_CHARS`). 새 페이지를 추가하면 빌드가 여기서 막힌다.
- **자수는 `<main>` 안쪽을 공백 제외로 센다.** 헤더·탭 내비·푸터는 `<main>`의 형제라 자동으로 빠진다 — 공유 UI 문구로 자수를 채울 수 없다. 자수를 손으로 잴 때도 같은 기준을 쓸 것(크롬 포함 측정은 페이지당 수백 자를 부풀려 얇은 페이지를 통과시키고, 공백을 세면 감사보다 후해져 `/terms`처럼 게이트를 통과하고도 감사에서 얇게 나온다). 빌드 로그 마지막 줄이 최소 자수와 해당 라우트를 찍어 준다.
- **404에는 광고 로더가 없어야 한다.** `index.html`의 AdSense 스니펫을 `build.mjs`의 `removeAdsLoaderFromNotFound()`가 404 산출물에서만 걷어낸다(Valuable Inventory 정책 — 본문 없는 화면에 광고 금지). 게이트가 404에 로더가 없는 것과 **정상 라우트에는 로더가 남아 있는 것**을 함께 어서션한다. 로더 태그를 고치면 스트립 정규식도 같이 고쳐야 하며, 못 찾으면 빌드가 실패한다.
- 방침·약관(`PrivacyView`·`TermsView`)은 **이 앱 고유 서술**을 유지한다. 13개 자산이 같은 문단을 쓰면 준중복 정책 문서가 되어 애드센스 심사에서 감점된다(과거 최대 유사도 0.862). 다른 앱 문구를 복붙하지 말고, 문단을 늘릴 때는 이 앱 계산기가 실제로 받는 입력·이 앱만의 한계로 쓸 것. 애드센스 3요소(제3자 광고 쿠키·맞춤 광고·옵트아웃 링크 2종)와 운영자 표기는 삭제 금지.
- 연도 목록은 `childAllowanceYearGuides.ts`와 `seo-routes.mjs`에 이중으로 있다(.mjs가 TS를 import 못 함). 드리프트는 `childAllowanceYearGuides.test.ts`가 잡는다.
- 지자체 자체 출산지원금은 수치를 넣지 않고 정부24 링크로만 안내한다 (`LOCAL_BIRTH_SUPPORT_URL`).
- Pinia/Sentry/auth는 이식하지 않았다 (baby는 로그인 없는 정적 계산기). 도입 시 08.loan 패턴 참조.
