// /guide/newborn-checklist 단계 카드 데이터 — 뷰에서 분리해 문단 길이·문장 수 게이트
// (guideParagraphs.test.ts)가 daycare 가이드와 같은 방식으로 직접 검사할 수 있게 한다.
//
// 카드 구성(v8 가독성): description은 앞의 두 문장만, 나머지 문장은 details("자세히 보기")로 옮겼다.
// 문장 순서·문구·숫자는 그대로다. 이 페이지 단계에는 금액 구간 나열이 없어 표로 옮긴 문장은 없다.
// "왜 이 순서인가요?" 라벨은 페이지당 1개 단계(부모급여)에만 둔다 — 소제목 중복 이력(감사 지적) 방지.
import type { ProcedureStep } from "@/components/baby/procedureStep";
import {
  BIRTH_REGISTRATION_DEADLINE_DAYS,
  CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS,
  FIRST_MEETING_EXCLUDED_CATEGORIES,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_YEARS,
  NEWBORN_BCG_DEADLINE_WEEKS,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";

export const NEWBORN_CHECKLIST_STEPS: readonly ProcedureStep[] = [
  {
    order: 1,
    title: "출생신고",
    description: `출생 후 ${BIRTH_REGISTRATION_DEADLINE_DAYS}일(1개월) 이내에 주소지 행정복지센터나 시(구)·읍·면사무소에 신고합니다. 병원에서 발급한 출생증명서와 신고인 신분증이 필요하며, 기한을 넘기면 과태료가 부과될 수 있습니다.`,
    details: [
      "출산 병원이 온라인 출생신고 참여 기관이라면 대법원 전자가족관계등록시스템으로 온라인 신고도 가능합니다. 주민등록번호가 부여되어야 아래 모든 지원금을 신청할 수 있어 모든 절차의 출발점입니다.",
    ],
  },
  {
    order: 2,
    title: "첫만남이용권 신청",
    description:
      "출생신고를 하면서 행정복지센터에서 함께 신청하거나 복지로·정부24에서 온라인으로 신청합니다. 현금이 아닌 국민행복카드 바우처로 지급되므로 카드가 없다면 발급 신청이 먼저입니다.",
    details: [
      `첫째 ${FIRST_MEETING_FIRST_CHILD / 10_000}만원·둘째 이상 ${FIRST_MEETING_SECOND_OR_MORE / 10_000}만원이 지급되고, 출생일부터 ${FIRST_MEETING_VALID_YEARS}년 이내 사용하지 않으면 잔액이 소멸됩니다. ${FIRST_MEETING_EXCLUDED_CATEGORIES.join(", ")}에는 사용할 수 없습니다.`,
    ],
    linkTo: "/first-meeting",
    linkLabel: "첫만남이용권 계산기",
  },
  {
    order: 3,
    title: "부모급여 신청",
    description: `출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급 지급됩니다. 가정양육 기준 0세 월 ${PARENTAL_BENEFIT_HOME.age0 / 10_000}만원, 1세 월 ${PARENTAL_BENEFIT_HOME.age1 / 10_000}만원이 현금으로 지급되며, 지급일은 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일입니다.`,
    why: `${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일이 지나면 신청한 달부터만 지급되어 놓친 달만큼 손해를 보기 때문에 가장 먼저 챙겨야 합니다.`,
    linkTo: "/parental-benefit",
    linkLabel: "부모급여 계산기",
  },
  {
    order: 4,
    title: "아동수당 신청",
    description: `부모급여와 별개 제도라 중복으로 받을 수 있고, 9세 미만까지 지역에 따라 월 10만~12만원이 지급됩니다. 아동수당도 출생 후 ${CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS}일 이내 신청해야 출생월분부터 소급되므로 부모급여와 같은 날 함께 신청하는 것이 안전합니다.`,
    linkTo: "/child-allowance",
    linkLabel: "아동수당 계산기",
  },
  {
    order: 5,
    title: "건강보험 피부양자 등록",
    description:
      "출생신고로 주민등록번호가 나오면 아기를 건강보험에 올립니다. 부모 중 직장가입자가 있으면 사업장이나 국민건강보험공단에 피부양자 등록을 신청하며, 추가 보험료 부담 없이 등록됩니다.",
    details: ["지역가입자 세대는 출생신고 후 세대원으로 반영되는지 공단에서 확인하세요."],
  },
  {
    order: 6,
    title: "예방접종 시작",
    description: `B형간염 1차는 출생 직후 병원에서 접종하는 경우가 많고, 결핵(BCG)은 생후 ${NEWBORN_BCG_DEADLINE_WEEKS}주 이내 접종이 권장됩니다. 이후 월령별 필수 예방접종 일정은 질병관리청 예방접종도우미에서 확인할 수 있으며, 국가예방접종 지원 대상 백신은 지정 의료기관에서 무료로 접종할 수 있습니다.`,
  },
];
