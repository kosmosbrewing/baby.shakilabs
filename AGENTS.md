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
```

## 디렉토리 맵

```
client/
  scripts/        seo-routes.mjs(라우트 목록) · build.mjs(sitemap+ssg) · validate-static-output.mjs
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
- 지자체 자체 출산지원금은 수치를 넣지 않고 정부24 링크로만 안내한다 (`LOCAL_BIRTH_SUPPORT_URL`).
- Pinia/Sentry/auth는 이식하지 않았다 (baby는 로그인 없는 정적 계산기). 도입 시 08.loan 패턴 참조.
