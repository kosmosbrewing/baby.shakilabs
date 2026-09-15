// 빌드 산출물(dist)이 font-subset-manifest.json과 일치하는지 게이트한다.
// document.fonts.check()는 이 환경 Chromium에서 무엇을 물어도 true를 반환해(BL-020 §6)
// 판정에 쓸 수 없다 — 그래서 여기서는 산출물 cmap 전수 대조로 실제 글리프 커버리지를
// 검증한다. renderedTexts(+manualAdditions)의 모든 문자가 서브셋 폰트의 cmap에 있어야
// "제목·히어로 문구가 글자 단위로 Pretendard와 섞이지 않는다"를 증명할 수 있다.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clientRoot, fontJobs, manifestPath } from "./font-subset-config.mjs";
import { woff2CodePoints } from "./woff2-cmap.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(`[verify-fonts] ${message}`);
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const manifestFonts = new Map(manifest.fonts.map((font) => [font.publicName, font]));
const distRoot = resolve(clientRoot, "dist");

// 1) dist 산출물이 manifest 기록과 바이트 단위로 일치하는지, 예산을 지키는지.
for (const fontJob of fontJobs) {
  const distFontPath = resolve(distRoot, "fonts", fontJob.publicName);
  assert(existsSync(distFontPath), `Missing shipped font: fonts/${fontJob.publicName}`);

  const font = readFileSync(distFontPath);
  assert(
    font.subarray(0, 4).toString("ascii") === "wOF2",
    `${fontJob.publicName} is not a WOFF2 file`,
  );
  assert(
    font.byteLength <= fontJob.maxBytes,
    `${fontJob.publicName} is ${font.byteLength}B, exceeds its ${fontJob.maxBytes}B budget`,
  );

  const manifestFont = manifestFonts.get(fontJob.publicName);
  assert(manifestFont, `manifest.fonts is missing an entry for ${fontJob.publicName}`);
  assert(
    manifestFont.bytes === font.byteLength,
    `${fontJob.publicName}: manifest bytes (${manifestFont.bytes}) != dist bytes (${font.byteLength}) — run npm run fonts:subset`,
  );
  assert(
    manifestFont.sha256 === hash(font),
    `${fontJob.publicName}: manifest sha256 does not match dist output — run npm run fonts:subset`,
  );

  // 2) 빌드된 CSS가 실제로 이 서브셋 파일을 참조하는지 (구 파일 참조가 남아있지 않은지).
  const cssDir = resolve(distRoot, "assets");
  const css = readdirSync(cssDir)
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(resolve(cssDir, file), "utf8"))
    .join("\n");
  assert(
    css.includes(`/fonts/${fontJob.publicName}`),
    `Built CSS does not reference /fonts/${fontJob.publicName}`,
  );
  assert(
    !css.includes("GmarketSansBold-num-v1.woff2"),
    "Built CSS still references the retired numeral-only subset (GmarketSansBold-num-v1.woff2)",
  );
}

// 3) cmap 전수 대조 — 렌더 수집 텍스트 전체(+ 수동 보강분)가 서브셋 글리프에 다 있는지.
const rendered = [...manifest.renderedTexts, ...Object.keys(manifest.manualAdditions ?? {})];
const brandJob = fontJobs.find((job) => job.publicName.startsWith("GmarketSansBold"));
const distFontPath = resolve(distRoot, "fonts", brandJob.publicName);

// cmap은 python fontTools가 아니라 순수 Node로 읽는다 — 이 게이트는 `npm run build`에
// 얹혀 Vercel에서도 도는데 그쪽 빌드 이미지에 fontTools(pip 패키지)가 없다.
// python을 부르면 게이트가 아니라 배포 장애가 된다.
const codePoints = woff2CodePoints(readFileSync(distFontPath));
const missing = [
  ...new Set(rendered.flatMap((text) => [...text])),
].filter((character) => !codePoints.has(character.codePointAt(0))).sort();
assert(
  missing.length === 0,
  `cmap coverage gap — missing glyphs for: ${JSON.stringify(missing)} (run npm run fonts:subset after updating manifest.characters)`,
);

console.log(
  `[verify-fonts] OK — ${fontJobs.length} font(s), ${rendered.length} rendered text(s), 0 missing glyphs.`,
);
