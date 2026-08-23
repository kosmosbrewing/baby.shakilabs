import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * WCAG 대비 회귀 게이트.
 *
 * 소스가 아니라 **빌드 산출물**을 읽는다. nutri에서 main.css의 `.dark` 토큰 블록이
 * Tailwind 빌드에서 통째로 사라져 "선언은 있는데 배포는 안 되는" 상태가 실제로 났다.
 * 선언만 검사하면 그런 앱을 통과시킨다.
 *
 * baby는 토큰이 두 곳에 나뉘어 있다:
 *   - index.html 인라인 critical CSS: 코어 팔레트(:root / .dark)
 *   - main.css → dist/assets/*.css: --status-* 계열
 * 브라우저 캐스케이드와 같은 순서(인라인 먼저, 스타일시트 나중)로 병합해 실제 계산값을 만든다.
 */
const AA_BODY = 4.5;

/** 텍스트가 실제로 얹히는 표면. baby는 bg-secondary·bg-accent를 쓰지 않으므로 제외한다. */
const SURFACES = ["--background", "--card", "--muted"];

const FOREGROUNDS = [
  "--foreground",
  "--muted-foreground",
  "--primary",
  "--destructive",
  "--status-success",
  "--status-warning",
  "--status-caution",
  "--status-danger",
  "--status-info",
];

/** 표면 위 전경이 아니라 짝으로만 쓰이는 조합(솔리드 버튼·칩). */
const PAIRS = [
  ["--primary-foreground", "--primary"],
  ["--destructive-foreground", "--destructive"],
  ["--accent-foreground", "--accent"],
  ["--secondary-foreground", "--secondary"],
];

/**
 * 알파 틴트 위 텍스트. 토큰 대 토큰만 재면 여기가 통째로 빈다 — 틴트는 배경을 브랜드색으로
 * 덮어 대비를 깎기 때문에 민무늬 표면은 통과해도 틴트 행만 미달인 사례가 실제로 있었다
 * (이 앱 다크 bg-primary/15 칩이 픽셀 실측 4.37:1이었다).
 * alpha/surface는 마크업에 적힌 값 그대로다. 새 틴트 조합을 쓰면 여기 한 줄을 추가할 것.
 */
const TINTS = [
  {
    fg: "--primary",
    where: "FreshBadge bg-primary/10 on the page background",
    base: "--background",
    layers: [["--primary", 0.1]],
  },
  {
    // AboutView: retro-panel(bg-card) > retro-titlebar(bg-muted/35) > FreshBadge(bg-primary/10).
    // 층이 셋이라 토큰 대 토큰으로는 절대 안 나오는 조합이고, 다크에서 실제로 제일 빡빡하다.
    fg: "--primary",
    where: "FreshBadge bg-primary/10 on retro-titlebar(bg-muted/35) over bg-card",
    base: "--card",
    layers: [["--muted", 0.35], ["--primary", 0.1]],
  },
  {
    fg: "--primary",
    where: "ProcedureStepList chip bg-primary/15 on retro-panel-muted(bg-muted/30)",
    base: "--background",
    layers: [["--muted", 0.3], ["--primary", 0.15]],
  },
  {
    fg: "--foreground",
    where: "AppHeader / TimelineTable current row bg-primary/8",
    base: "--background",
    layers: [["--primary", 0.08]],
  },
];

function hslToRgb(token) {
  const [h, s, l] = token.split(/\s+/).map(Number.parseFloat);
  if (![h, s, l].every(Number.isFinite)) throw new Error(`Unparsable hsl token: "${token}"`);
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [channel(0), channel(8), channel(4)];
}

function relativeLuminance([r, g, b]) {
  const linear = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRgb(a, b) {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** source-over compositing in sRGB — 브라우저가 알파 배경을 합성하는 방식 그대로. */
function composite(fg, bg, alpha) {
  return [0, 1, 2].map((i) => alpha * fg[i] + (1 - alpha) * bg[i]);
}

// 주석을 먼저 걷어낸다. 이 앱의 .dark 블록 주석에 `{H} {S}% 10%`(파생 공식)가 들어 있어서
// 블록 매칭이 중괄호에서 끊겼다 — 그 상태로는 "다크가 배포 안 됨"이라는 오탐이 난다.
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** 하나의 CSS 텍스트에서 주어진 셀렉터 블록들의 커스텀 프로퍼티를 순서대로 병합한다. */
function collectTokens(rawCss, selector) {
  const css = stripComments(rawCss);
  const tokens = {};
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blocks = css.matchAll(new RegExp(`(?:^|[\\s,{}])${escaped}\\s*\\{([^{}]*)\\}`, "g"));
  for (const block of blocks) {
    for (const [, name, value] of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      tokens[name] = value.trim();
    }
  }
  return tokens;
}

function inlineStyles(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
}

export function verifyTokenContrast({ distRoot, assert }) {
  const assetsDir = resolve(distRoot, "assets");
  const cssFiles = readdirSync(assetsDir).filter((name) => name.endsWith(".css"));
  assert(cssFiles.length > 0, "Build must emit at least one stylesheet");
  const sheetCss = cssFiles.map((n) => readFileSync(resolve(assetsDir, n), "utf8")).join("\n");
  const inlineCss = inlineStyles(readFileSync(resolve(distRoot, "index.html"), "utf8"));

  // 인라인 critical CSS가 먼저, 스타일시트가 나중 — 같은 특이도면 나중이 이긴다.
  const themes = {
    light: { ...collectTokens(inlineCss, ":root"), ...collectTokens(sheetCss, ":root") },
    dark: {
      ...collectTokens(inlineCss, ":root"),
      ...collectTokens(sheetCss, ":root"),
      ...collectTokens(inlineCss, ".dark"),
      ...collectTokens(sheetCss, ".dark"),
    },
  };

  const required = [...new Set([...SURFACES, ...FOREGROUNDS, ...PAIRS.flat()])];
  let checked = 0;

  for (const [theme, tokens] of Object.entries(themes)) {
    for (const name of required) {
      assert(tokens[name], `Built CSS does not ship ${name} for the ${theme} theme`);
    }
    // 다크가 라이트를 하나도 덮지 않았다면 .dark 블록이 배포에서 증발한 것이다(nutri 사례).
    if (theme === "dark") {
      assert(
        tokens["--background"] !== themes.light["--background"],
        "Dark theme did not override --background: the .dark block was stripped from the build",
      );
    }

    const rgb = (name) => hslToRgb(tokens[name]);

    for (const fg of FOREGROUNDS) {
      for (const bg of SURFACES) {
        const ratio = contrastRgb(rgb(fg), rgb(bg));
        checked += 1;
        assert(
          ratio >= AA_BODY,
          `Contrast below WCAG AA (${theme}): ${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}:1, need ${AA_BODY}:1`,
        );
      }
    }

    for (const [fg, bg] of PAIRS) {
      const ratio = contrastRgb(rgb(fg), rgb(bg));
      checked += 1;
      assert(
        ratio >= AA_BODY,
        `Contrast below WCAG AA (${theme}): ${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}:1, need ${AA_BODY}:1`,
      );
    }

    for (const { fg, base, layers, where } of TINTS) {
      // 마크업 순서대로 아래에서 위로 겹쳐 칠한다 (source-over).
      const background = layers.reduce(
        (under, [token, alpha]) => composite(rgb(token), under, alpha),
        rgb(base),
      );
      const ratio = contrastRgb(rgb(fg), background);
      checked += 1;
      const stack = [base, ...layers.map(([t, a]) => `${t}/${Math.round(a * 100)}`)].join(" < ");
      assert(
        ratio >= AA_BODY,
        `Contrast below WCAG AA (${theme}): ${fg} on [${stack}] (${where}) = ` +
          `${ratio.toFixed(2)}:1, need ${AA_BODY}:1`,
      );
    }
  }

  return checked;
}
