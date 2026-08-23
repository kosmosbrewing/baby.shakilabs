// Tailwind는 해석하지 못한 유틸리티를 경고도 빌드 실패도 없이 통째로 버린다.
// 두 종류가 같은 방식으로 조용히 죽는다:
//
//   1) theme.opacity 스케일 밖 수식어 — 3.4 기본 스케일에는 5·10·15·20·25·30·35·
//      40·45·50·55·60·65·70·75·80·85·90·95가 있고 8·12·14·92는 없다. 기억으로
//      판단하지 말 것: 유일한 근거는 산출 CSS다.
//   2) 테마가 정의한 적 없는 색 이름 — bg-deduction 처럼 다른 앱에서 복사돼 온 것.
//
// 둘 다 마크업에는 남고 CSS에만 없으므로 그 색은 그냥 안 칠해진다. 배경이 빠진
// 화면은 "원래 그런 디자인"처럼 보여서, 눈으로 직접 대조하기 전까지 아무도 모른다.
// 이 앱은 사이트 헤더 배경(bg-primary/8)을 그렇게 내보내고 있었다 — 전 페이지에서
// 헤더가 페이지 배경과 완전히 같은 색이었다.
//
// 이름 화이트리스트를 두지 않는 것이 핵심이다. 판정 근거를 "산출 CSS에 규칙이
// 있는가" 하나로 두면 스케일이나 테마가 바뀌어도 목록을 손볼 일이 없다.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function collectSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, out);
    else if (/\.(vue|ts)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

const COLOR_PREFIX = "bg|text|border|ring|divide|fill|stroke|outline|placeholder|caret|accent|decoration";
// 토큰 경계. 접두어가 토큰 중간에 걸리면 안 된다: 애니메이션 유틸리티
// `slide-in-from-top-4`의 꼬리는 그 자체로 유틸리티가 아닌데, 그걸 결함으로
// 보고하면 사람들이 이 게이트를 무시하도록 학습된다.
// `!`(important)는 경계로 인정하고 토큰에 포함시킨다 — Tailwind가 `.\!text-profit`
// 으로 내보내므로, 빼고 조회하면 멀쩡한 클래스를 죽었다고 오판한다.
const BOUNDARY = "(?<![a-zA-Z0-9-])";
const IMPORTANT = "!?";
// 슬래시 수식어가 붙은 것 — 그라디언트 정지점(from/via/to)도 실제 색이므로 함께 본다.
const WITH_OPACITY = new RegExp(
  `${BOUNDARY}${IMPORTANT}(?:[a-z-]+:)*(?:${COLOR_PREFIX}|from|via|to)-[a-z][a-zA-Z0-9-]*\\/(?:\\d+|\\[[0-9.]+%?\\])`,
  "g"
);
// 수식어가 없는 것 — 테마에 없는 색 이름을 잡는 축이다. 레이아웃·타이포그래피
// 유틸리티를 이름으로 걸러내지 않는다: 그것들은 진짜 규칙으로 해석되므로 CSS 조회가
// 알아서 통과시킨다. (그래서 스케일에 없는 text-h2 같은 것도 같이 잡힌다.)
const PLAIN = new RegExp(
  `${BOUNDARY}${IMPORTANT}(?:[a-z-]+:)*(?:${COLOR_PREFIX})-[a-z][a-zA-Z0-9-]*(?=["'\\s\`]|$)`,
  "g"
);

// Tailwind가 클래스명을 셀렉터로 바꿀 때 이스케이프하는 문자들.
const toSelector = (cls) => cls.replace(/[/[\]%.:!]/g, (ch) => `\\${ch}`);

export function validateUtilitiesAreGenerated({ projectRoot, distRoot }) {
  const cssDir = resolve(distRoot, "assets");
  const cssFiles = readdirSync(cssDir).filter((name) => name.endsWith(".css"));
  assert(cssFiles.length > 0, "No built CSS found to validate utilities against");
  // 뷰별 CSS는 코드 스플릿으로 갈라져 나가므로 한 파일만 보면 멀쩡한 규칙을 놓친다.
  const css = cssFiles.map((name) => readFileSync(resolve(cssDir, name), "utf8")).join("\n");

  const files = collectSourceFiles(resolve(projectRoot, "src"));
  assert(files.length > 0, "No source files collected — utility extraction failed");

  const missing = [];
  let checked = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const found = new Set([...(source.match(WITH_OPACITY) ?? []), ...(source.match(PLAIN) ?? [])]);
    for (const cls of found) {
      checked += 1;
      const selector = toSelector(cls);
      if (css.includes(`.${selector}`)) continue;
      // 변형 접두어가 붙은 클래스는 셀렉터에 기본 이름이 그대로 남으므로,
      // 선행 점에 고정하지 말고 꼬리로 대조한다.
      if (new RegExp(`[.\\\\:]${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s,:{>~+\\[]`).test(css)) continue;
      missing.push(`${cls}  (${file.slice(projectRoot.length + 1)})`);
    }
  }

  assert(missing.length === 0,
    "These utilities were written in the templates but produced no CSS rule. "
      + "Off-scale slash opacity needs the arbitrary-value syntax (/[8%]); a colour "
      + "or size name must exist in tailwind.config.ts:\n  "
      + missing.join("\n  "));
  assert(checked > 20,
    `색 유틸리티 스캔이 ${checked}건밖에 못 찾았다 — 추출이 깨졌다고 봐야 한다`);
  return checked;
}
