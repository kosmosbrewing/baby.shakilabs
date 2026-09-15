// GmarketSans 브랜드 서브셋을 font-subset-manifest.json의 고정 문자셋(characters)으로
// 재생성한다. finance의 fonts:subset과 달리 문자셋을 소스에서 매번 다시 grep하지 않는다 —
// BL-020(docs/BRAND_FONT_SUBSET.md §3)이 소스 grep을 금지하기 때문이다. 화면에 새 GmarketSans
// 텍스트가 추가되면(새 히어로 문구, 새 페이지 제목 등) manifest의 renderedTexts/characters를
// 렌더 수집으로 다시 만들어 이 파일을 손으로 갱신한 뒤 본 스크립트를 돌려야 한다.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fontJobs, manifestPath } from "./font-subset-config.mjs";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { characters } = manifest;

const actualCharacterSha256 = hash(characters);
if (manifest.characterSha256 !== actualCharacterSha256) {
  throw new Error(
    "manifest.characters와 manifest.characterSha256이 불일치한다 — characters를 손으로 고쳤다면 " +
      `characterSha256도 ${actualCharacterSha256}로 갱신해라.`,
  );
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "baby-fonts-"));
const characterFile = join(temporaryRoot, "characters.txt");

try {
  writeFileSync(characterFile, characters);

  const fonts = fontJobs.map((fontJob) => {
    // --no-hinting만 쓴다. --layout-features=''는 커널링(GPOS)을 날려버려 절대 쓰지 않는다
    // (BL-020 §4). 지정하지 않으면 fontTools 기본값(GPOS 포함)이 유지된다.
    const result = spawnSync("python3", [
      "-m",
      "fontTools.subset",
      fontJob.source,
      `--text-file=${characterFile}`,
      "--flavor=woff2",
      `--output-file=${fontJob.output}`,
      "--no-hinting",
    ], { encoding: "utf8" });

    if (result.error || result.status !== 0) {
      const detail = result.error?.message ?? result.stderr.trim();
      throw new Error(`Font subsetting failed for ${fontJob.publicName}: ${detail}`);
    }

    const content = readFileSync(fontJob.output);
    if (content.byteLength > fontJob.maxBytes) {
      throw new Error(
        `${fontJob.publicName} is ${content.byteLength}B, exceeds its ${fontJob.maxBytes}B budget`,
      );
    }

    return {
      publicName: fontJob.publicName,
      bytes: content.byteLength,
      sha256: hash(content),
    };
  });

  const nextManifest = { ...manifest, characterSha256: actualCharacterSha256, fonts };
  writeFileSync(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
  console.log(`Generated ${fonts.length} font(s) for ${manifest.characterCount} characters.`);
  for (const font of fonts) console.log(`  ${font.publicName}: ${font.bytes}B`);
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
