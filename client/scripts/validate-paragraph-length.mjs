// 렌더 산출물 문단 길이 게이트(v8 가독성) — 절차 가이드(/guide/*)의 프리렌더 <main> 안 <p>가
// 하나라도 250자(공백 포함, 연속 공백은 하나로)를 넘으면 빌드를 멈춘다.
//
// 데이터 테스트(src/data/guideParagraphs.test.ts)만으로는 부족하다: 문단 구분자(\n\n)를 데이터에
// 넣어도 컴포넌트가 그걸 <p>로 나누지 않으면 화면은 여전히 한 덩어리다. 그래서 크롤러·사용자가
// 실제로 받는 HTML을 마지막으로 잰다. 숫자는 src/lib/paragraphs.ts의 PARAGRAPH_MAX_CHARS와 같다
// (.mjs가 TS를 import하지 못해 이중으로 둔다 — 값이 어긋나면 둘 중 엄한 쪽이 먼저 red를 낸다).
import { readFileSync } from "node:fs";

export const PARAGRAPH_MAX_CHARS = 250;
export const PARAGRAPH_GATED_PREFIX = "/guide/";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

function paragraphTexts(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? "";
  return [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) =>
    match[1]
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name) => ENTITIES[name])
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** routes 중 /guide/ 라우트를 검사하고 [검사 라우트 수, 검사 문단 수, 최장 길이]를 돌려준다. */
export function validateGuideParagraphs({ routes, routeOutputPath, assert }) {
  const gated = routes.filter((route) => route.startsWith(PARAGRAPH_GATED_PREFIX));
  // 대상이 0개면 무조건 통과한다 — 라우트 이름이 바뀌어 게이트가 조용히 꺼지는 것을 막는다.
  assert(gated.length > 0, `Paragraph gate: no ${PARAGRAPH_GATED_PREFIX} routes found`);

  const failures = [];
  let paragraphCount = 0;
  let longest = 0;
  for (const route of gated) {
    const paragraphs = paragraphTexts(readFileSync(routeOutputPath(route), "utf8"));
    assert(paragraphs.length > 0, `Paragraph gate: no <p> inside <main> for ${route}`);
    for (const text of paragraphs) {
      paragraphCount += 1;
      longest = Math.max(longest, text.length);
      if (text.length > PARAGRAPH_MAX_CHARS) failures.push(`${route} ${text.length}자: ${text.slice(0, 40)}…`);
    }
  }
  assert(
    failures.length === 0,
    `Paragraph over ${PARAGRAPH_MAX_CHARS} chars on guide pages (나눠서 문단·표로):\n  ${failures.join("\n  ")}`,
  );
  return { routeCount: gated.length, paragraphCount, longest };
}
