import { describe, expect, it } from "vitest";
// seo-routes.mjs는 plain .mjs라 이 TS 배열을 import하지 못해 연도 목록을 복제해 두었다.
// The duplicate is what makes the canonical consolidation work at build time
// (prerender list + sitemap filter + canonical map all read the .mjs copy), so
// a silent drift would ship year landings that are neither prerendered nor
// canonicalized. Read it as raw text: tsconfig only covers src/, so importing
// the module itself would break vue-tsc.
import seoRoutesSource from "../../scripts/seo-routes.mjs?raw";
import { CHILD_ALLOWANCE_LANDING_YEARS } from "@/data/childAllowanceYearGuides";

function readMjsYearList(): number[] {
  const match = seoRoutesSource.match(/CHILD_ALLOWANCE_LANDING_YEARS\s*=\s*\[([^\]]*)\]/);
  if (!match) throw new Error("CHILD_ALLOWANCE_LANDING_YEARS not found in seo-routes.mjs");
  return match[1]
    .split(",")
    .map((part: string) => part.trim())
    .filter(Boolean)
    .map(Number);
}

describe("child allowance landing years", () => {
  it("stays in sync with the build-time route list in seo-routes.mjs", () => {
    expect(readMjsYearList()).toEqual([...CHILD_ALLOWANCE_LANDING_YEARS]);
  });
});
