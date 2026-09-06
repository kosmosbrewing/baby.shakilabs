// /child-allowance/population-decline 다이제스트 — 지역 등급 축(4단 사다리 × 108개월)에서만
// 나오는 발견. /child-allowance는 개월수 축을 가져가고 이 페이지는 지역 축을 통째로 가져간다.
import type { GuideData } from "@/data/seoGuides";
import { COMMON_DISCLAIMER } from "@/data/seoGuides";
import {
  CARE_ALLOWANCE_MONTHLY,
  CHILD_ALLOWANCE_BY_REGION,
  FIRST_MEETING_FIRST_CHILD,
  PARENTAL_BENEFIT_HOME,
  REGION_OPTIONS,
} from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_END_MONTH,
  DAYCARE_CASH_ZERO_MONTH,
  PARENTAL_MONTHS,
  REGION_TIERS,
  SOLO_MONTHS,
  SOLO_START_MONTH,
  TOTAL_MONTHS,
  childAllowanceLifetime,
  lifetimeCash,
  monthlyAt,
  peakMonthly,
  regionLadderSteps,
  regionMonthlyGap,
  soloSegmentCash,
} from "@/data/digests/engineFacts";
import { formatWon, labelledWon, pct, times } from "@/data/digests/digestFormat";
import { buildBasisSection } from "@/data/digests/digestBasis";

const label = (tier: (typeof REGION_TIERS)[number]): string =>
  REGION_OPTIONS.find((option) => option.value === tier)?.label ?? tier;

const ladderSteps = regionLadderSteps();
const monthlyGap = regionMonthlyGap();
const lifetimeGap = childAllowanceLifetime("populationDeclineSpecial") - childAllowanceLifetime("metro");
const nonMetroLifetimeGap = childAllowanceLifetime("nonMetro") - childAllowanceLifetime("metro");
const monthsToOneParentalMonth = PARENTAL_BENEFIT_HOME.age0 / ladderSteps[0];
const fastMonthsToOneParentalMonth = PARENTAL_BENEFIT_HOME.age0 / monthlyGap;
const breakEvenMonth = TOTAL_MONTHS - fastMonthsToOneParentalMonth;
const homeMetroLifetime = lifetimeCash("home", "metro");
const homeSpecialLifetime = lifetimeCash("home", "populationDeclineSpecial");
const daycareMetroLifetime = lifetimeCash("daycare", "metro");
const daycareSpecialLifetime = lifetimeCash("daycare", "populationDeclineSpecial");
const soloGap = soloSegmentCash("populationDeclineSpecial") - soloSegmentCash("metro");
const peak = peakMonthly();

export const POPULATION_DECLINE_DIGEST: GuideData = {
  title: "지역 등급 축을 전수 스캔해 나온 발견 9가지",
  intro:
    "아래 항목은 이 페이지의 계산 함수에서 지역 등급만 4단계로 바꿔 가며 0개월부터 마지막 지급월까지 다시 호출해 얻은 결과입니다. 등급표를 옮겨 적은 문장이 아니라, 등급을 바꿨을 때만 드러나는 간격과 역전을 담았습니다.",
  sections: [
    {
      h2: "등급 사다리의 마지막 한 칸이 앞의 두 칸을 합친 것과 같다",
      body: `아동수당 월액은 ${labelledWon(REGION_TIERS.map((tier) => [label(tier), CHILD_ALLOWANCE_BY_REGION[tier]] as const))}입니다. 칸 사이 간격을 재면 ${ladderSteps.map((step) => formatWon(step)).join(" · ")}으로 균등하지 않아, 마지막 한 칸이 앞의 두 칸을 합친 것과 정확히 같습니다. 그래서 "한 등급 올라간다"는 말의 값어치가 어느 자리에서 올라가느냐에 따라 ${times(ladderSteps[2], ladderSteps[0])}로 갈립니다.`,
    },
    {
      h2: `등급 하나가 9년 동안 ${formatWon(lifetimeGap)}을 가른다`,
      body: `아동수당은 0개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지 ${TOTAL_MONTHS}개월 지급되므로 월액 차이가 그대로 ${TOTAL_MONTHS}배로 누적됩니다. 전 기간을 같은 등급으로 받으면 ${labelledWon(REGION_TIERS.map((tier) => [label(tier), childAllowanceLifetime(tier)] as const))}이고, 양 끝의 차이는 ${formatWon(lifetimeGap)}입니다. 월 ${formatWon(monthlyGap)}은 체감이 어려운 금액이지만 ${TOTAL_MONTHS}개월을 곱하면 첫만남이용권 첫째 금액 ${formatWon(FIRST_MEETING_FIRST_CHILD)}을 넘어섭니다.`,
    },
    {
      h2: `한 칸 차이는 9년을 다 받아도 ${formatWon(nonMetroLifetimeGap)}에 그친다`,
      body: `${label("metro")}과 ${label("nonMetro")}처럼 등급이 한 칸만 다르면 월 ${formatWon(ladderSteps[0])} 차이라, ${TOTAL_MONTHS}개월 전부를 받아도 누적 차이가 ${formatWon(nonMetroLifetimeGap)}입니다. 0세 부모급여 한 달분 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}에 이르려면 ${monthsToOneParentalMonth}개월이 필요한데 지급 기간이 ${TOTAL_MONTHS}개월이므로, 이 조합은 지급 기간 전체를 써도 부모급여 한 달치에 도달하지 못합니다. 반대로 ${label("metro")}과 ${label("populationDeclineSpecial")} 사이는 월 ${formatWon(monthlyGap)}이라 ${fastMonthsToOneParentalMonth}개월이면 같은 선을 넘습니다.`,
    },
    {
      h2: `${label("metro")}에서만 양육수당과 아동수당이 정확히 같다`,
      body: `${PARENTAL_MONTHS}개월부터 ${SOLO_START_MONTH - 1}개월까지는 가정양육 시 양육수당 ${formatWon(CARE_ALLOWANCE_MONTHLY)}과 아동수당이 함께 들어오는데, ${label("metro")}에서는 두 금액이 같아 월 합계가 반으로 정확히 나뉩니다. ${label("nonMetro")}부터는 아동수당이 ${REGION_TIERS.slice(1).map((tier) => formatWon(CHILD_ALLOWANCE_BY_REGION[tier])).join(" · ")}으로 커져 두 항목의 크기 순위가 뒤집히고, ${label("populationDeclineSpecial")}에서는 아동수당이 양육수당의 ${times(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial, CARE_ALLOWANCE_MONTHLY)}가 됩니다. 양육수당은 지역 차등이 없는 전국 단일 금액이라 이 역전은 아동수당 쪽만 움직여서 생깁니다.`,
    },
    {
      h2: "지역 등급이 건드리는 것은 세 제도 중 하나뿐이다",
      body: `부모급여·양육수당·첫만남이용권은 네 등급 어디서나 금액이 같고, 지역에 따라 달라지는 것은 아동수당뿐입니다. 그래서 등급을 ${label("metro")}에서 ${label("populationDeclineSpecial")}로 올려도 가정양육 가정의 생애 현금은 ${formatWon(homeMetroLifetime)}에서 ${formatWon(homeSpecialLifetime)}으로 ${pct(lifetimeGap, homeMetroLifetime)} 느는 데 그칩니다. 같은 등급 상향이 어린이집 가정에서는 ${formatWon(daycareMetroLifetime)}에서 ${formatWon(daycareSpecialLifetime)}으로 ${pct(lifetimeGap, daycareMetroLifetime)} 늘어나는데, 더해지는 금액 ${formatWon(lifetimeGap)}은 똑같고 분모만 다르기 때문입니다.`,
    },
    {
      h2: "등급을 올려 얻는 금액은 남은 개월수에 정비례한다",
      body: `등급의 값어치는 지금 몇 개월인지에 따라 달라지는데, ${label("metro")}에서 ${label("populationDeclineSpecial")}로 옮기면 남은 개월수 하나당 ${formatWon(monthlyGap)}씩 늘어납니다. 0개월이면 ${formatWon(lifetimeGap)}이지만 ${breakEvenMonth}개월이면 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}, ${SOLO_START_MONTH}개월이면 ${formatWon(soloGap)}으로 줄어듭니다. 아동수당은 남은 총액이 "남은 개월수 × 월액"이라 등급 상향의 값어치도 계단 없이 직선으로 줄어듭니다 — 부모급여처럼 특정 달에 뚝 떨어지는 지점이 없습니다.`,
    },
    {
      h2: `마지막 ${SOLO_MONTHS}개월은 지역 등급이 금액을 통째로 정한다`,
      body: `${SOLO_START_MONTH}개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지 ${SOLO_MONTHS}개월은 부모급여도 양육수당도 없이 아동수당만 남는 구간이라, 이 기간의 총액을 정하는 입력은 지역 등급 하나뿐입니다. ${labelledWon(REGION_TIERS.map((tier) => [label(tier), soloSegmentCash(tier)] as const))}이며 보육 형태를 바꿔도 값이 달라지지 않습니다. ${TOTAL_MONTHS}개월 전체에서 등급이 만드는 차이 ${formatWon(lifetimeGap)} 가운데 이 구간의 몫은 ${formatWon(soloGap)}, ${pct(soloGap, lifetimeGap)}입니다.`,
    },
    {
      h2: `월 최댓값 ${formatWon(peak.amount)}은 조합 하나에서만 나온다`,
      body: `보육 형태 2가지 × 지역 4등급 × 0~${CHILD_ALLOWANCE_END_MONTH}개월을 전부 돌려 월 합계의 최댓값을 찾으면 가정양육 · ${label(peak.region)} 조합의 ${formatWon(peak.amount)} 하나뿐이고, 그 조합 안에서도 ${peak.month}~${DAYCARE_CASH_ZERO_MONTH - 1}개월 ${DAYCARE_CASH_ZERO_MONTH}달이 같은 값을 냅니다. 같은 ${peak.month}개월 가정양육이라도 ${label("metro")}은 ${formatWon(monthlyAt(peak.month, "home", "metro"))}이고, 어린이집을 고르면 ${label(peak.region)}에서도 ${formatWon(monthlyAt(peak.month, "daycare", peak.region))}으로 내려갑니다. 최댓값이 나오는 구간과 보육 형태는 등급을 바꿔도 그대로이고, 등급은 금액만 ${formatWon(monthlyGap)} 범위에서 올립니다.`,
    },
    {
      h2: "등급을 최대로 올려도 어린이집이 가정양육을 넘지 못한다",
      body: `보육 형태와 지역을 곱한 여덟 조합의 생애 현금을 모두 세우면, 어린이집 쪽 최댓값은 ${label("populationDeclineSpecial")}의 ${formatWon(daycareSpecialLifetime)}이고 가정양육 쪽 최솟값은 ${label("metro")}의 ${formatWon(homeMetroLifetime)}입니다. 가장 유리한 어린이집 조합이 가장 불리한 가정양육 조합의 ${pct(daycareSpecialLifetime, homeMetroLifetime)}에 그쳐, 등급으로 보육 형태의 격차를 메우는 조합은 여덟 가지 중 하나도 없습니다. 다만 이 비교는 현금만 센 것이고, 어린이집 쪽에는 계산기가 다루지 않는 보육료 바우처가 현물로 따로 들어갑니다.`,
    },
    buildBasisSection(
      `기본 가정은 가정양육, 출생월 0개월이며 지역 등급만 네 단계로 바꿔 비교했습니다. ${label("populationDeclineSpecial")}의 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)}은 지자체에 따라 일부가 지역화폐로 지급될 수 있어 위 금액이 전액 현금이라는 뜻은 아닙니다.`,
    ),
  ],
  disclaimer: COMMON_DISCLAIMER,
};
