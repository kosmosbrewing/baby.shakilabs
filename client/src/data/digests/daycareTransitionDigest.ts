// /guide/daycare-transition 다이제스트 — 축은 "언제 보낼 것인가(입소 시점)"다.
// /parental-benefit는 제도별 금액 구조를, /child-allowance는 개월수 축을, 이 페이지는
// "전환하는 달을 한 칸 옮기면 무엇이 달라지는가"만 가져간다.
// 숫자는 전부 enrollmentFacts.ts를 거쳐 엔진에서 나오며, 이 파일에 금액 리터럴을 적지 않는다.
//
// 정직성: 여기서 말하는 "차이"는 현금 지원만 뺀 값이다. 어린이집을 이용하면 줄어든 현금 대신
// 보육료 바우처가 어린이집에 직접 지급되고 이 계산기는 그 금액을 모델링하지 않는다. 그래서
// 현금 비교를 담은 문단마다 바우처가 별도로 지급된다는 사실을 같이 적는다(테스트로 강제).
import type { GuideData } from "@/data/seoGuides";
import { COMMON_DISCLAIMER } from "@/data/seoGuides";
import { BABY_DATA_UPDATED } from "@/data/benefitRates2026";
import {
  CHILD_ALLOWANCE_END_MONTH,
  REGION_TIERS,
  TOTAL_MONTHS,
  lifetimeCash,
  monthlyAt,
} from "@/data/digests/engineFacts";
import {
  cashGapFrom,
  gapNeutralMonth,
  gapPlateaus,
  gapStepMonths,
  halfGapMonth,
  paymentShiftDays,
  shortestPaymentShift,
} from "@/data/digests/enrollmentFacts";
import { formatWon, pct, times, wonList } from "@/data/digests/digestFormat";
import { buildBasisSection } from "@/data/digests/digestBasis";

const BASE_REGION = "metro" as const;
const PAYMENT_YEAR = Number(BABY_DATA_UPDATED.slice(0, 4));

const plateaus = gapPlateaus(BASE_REGION);
const stepMonths = gapStepMonths(BASE_REGION);
const neutralMonth = gapNeutralMonth(BASE_REGION);
const halfMonth = halfGapMonth(BASE_REGION);

const homeLifetime = lifetimeCash("home", BASE_REGION);
const daycareLifetime = lifetimeCash("daycare", BASE_REGION);
const fullGap = cashGapFrom(0, BASE_REGION);
const halfGap = fullGap / 2;

// 구간별 누적 차이 — 평지 하나가 곧 한 구간이라 평지 정보를 그대로 곱한다.
const segmentTotal = (plateau: (typeof plateaus)[number]) => plateau.amount * plateau.months;
const firstYearSegment = plateaus[0];
const secondYearSegment = plateaus[1];
const longSegment = plateaus[2];
const firstYearTotal = segmentTotal(firstYearSegment);
const secondYearTotal = segmentTotal(secondYearSegment);
const longTotal = segmentTotal(longSegment);

const phaseBoundary = stepMonths[0];
const gapDropAtBoundary = firstYearSegment.amount - secondYearSegment.amount;
const shifts = paymentShiftDays(PAYMENT_YEAR);
const shortest = shortestPaymentShift(PAYMENT_YEAR);
const longestShift = Math.max(...shifts);

const regionLifetimes = REGION_TIERS.map((region) => lifetimeCash("home", region));

export const DAYCARE_TRANSITION_DIGEST: GuideData = {
  title: "입소 시점을 한 달씩 옮겨 본 계산 결과 9가지",
  intro:
    `아래 항목은 이 페이지가 링크하는 계산기와 같은 함수에 "몇 개월에 어린이집으로 전환하는가"만 ` +
    `0개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지 한 달씩 바꿔 넣어 다시 호출한 결과입니다. ` +
    `모든 금액은 현금 지원만 합한 값이고, 어린이집을 이용하면 줄어든 현금 대신 보육료 바우처가 ` +
    `어린이집에 직접 지급됩니다. 이 계산기는 그 바우처 금액을 모델링하지 않으므로 아래 숫자를 ` +
    `"어린이집이 손해"로 읽으면 안 됩니다.`,
  sections: [
    {
      h2: `입소 시점이 움직이는 현금은 ${formatWon(fullGap)}이 상한이다`,
      body:
        `수도권 기준으로 0개월에 바로 어린이집으로 전환하면 마지막 지급월까지 받는 현금이 ${formatWon(daycareLifetime)}이고, ` +
        `한 번도 전환하지 않고 가정양육을 유지하면 ${formatWon(homeLifetime)}입니다. 두 끝의 차이 ${formatWon(fullGap)}은 ` +
        `가정양육 총액의 ${pct(fullGap, homeLifetime)}이며, 입소 시점이라는 선택 하나가 현금 흐름에서 움직일 수 있는 최대 폭입니다. ` +
        `다만 이 차액은 없어지는 돈이 아니라 지급 경로가 바뀌는 돈입니다 — 같은 몫이 보육료 바우처가 되어 어린이집에 직접 지급되고, ` +
        `이 계산기는 그 바우처 금액을 다루지 않아 위 두 숫자 어디에도 넣지 않았습니다.`,
    },
    {
      h2: `한 달을 옮기는 값은 ${stepMonths.join("·")}개월에서만 바뀐다`,
      body:
        `"이번 달에 보낼까, 다음 달에 보낼까"의 값은 그 달 하나의 현금 차이와 같습니다. 전수 스캔에서 그 값은 ` +
        `${wonList(plateaus.map((plateau) => plateau.amount))}의 ${plateaus.length}개뿐이고, 바뀌는 달도 ${stepMonths.join("·")}개월 ` +
        `${stepMonths.length}곳뿐입니다. 구간으로 적으면 ${firstYearSegment.from}~${firstYearSegment.to}개월 월 ${formatWon(firstYearSegment.amount)}, ` +
        `${secondYearSegment.from}~${secondYearSegment.to}개월 ${formatWon(secondYearSegment.amount)}, ` +
        `${longSegment.from}~${longSegment.to}개월 ${formatWon(longSegment.amount)}, 그리고 ${neutralMonth}개월부터는 0원입니다. ` +
        `네 값 모두 현금만 센 것이라, 어린이집 쪽에 붙는 보육료 바우처는 여기에 들어 있지 않습니다.`,
    },
    {
      h2: `현금이 끊기는 달에 차이는 오히려 ${formatWon(gapDropAtBoundary)} 줄어든다`,
      body:
        `어린이집을 이용하면 ${phaseBoundary}개월부터 부모급여 명목의 현금이 0원이 되니 그 달이 가장 손해가 클 것 같지만, ` +
        `스캔 결과는 반대를 가리킵니다. ${phaseBoundary - 1}개월의 현금 차이는 ${formatWon(firstYearSegment.amount)}인데 ` +
        `${phaseBoundary}개월에는 ${formatWon(secondYearSegment.amount)}으로 ${formatWon(gapDropAtBoundary)} 줄어듭니다. ` +
        `가정양육 쪽 월 합계도 같은 달에 ${formatWon(monthlyAt(phaseBoundary - 1, "home", BASE_REGION))}에서 ` +
        `${formatWon(monthlyAt(phaseBoundary, "home", BASE_REGION))}으로 함께 내려앉기 때문입니다. ` +
        `"어린이집 현금이 끊기는 달"과 "두 형태의 차이가 가장 큰 구간"은 서로 다른 곳에 있고, 후자는 ` +
        `${firstYearSegment.from}~${firstYearSegment.to}개월입니다. 어느 달이든 줄어든 현금 자리는 보육료 바우처가 대신합니다.`,
    },
    {
      h2: `첫 ${firstYearSegment.months}달의 누적 차이가 뒤 ${longSegment.months}달보다 크다`,
      body:
        `구간별로 현금 차이를 합치면 ${firstYearSegment.from}~${firstYearSegment.to}개월 ${firstYearSegment.months}달이 ` +
        `${formatWon(firstYearTotal)}으로 전체 ${formatWon(fullGap)}의 ${pct(firstYearTotal, fullGap)}, ` +
        `${secondYearSegment.from}~${secondYearSegment.to}개월이 ${formatWon(secondYearTotal)}(${pct(secondYearTotal, fullGap)}), ` +
        `${longSegment.from}~${longSegment.to}개월 ${longSegment.months}달이 ${formatWon(longTotal)}(${pct(longTotal, fullGap)})입니다. ` +
        `뒤 구간은 앞 구간보다 ${(longSegment.months / firstYearSegment.months).toFixed(2)}배 길지만 누적 차이는 ` +
        `${formatWon(firstYearTotal - longTotal)} 작습니다. 입소 시점이 현금에 크게 작용하는 구간이 첫 1년에 몰려 있다는 뜻이며, ` +
        `이 합계 역시 보육료 바우처를 뺀 현금만의 값입니다.`,
    },
    {
      h2: `남은 차이가 절반 아래로 내려가는 달은 ${halfMonth}개월이다`,
      body:
        `0개월 기준 현금 차이 ${formatWon(fullGap)}의 절반은 ${formatWon(halfGap)}인데, 남은 차이가 처음으로 그 아래로 ` +
        `내려가는 달은 ${halfMonth}개월(${formatWon(cashGapFrom(halfMonth, BASE_REGION))})입니다. 지급 기간 ${TOTAL_MONTHS}개월 가운데 ` +
        `${pct(halfMonth, TOTAL_MONTHS)}만 지난 시점입니다. 입소를 ${halfMonth}개월까지 미루면 현금 기준으로 되찾을 수 있는 몫의 ` +
        `절반이 이미 지나가고, 남은 ${TOTAL_MONTHS - halfMonth}달을 다 써도 나머지 절반만 움직입니다. ` +
        `이 곡선은 보육료 바우처를 넣지 않은 현금만의 곡선이라, 실제 가계 부담은 이 모양과 다르게 움직일 수 있습니다.`,
    },
    {
      h2: "거주 지역 등급은 이 결정을 한 푼도 바꾸지 않는다",
      body:
        `지역 ${REGION_TIERS.length}등급 × 0~${CHILD_ALLOWANCE_END_MONTH}개월 전 조합에서 두 형태의 현금 차이를 다시 계산하면 ` +
        `네 등급 모두 ${formatWon(fullGap)}으로 같습니다. 지역 차등이 붙는 항목은 아동수당 하나뿐인데 그 금액이 보육 형태를 보지 않아 ` +
        `뺄셈에서 통째로 상쇄되기 때문입니다. 반대로 총액 자체는 등급마다 달라 가정양육 기준으로 ` +
        `${formatWon(Math.min(...regionLifetimes))}에서 ${formatWon(Math.max(...regionLifetimes))}까지 벌어집니다. ` +
        `그래서 "우리 지역은 아동수당이 많으니 입소를 늦추는 편이 더 이득"이라는 판단은 성립하지 않습니다. ` +
        `어느 등급에서든 어린이집 쪽에는 현금 대신 보육료 바우처가 지급됩니다.`,
    },
    {
      h2: "절대액과 배수가 서로 다른 구간을 최악으로 꼽는다",
      body:
        `월 현금을 배수로 보면 가정양육이 어린이집의 몇 배인지가 0개월 ${times(monthlyAt(0, "home", BASE_REGION), monthlyAt(0, "daycare", BASE_REGION))}, ` +
        `${phaseBoundary}개월 ${times(monthlyAt(phaseBoundary, "home", BASE_REGION), monthlyAt(phaseBoundary, "daycare", BASE_REGION))}, ` +
        `${longSegment.from}개월 ${times(monthlyAt(longSegment.from, "home", BASE_REGION), monthlyAt(longSegment.from, "daycare", BASE_REGION))}로 움직입니다. ` +
        `절대 차이는 ${wonList([firstYearSegment.amount, secondYearSegment.amount, longSegment.amount])}으로 계속 줄어드는데 ` +
        `배수는 ${secondYearSegment.from}~${secondYearSegment.to}개월 구간에서 최대가 되고 그 구간 안에서는 값이 움직이지 않습니다. ` +
        `같은 표를 두고 "얼마 차이나나"는 ${firstYearSegment.from}~${firstYearSegment.to}개월을, ` +
        `"몇 배 차이나나"는 ${secondYearSegment.from}~${secondYearSegment.to}개월을 피해야 할 구간으로 지목하는 셈입니다. 두 지표 모두 현금만 센 것이고 보육료 바우처는 어느 쪽에도 없습니다.`,
    },
    {
      h2: `같은 달분 현금이 ${shortest.days}~${longestShift}일 뒤로 밀린다`,
      body:
        `가정양육 현금은 그 달 25일에 들어오지만 어린이집 이용 시 현금 차액은 익월 20일에 지급됩니다. ` +
        `${PAYMENT_YEAR}년 열두 달을 실제 달력으로 재면 그 간격이 ${shortest.month}월분 ${shortest.days}일에서 최대 ${longestShift}일까지 벌어집니다 ` +
        `— 달의 길이가 다르기 때문이고, 짧은 달일수록 밀리는 폭도 작습니다. 금액이 아니라 입금일이 이동하는 것이라 총액에는 잡히지 않지만, ` +
        `전환하는 달에는 현금이 한 번 비는 구간이 생깁니다. 보육료 바우처는 이 현금 차액과 다른 경로로 어린이집에 지급되므로 이 지연과는 별개입니다.`,
    },
    {
      h2: "현금만 세면 답은 언제나 미루라 쪽으로 나온다",
      body:
        `지역 ${REGION_TIERS.length}등급 × 0~${CHILD_ALLOWANCE_END_MONTH}개월 전수 스캔에서 입소를 한 달 미룰 때 남은 현금 차이가 늘어나는 달은 ` +
        `하나도 없었고, 어린이집 총액이 가정양육 총액을 넘는 조합도 없었습니다. 다만 ${neutralMonth}개월부터는 차이가 이미 0원이라 더 미뤄도 ` +
        `줄어들 것이 없어, "미룰수록 이득"은 0~${neutralMonth - 1}개월에서만 성립합니다. 결과가 한 방향으로만 나오는 이유는 이 계산기가 현금만 세고 ` +
        `보육료 바우처 금액을 모델링하지 않기 때문입니다. 어린이집을 이용하면 줄어든 현금 대신 보육료가 어린이집에 직접 지원되므로, ` +
        `이 페이지의 숫자는 입소 여부를 판단하는 근거가 아니라 현금 흐름이 언제 어떻게 바뀌는지를 미리 보는 용도입니다.`,
    },
    buildBasisSection(
      `기본 가정은 수도권 거주이며, 입소 시점 비교는 지역을 고정한 채 그 달부터 보육 형태만 어린이집으로 바꿔 계산했습니다. ` +
        `위 금액은 전부 현금 지원만 합한 것이고, 어린이집 보육료 바우처의 금액은 이 계산기가 다루지 않아 어디에도 들어 있지 않습니다.`,
    ),
  ],
  disclaimer: COMMON_DISCLAIMER,
};
