// /parental-benefit 다이제스트 — 부모급여 계산 엔진(보육 형태 축 + 구간 계단)에서 나온 발견.
// 통합된 /parental-benefit/daycare의 고유 내용도 여기로 흡수했다.
// 숫자는 전부 engineFacts.ts를 거쳐 엔진에서 나오며, 이 파일에 금액 리터럴을 적지 않는다.
import type { GuideData } from "@/data/seoGuides";
import { COMMON_DISCLAIMER } from "@/data/seoGuides";
import {
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";
import {
  CARE_MONTHS,
  DAYCARE_CASH_ZERO_MONTH,
  DAYCARE_SOLO_MONTHS,
  PARENTAL_MONTHS,
  SOLO_START_MONTH,
  TOTAL_MONTHS,
  careAllowanceLifetime,
  childAllowanceLifetime,
  firstTwoYearsCash,
  lifetimeCash,
  monthlyAt,
  stepMonths,
} from "@/data/digests/engineFacts";
import { formatWon, pct, times, wonList } from "@/data/digests/digestFormat";
import { buildBasisSection } from "@/data/digests/digestBasis";

const homeSteps = stepMonths("home", "metro");
const daycareSteps = stepMonths("daycare", "metro");
const homePlateaus = [0, ...homeSteps].map((month) => monthlyAt(month, "home", "metro"));
const daycarePlateaus = [0, ...daycareSteps].map((month) => monthlyAt(month, "daycare", "metro"));
// 마지막 평지는 지급 종료 후의 0원이라 "한 달 지연 비용"에서는 뺀다.
const homeDelayCosts = homePlateaus.filter((amount) => amount > 0);
const daycareDelayCosts = daycarePlateaus.filter((amount) => amount > 0);

const homeLifetime = lifetimeCash("home", "metro");
const daycareLifetime = lifetimeCash("daycare", "metro");
const homeLifetimeSpecial = lifetimeCash("home", "populationDeclineSpecial");
const daycareLifetimeSpecial = lifetimeCash("daycare", "populationDeclineSpecial");

const phase1Drop = monthlyAt(0, "home", "metro") - monthlyAt(DAYCARE_CASH_ZERO_MONTH, "home", "metro");
const daycarePhase1Drop =
  monthlyAt(0, "daycare", "metro") - monthlyAt(DAYCARE_CASH_ZERO_MONTH, "daycare", "metro");
const daycareVoucherAge0 = PARENTAL_BENEFIT_HOME.age0 - PARENTAL_BENEFIT_DAYCARE_CASH.age0;
const soloMonthly = monthlyAt(SOLO_START_MONTH, "home", "metro");

export const PARENTAL_BENEFIT_DIGEST: GuideData = {
  title: "부모급여 계산 엔진에서 나온 발견 9가지",
  intro:
    "아래 항목은 이 페이지의 계산 함수를 보육 형태 2가지 × 지역 4등급 × 0~107개월 전 조합으로 다시 호출해 얻은 결과입니다. 화면에서 값을 하나씩 바꿔서는 보이지 않는 경계와 역전만 골랐습니다.",
  sections: [
    {
      h2: "가정양육은 계단이 네 칸, 어린이집은 두 칸이다",
      body: `수도권 기준으로 월 합계를 0개월부터 ${TOTAL_MONTHS}개월까지 한 달씩 돌려 보면, 가정양육은 ${wonList(homePlateaus)}으로 ${homeSteps.length}번 내려앉고 어린이집은 ${wonList(daycarePlateaus)}으로 ${daycareSteps.length}번만 바뀝니다. 값이 바뀌는 달도 다릅니다 — 가정양육은 ${homeSteps.join("·")}개월이지만 어린이집은 ${daycareSteps.join("·")}개월뿐이라, ${daycareSteps[0]}개월 이후로는 지급이 끝나는 ${daycareSteps[1]}개월까지 ${DAYCARE_SOLO_MONTHS}개월 동안 금액이 한 번도 움직이지 않습니다. 계단 수가 갈리는 이유는 양육수당이 가정양육 전용이라 어린이집 쪽에는 ${homeSteps[1]}개월과 ${homeSteps[2]}개월의 두 경계가 아예 생기지 않기 때문입니다.`,
    },
    {
      h2: `어린이집을 쓰면 ${DAYCARE_CASH_ZERO_MONTH}개월부터 부모급여 현금이 0원이 된다`,
      body: `어린이집을 이용하는 0세는 보육료 바우처와의 차액인 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}만 현금으로 받고, ${DAYCARE_CASH_ZERO_MONTH}개월이 되는 달부터는 그 차액이 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age1)}이 되어 부모급여 명목의 현금이 끊깁니다. 다만 이때도 현금이 전부 사라지지는 않습니다 — 아동수당은 보육 형태를 보지 않고 계속 지급되므로 수도권 기준 월 ${formatWon(monthlyAt(DAYCARE_CASH_ZERO_MONTH, "daycare", "metro"))}이 남고, 이 금액이 ${DAYCARE_CASH_ZERO_MONTH}개월부터 마지막 지급월까지 ${DAYCARE_SOLO_MONTHS}개월 동안 어린이집 가정이 받는 유일한 현금입니다. 화면의 월 합계가 ${formatWon(monthlyAt(0, "daycare", "metro"))}에서 ${formatWon(monthlyAt(DAYCARE_CASH_ZERO_MONTH, "daycare", "metro"))}으로 떨어지는 자리가 바로 이 지점입니다.`,
    },
    {
      h2: `${DAYCARE_CASH_ZERO_MONTH}개월 경계는 낙폭이 큰 쪽과 타격이 큰 쪽이 다르다`,
      body: `${DAYCARE_CASH_ZERO_MONTH}개월 경계에서 가정양육의 월 합계는 ${formatWon(monthlyAt(0, "home", "metro"))}에서 ${formatWon(monthlyAt(DAYCARE_CASH_ZERO_MONTH, "home", "metro"))}으로 ${formatWon(phase1Drop)} 줄고, 어린이집은 ${formatWon(monthlyAt(0, "daycare", "metro"))}에서 ${formatWon(monthlyAt(DAYCARE_CASH_ZERO_MONTH, "daycare", "metro"))}으로 ${formatWon(daycarePhase1Drop)} 줄어 절대 낙폭은 가정양육이 ${formatWon(phase1Drop - daycarePhase1Drop)} 더 큽니다. 그런데 줄어드는 비율은 가정양육 ${pct(phase1Drop, monthlyAt(0, "home", "metro"))}, 어린이집 ${pct(daycarePhase1Drop, monthlyAt(0, "daycare", "metro"))}로 순위가 뒤집힙니다. 경계 하나가 절대액으로는 가정양육을, 비율로는 어린이집을 더 크게 때리는 셈이라 "얼마 줄었나"와 "몇 퍼센트 줄었나" 중 어느 쪽으로 읽느냐에 따라 결론이 반대로 나옵니다.`,
    },
    {
      h2: `보육 형태가 금액을 가르는 마지막 달은 ${SOLO_START_MONTH - 1}개월이다`,
      body: `같은 지역이라면 ${SOLO_START_MONTH}개월부터 가정양육과 어린이집의 월 수령액이 정확히 같아집니다. 이 달에는 부모급여도 양육수당도 이미 끝나 아동수당만 남고, 아동수당은 보육 형태를 보지 않기 때문입니다. 수도권 기준으로 두 형태 모두 ${formatWon(soloMonthly)}이며 이 상태가 마지막 지급월까지 이어집니다. 즉 화면의 보육 형태 토글이 결과를 바꾸는 구간은 0~${SOLO_START_MONTH - 1}개월뿐이고 그 뒤로는 어느 쪽을 골라도 금액이 같습니다. 지역을 바꾸면 금액 자체는 달라지지만 두 형태가 같아진다는 점은 네 등급 모두에서 성립합니다.`,
    },
    {
      h2: `첫 ${PARENTAL_MONTHS / 12}년에 9년치 지원금의 ${pct(firstTwoYearsCash("home", "metro"), homeLifetime)}가 몰려 있다`,
      body: `수도권 가정양육 기준으로 0개월부터 마지막 지급월까지 받는 현금 합계는 ${formatWon(homeLifetime)}인데, 이 가운데 0~${PARENTAL_MONTHS - 1}개월 ${PARENTAL_MONTHS}개월분이 ${formatWon(firstTwoYearsCash("home", "metro"))}으로 ${pct(firstTwoYearsCash("home", "metro"), homeLifetime)}를 차지합니다. 기간으로는 ${TOTAL_MONTHS}개월 중 ${PARENTAL_MONTHS}개월, 즉 ${pct(PARENTAL_MONTHS, TOTAL_MONTHS)}에 불과한 구간입니다. 이 편중은 지역 등급이 올라갈수록 완만해져 인구감소 특별지역에서는 같은 비중이 ${pct(firstTwoYearsCash("home", "populationDeclineSpecial"), homeLifetimeSpecial)}로 내려가는데, 지역 차등이 붙는 항목이 아동수당뿐이라 뒤쪽 구간의 몫만 커지기 때문입니다.`,
    },
    {
      h2: `양육수당 ${CARE_MONTHS}개월 총액이 0세 부모급여 ${(careAllowanceLifetime() / PARENTAL_BENEFIT_HOME.age0).toFixed(1)}개월분이다`,
      body: `양육수당은 ${PARENTAL_MONTHS}개월부터 ${SOLO_START_MONTH - 1}개월까지 ${CARE_MONTHS}개월 동안 지급되어 합계 ${formatWon(careAllowanceLifetime())}입니다. 같은 금액을 0세 부모급여 월 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}으로 환산하면 ${(careAllowanceLifetime() / PARENTAL_BENEFIT_HOME.age0).toFixed(1)}개월분에 지나지 않습니다. 기간은 ${CARE_MONTHS}개월로 부모급여 1단계 ${DAYCARE_CASH_ZERO_MONTH}개월의 ${(CARE_MONTHS / DAYCARE_CASH_ZERO_MONTH).toFixed(2)}배지만, 총액은 그 구간 합계 ${formatWon(PARENTAL_BENEFIT_HOME.age0 * DAYCARE_CASH_ZERO_MONTH)}의 ${pct(careAllowanceLifetime(), PARENTAL_BENEFIT_HOME.age0 * DAYCARE_CASH_ZERO_MONTH)}에 그칩니다. 이 항목은 지역 차등이 없어 네 등급 어디서나 같은 금액입니다.`,
    },
    {
      h2: `신청이 한 달 늦을 때 잃는 금액이 ${monthlyAt(0, "home", "metro") / soloMonthly}분의 1까지 줄어든다`,
      body: `부모급여와 아동수당은 출생일로부터 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 안에 신청해야 출생월분부터 소급되고, 늦으면 신청한 달부터만 지급됩니다. 그래서 한 달 지연으로 사라지는 금액은 그 달의 월 합계와 같은데, 수도권 가정양육 기준으로 ${wonList(homeDelayCosts)}의 ${homeDelayCosts.length}개 값을 차례로 지납니다. 가장 비싼 달과 가장 싼 달의 차이가 ${monthlyAt(0, "home", "metro") / soloMonthly}배라, 같은 "한 달 지연"이라도 신생아 시기에 놓치는 쪽이 압도적으로 비쌉니다. 어린이집을 이용하면 같은 지연 비용이 ${wonList(daycareDelayCosts)} ${daycareDelayCosts.length}개 값뿐입니다.`,
    },
    {
      h2: `생애 현금은 가정양육이 ${times(homeLifetime, daycareLifetime)}지만 배수는 지역마다 다르다`,
      body: `수도권 기준으로 0개월부터 지급 종료까지 받는 현금 총액은 가정양육 ${formatWon(homeLifetime)}, 어린이집 ${formatWon(daycareLifetime)}으로 ${times(homeLifetime, daycareLifetime)} 차이가 납니다. 다만 이 차이는 어린이집 가정이 그만큼 덜 지원받는다는 뜻이 아닙니다 — 차액에 해당하는 몫은 현금 대신 보육료 바우처로 어린이집에 직접 지급되며, 0세반 기준 월 ${formatWon(daycareVoucherAge0)}이 그 현물 지원입니다. 그리고 이 배수는 고정값이 아닙니다: 비수도권 ${times(lifetimeCash("home", "nonMetro"), lifetimeCash("daycare", "nonMetro"))}, 인구감소 우대 ${times(lifetimeCash("home", "populationDeclinePreferred"), lifetimeCash("daycare", "populationDeclinePreferred"))}, 인구감소 특별 ${times(homeLifetimeSpecial, daycareLifetimeSpecial)}로 등급이 올라갈수록 줄어듭니다.`,
    },
    {
      h2: `어린이집 가정은 생애 현금의 ${pct(childAllowanceLifetime("metro"), daycareLifetime)}가 아동수당이다`,
      body: `수도권 기준으로 어린이집을 계속 이용하면 ${TOTAL_MONTHS}개월 동안 받는 현금 ${formatWon(daycareLifetime)} 가운데 아동수당이 ${formatWon(childAllowanceLifetime("metro"))}, 즉 ${pct(childAllowanceLifetime("metro"), daycareLifetime)}입니다. 같은 아동수당이 가정양육 가정에서는 ${formatWon(homeLifetime)} 중 ${pct(childAllowanceLifetime("metro"), homeLifetime)}에 그칩니다. 두 비중의 비는 앞의 총액 배수와 정확히 같은 ${times(homeLifetime, daycareLifetime)}인데, 아동수당 금액 자체는 보육 형태와 무관해 분자가 같고 분모만 다르기 때문입니다. 그래서 어린이집을 이용하는 가정일수록 거주 지역 등급이 최종 금액에 미치는 영향이 커집니다.`,
    },
    buildBasisSection(
      `기본 가정은 수도권 거주, 가정양육, 출생월 0개월이며, 보육 형태를 비교한 항목은 지역을 수도권으로 고정하고 형태만 바꿨습니다.`,
    ),
  ],
  disclaimer: COMMON_DISCLAIMER,
};
