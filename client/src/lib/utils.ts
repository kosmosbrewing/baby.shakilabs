import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// 숫자 포맷: 1000 → "1,000"
export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "-";
  return num.toLocaleString("ko-KR");
}

// 원화 원단위 포맷: 2345678 → "2,345,678원" — 모든 금액은 원+콤마, 축약 금지 (BOILERPLATE_FRONTEND.md)
export function formatWon(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

// 콤마 포함 입력값에서 숫자만 추출: "1,234,000" → 1234000
export function parseNumericInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(num) ? 0 : Math.max(0, num);
}

// 입력 디바운스 — 텍스트 입력 300ms 후 재계산 (BOILERPLATE_FRONTEND.md §0 입력 UX)
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs = 300,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}
