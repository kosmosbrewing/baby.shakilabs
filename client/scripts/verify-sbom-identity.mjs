/**
 * 커밋된 SBOM이 "이 저장소의 것"인지만 확인한다 (재생성·네트워크 없음).
 *
 * 왜 재생성 후 diff가 아닌가: CycloneDX metadata.timestamp, SPDX documentNamespace(UUID),
 * tools의 npm CLI 버전이 매 실행마다 달라져 `git diff --exit-code` 방식은 상시 red가 된다.
 * 신원 필드만 대조하면 완전히 결정적이면서, 스캐폴딩 복사로 남의 앱 SBOM이 박히는
 * 실제 오염(seller-fee-compare가 house·biz·loan에 커밋된 사례)을 그대로 잡아낸다.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const cyclonedxPath = resolve(projectRoot, "artifacts/sbom/production.cyclonedx.json");
const spdxPath = resolve(projectRoot, "artifacts/sbom/production.spdx.json");

// SBOM을 커밋하지 않는 앱에서는 무해하게 통과한다.
// 같은 CI 스텝을 12개 앱에 그대로 붙이고, 나중에 어느 앱이 SBOM을 커밋하기 시작하면 자동 활성화되도록.
if (!existsSync(cyclonedxPath)) {
  console.log("SBOM identity: no committed SBOM at client/artifacts/sbom — skipped");
  process.exit(0);
}

const pkg = readJson(resolve(projectRoot, "package.json"));
const component = readJson(cyclonedxPath).metadata?.component ?? {};
const errors = [];

if (component.name !== pkg.name) {
  errors.push(`cyclonedx metadata.component.name is "${component.name}", expected "${pkg.name}"`);
}

if (component.version !== pkg.version) {
  errors.push(`cyclonedx metadata.component.version is "${component.version}", expected "${pkg.version}"`);
}

// GITHUB_REPOSITORY는 CI에서만 주어진다. 로컬 실행에서는 이 검사만 건너뛴다.
if (process.env.GITHUB_REPOSITORY) {
  const expected = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const vcs = (component.externalReferences ?? []).find((ref) => ref.type === "vcs");
  const actual = vcs?.url?.replace(/\.git$/, "");

  if (actual !== expected) {
    errors.push(`cyclonedx vcs externalReference is "${actual ?? "(missing)"}", expected "${expected}"`);
  }
}

if (existsSync(spdxPath)) {
  const spdx = readJson(spdxPath);
  const rootPackage = spdx.packages?.find((item) => item.SPDXID === spdx.documentDescribes?.[0]);

  if (rootPackage?.name !== pkg.name) {
    errors.push(`spdx root package name is "${rootPackage?.name ?? "(missing)"}", expected "${pkg.name}"`);
  }
}

if (errors.length > 0) {
  console.error("SBOM identity check failed — the committed SBOM does not describe this repository:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error("Regenerate with `npm run sbom:prod` from this repository.");
  process.exit(1);
}

console.log(`SBOM identity OK: ${pkg.name}@${pkg.version}`);
