/**
 * vendor tgz · README · package.json 3자를 대조한다 (네트워크 없음).
 *
 * 왜 필요한가: client/vendor/README.md는 단순 문서가 아니라 공급망 기록이다.
 * 버전 문자열과 tgz의 SHA-256이 함께 적혀 있어서, 방치되면 무결성 검증을 하려는 사람에게
 * 오답을 주는 상태가 된다(실제로 12개 앱 중 9곳이 0.3.7 해시를 그대로 들고 있었다).
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = resolve(projectRoot, "vendor");

let tarballs = [];
try {
  tarballs = readdirSync(vendorDir).filter((name) => name.endsWith(".tgz"));
} catch {
  console.log("Vendor check: no client/vendor directory — skipped");
  process.exit(0);
}

if (tarballs.length === 0) {
  console.log("Vendor check: no vendored tarball — skipped");
  process.exit(0);
}

const errors = [];

// 활성 아티팩트는 하나만 커밋한다는 규칙. 롤백본은 Git 히스토리에서 꺼낸다.
if (tarballs.length > 1) {
  errors.push(`expected exactly one vendored tarball, found ${tarballs.length}: ${tarballs.join(", ")}`);
}

const tarball = tarballs[0];
const version = tarball.match(/-(\d+\.\d+\.\d+)\.tgz$/)?.[1];
const sha256 = createHash("sha256").update(readFileSync(resolve(vendorDir, tarball))).digest("hex");
const readme = readFileSync(resolve(vendorDir, "README.md"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));

if (!version) {
  errors.push(`cannot parse a semver from tarball filename "${tarball}"`);
}

if (!readme.includes(tarball)) {
  errors.push(`README.md does not mention the committed tarball "${tarball}"`);
}

if (!readme.includes(sha256)) {
  errors.push(`README.md does not contain the actual SHA-256 of ${tarball} (${sha256})`);
}

const specifier = pkg.dependencies?.["@shakilabs/ui"];
const expectedSpecifier = `file:vendor/${tarball}`;

if (specifier !== expectedSpecifier) {
  errors.push(`package.json @shakilabs/ui is "${specifier}", expected "${expectedSpecifier}"`);
}

if (errors.length > 0) {
  console.error("Vendored artifact check failed — client/vendor/README.md is a supply-chain record, keep it true:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Vendor OK: ${tarball} sha256=${sha256.slice(0, 12)}… matches README and package.json`);
