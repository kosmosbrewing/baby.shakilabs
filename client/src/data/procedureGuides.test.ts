// 절차 가이드 데이터 회귀 테스트 — 감사에서 지적된 결함(중복 소제목·미검증 수치)이 재발하지 않도록
// 데이터 층에서 고정한다. 수치 검증은 benefitRates2026 상수와의 일치만 본다 (수치 자체는 상수가 진실 원천).
import { describe, expect, it } from "vitest";
import {
  DAYCARE_TRANSITION_GUIDE,
  DAYCARE_TRANSITION_TABLE,
  NEWBORN_CHECKLIST_GUIDE,
  NEWBORN_CHECKLIST_TABLE,
  type GuideTable,
} from "@/data/procedureGuides";
import type { GuideData } from "@/data/seoGuides";
import {
  BIRTH_REGISTRATION_DEADLINE_DAYS,
  CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";

const guides: ReadonlyArray<[string, GuideData, GuideTable]> = [
  ["newborn-checklist", NEWBORN_CHECKLIST_GUIDE, NEWBORN_CHECKLIST_TABLE],
  ["daycare-transition", DAYCARE_TRANSITION_GUIDE, DAYCARE_TRANSITION_TABLE],
];

describe.each(guides)("절차 가이드 데이터: %s", (_name, guide, table) => {
  it("표의 모든 행이 컬럼 수와 일치한다", () => {
    expect(table.rows.length).toBeGreaterThanOrEqual(4);
    for (const row of table.rows) {
      expect(row).toHaveLength(table.columns.length);
    }
  });

  it("소제목(섹션 h2 + 표 제목)이 서로 중복되지 않는다", () => {
    const headings = [...(guide.sections ?? []).map((s) => s.h2), table.title];
    expect(new Set(headings).size).toBe(headings.length);
    // "왜 이 순서인가요?"는 단계 카드 라벨(페이지당 1회)로만 쓴다 — 소제목 중복 감사 지적 재발 방지
    expect(headings).not.toContain("왜 이 순서인가요?");
  });

  it("가이드 FAQ 질문이 서로 중복되지 않는다", () => {
    const questions = (guide.faqs ?? []).map((f) => f.q);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("공식 출처 링크가 https 절대 URL이다", () => {
    expect(guide.sources?.length ?? 0).toBeGreaterThanOrEqual(2);
    for (const source of guide.sources ?? []) {
      expect(source.url).toMatch(/^https:\/\//);
    }
  });
});

describe("신청 정리표 수치가 상수와 일치한다", () => {
  const cell = (table: GuideTable, rowLabel: string, columnIndex: number): string => {
    const row = table.rows.find((r) => r[0].startsWith(rowLabel));
    expect(row, `${rowLabel} 행이 존재해야 한다`).toBeDefined();
    return row![columnIndex];
  };

  it("출생신고·부모급여·아동수당 기한이 상수 기준이다", () => {
    expect(cell(NEWBORN_CHECKLIST_TABLE, "출생신고", 1)).toContain(`${BIRTH_REGISTRATION_DEADLINE_DAYS}일`);
    expect(cell(NEWBORN_CHECKLIST_TABLE, "부모급여", 1)).toContain(`${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일`);
    expect(cell(NEWBORN_CHECKLIST_TABLE, "아동수당", 1)).toContain(`${CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS}일`);
  });

  it("지자체 항목은 수치 없이 정부24 확인으로만 안내한다 (정직성 규칙)", () => {
    const row = NEWBORN_CHECKLIST_TABLE.rows.find((r) => r[0].includes("지자체"));
    expect(row).toBeDefined();
    expect(row!.join(" ")).toContain("정부24");
    expect(row!.join(" ")).not.toMatch(/\d+만원/);
  });

  it("전환 비교표의 차액·지급일이 상수 기준이다", () => {
    expect(cell(DAYCARE_TRANSITION_TABLE, "부모급여 0세", 2)).toContain(
      `${PARENTAL_BENEFIT_DAYCARE_CASH.age0 / 10_000}만원`,
    );
    expect(cell(DAYCARE_TRANSITION_TABLE, "현금 지급일", 1)).toContain(`${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일`);
    expect(cell(DAYCARE_TRANSITION_TABLE, "현금 지급일", 2)).toContain(
      `익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일`,
    );
  });
});
