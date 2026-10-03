// v8 가독성 게이트(데이터 층) — 절차 가이드(/guide/*)가 <p>로 렌더하는 모든 문단이 250자 이하이고,
// 단계 카드에 바로 보이는 본문은 두 문장 이하다. 2026-10 점검 전 /guide/daycare-transition은
// 573자 한 문단(계산 기준)과 292자 단계 카드를 포함해 250자 초과 문단이 10개였다.
// 같은 규칙을 빌드 산출물(<main> 안 <p>)에도 validate-paragraph-length.mjs가 건다 — 이 테스트는
// 데이터에서 빨리 잡고, 빌드 게이트는 컴포넌트가 문단을 실제로 나눠 렌더하는지까지 본다.
import { describe, expect, it } from "vitest";
import {
  DAYCARE_TRANSITION_GUIDE,
  DAYCARE_TRANSITION_TABLE,
  NEWBORN_CHECKLIST_GUIDE,
  NEWBORN_CHECKLIST_TABLE,
  type GuideTable,
} from "@/data/procedureGuides";
import type { GuideData } from "@/data/seoGuides";
import { DAYCARE_TRANSITION_STEPS } from "@/data/daycareTransitionSteps";
import { NEWBORN_CHECKLIST_STEPS } from "@/data/newbornChecklistSteps";
import { DAYCARE_TRANSITION_DIGEST } from "@/data/digests";
import { stepParagraphs, type ProcedureStep } from "@/components/baby/procedureStep";
import {
  PARAGRAPH_MAX_CHARS,
  STEP_VISIBLE_MAX_SENTENCES,
  splitParagraphs,
  splitSentences,
} from "@/lib/paragraphs";

interface GuidePage {
  route: string;
  steps: readonly ProcedureStep[];
  guides: readonly GuideData[];
  table: GuideTable;
}

const GUIDE_PAGES: readonly GuidePage[] = [
  {
    route: "/guide/daycare-transition",
    steps: DAYCARE_TRANSITION_STEPS,
    guides: [DAYCARE_TRANSITION_DIGEST, DAYCARE_TRANSITION_GUIDE],
    table: DAYCARE_TRANSITION_TABLE,
  },
  {
    route: "/guide/newborn-checklist",
    steps: NEWBORN_CHECKLIST_STEPS,
    guides: [NEWBORN_CHECKLIST_GUIDE],
    table: NEWBORN_CHECKLIST_TABLE,
  },
];

/** 화면 기준 글자 수 — 연속 공백은 렌더에서 하나로 접히므로 같은 방식으로 센다. */
const renderedLength = (text: string) => text.replace(/\s+/g, " ").trim().length;

/** 페이지가 <p>로 렌더하는 데이터 문단 전부(단계 카드 → 정리표 각주 → 다이제스트·가이드 → FAQ 답). */
function renderedParagraphs(page: GuidePage): string[] {
  return [
    ...page.steps.flatMap(stepParagraphs),
    ...(page.table.footnote ? [page.table.footnote] : []),
    ...page.guides.flatMap((guide) => [
      guide.intro,
      ...(guide.sections ?? []).flatMap((section) => splitParagraphs(section.body)),
      ...(guide.disclaimer ? [guide.disclaimer] : []),
      ...(guide.faqs ?? []).map((faq) => faq.a),
    ]),
  ];
}

describe.each(GUIDE_PAGES)("$route 문단 길이", (page) => {
  it(`렌더되는 문단이 모두 ${PARAGRAPH_MAX_CHARS}자 이하다`, () => {
    const paragraphs = renderedParagraphs(page);
    // 수집이 비면 무조건 통과하는 가짜 게이트가 된다 — 실제로 문단을 모았는지 먼저 확인한다.
    expect(paragraphs.length).toBeGreaterThan(10);
    const over = paragraphs
      .filter((paragraph) => renderedLength(paragraph) > PARAGRAPH_MAX_CHARS)
      .map((paragraph) => `${renderedLength(paragraph)}자: ${paragraph.slice(0, 40)}…`);
    expect(over).toEqual([]);
  });

  it(`단계 카드에 바로 보이는 본문은 ${STEP_VISIBLE_MAX_SENTENCES}문장 이하다`, () => {
    const over = page.steps
      .filter((step) => splitSentences(step.description).length > STEP_VISIBLE_MAX_SENTENCES)
      .map((step) => `${step.order}. ${step.title}: ${splitSentences(step.description).length}문장`);
    expect(over).toEqual([]);
  });

  it("단계 카드 문단에 문단 구분자가 섞여 있지 않다 (카드는 구분자를 해석하지 않는다)", () => {
    for (const paragraph of page.steps.flatMap(stepParagraphs)) {
      expect(splitParagraphs(paragraph)).toHaveLength(1);
    }
  });
});

describe("문장 분할 규칙", () => {
  it("소수점·도메인은 문장 경계로 보지 않는다", () => {
    expect(splitSentences("0개월 2.13배입니다. 복지로(bokjiro.go.kr)에서 신청합니다.")).toHaveLength(2);
  });

  it("물음표로 끝나는 라벨도 한 문장으로 센다", () => {
    expect(splitSentences("왜 이 순서인가요? 기한이 있기 때문입니다.")).toHaveLength(2);
  });
});
