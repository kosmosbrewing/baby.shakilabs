// /guide/daycare-transition 단계 카드 데이터 — 뷰에서 분리해 파일당 200줄 규칙을 지키고,
// 단계별 수치 근거를 테스트가 직접 잡을 수 있게 한다.
//
// 각 단계는 그 단계가 링크하는 계산기의 실제 계산 결과를 최소 1개 인용한다. 숫자는 전부
// 엔진(babyCalculator + enrollmentFacts)에서 나오며 이 파일에 금액 리터럴을 적지 않는다.
// 현금 비교를 담은 단계에는 보육료 바우처가 별도로 지급된다는 사실을 같은 문단에 적는다.
import type { ProcedureStep } from "@/components/baby/procedureStep";
import {
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_MONTHLY,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_END_MONTH,
  FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_PHASE1_END_MONTH,
} from "@/data/benefitRates2026";
import { formatWon } from "@/lib/utils";
import {
  CARE_MONTHS,
  PARENTAL_MONTHS,
  REGION_TIERS,
  careAllowanceLifetime,
  childAllowanceLifetime,
} from "@/data/digests/engineFacts";
import { buildMonthlyTotal } from "@/utils/babyCalculator";
import { gapPlateaus, remainingParentalHomeCash } from "@/data/digests/enrollmentFacts";

const BASE_REGION = "metro" as const;
const plateaus = gapPlateaus(BASE_REGION);
const paidPlateaus = plateaus.filter((plateau) => plateau.amount > 0);
const carePlateau = plateaus.find((plateau) => plateau.from === CARE_ALLOWANCE_START_MONTH);
const careSegmentGap = (carePlateau?.amount ?? 0) * (carePlateau?.months ?? 0);

/**
 * 보육 형태를 바꿨을 때 아동수당 항목이 달라지는 달 수 — 0이어야 "전환 영향 없음"이 정직하다.
 * 같은 인자를 두 번 넣어 비교하면 항등식이라 무조건 0이 나오므로, 반드시 home/daycare 두 형태로
 * 월 합계를 각각 만들어 그 안의 아동수당 항목만 맞대 본다.
 */
const childAllowanceCareSensitiveMonths = (() => {
  let count = 0;
  for (const region of REGION_TIERS) {
    for (let month = 0; month <= CHILD_ALLOWANCE_END_MONTH; month += 1) {
      const home = buildMonthlyTotal(month, "home", region).childAllowance;
      const daycare = buildMonthlyTotal(month, "daycare", region).childAllowance;
      if (home !== daycare) count += 1;
    }
  }
  return count;
})();

const plateauPhrase = paidPlateaus
  .map((plateau) => `${plateau.from}~${plateau.to}개월 월 ${formatWon(plateau.amount)}`)
  .join(", ");

export const DAYCARE_TRANSITION_STEPS: readonly ProcedureStep[] = [
  {
    order: 1,
    title: "어린이집 입소 등록(보육료 자격 변경)",
    description:
      `어린이집 입소가 확정되면 행정복지센터나 복지로에서 보육료(바우처) 자격으로 변경 신청합니다. ` +
      `변경 시점부터 보육료 바우처가 우선 지원되고 부모급여는 현금 차액만 지급됩니다 — 0세는 월 ` +
      `${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}, 1세는 차액이 없어 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age1)}입니다. ` +
      `자격 변경이 현금에 미치는 크기는 개월수마다 다릅니다: 엔진을 0~${CHILD_ALLOWANCE_END_MONTH}개월 전수 호출하면 ` +
      `두 형태의 월 현금 차이는 ${plateauPhrase}의 ${paidPlateaus.length}개 값뿐이고, 그만큼이 현금 대신 보육료 바우처로 지원됩니다.`,
    why: "보육료와 부모급여가 중복 지원되지 않도록 입소 등록 시점을 기준으로 지급 방식이 자동 전환되기 때문입니다.",
    linkTo: "/parental-benefit/daycare",
    linkLabel: "어린이집 이용 시 부모급여",
  },
  {
    order: 2,
    title: "가정양육수당 해당 여부 확인",
    description:
      `가정양육수당(월 ${formatWon(CARE_ALLOWANCE_MONTHLY)})은 ${CARE_ALLOWANCE_START_MONTH}~${CARE_ALLOWANCE_END_MONTH}개월 아동이 ` +
      `어린이집을 이용하지 않을 때만 지급됩니다. 이 ${CARE_MONTHS}개월을 모두 가정양육으로 채우면 누적 ${formatWon(careAllowanceLifetime())}인데, ` +
      `같은 구간을 어린이집으로 보냈을 때 줄어드는 현금도 정확히 ${formatWon(careSegmentGap)}입니다 — 이 구간에서 두 형태를 가르는 항목이 ` +
      `양육수당 하나뿐이기 때문이고, 그 몫은 보육료 바우처로 대체됩니다. 퇴소 후 가정양육으로 돌아오면 자격 변경 신청으로 다시 받을 수 있습니다.`,
    linkTo: "/parental-benefit",
    linkLabel: "부모급여 계산기",
  },
  {
    order: 3,
    title: "종일제 아이돌봄 이용 여부 확인",
    description:
      `${FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE} 이 택1에 걸린 금액은 남은 부모급여이고, 가정양육 기준으로 ` +
      `0개월이면 ${formatWon(remainingParentalHomeCash(0))}, ${PARENTAL_BENEFIT_PHASE1_END_MONTH + 1}개월이면 ` +
      `${formatWon(remainingParentalHomeCash(PARENTAL_BENEFIT_PHASE1_END_MONTH + 1))}, ${PARENTAL_MONTHS}개월부터는 ` +
      `${formatWon(remainingParentalHomeCash(PARENTAL_MONTHS))}입니다. 개월수가 늦을수록 이 선택의 무게가 가벼워지므로, ` +
      `어린이집 입소를 계기로 아이돌봄 이용을 정리할지 시간제로 전환할지 함께 결정하세요.`,
  },
  {
    order: 4,
    title: "아동수당은 그대로 유지",
    description:
      `아동수당은 어린이집 이용 여부와 무관하게 ${CHILD_ALLOWANCE_END_MONTH}개월까지 계속 지급되므로 별도 전환 신청이 필요 없습니다. ` +
      `보육 형태 2가지 × 지역 ${REGION_TIERS.length}등급 × 0~${CHILD_ALLOWANCE_END_MONTH}개월을 전수 대조하면 보육 형태 때문에 아동수당 월액이 ` +
      `달라지는 달은 ${childAllowanceCareSensitiveMonths}개이고, 수도권 기준 누적 ${formatWon(childAllowanceLifetime(BASE_REGION))}이 전환 전후로 같습니다. ` +
      `지급받는 계좌나 주소가 바뀌었다면 변경 신고만 해두면 됩니다.`,
    linkTo: "/child-allowance",
    linkLabel: "아동수당 계산기",
  },
];
