// 상황별 랜딩 페이지(B: /parental-benefit/daycare, /first-meeting/twins, /first-meeting/second,
// /child-allowance/population-decline) 전용 SeoRichGuide 데이터.
// 금액은 전부 benefitRates2026.ts 상수에서 계산해 쓰고, 확신도가 낮은 사실(다태아 순위별 산정식,
// 1세반 보육료 차액)은 구체 수치 대신 "지자체 안내 기준" 등 완곡 표현으로 서술한다 (정직성 규칙).
import { COMMON_DISCLAIMER, type GuideData } from "@/data/seoGuides";
import {
  APPLICATION_CHANNELS,
  CARE_ALLOWANCE_END_MONTH,
  CARE_ALLOWANCE_MONTHLY,
  CARE_ALLOWANCE_START_MONTH,
  CHILD_ALLOWANCE_BY_REGION,
  CHILD_ALLOWANCE_END_MONTH,
  FIRST_MEETING_EXCLUDED_CATEGORIES,
  FIRST_MEETING_FIRST_CHILD,
  FIRST_MEETING_SECOND_OR_MORE,
  FIRST_MEETING_VALID_YEARS,
  FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE,
  LOCAL_BIRTH_SUPPORT_URL,
  PARENTAL_BENEFIT_DAYCARE_CASH,
  PARENTAL_BENEFIT_HOME,
  PARENTAL_BENEFIT_PAYMENT_DAY_CASH,
  PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF,
  PARENTAL_BENEFIT_PHASE1_END_MONTH,
  PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS,
} from "@/data/benefitRates2026";
import { calcFirstMeetingVoucher } from "@/utils/babyCalculator";
import { formatWon } from "@/lib/utils";

// 어린이집 0세반 보육료 바우처 단가 = 부모급여 가정양육 0세액 − 어린이집 이용 시 현금 차액
const daycareVoucherAge0 = PARENTAL_BENEFIT_HOME.age0 - PARENTAL_BENEFIT_DAYCARE_CASH.age0;

// 아동수당 총 지급 개월수 (출생월 0개월 포함) — 지역 등급별 생애 총액 차이를 계산할 때 쓴다.
const CHILD_ALLOWANCE_TOTAL_MONTHS = CHILD_ALLOWANCE_END_MONTH + 1;

// 0세 12개월을 어린이집에서 보냈을 때 가정양육 대비 덜 받는 현금 (바우처로 대체되는 금액)
const daycareCashGapYear0 =
  (PARENTAL_BENEFIT_HOME.age0 - PARENTAL_BENEFIT_DAYCARE_CASH.age0) * (PARENTAL_BENEFIT_PHASE1_END_MONTH + 1);

export const PARENTAL_BENEFIT_DAYCARE_GUIDE: GuideData = {
  title: "어린이집 이용 시 부모급여 완전정리",
  intro:
    "어린이집을 이용하면 부모급여를 전액 현금으로 받지 못하고, 보육료 바우처와의 차액만 현금으로 받습니다. 0세와 1세는 이 차액 구조가 서로 다릅니다.",
  sections: [
    {
      h2: "0세와 1세, 현금 차액 구조가 다릅니다",
      body: `0세는 부모급여 ${formatWon(PARENTAL_BENEFIT_HOME.age0)} 중 보육료 바우처(${formatWon(daycareVoucherAge0)})를 뺀 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age0)}만 현금으로 받습니다. 1세는 보육료 지원액이 부모급여 금액을 넘어서 현금 차액이 ${formatWon(PARENTAL_BENEFIT_DAYCARE_CASH.age1)}이 됩니다.`,
    },
    {
      h2: "반 편성에 따라 차액이 달라질 수 있습니다",
      body: "같은 0세 아동이라도 실제 편성되는 반(0세반·혼합반 등)의 보육료 단가 기준으로 바우처 금액이 정해지므로, 편성 반에 따라 현금 차액이 위 금액과 다를 수 있습니다. 정확한 금액은 다니는 어린이집과 관할 행정복지센터에서 확인하세요.",
    },
    {
      h2: "현금 → 바우처 전환 시점",
      body: "가정양육 중에는 현금으로 받다가, 어린이집 입소가 확정되는 달부터 보육료 바우처 지원으로 전환되고 부모급여는 그 순간부터 차액만 지급됩니다.",
    },
    {
      h2: "지급일이 다릅니다 (현금 25일 vs 차액 익월 20일)",
      body: `가정양육 부모급여 현금은 매월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일에 들어오지만, 어린이집 이용 시 받는 현금 차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일에 지급됩니다. 그래서 어린이집 입소 첫 달에는 "이번 달 입금이 왜 안 들어오지?"라고 느끼기 쉽지만, 대부분은 미지급이 아니라 지급일이 뒤로 밀린 것입니다. 통장 입금 내역을 확인할 때 이 날짜 차이를 먼저 확인해 보세요.`,
    },
    {
      h2: "0세 1년을 어린이집에서 보내면 현금은 얼마나 줄어드나요",
      body: `0세 구간(0~${PARENTAL_BENEFIT_PHASE1_END_MONTH}개월) 전체를 어린이집에서 보내면 가정양육 대비 현금 수령액이 ${formatWon(daycareCashGapYear0)} 줄어듭니다. 다만 이 금액은 사라지는 것이 아니라 보육료 바우처(월 ${formatWon(daycareVoucherAge0)})로 어린이집에 직접 지급되는 몫입니다. 즉 "손해"가 아니라 "현금이 아닌 형태로 받는 것"이므로, 실제 판단은 보육료 부담이 실제로 얼마나 줄어드는지와 함께 비교해야 합니다.`,
    },
    {
      h2: "24개월 이후에는 양육수당도 끊깁니다",
      body: `가정양육을 계속하면 ${CARE_ALLOWANCE_START_MONTH}~${CARE_ALLOWANCE_END_MONTH}개월 동안 월 ${formatWon(CARE_ALLOWANCE_MONTHLY)}의 양육수당을 받지만, 어린이집을 이용 중이면 이 양육수당은 지급되지 않습니다. 부모급여가 끝나는 24개월 시점에 가정양육과 어린이집의 현금 차이가 다시 한 번 벌어지는 지점이라 미리 알아 두는 편이 좋습니다. 아동수당은 이와 무관하게 ${CHILD_ALLOWANCE_END_MONTH}개월까지 계속 지급됩니다.`,
    },
    {
      h2: "종일제 아이돌봄서비스와는 중복되지 않습니다",
      body: `${FULL_TIME_CHILDCARE_EXCLUSIVE_NOTE} 어린이집·아이돌봄·가정양육 중 무엇을 택하느냐에 따라 받는 형태가 달라지므로, 세 가지를 동시에 계산해 비교한 뒤 결정하는 것이 좋습니다. 보육 형태를 바꿀 때는 ${APPLICATION_CHANNELS[0]}이나 ${APPLICATION_CHANNELS[1]}에서 변경 신고를 해야 다음 지급분부터 정상 반영됩니다.`,
    },
  ],
  faqs: [
    {
      q: "우리 아이가 혼합반이면 차액이 달라지나요?",
      a: "가능성이 있습니다. 보육료 바우처는 편성된 반의 보육료 단가를 기준으로 산정되므로, 0세반이 아닌 혼합반 등에 편성되면 현금 차액이 표준 금액과 다를 수 있습니다. 다니는 어린이집에 정확한 단가를 확인하세요.",
    },
    {
      q: "어린이집 입소 첫 달에 입금이 없는데 잘못된 건가요?",
      a: `대부분은 지급일 차이 때문입니다. 가정양육 현금은 당월 ${PARENTAL_BENEFIT_PAYMENT_DAY_CASH}일, 어린이집 이용 시 현금 차액은 익월 ${PARENTAL_BENEFIT_PAYMENT_DAY_DAYCARE_DIFF}일에 지급되므로 전환 첫 달에는 입금이 한 달 뒤로 밀린 것처럼 보일 수 있습니다.`,
    },
    {
      q: "중간에 어린이집을 그만두면 다시 현금으로 받나요?",
      a: "네, 가정양육으로 돌아가면 그 시점부터 다시 부모급여 전액이 현금으로 지급됩니다. 다만 보육 형태 변경 신고가 처리된 이후 지급분부터 반영되므로 변경 즉시 신고하는 것이 좋습니다.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const TWINS_FIRST_MEETING_GUIDE: GuideData = {
  title: "쌍둥이 첫만남이용권 완전정리",
  intro:
    "다태아(쌍둥이 이상)는 각 아이가 개별 출생 순위를 부여받아 첫만남이용권을 각각 받습니다. 첫째가 쌍둥이라면 서로 다른 순위 금액을 받아 합산액이 단태아보다 커집니다.",
  sections: [
    {
      h2: "첫째가 쌍둥이면 얼마를 받나요",
      body: `쌍둥이 중 한 명은 첫째(${formatWon(FIRST_MEETING_FIRST_CHILD)}), 다른 한 명은 둘째(${formatWon(FIRST_MEETING_SECOND_OR_MORE)}) 순위로 계산되어 합산 ${formatWon(calcFirstMeetingVoucher("first", 2))}을 받는 것이 다수 지자체의 안내 기준입니다.`,
    },
    {
      h2: "중앙정부 공식 산정식은 지자체 확인이 필요합니다",
      body: "다태아 출생 순위별 산정 방식은 중앙정부 원문에서 세부 수식을 찾지 못해, 위 금액은 다수 지자체 안내를 정리한 참고값입니다. 정확한 금액은 관할 행정복지센터에서 최종 확인하세요.",
    },
    {
      h2: "사용기한은 아이별로 따로 세지 않습니다",
      body: `쌍둥이는 같은 날 태어나므로 사용기한도 함께 시작됩니다. 첫만남이용권은 출생일로부터 ${FIRST_MEETING_VALID_YEARS}년 이내에 써야 하고, 기한이 지나면 남은 포인트가 소멸됩니다. 단태아보다 총액이 크다는 뜻은 같은 기간 안에 더 많은 금액을 소진해야 한다는 뜻이기도 해서, 산후조리원비나 초기 육아용품처럼 금액이 큰 지출에 먼저 배정해 두는 편이 안전합니다.`,
    },
    {
      h2: "카드는 아이 수만큼 관리해야 합니다",
      body: `첫만남이용권은 현금이 아니라 국민행복카드 포인트로 충전되며, 지원금은 아이별로 배정됩니다. 쌍둥이라면 아이별 배정 금액과 잔액을 따로 확인해야 하고, 한 아이 몫이 남았는데 다른 아이 몫부터 소진되는 상황을 피하려면 결제 전 카드사 앱에서 잔액을 확인하는 습관이 필요합니다. 신청은 ${APPLICATION_CHANNELS.join(", ")} 중 어디서나 가능하며, 출생신고와 함께 처리하면 서류를 한 번에 낼 수 있습니다.`,
    },
    {
      h2: "쓸 수 없는 업종은 단태아와 동일합니다",
      body: `다태아라고 사용처가 넓어지지는 않습니다. ${FIRST_MEETING_EXCLUDED_CATEGORIES.join(", ")}에서는 사용할 수 없고, 그 외 병원·산후조리원·유아용품점 등에서는 정상적으로 결제됩니다. 잔액을 현금으로 인출하거나 상품권으로 바꾸는 것도 불가능하니, 기한 내 실제로 쓸 항목을 기준으로 계획하세요.`,
    },
    {
      h2: "다른 지원금은 아이 수만큼 각각 늘어납니다",
      body: `첫만남이용권뿐 아니라 부모급여와 아동수당도 아동 한 명 단위로 지급됩니다. 쌍둥이라면 부모급여 0세 월 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}을 두 명분, 아동수당도 두 명분을 각각 받게 되어 월 단위 체감 금액이 단태아의 두 배가 됩니다. 홈 화면 타임라인에 두 아이의 생년월을 각각 넣어 보면 전체 수령 흐름을 비교할 수 있습니다.`,
    },
  ],
  faqs: [
    {
      q: "세쌍둥이는 얼마를 받나요?",
      a: `첫째 ${formatWon(FIRST_MEETING_FIRST_CHILD)} + 둘째 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)} + 셋째 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}처럼 각자 순위를 부여받아 합산되는 것이 지자체 안내 기준입니다.`,
    },
    {
      q: "쌍둥이 지원금을 한 아이 카드에 몰아서 쓸 수 있나요?",
      a: "지원금은 아이별로 배정되므로 결제 전 아이별 잔액을 확인하는 것이 안전합니다. 운영 방식은 카드사·지자체에 따라 다를 수 있어 카드사 앱이나 관할 행정복지센터에서 확인하세요.",
    },
    {
      q: "쌍둥이면 부모급여와 아동수당도 두 배인가요?",
      a: `두 제도 모두 아동 한 명 단위로 지급되므로 아이 수만큼 각각 받습니다. 0세 가정양육 기준으로 부모급여는 한 명당 월 ${formatWon(PARENTAL_BENEFIT_HOME.age0)}입니다.`,
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const SECOND_CHILD_FIRST_MEETING_GUIDE: GuideData = {
  title: "둘째 첫만남이용권 300만원 완전정리",
  intro: `2024년 1월 1일 이후 출생아부터 둘째 이상 자녀는 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}을 받습니다. 첫째와 얼마나 차이 나는지 정리했습니다.`,
  sections: [
    {
      h2: "첫째 vs 둘째 이상 비교",
      body: `첫째는 ${formatWon(FIRST_MEETING_FIRST_CHILD)}, 둘째 이상은 ${formatWon(FIRST_MEETING_SECOND_OR_MORE)}로 첫째보다 ${formatWon(FIRST_MEETING_SECOND_OR_MORE - FIRST_MEETING_FIRST_CHILD)} 더 많습니다.`,
    },
    {
      h2: "2024년 1월 1일 이후 출생아 기준",
      body: "둘째 이상 300만원 지급은 2024년 1월 1일 이후 출생아부터 적용됩니다. 그 이전 출생아는 다른 기준이 적용될 수 있으니 관할 행정복지센터에서 확인하세요.",
    },
    {
      h2: "출생 순위는 '지금 몇째냐'가 아니라 가족관계등록 기준입니다",
      body: "둘째 이상 판정은 부모가 체감하는 순서가 아니라 가족관계등록부에 올라 있는 자녀 수를 기준으로 합니다. 그래서 재혼 가정, 입양, 사별 등으로 가족 구성이 복잡한 경우에는 예상과 다른 순위가 나올 수 있습니다. 순위가 애매하다고 판단되면 출생신고 시점에 담당자에게 순위 판정 근거를 함께 확인해 두는 편이 나중에 금액이 달라 당황하는 일을 막아 줍니다.",
    },
    {
      h2: "둘째라도 사용기한은 첫째와 똑같습니다",
      body: `금액만 ${formatWon(FIRST_MEETING_SECOND_OR_MORE - FIRST_MEETING_FIRST_CHILD)} 많을 뿐, 사용 조건은 첫째와 동일합니다. 출생일로부터 ${FIRST_MEETING_VALID_YEARS}년 안에 써야 하고 기한이 지나면 잔액이 소멸되며, ${FIRST_MEETING_EXCLUDED_CATEGORIES.join(", ")}에서는 사용할 수 없습니다. 금액이 큰 만큼 기한 내 소진 계획을 더 일찍 세워야 하는 쪽은 오히려 둘째입니다.`,
    },
    {
      h2: "둘째 출산 때 다시 챙겨야 하는 신청들",
      body: `첫째 때 이미 신청해 봤더라도 부모급여·아동수당·첫만남이용권은 아이별로 새로 신청해야 합니다. 특히 부모급여는 출생일로부터 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급되고, 늦으면 신청한 달부터만 지급되어 놓친 달만큼 받지 못합니다. ${APPLICATION_CHANNELS.join(", ")} 중 편한 경로에서 출생신고와 함께 한 번에 처리하는 것이 가장 안전합니다.`,
    },
    {
      h2: "형제가 함께 받는 기간에는 아동수당이 겹칩니다",
      body: `아동수당은 아이마다 ${CHILD_ALLOWANCE_END_MONTH}개월까지 지급되므로, 첫째가 아직 지급 구간에 있는 동안 둘째가 태어나면 두 아이분이 동시에 들어옵니다. 첫째의 남은 개월수와 둘째의 시작 시점을 함께 보면 가계에 실제로 들어오는 월 금액이 언제 늘고 언제 줄어드는지 미리 파악할 수 있습니다.`,
    },
  ],
  faqs: [
    {
      q: "셋째도 300만원인가요?",
      a: "네, 둘째 이상은 출생 순위와 무관하게 동일하게 300만원이 지급됩니다.",
    },
    {
      q: "첫째 때 신청했으면 둘째는 자동으로 나오나요?",
      a: `자동으로 나오지 않습니다. 지원금은 아동별로 신청해야 하며, 부모급여는 출생일로부터 ${PARENTAL_BENEFIT_RETROACTIVE_DEADLINE_DAYS}일 이내에 신청해야 출생월분부터 소급 지급됩니다.`,
    },
    {
      q: "재혼 가정인데 우리 아이가 둘째로 인정되나요?",
      a: "출생 순위는 가족관계등록부상 자녀 수를 기준으로 판정되므로 가족 구성에 따라 결과가 달라질 수 있습니다. 출생신고 시 담당자에게 순위 판정 기준을 함께 확인하세요.",
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};

export const POPULATION_DECLINE_CHILD_ALLOWANCE_GUIDE: GuideData = {
  title: "인구감소지역 아동수당 완전정리",
  intro: `인구감소지역에 거주하면 아동수당이 우대(${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclinePreferred)}) 또는 특별(${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)}) 등급으로 더 많이 지급됩니다.`,
  sections: [
    {
      h2: "우대 11만원 vs 특별 12만원",
      body: `수도권 ${formatWon(CHILD_ALLOWANCE_BY_REGION.metro)}, 비수도권 ${formatWon(CHILD_ALLOWANCE_BY_REGION.nonMetro)}보다 인구감소지역은 더 많이 받습니다. 특별지역 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)}은 지자체에 따라 일부가 지역화폐(상품권)로 지급될 수 있어 전액 현금인 다른 지역과 실질 가치가 다를 수 있습니다.`,
    },
    {
      h2: "우리 지역이 인구감소지역인지 확인하는 방법",
      body: `인구감소지역 지정은 행정안전부 고시 기준으로 정해지며, 지정 목록이 수시로 바뀔 수 있어 이 페이지에는 담지 않았습니다. 정확한 지정 여부는 정부24 통합 신청 페이지(${LOCAL_BIRTH_SUPPORT_URL})에서 거주지 주소로 확인하세요.`,
    },
    {
      h2: "9년을 다 받으면 지역 차이가 얼마나 벌어지나요",
      body: `아동수당은 출생월 0개월부터 ${CHILD_ALLOWANCE_END_MONTH}개월까지 총 ${CHILD_ALLOWANCE_TOTAL_MONTHS}개월 지급됩니다. 전 기간을 같은 등급에서 받는다고 가정하면 수도권은 ${formatWon(CHILD_ALLOWANCE_BY_REGION.metro * CHILD_ALLOWANCE_TOTAL_MONTHS)}, 인구감소 우대는 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclinePreferred * CHILD_ALLOWANCE_TOTAL_MONTHS)}, 인구감소 특별은 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial * CHILD_ALLOWANCE_TOTAL_MONTHS)}이 됩니다. 특별지역과 수도권의 차이는 ${formatWon((CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial - CHILD_ALLOWANCE_BY_REGION.metro) * CHILD_ALLOWANCE_TOTAL_MONTHS)}으로, 월 단위로는 작아 보여도 9년 누적으로는 무시할 수 없는 금액입니다.`,
    },
    {
      h2: "이사하면 언제부터 금액이 바뀌나요",
      body: "지역 등급 판정은 주민등록 주소 기준이라, 인구감소지역으로 전입하거나 그곳에서 수도권으로 전출하면 월액이 달라집니다. 기준이 되는 것은 실제 거주 시작일이 아니라 전입신고가 처리된 시점이며, 변경분이 지급에 반영되기까지 한 달가량 시차가 생길 수 있습니다. 이사 전후로 금액이 얼마나 달라지는지는 위 계산기에서 지역만 바꿔 비교해 보세요.",
    },
    {
      h2: "지역화폐로 받으면 무엇이 달라지나요",
      body: `특별지역 ${formatWon(CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial)} 중 일부가 지역화폐로 지급되면 명목 금액은 같아도 사용처가 관내 가맹점으로 제한되고 유효기간이 붙을 수 있습니다. 온라인 구매 비중이 큰 가정이라면 실질 가치가 현금과 다르게 느껴질 수 있으니, 계산 결과를 볼 때 "현금 얼마 + 지역화폐 얼마"로 나눠서 생각하는 편이 정확합니다. 지급 비율과 사용 조건은 지자체마다 달라 관할 행정복지센터 안내가 최종 기준입니다.`,
    },
    {
      h2: "지자체 자체 출산지원금과 헷갈리지 마세요",
      body: `인구감소지역은 아동수당 등급이 높을 뿐 아니라 자체 출산장려금을 별도로 운영하는 경우가 많습니다. 다만 이 둘은 완전히 다른 제도이고, 이 계산기가 계산하는 것은 중앙정부 아동수당뿐입니다. 거주지 자체 지원금은 정부24 통합 신청 페이지(${LOCAL_BIRTH_SUPPORT_URL})에서 따로 확인해 합산하세요.`,
    },
  ],
  faqs: [
    {
      q: "특별지역 12만원은 전액 현금으로 받을 수 있나요?",
      a: "지자체에 따라 다릅니다. 일부 지자체는 지역화폐(상품권) 형태로 지급해 전액 현금이 아닐 수 있습니다.",
    },
    {
      q: "인구감소지역으로 이사하면 바로 인상된 금액이 나오나요?",
      a: "주민등록 주소 기준으로 판정되므로 전입신고 처리 이후 지급분부터 반영됩니다. 지자체 처리 일정에 따라 한 달가량 시차가 생길 수 있습니다.",
    },
    {
      q: "9년 전체로 보면 수도권과 얼마나 차이 나나요?",
      a: `총 ${CHILD_ALLOWANCE_TOTAL_MONTHS}개월을 같은 등급으로 받는다고 가정하면 인구감소 특별지역은 수도권보다 ${formatWon((CHILD_ALLOWANCE_BY_REGION.populationDeclineSpecial - CHILD_ALLOWANCE_BY_REGION.metro) * CHILD_ALLOWANCE_TOTAL_MONTHS)} 더 받습니다.`,
    },
  ],
  disclaimer: COMMON_DISCLAIMER,
};
