// 다이제스트 산문 전용 표기 헬퍼. 비율·배수는 반드시 엔진 값에서 계산해 찍고, 산문 파일에
// 숫자를 손으로 적지 않는다 — 상수가 바뀌면 문장이 스스로 다시 쓰이도록 하기 위함이다.
// (그 자동 재작성이 테스트까지 같이 움직이지 않도록, 테스트 쪽 기대값은 리터럴로 고정한다.)
import { formatWon } from "@/lib/utils";

/** a가 b에서 차지하는 비율 — 소수점 둘째 자리까지. 예: 58.12% */
export function pct(a: number, b: number): string {
  return `${((a / b) * 100).toFixed(2)}%`;
}

/** a가 b의 몇 배인지 — 소수점 둘째 자리까지. 예: 2.22배 */
export function times(a: number, b: number): string {
  return `${(a / b).toFixed(2)}배`;
}

/** 금액 목록을 "A원, B원, C원" 형태로 이어 붙인다. */
export function wonList(values: readonly number[]): string {
  return values.map((value) => formatWon(value)).join(", ");
}

/** "라벨 A원, 라벨 B원" 형태 — 지역 등급별 금액 나열에 쓴다. */
export function labelledWon(pairs: ReadonlyArray<readonly [string, number]>): string {
  return pairs.map(([label, value]) => `${label} ${formatWon(value)}`).join(", ");
}

export { formatWon };
