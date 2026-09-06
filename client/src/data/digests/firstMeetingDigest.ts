// /first-meeting 다이제스트 — 출생 순위 × 다태아 수 룩업과 24개월 사용기한 경계에서 나온 발견.
// 통합된 /first-meeting/twins·/first-meeting/second의 고유 내용도 여기로 흡수했다.
import type { GuideData } from "@/data/seoGuides";
import { COMMON_DISCLAIMER } from "@/data/seoGuides";
import {
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_DAYS,
  FIRST_MEETING_VALID_YEARS,
} from "@/data/benefitRates2026";
import { calcRemainingTotal } from "@/utils/babyCalculator";
import {
  CARE_MONTHS,
  PARENTAL_MONTHS,
  careAllowanceLifetime,
  deadlineOf,
  monthlyAt,
  remainingDropSizes,
  voucher,
  voucherPerChild,
} from "@/data/digests/engineFacts";
import { formatWon, pct, times } from "@/data/digests/digestFormat";
import { buildBasisSection } from "@/data/digests/digestBasis";

// 다태아 선택지 — 화면(MULTIPLE_BIRTH_OPTIONS)과 같은 값이지만 참조를 공유하지 않는 독립 리터럴.
// 참조를 공유하면 "화면 선택지 == 다이제스트 전제" 검사가 자기 자신과의 비교가 되어 red가 나지 않는다.
export const MULTIPLE_BIRTH_COUNTS = [1, 2, 3] as const;

const validLastMonth = FIRST_MEETING_VALID_YEARS * 12 - 1;
const expiryMonth = validLastMonth + 1;

const remainingBeforeExpiry = calcRemainingTotal(validLastMonth, "home", "metro", "first", 1);
const remainingAtExpiry = calcRemainingTotal(expiryMonth, "home", "metro", "first", 1);
const firstChildCliff =
  remainingBeforeExpiry.remainingMonthlyTotal +
  remainingBeforeExpiry.firstMeetingAmount -
  remainingAtExpiry.remainingMonthlyTotal;

const twinSecondBefore = calcRemainingTotal(validLastMonth, "home", "metro", "secondOrMore", 2);
const twinSecondCliff =
  twinSecondBefore.remainingMonthlyTotal +
  twinSecondBefore.firstMeetingAmount -
  remainingAtExpiry.remainingMonthlyTotal;

// 한 달 지연으로 잃는 금액 중 가장 큰 값 (수도권·가정양육 0~11개월 구간).
const biggestMonthlyDrop = Math.max(...remainingDropSizes("home", "metro").map((entry) => entry.drop));

const orderGap = voucher("secondOrMore", 1) - voucher("first", 1);
const firstTwins = voucher("first", 2);
const secondSingle = voucher("secondOrMore", 1);
const secondTwins = voucher("secondOrMore", 2);
const careLifetime = careAllowanceLifetime();
const voucherMin = voucher("first", MULTIPLE_BIRTH_COUNTS[0]);
const voucherMax = voucher("secondOrMore", MULTIPLE_BIRTH_COUNTS[MULTIPLE_BIRTH_COUNTS.length - 1]);
const sampleBirthDate = "2026-03-15";

export const FIRST_MEETING_DIGEST: GuideData = {
  title: "첫만남이용권 계산 엔진에서 나온 발견 9가지",
  intro:
    "아래 항목은 이 페이지의 계산 함수를 출생 순위 2가지 × 다태아 수 조합으로 다시 호출하고, 사용기한 경계를 한 달씩 넘겨 가며 얻은 결과입니다. 금액표를 옮겨 적은 문장은 넣지 않았습니다.",
  sections: [
    {
      h2: "이 계산기에서 날짜로 기한이 정해지는 항목은 첫만남이용권뿐이다",
      body: `부모급여·양육수당·아동수당은 모두 개월수 경계로 금액이 정해지지만 첫만남이용권만 출생일에 ${FIRST_MEETING_VALID_YEARS}년을 더한 날짜가 기한입니다. 그래서 같은 개월수라도 태어난 날에 따라 남은 기간이 다르고, ${sampleBirthDate}에 태어난 아이의 기한은 ${deadlineOf(sampleBirthDate)}입니다. 화면의 사용기한 게이지는 ${FIRST_MEETING_VALID_YEARS}년을 ${FIRST_MEETING_VALID_DAYS}일로 환산해 표시하므로 윤년이 낀 해에는 실제 만료일과 하루 정도 어긋날 수 있고, 정확한 잔액과 만료일은 국민행복카드 발급 카드사에서 확인하는 편이 안전합니다.`,
    },
    {
      h2: `${expiryMonth}개월에 사라지는 금액이 이 계산기에서 가장 큰 한 칸이다`,
      body: `남은 지원금 합계는 ${validLastMonth}개월에서 ${expiryMonth}개월로 넘어갈 때 첫째·단태아·수도권·가정양육 기준 ${formatWon(remainingBeforeExpiry.remainingMonthlyTotal + remainingBeforeExpiry.firstMeetingAmount)}에서 ${formatWon(remainingAtExpiry.remainingMonthlyTotal)}으로 ${formatWon(firstChildCliff)} 줄어듭니다. 월 합계가 ${formatWon(monthlyAt(validLastMonth, "home", "metro"))}만큼 빠지는 데 더해 바우처 ${formatWon(FIRST_MEETING_FIRST_CHILD)}이 사용기한을 지나 화면에서 빠지기 때문입니다. 같은 자리가 둘째 이상 쌍둥이라면 ${formatWon(twinSecondCliff)}으로 커져, 한 달 지연으로 잃는 금액 중 가장 큰 ${formatWon(biggestMonthlyDrop)}의 ${times(twinSecondCliff, biggestMonthlyDrop)}가 됩니다. 다만 이 금액은 "못 받는 돈"이 아니라 "기한 안에 쓰지 않으면 잔액이 소멸하는 돈"이라, 이미 다 썼다면 실제로 줄어드는 것은 월 합계뿐입니다.`,
    },
    {
      h2: `출생 순위 차액은 아이가 몇이든 정확히 ${formatWon(orderGap)}이다`,
      body: `첫만남이용권은 첫째 ${formatWon(FIRST_MEETING_FIRST_CHILD)}, 둘째 이상 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}의 두 값 룩업이고, 다태아는 첫 아이만 선택한 순위를 쓰고 나머지는 둘째 이상으로 셉니다. 그래서 같은 다태아 수에서 "첫째"와 "둘째 이상"의 총액 차이는 ${MULTIPLE_BIRTH_COUNTS.map((count) => `${count}명 ${formatWon(voucher("secondOrMore", count) - voucher("first", count))}`).join(", ")}으로 모두 같습니다. 아이 수를 더 늘려도 이 차이는 움직이지 않는데, 두 식이 각각 첫째 단가 + 둘째 단가 × (n−1)과 둘째 단가 × n이라 기울기가 같아 평행하기 때문입니다.`,
    },
    {
      h2: "1인당으로 보면 첫 출산 쌍둥이가 둘째 단태아보다 적다",
      body: `첫 출산 쌍둥이의 총액은 ${formatWon(firstTwins)}으로 둘째 단태아 ${formatWon(secondSingle)}보다 ${formatWon(firstTwins - secondSingle)} 많지만, 아이 한 명당으로 나누면 ${formatWon(voucherPerChild("first", 2))} 대 ${formatWon(voucherPerChild("secondOrMore", 1))}으로 순위가 뒤집힙니다. 첫 출산 쌍둥이는 두 아이 중 한 명이 첫째 단가 ${formatWon(FIRST_MEETING_FIRST_CHILD)}을 받기 때문입니다. 아이를 한 명 더 늘려 첫 출산 삼둥이 ${formatWon(voucher("first", 3))}과 둘째 이상 쌍둥이 ${formatWon(secondTwins)}을 견줘도 마찬가지여서, 총액은 ${formatWon(voucher("first", 3) - secondTwins)} 앞서지만 1인당은 ${formatWon(voucherPerChild("first", 3))} 대 ${formatWon(voucherPerChild("secondOrMore", 2))}으로 다시 뒤집힙니다. 둘째 이상끼리는 아이 수가 몇이든 1인당이 ${formatWon(voucherPerChild("secondOrMore", 1))}으로 같아 이런 역전이 생기지 않습니다.`,
    },
    {
      h2: `첫 출산은 아이가 늘수록 1인당이 오르지만 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}에는 닿지 않는다`,
      body: `첫 출산의 1인당 금액은 ${MULTIPLE_BIRTH_COUNTS.map((count) => `${count}명 ${formatWon(voucherPerChild("first", count))}`).join(", ")}으로 올라갑니다. 식으로 쓰면 둘째 단가에서 순위 차액을 아이 수로 나눈 값을 뺀 것이라, 아이가 늘수록 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}에 가까워지지만 어떤 유한한 아이 수에서도 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}이 되지는 않습니다. 반대로 둘째 이상은 아이 수와 무관하게 1인당이 ${formatWon(voucherPerChild("secondOrMore", 3))}으로 평평합니다.`,
    },
    {
      h2: `둘째 이상 쌍둥이 한 번이 양육수당 ${CARE_MONTHS}개월치의 ${pct(secondTwins, careLifetime)}다`,
      body: `둘째 이상 쌍둥이의 첫만남이용권 합계는 ${formatWon(secondTwins)}으로, ${PARENTAL_MONTHS}개월부터 지급되는 양육수당 총액 ${formatWon(careLifetime)}의 ${pct(secondTwins, careLifetime)}입니다. 출생 직후 한 번에 들어오는 바우처가 ${CARE_MONTHS}개월에 걸쳐 나오는 월 지원과 거의 같은 크기라는 뜻입니다. 같은 비교를 첫째 단태아 ${formatWon(FIRST_MEETING_FIRST_CHILD)}으로 좁히면 ${pct(FIRST_MEETING_FIRST_CHILD, careLifetime)}로 내려갑니다. 화면에서 고를 수 있는 조합의 최소는 ${formatWon(voucherMin)}, 최대는 ${formatWon(voucherMax)}으로 ${times(voucherMax, voucherMin)} 벌어집니다.`,
    },
    {
      h2: "첫만남이용권은 남은 총액에 더해지지 않고 따로 표시된다",
      body: `이 계산기의 남은 지원금 합계는 부모급여·양육수당·아동수당 세 항목만 월별로 더하고 첫만남이용권은 별도 항목으로 뺍니다. 현금이 아니라 국민행복카드 포인트로 충전되는 바우처인 데다 출생 직후 이미 수령했을 가능성이 높아, 합산하면 앞으로 들어올 현금을 실제보다 크게 보여 주기 때문입니다. 그래서 ${validLastMonth}개월 아이의 화면에는 월 합계 ${formatWon(remainingBeforeExpiry.remainingMonthlyTotal)}과 바우처 ${formatWon(remainingBeforeExpiry.firstMeetingAmount)}이 나란히 뜨고, 두 숫자의 성격이 다르다는 표시가 함께 붙습니다.`,
    },
    {
      h2: "쌍둥이는 사용기한도 한 날에 함께 시작한다",
      body: `다태아는 같은 날 태어나므로 아이별로 배정된 바우처의 기한이 모두 같은 날 끝납니다. 첫 출산 쌍둥이라면 ${formatWon(firstTwins)}을, 둘째 이상 쌍둥이라면 ${formatWon(secondTwins)}을 같은 ${expiryMonth}개월 안에 소진해야 한다는 뜻입니다. 첫째 단태아 ${formatWon(FIRST_MEETING_FIRST_CHILD)}과 견주면 같은 기간에 써야 할 금액이 각각 ${times(firstTwins, FIRST_MEETING_FIRST_CHILD)}와 ${times(secondTwins, FIRST_MEETING_FIRST_CHILD)}이므로, 금액이 큰 조합일수록 기한 압박이 그대로 비례해 커집니다. 아이별 잔액이 따로 관리되는지는 카드사 안내를 확인하는 편이 안전합니다.`,
    },
    {
      h2: "출생 순위는 가족관계등록부 기준이라 계산기가 판정하지 못한다",
      body: `이 계산기는 "첫째"와 "둘째 이상" 중 사용자가 고른 값을 그대로 룩업에 넣을 뿐, 순위 자체를 판정하지 않습니다. 실제 순위는 가족관계등록부에 올라 있는 자녀 수로 정해져 재혼·입양·사별처럼 가족 구성이 복잡한 경우 예상과 다르게 나올 수 있고, 그때 총액은 다태아 수와 무관하게 ${formatWon(orderGap)}씩 어긋납니다. 둘째 이상 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)} 기준은 2024년 1월 1일 이후 출생아부터 적용되므로 그 이전 출생아는 관할 행정복지센터에서 따로 확인해야 합니다.`,
    },
    buildBasisSection(
      `기본 가정은 첫째·단태아이며, 잔액 절벽을 잰 항목만 수도권·가정양육을 함께 고정했습니다. 화면에서 고를 수 있는 다태아 수는 ${MULTIPLE_BIRTH_COUNTS.join("·")}명입니다.`,
    ),
  ],
  disclaimer: COMMON_DISCLAIMER,
};
