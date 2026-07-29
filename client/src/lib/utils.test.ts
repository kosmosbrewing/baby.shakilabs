import { describe, expect, it, vi } from "vitest";
import { debounce, formatNumber, formatWon, parseNumericInput } from "./utils";

describe("utils formatters", () => {
  it("formatNumber/formatWon은 nullish를 '-'로 처리한다", () => {
    expect(formatNumber(null)).toBe("-");
    expect(formatNumber(12345)).toBe("12,345");

    expect(formatWon(undefined)).toBe("-");
    expect(formatWon(12345.6)).toBe("12,346원");
  });

  it("parseNumericInput은 콤마·기호를 제거하고 음수를 0으로 clamp한다", () => {
    expect(parseNumericInput("1,234,000")).toBe(1_234_000);
    expect(parseNumericInput("-500")).toBe(0);
    expect(parseNumericInput("abc")).toBe(0);
  });
});

describe("debounce", () => {
  it("연속 호출 시 마지막 호출만 대기시간 이후 실행된다", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("a");
    debounced("b");
    debounced("c");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");

    vi.useRealTimers();
  });
});
