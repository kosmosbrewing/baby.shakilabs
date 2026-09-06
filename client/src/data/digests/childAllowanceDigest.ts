// /child-allowance 다이제스트 — 개월수 축(경계·구간·기간 대비 총액)에서 나온 발견만 싣는다.
// 지역 등급 축은 /child-allowance/population-decline이 통째로 가져간다 (발견 집합 분리).
import type { GuideData } from "@/data/seoGuides";
import { COMMON_DISCLAIMER } from "@/data/seoGuides";
import {
  CHILD_ALLOWANCE_BY_REGION,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  PARENTAL_BENEFIT_HOME,
} from "@/data/benefitRates2026";
import { careAllowanceAmount, childAllowanceAmount, parentalBenefitAmount } from "@/utils/babyCalculator";
import {
  CARE_MONTHS,
  CHILD_ALLOWANCE_END_MONTH,
  DAYCARE_CASH_ZERO_MONTH,
  DAYCARE_SOLO_MONTHS,
  PARENTAL_MONTHS,
  SOLO_MONTHS,
  SOLO_START_MONTH,
  TOTAL_MONTHS,
  changeMonths,
  childAllowanceDropSizes,
  childAllowanceLifetime,
  lifetimeCash,
  monthlyAt,
  parentalLifetime,
  remainingDropSizes,
  soloSegmentCash,
} from "@/data/digests/engineFacts";
import { formatWon, pct, times } from "@/data/digests/digestFormat";
import { buildBasisSection } from "@/data/digests/digestBasis";

const metroMonthly = CHILD_ALLOWANCE_BY_REGION.metro;
const homeDrops = remainingDropSizes("home", "metro");
const daycareDrops = remainingDropSizes("daycare", "metro");
const childDropKinds = childAllowanceDropSizes("metro");
const parentalChangeMonths = changeMonths((month) => parentalBenefitAmount(month, "home"));
const careChangeMonths = changeMonths((month) => careAllowanceAmount(month, "home"));
const childChangeMonths = changeMonths((month) => childAllowanceAmount(month, "metro"));
const daycareSoloCash = lifetimeCash("daycare", "metro", DAYCARE_CASH_ZERO_MONTH);
const homeSameSpanCash = lifetimeCash("home", "metro", DAYCARE_CASH_ZERO_MONTH);
const daycareLifetime = lifetimeCash("daycare", "metro");
const parentalCashLifetime = parentalLifetime("home");
const childLifetimeMetro = childAllowanceLifetime("metro");
const childLifetimeSpecial = childAllowanceLifetime("populationDeclineSpecial");

export const CHILD_ALLOWANCE_DIGEST: GuideData = {
  title: "아동수당 계산 엔진에서 나온 발견 9가지",
  intro:
    "아래 항목은 이 페이지의 계산 함수를 0개월부터 마지막 지급월까지 한 달씩, 그리고 보육 형태 2가지로 다시 호출해 얻은 결과입니다. 지급 기간의 경계와 다른 두 제도와의 겹침에서 나온 값만 골랐습니다.",
  sections: [
    {
      h2: "세 제도 중 금액이 한 번도 바뀌지 않는 것은 아동수당뿐이다",
      body: `지급 기간인 0~${CHILD_ALLOWANCE_END_MONTH}개월을 한 달씩 돌려 금액이 바뀌는 달을 세면 부모급여는 ${parentalChangeMonths.join("·")}개월 ${parentalChangeMonths.length}번, 양육수당은 ${careChangeMonths.join("·")}개월 ${careChangeMonths.length}번인데 아동수당은 ${childChangeMonths.length}번입니다. 지역만 고정하면 첫 달과 마지막 달의 금액이 같아, 이 계산기에서 남은 총액이 "남은 개월수 × 월액"이라는 단순 곱셈으로 성립하는 항목은 아동수당 하나뿐입니다. 부모급여에 같은 어림셈을 쓰면 구간이 섞이는 달에서 어긋납니다.`,
    },
    {
      h2: `${TOTAL_MONTHS}개월은 ${PARENTAL_MONTHS}개월과 ${CARE_MONTHS}개월과 ${SOLO_MONTHS}개월로 쪼개진다`,
      body: `아동수당이 지급되는 ${TOTAL_MONTHS}개월은 부모급여가 함께 들어오는 ${PARENTAL_MONTHS}개월, 가정양육이라면 양육수당이 함께 들어오는 ${CARE_MONTHS}개월, 그리고 아동수당만 남는 ${SOLO_MONTHS}개월로 정확히 나뉩니다. ${PARENTAL_MONTHS} + ${CARE_MONTHS} + ${SOLO_MONTHS} = ${TOTAL_MONTHS}이라 빈틈도 겹침도 없습니다. 마지막 ${SOLO_MONTHS}개월은 ${SOLO_START_MONTH}개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지이고 수도권 기준 ${formatWon(soloSegmentCash("metro"))}인데, 이 구간에서는 보육 형태를 바꿔도 금액이 달라지지 않습니다.`,
    },
    {
      h2: `어린이집 가정은 ${DAYCARE_SOLO_MONTHS}개월 동안 아동수당만 받는다`,
      body: `어린이집을 이용하면 부모급여 현금 차액이 ${DAYCARE_CASH_ZERO_MONTH}개월에 0원이 되고 양육수당은 애초에 대상이 아니어서, ${DAYCARE_CASH_ZERO_MONTH}개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지 ${DAYCARE_SOLO_MONTHS}개월 동안 들어오는 정부 지원 현금은 아동수당 한 항목뿐입니다. 수도권 기준 ${formatWon(metroMonthly)} × ${DAYCARE_SOLO_MONTHS}개월 = ${formatWon(daycareSoloCash)}이며, 어린이집 가정의 생애 현금 ${formatWon(daycareLifetime)} 중 ${pct(daycareSoloCash, daycareLifetime)}에 해당합니다. 같은 ${DAYCARE_SOLO_MONTHS}개월을 가정양육으로 보내면 부모급여 2단계와 양육수당이 얹혀 ${formatWon(homeSameSpanCash)}, ${times(homeSameSpanCash, daycareSoloCash)}가 됩니다.`,
    },
    {
      h2: `아동수당은 부모급여보다 ${times(TOTAL_MONTHS, PARENTAL_MONTHS)} 오래 나오고 총액은 ${pct(childLifetimeMetro, parentalCashLifetime)}다`,
      body: `수도권 기준으로 아동수당 생애 총액은 ${formatWon(childLifetimeMetro)}, 가정양육 부모급여 생애 총액은 ${formatWon(parentalCashLifetime)}입니다. 지급 기간은 ${TOTAL_MONTHS}개월과 ${PARENTAL_MONTHS}개월로 ${times(TOTAL_MONTHS, PARENTAL_MONTHS)} 차이가 나는데 총액은 오히려 ${pct(childLifetimeMetro, parentalCashLifetime)}에 그칩니다. 월액이 ${formatWon(metroMonthly)}과 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}으로 열 배 벌어지기 때문이며, 이 역전은 지역 등급을 최대로 올려도 뒤집히지 않습니다 — 가장 높은 등급의 ${formatWon(childLifetimeSpecial)}도 ${formatWon(parentalCashLifetime)}의 ${pct(childLifetimeSpecial, parentalCashLifetime)}입니다.`,
    },
    {
      h2: "남은 총액이 매달 같은 폭으로 줄어드는 항목은 아동수당뿐이다",
      body: `개월수를 1씩 올리며 잔액을 다시 계산하면 아동수당은 ${TOTAL_MONTHS}번 모두 같은 폭(수도권 ${formatWon(metroMonthly)}) 하나로만 줄어, 감소 폭의 종류가 ${childDropKinds.length}가지입니다. 같은 방식으로 잰 세 제도 합계의 감소 폭은 가정양육 ${homeDrops.length}가지, 어린이집 ${daycareDrops.length}가지로 갈립니다. 잔액 곡선으로 보면 아동수당만 꺾이는 지점이 없는 직선이고 나머지는 꺾입니다. 그래서 소급 기한을 놓쳤을 때의 손해가 아이 나이와 무관하게 일정한 제도는 아동수당 하나뿐이며, 다른 두 제도는 언제 놓쳤는지가 손해 크기를 정합니다.`,
    },
    {
      h2: "마지막 지급월은 아홉 번째 생일이 오는 달의 한 달 전이다",
      body: `이 계산기는 출생월을 0개월로 세므로 ${CHILD_ALLOWANCE_END_MONTH}개월째가 마지막 지급월이고 ${TOTAL_MONTHS}개월째부터 지급이 없습니다. ${TOTAL_MONTHS}개월은 정확히 ${TOTAL_MONTHS / 12}년이라 ${TOTAL_MONTHS}개월째가 곧 아홉 번째 생일이 오는 달입니다. 따라서 마지막으로 돈이 들어오는 달은 그 직전 달입니다 — 3월생 아이라면 아홉 번째 생일이 있는 3월이 아니라 그 전달인 2월이 마지막 지급월입니다. 달력상 "만 9세까지"와 화면의 종료 시점이 한 달 어긋나 보인다면 이 산정 방식 때문입니다.`,
    },
    {
      h2: "같은 해 1월생과 12월생의 남은 개월수는 11개월 차이다",
      body: `출생연도만 알고 월을 모를 때 이 계산기는 1월생과 12월생을 양 끝으로 잡아 범위를 냅니다. 두 끝의 남은 개월수 차이는 두 아이가 모두 태어났고 1월생도 아직 지급 구간 안에 있을 때만 정확히 11개월인데, 개월수를 연·월 차이로만 세어 일자가 개입하지 않기 때문입니다. 이 조건을 벗어나면 11개월은 무너집니다 — 12월생이 아직 태어나지 않은 해에는 그쪽 경과 개월수가 0으로 눌려 차이가 10개월 이하로 줄고(연도 전체가 미래면 두 끝이 모두 ${TOTAL_MONTHS}개월이라 0), 지급 종료를 걸치는 해에는 1월생이 먼저 0에 닿아 다시 11개월보다 작아지며, 연도 전체가 종료를 지나면 두 끝이 모두 0개월이 됩니다.`,
    },
    {
      h2: `어린이집을 이용하면 ${PARENTAL_MONTHS}개월 경계에서 바뀌는 금액이 0원이다`,
      body: `${PARENTAL_MONTHS}개월은 부모급여가 끝나고 가정양육이면 양육수당으로 넘어가는 자리라 가장 큰 변화가 예상되지만, 어린이집을 계속 이용하는 가정에서는 ${PARENTAL_MONTHS - 1}개월과 ${PARENTAL_MONTHS}개월의 월 합계가 수도권 기준 둘 다 ${formatWon(monthlyAt(PARENTAL_MONTHS, "daycare", "metro"))}으로 같습니다. 현금이 실제로 끊긴 자리는 ${DAYCARE_CASH_ZERO_MONTH}개월이었고 ${PARENTAL_MONTHS}개월에는 이미 0원이던 항목의 자격만 끝나기 때문입니다. 같은 경계에서 가정양육은 ${formatWon(monthlyAt(PARENTAL_MONTHS - 1, "home", "metro"))}에서 ${formatWon(monthlyAt(PARENTAL_MONTHS, "home", "metro"))}으로 내려가 ${formatWon(monthlyAt(PARENTAL_MONTHS - 1, "home", "metro") - monthlyAt(PARENTAL_MONTHS, "home", "metro"))}이 움직이므로, 이 경계의 무게는 보육 형태에 따라 완전히 갈립니다.`,
    },
    {
      h2: `아동수당 ${TOTAL_MONTHS}개월분이 첫만남이용권 첫째 금액의 ${times(childLifetimeMetro, FIRST_MEETING_FIRST_CHILD)}다`,
      body: `수도권 기준 아동수당 생애 총액 ${formatWon(childLifetimeMetro)}은 첫만남이용권 첫째 ${formatWon(FIRST_MEETING_FIRST_CHILD)}의 ${times(childLifetimeMetro, FIRST_MEETING_FIRST_CHILD)}, 둘째 이상 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}의 ${times(childLifetimeMetro, FIRST_MEETING_SECOND_OR_MORE)}입니다. 다만 첫만남이용권은 출생 직후 한 번에 들어오고 아동수당은 9년에 걸쳐 나뉘어 들어오므로, 같은 금액이라도 손에 들어오는 시점과 쓸 수 있는 기간이 완전히 다릅니다. 이 계산기가 두 항목을 합산하지 않고 따로 보여 주는 이유이기도 합니다 — 첫만남이용권은 현금이 아니라 사용기한이 붙은 바우처이고 출생 직후 이미 수령했을 수 있습니다.`,
    },
    buildBasisSection(
      `기본 가정은 수도권 거주, 가정양육, 출생월 0개월이며, 보육 형태를 비교한 항목은 지역을 수도권으로 고정하고 형태만 바꿨습니다.`,
    ),
  ],
  disclaimer: COMMON_DISCLAIMER,
};
