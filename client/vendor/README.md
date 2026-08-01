# ShakiLabs UI artifact

`shakilabs-ui-0.3.11.tgz` is the active exact artifact for `@shakilabs/ui` 0.3.11.

- Source repository: `00.root-shakilabs` (`packages/ui`)
- Source commit: `657cf80b72ef4a977b7b34e765b8ddb4ce9fbef7`
- SHA-256: `2c9587d9fd74af697f0a95bc50e39bccf169fb48dcebf37afe5991926b713b54`
- Referenced from `client/package.json` as `file:vendor/shakilabs-ui-0.3.11.tgz`
- Rollback artifacts: available from Git history when needed

Only the active exact artifact is committed so an isolated Vercel checkout can run `npm ci` without a private registry token.

## Verify

```sh
shasum -a 256 client/vendor/shakilabs-ui-0.3.11.tgz
```

The digest must match the SHA-256 above. CI enforces this on every push via
`node scripts/verify-vendor-readme.mjs`, which cross-checks three sources that
drift apart in practice: the tarball filename version, the digest recorded here,
and the `file:` specifier in `client/package.json`.

## Update procedure

This file is a supply-chain record, not release notes — a stale version or digest
hands the wrong answer to anyone verifying integrity. Update it in the same commit
as the tarball:

1. Pack the new release from `00.root-shakilabs/packages/ui` and copy the `.tgz` here.
2. Delete the previous `.tgz` — exactly one artifact stays committed.
3. Point `client/package.json` at the new filename and run `npm install` to refresh `package-lock.json`.
4. Rewrite the version, source commit, and SHA-256 above.
5. Run `npm run verify:supply-chain` before pushing.
