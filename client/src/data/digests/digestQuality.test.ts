// 다이제스트 형식·중복 게이트. 발견 수, h3 규칙, 페이지 간 유사도, 금지 표현을 한 번에 잡는다.
// h3는 검색 스니펫에 단독 노출되므로 본문과 같은 기준으로 검사한다 (육아 지원금은 YMYL).
import { describe, expect, it } from "vitest";
import { BASIS_HEADING, ENGINE_DIGESTS, findingSections } from "@/data/digests";
import {
  CHILD_ALLOWANCE_GUIDE,
  FIRST_MEETING_GUIDE,
  PARENTAL_BENEFIT_GUIDE,
  type GuideData,
} from "@/data/seoGuides";
import { POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE } from "@/data/situationalGuides";
import { diceSimilarity, maskedDiceSimilarity } from "@/lib/textSimilarity";

const MIN_FINDINGS = 8;
const MAX_HEADING_CHARS = 45;
const MIN_BODY_CHARS = 150;
// 앱 안에서 다이제스트끼리는 0.5 미만, 기존 가이드 본문 대비는 0.85 미만.
const MAX_PAIR_SIMILARITY = 0.5;
const MAX_EXISTING_SIMILARITY = 0.85;

// 갱신 주기를 약속하는 표현과 관측하지 않은 것을 관측했다고 말하는 표현 (정직성 규칙).
const FORBIDDEN_PHRASES = ["매월 갱신", "매달 갱신", "자동 갱신", "실시간", "수시로 업데이트", "항상 최신"];

function guideText(guide: GuideData): string {
  return [guide.title, guide.intro, ...(guide.sections ?? []).flatMap((s) => [s.h2, s.body])].join(" ");
}

function digestText(digest: GuideData): string {
  return [digest.title, digest.intro, ...findingSections(digest).flatMap((s) => [s.h2, s.body])].join(" ");
}

const EXISTING_GUIDES: ReadonlyArray<{ name: string; guide: GuideData }> = [
  { name: "PARENTAL_BENEFIT_GUIDE", guide: PARENTAL_BENEFIT_GUIDE },
  { name: "CHILD_ALLOWANCE_GUIDE", guide: CHILD_ALLOWANCE_GUIDE },
  { name: "FIRST_MEETING_GUIDE", guide: FIRST_MEETING_GUIDE },
  { name: "POPULATION_DECLINE_GUIDE", guide: POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE },
];

describe("다이제스트 형식", () => {
  it.each(ENGINE_DIGESTS)("$route: 발견이 8개 이상이다", ({ digest }) => {
    expect(findingSections(digest).length).toBeGreaterThanOrEqual(MIN_FINDINGS);
  });

  it.each(ENGINE_DIGESTS)("$route: 계산 기준 문단이 정확히 하나 있다", ({ digest }) => {
    const basis = (digest.sections ?? []).filter((section) => section.h2 === BASIS_HEADING);
    expect(basis).toHaveLength(1);
    expect(basis[0].body).toContain("확인한 날짜");
    expect(basis[0].body).toContain("모델링하지 않으므로");
  });

  it.each(ENGINE_DIGESTS)("$route: h3가 45자 이내이고 결론형으로 끝난다", ({ digest }) => {
    for (const section of findingSections(digest)) {
      expect(section.h2.length, section.h2).toBeLessThanOrEqual(MAX_HEADING_CHARS);
      // 결론형 종결(다/까/가) — 명사형 제목은 발견이 아니라 목차라 금지한다.
      expect(/[다까가]$/.test(section.h2), section.h2).toBe(true);
    }
  });

  it.each(ENGINE_DIGESTS)("$route: 본문이 채우는 문장 없이 충분히 길다", ({ digest }) => {
    for (const section of findingSections(digest)) {
      expect(section.body.replace(/\s+/g, "").length, section.h2).toBeGreaterThanOrEqual(MIN_BODY_CHARS);
    }
  });

  it.each(ENGINE_DIGESTS)("$route: 갱신 주기를 약속하지 않는다", ({ digest }) => {
    const text = guideText(digest);
    for (const phrase of FORBIDDEN_PHRASES) expect(text).not.toContain(phrase);
  });

  it.each(ENGINE_DIGESTS)("$route: h3가 페이지 안에서 서로 다르다", ({ digest }) => {
    const headings = findingSections(digest).map((section) => section.h2);
    expect(new Set(headings).size).toBe(headings.length);
  });
});

describe("페이지 간 유사도", () => {
  it("다이제스트 전 쌍이 원문·마스킹 모두 0.5 미만이다", () => {
    const failures: string[] = [];
    for (let i = 0; i < ENGINE_DIGESTS.length; i += 1) {
      for (let j = i + 1; j < ENGINE_DIGESTS.length; j += 1) {
        const left = ENGINE_DIGESTS[i];
        const right = ENGINE_DIGESTS[j];
        const raw = diceSimilarity(digestText(left.digest), digestText(right.digest));
        const masked = maskedDiceSimilarity(digestText(left.digest), digestText(right.digest));
        if (raw >= MAX_PAIR_SIMILARITY || masked >= MAX_PAIR_SIMILARITY) {
          failures.push(`${left.route} vs ${right.route}: raw ${raw.toFixed(3)} / masked ${masked.toFixed(3)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("각 다이제스트가 기존 가이드 본문 전부와 0.85 미만이다", () => {
    const failures: string[] = [];
    for (const { route, digest } of ENGINE_DIGESTS) {
      for (const { name, guide } of EXISTING_GUIDES) {
        const raw = diceSimilarity(digestText(digest), guideText(guide));
        const masked = maskedDiceSimilarity(digestText(digest), guideText(guide));
        if (raw >= MAX_EXISTING_SIMILARITY || masked >= MAX_EXISTING_SIMILARITY) {
          failures.push(`${route} vs ${name}: raw ${raw.toFixed(3)} / masked ${masked.toFixed(3)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
