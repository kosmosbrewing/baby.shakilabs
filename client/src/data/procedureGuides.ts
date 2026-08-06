// 절차 가이드 페이지(C: /guide/newborn-checklist, /guide/daycare-transition) 전용 SeoRichGuide·정리표 데이터.
// 신청 순서·기한 관련 수치는 전부 benefitRates2026.ts 상수를 참조한다 (하드코딩 금지).
// 지자체별로 다른 항목은 수치를 넣지 않고 "정부24 확인"으로만 안내한다 (정직성 규칙).
import { COMMON_DISCLAIMER, type GuideData } from "@/data/seoGuides";
import {
  APPLICATION_CHANNELS,
  BIRTH_REGISTRATION_DEADLINE_DAYS,
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_MONTHLY,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_BY_REGION,
  CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_YEARS,
  LOCAL_BIRTH_SUPPORT_URL,
  NEWBORN_BCG_DEADLINE_WEEKS,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF,
  PARENTAL_BENEFIT_PHASE1_END_MONTH,
  PARENTAL_BENEFIT_PHASE2_END_MONTH,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";

// 정리표 데이터 — GuideDataTable.vue가 렌더한다. rows의 첫 셀은 항목명(강조)이다.
export interface GuideTable {
  title: string;
  columns: readonly string[];
  rows: ReadonlyArray<readonly string[]>;
  footnote?: string;
  minWidth: string;
}

const manwon = (amount: number) => `${amount / 10_000}만원`;
const allowanceValues = Object.values(CHILD_ALLOWANCE_BY_REGION);
const allowanceRange = `${Math.min(...allowanceValues) / 10_000}만~${Math.max(...allowanceValues) / 10_000}만원`;

export const NEWBORN_CHECKLIST_TABLE: GuideTable = {
  title: "신청 항목별 기한·장소·준비물 정리표",
  columns: ["항목", "기한", "신청 장소", "준비물·비고"],
  rows: [
    [
      "출생신고",
      `출생 후 ${BIRTH_REGISTRATION_DEADLINE_DAYS}일(1개월) 이내`,
      "주소지 행정복지센터, 시(구)·읍·면사무소",
      "출생증명서(병원 발급)·신고인 신분증 — 기한 경과 시 과태료 부과 대상",
    ],
    [
      "첫만남이용권",
      `출생신고와 함께 신청 권장 — 바우처는 출생일부터 ${FIRST_MEETING_VALID_YEARS}년 내 사용`,
      APPLICATION_CHANNELS.join(" / "),
      `국민행복카드 필요(없으면 발급 신청 먼저) — 첫째 ${manwon(FIRST_MEETING_FIRST_CHILD)}·둘째 이상 ${manwon(FIRST_MEETING_SECOND_OR_MORE)}`,
    ],
    [
      "부모급여",
      `출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내(소급 기준)`,
      APPLICATION_CHANNELS.join(" / "),
      `신분증·지급받을 계좌 — ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 경과 시 신청한 달부터만 지급`,
    ],
    [
      "아동수당",
      `출생 후 ${CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS}일 이내(소급 기준)`,
      APPLICATION_CHANNELS.join(" / "),
      `신분증·지급받을 계좌 — 지역별 월 ${allowanceRange}, 부모급여와 같은 날 함께 신청 권장`,
    ],
    [
      "건강보험 피부양자 등록",
      "출생신고 후 빠른 시일 내",
      "부모 직장(사업장), 국민건강보험공단",
      "가족관계 확인 서류 등 — 세부 서류는 사업장·공단 안내에 따름",
    ],
    [
      "지자체 출산지원금",
      "지자체별 상이 — 정부24 확인",
      "정부24 행복출산 원스톱 서비스",
      "금액·요건이 지역별로 달라 거주지 기준으로 확인 필요",
    ],
  ],
  footnote: "지자체·사업장에 따라 세부 서류가 다를 수 있으니 방문 전 관할 기관에서 확인하세요.",
  minWidth: "44rem",
};

export const NEWBORN_CHECKLIST_GUIDE: GuideData = {
  title: "출산 직후 신청 순서 가이드",
  intro: `출생신고부터 부모급여·아동수당까지 순서대로 신청하면 놓치는 지원금 없이 받을 수 있습니다. 특히 부모급여는 출생 후 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월부터 소급 지급되니 가장 먼저 챙겨야 합니다.`,
  sections: [
    {
      h2: "출생신고가 모든 신청의 출발점입니다",
      body: `출생신고는 출생 후 ${BIRTH_REGISTRATION_DEADLINE_DAYS}일(1개월) 이내에 해야 하며, 기한을 넘기면 과태료가 부과될 수 있습니다. 병원에서 발급한 출생증명서와 신고인 신분증을 챙겨 주소지 행정복지센터나 시(구)·읍·면사무소를 방문하면 되고, 출산 병원이 온라인 출생신고 참여 기관이라면 대법원 전자가족관계등록시스템으로 온라인 신고도 가능합니다. 출생신고로 아기 주민등록번호가 부여되어야 지원금 신청·건강보험 등록이 모두 가능해지므로, 다른 어떤 신청보다 먼저 처리해야 합니다.`,
    },
    {
      h2: "행복출산 원스톱 서비스로 한 번에",
      body: `행정복지센터에서 출생신고를 하면서 행복출산 원스톱 서비스를 이용하면 첫만남이용권·부모급여·아동수당은 물론 거주지 지자체의 출산지원금까지 한 장의 신청서로 접수할 수 있습니다. 정부24(${LOCAL_BIRTH_SUPPORT_URL})에서 온라인으로도 같은 통합 신청이 가능합니다. 지자체 출산지원금은 지역마다 금액과 요건이 크게 달라 이 앱에서는 수치를 안내하지 않으니, 거주지 기준으로 직접 확인하세요.`,
    },
    {
      h2: "지급일도 함께 알아두세요",
      body: `현금으로 지급되는 부모급여는 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일, 어린이집 이용 시 보육료 차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일에 지급됩니다. 아동수당 지급일도 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일 전후이며, 정확한 지급일은 관할 지자체 공지를 따릅니다.`,
    },
    {
      h2: "출생신고 후 잊기 쉬운 두 가지: 건강보험·예방접종",
      body: `주민등록번호가 나오면 아기를 건강보험에 올려야 진료비 부담이 줄어듭니다. 부모 중 직장가입자가 있으면 사업장이나 국민건강보험공단에 피부양자 등록을 신청하면 추가 보험료 없이 등록됩니다. 예방접종은 B형간염 1차를 출생 직후 병원에서 접종하는 경우가 많고, 결핵(BCG)은 생후 ${NEWBORN_BCG_DEADLINE_WEEKS}주 이내 접종이 권장됩니다. 이후 월령별 일정은 질병관리청 예방접종도우미에서 확인할 수 있습니다.`,
    },
  ],
  faqs: [
    {
      q: "행복출산 원스톱 서비스는 어떤 제도인가요?",
      a: "정부24의 통합 신청 서비스로, 출생신고 후 첫만남이용권·부모급여·아동수당과 거주지 지자체의 출산지원금까지 한 번의 접수로 신청할 수 있습니다. 행정복지센터 방문 신청 시에도 같은 묶음으로 접수됩니다.",
    },
    {
      q: "아동수당도 소급 기한이 있나요?",
      a: `네, 아동수당도 출생 후 ${CHILD_ALLOWANCE_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급 지급됩니다. 부모급여를 신청할 때 같은 자리에서 함께 신청하는 것이 가장 안전합니다.`,
    },
    {
      q: "지자체 출산지원금은 얼마나 받을 수 있나요?",
      a: "지역마다 금액과 요건 편차가 매우 커 일괄 안내가 어렵습니다. 정부24 행복출산 원스톱 서비스에서 거주지 기준으로 확인하는 것이 가장 정확합니다.",
    },
  ],
  sources: [
    {
      label: "복지로 — 부모급여·아동수당·첫만남이용권 안내와 온라인 신청",
      url: "https://www.bokjiro.go.kr",
    },
    {
      label: "정부24 — 행복출산 원스톱 서비스 (출생신고 후 통합 신청)",
      url: LOCAL_BIRTH_SUPPORT_URL,
    },
    {
      label: "질병관리청 예방접종도우미 — 표준예방접종일정표",
      url: "https://nip.kdca.go.kr",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const DAYCARE_TRANSITION_TABLE: GuideTable = {
  title: "전환 전후 지원금 비교표",
  columns: ["항목", "가정양육 시", "어린이집 이용 시"],
  rows: [
    [
      `부모급여 0세(0~${PARENTAL_BENEFIT_PHASE1_END_MONTH}개월)`,
      `월 ${manwon(PARENTAL_BENEFIT_HOME.age0)} 현금`,
      `보육료 바우처 + 현금 차액 ${manwon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}`,
    ],
    [
      `부모급여 1세(${PARENTAL_BENEFIT_PHASE1_END_MONTH + 1}~${PARENTAL_BENEFIT_PHASE2_END_MONTH}개월)`,
      `월 ${manwon(PARENTAL_BENEFIT_HOME.age1)} 현금`,
      "보육료 바우처만 지원 (현금 차액 0원)",
    ],
    [
      `가정양육수당(${CARE_ALLOWANCE_START_MONTH}~${CARE_ALLOWANCE_END_MONTH}개월)`,
      `월 ${manwon(CARE_ALLOWANCE_MONTHLY)}`,
      "지급되지 않음 (보육료 바우처로 대체)",
    ],
    ["아동수당(9세 미만)", `지역별 월 ${allowanceRange}`, "동일하게 지급 (전환 영향 없음)"],
    [
      "현금 지급일",
      `매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일`,
      `차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일`,
    ],
  ],
  footnote: "보육료 바우처 금액은 반별·시기별 수납액에 따라 달라져 이 표에는 표기하지 않았습니다.",
  minWidth: "38rem",
};

export const DAYCARE_TRANSITION_GUIDE: GuideData = {
  title: "어린이집 입소 전환 체크리스트",
  intro:
    "어린이집 입소가 확정되면 부모급여·양육수당·아이돌봄 지원이 서로 영향을 주고받습니다. 전환 전에 무엇이 바뀌는지 미리 확인하세요.",
  sections: [
    {
      h2: "가정양육수당은 택1 구조입니다",
      body: `가정양육수당(월 ${manwon(CARE_ALLOWANCE_MONTHLY)})은 ${CARE_ALLOWANCE_START_MONTH}개월 이후 어린이집을 이용하지 않을 때만 지급됩니다. 어린이집을 이용하면 양육수당 대신 보육료 바우처가 지원되고, 퇴소 후 가정양육으로 돌아오면 자격 변경 신청으로 다시 받을 수 있습니다.`,
    },
    {
      h2: "지급 방식과 지급일이 이렇게 바뀝니다",
      body: `가정양육 부모급여는 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일 현금으로 들어오지만, 어린이집 이용 시 현금 차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일에 지급되어 입금일 자체가 달라집니다. 0세는 차액 ${manwon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}이 있지만, 1세는 보육료 지원액이 부모급여를 넘어서 현금 차액이 없습니다. 가계 현금 흐름을 짤 때 지급일 변화까지 함께 계산하세요.`,
    },
    {
      h2: "전환 신청은 어디서 하나요?",
      body: `보육료(바우처) 자격 변경은 ${APPLICATION_CHANNELS.join(", ")}에서 처리할 수 있습니다. 입소 시점과 자격 변경 시점이 어긋나면 그 달 지급 방식이 예상과 달라질 수 있으니, 입소가 확정되면 바로 변경 신청을 하고 처리 결과를 확인하는 것이 안전합니다.`,
    },
  ],
  faqs: [
    {
      q: "아동수당도 전환 영향을 받나요?",
      a: "아니요. 아동수당은 어린이집 이용 여부와 무관하게 계속 지급됩니다.",
    },
    {
      q: "월 중에 입소하면 그 달 지원금은 어떻게 되나요?",
      a: "입소일과 자격 변경 시점에 따라 그 달 지급 방식이 달라질 수 있습니다. 월 중 전환 기준은 복지로 또는 관할 행정복지센터에서 확인하는 것이 정확합니다.",
    },
    {
      q: "퇴소하면 다시 가정양육 지원으로 돌아갈 수 있나요?",
      a: `가능합니다. 어린이집 퇴소 후 가정양육으로 전환하면 자격 변경 신청을 통해 월령에 따라 부모급여(0~${PARENTAL_BENEFIT_PHASE2_END_MONTH}개월) 또는 가정양육수당(${CARE_ALLOWANCE_START_MONTH}~${CARE_ALLOWANCE_END_MONTH}개월)을 다시 받을 수 있습니다.`,
    },
  ],
  sources: [
    {
      label: "복지로 — 보육료·부모급여 자격 변경 신청 안내",
      url: "https://www.bokjiro.go.kr",
    },
    {
      label: "임신육아종합포털 아이사랑 — 어린이집 입소 대기 신청",
      url: "https://www.childcare.go.kr",
    },
    {
      label: "아이돌봄서비스 — 정부지원 중복 기준 안내",
      url: "https://www.idolbom.go.kr",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};
