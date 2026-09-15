// GmarketSans 브랜드 폰트 서브셋 파이프라인 설정 (BL-020 개정판, docs/BRAND_FONT_SUBSET.md).
// Pretendard는 별도 생성 과정 없이 이미 -subset.woff2가 저장소에 있어 이 파이프라인은
// GmarketSans 전용 job 하나만 정의한다.
//
// finance(02.finance/client/scripts/font-subset-config.mjs)와 구조는 같지만 문자 수집
// 방식은 다르다 — finance의 collectFontCharacters()는 .vue 소스를 grep해서 과대 수집한다
// (주석의 한글까지 세고, 실제로 렌더되지 않는 문자도 포함). BL-020은 이 방식을 명시적으로
// 금지한다(§3 "소스 grep 금지"). 대신 문자셋은 scripts/font-subset-manifest.json의
// `characters` 필드에 고정값으로 저장돼 있다 — Playwright로 전 라우트를 렌더링해 computed
// font-family가 GmarketSans인 리프 요소의 textContent를 전수 수집한 결과(+ 숫자셋 상수)다.
// 수집 방법과 대상 라우트는 매니페스트의 `collectionMethod`·`routesScanned`에 기록돼 있다.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
export const clientRoot = resolve(scriptRoot, "..");

export const fontJobs = [
  {
    source: resolve(clientRoot, "public/fonts/GmarketSansBold.woff"),
    output: resolve(clientRoot, "public/fonts/GmarketSansBold-brand-v1.woff2"),
    publicName: "GmarketSansBold-brand-v1.woff2",
    // BL-020 §4: 실측 7,812B, 예산은 여유 있게 24KB(24 * 1024)로 잡는다.
    maxBytes: 24 * 1024,
    preload: false,
  },
];

export const manifestPath = resolve(clientRoot, "scripts/font-subset-manifest.json");
