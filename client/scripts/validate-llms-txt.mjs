// llms.txt 게이트 — 산출물(dist/llms.txt)을 검사한다. public/ 사본이 아니라 실제로 배포되는
// 파일을 봐야 "public에는 있는데 배포에는 없다"는 상태를 잡을 수 있다.
//
// Two assertions, both bidirectional on purpose:
// 1) The URLs listed here must match SITEMAP_ROUTES exactly. Missing entries hide
//    pages from the answer engines the file exists for; extra entries advertise a
//    URL that canonicalizes elsewhere or does not exist at all. A one-way check
//    would let the file rot in whichever direction is not tested.
// 2) Consolidated variants must not be listed as pages, since they canonicalize
//    away — the file may only mention them in the prose that explains why.
//
// Plus a forbidden-phrase scan: this app has no automated collection, so claiming
// "official rates", "real-time" or "auto-updated" would be a data-honesty defect.
// Negations are allowed ("자동 수집 수단이 없으므로") — the check looks for the
// phrase used as a claim, not the word.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const CANONICAL_BASE = "https://shakilabs.com/baby";

// 부정문 안에서는 허용한다 — 없다고 말하는 문장까지 막으면 정직한 고지를 쓸 수 없다.
const NEGATION_MARKERS = [
  "없으므로",
  "없습니다",
  "않습니다",
  "않으며",
  "못하며",
  "못합니다",
  "제공하지",
  "약속하지",
  "아닙니다",
  "보장하지",
];

const FORBIDDEN_CLAIMS = ["공식 요금", "고시", "실시간", "자동 갱신", "자동 수집", "항상 최신", "매월 갱신"];

function sentencesOf(text) {
  return text
    .split(/(?<=[.!?])\s+|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateLlmsTxt({ distRoot, sitemapRoutes, canonicalizedRoutes, assert }) {
  const llmsPath = resolve(distRoot, "llms.txt");
  assert(existsSync(llmsPath), "Missing dist/llms.txt — put it in client/public/llms.txt");
  const text = readFileSync(llmsPath, "utf8");

  const listed = [...text.matchAll(/https:\/\/shakilabs\.com\/baby[^\s)\]]*/g)]
    .map((match) => match[0].replace(/[.,]$/, ""))
    // 사이트맵 대조 대상은 "페이지 URL"이라 llms.txt 자신·robots·sitemap 파일은 제외한다.
    .filter((url) => !/\.(txt|xml)$/.test(url));
  const uniqueListed = [...new Set(listed)];

  const expected = sitemapRoutes.map((route) => (route === "/" ? CANONICAL_BASE : `${CANONICAL_BASE}${route}`));

  const missing = expected.filter((url) => !uniqueListed.includes(url));
  const extra = uniqueListed.filter((url) => !expected.includes(url));
  assert(missing.length === 0, `llms.txt is missing sitemap URLs: ${missing.join(" ")}`);
  assert(
    extra.length === 0,
    `llms.txt lists URLs that are not in the sitemap: ${extra.join(" ")}`,
  );

  const variantUrls = canonicalizedRoutes.map((route) => `${CANONICAL_BASE}${route}`);
  const advertisedVariants = variantUrls.filter((url) => uniqueListed.includes(url));
  assert(
    advertisedVariants.length === 0,
    `llms.txt advertises canonicalized variants: ${advertisedVariants.join(" ")}`,
  );

  const offenders = [];
  for (const sentence of sentencesOf(text)) {
    const negated = NEGATION_MARKERS.some((marker) => sentence.includes(marker));
    if (negated) continue;
    for (const claim of FORBIDDEN_CLAIMS) {
      if (sentence.includes(claim)) offenders.push(`"${claim}" in: ${sentence}`);
    }
  }
  assert(offenders.length === 0, `llms.txt makes claims this app cannot back:\n  ${offenders.join("\n  ")}`);

  return uniqueListed.length;
}
