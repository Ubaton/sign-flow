# SignFlow

Self-hosted e-signature SDK (repository: `sign-agreement-package`). See
[apps/docs](apps/docs) for the marketing site + dashboard, [apps/api](apps/api)
for the backend, and [packages/core](packages/core) / [packages/react](packages/react)
for the published SDK. `apps/docs/public/llms.txt` describes the product for
LLM crawlers per the [llms.txt](https://llmstxt.org) convention.

## Local development

```
cp apps/api/.env.example apps/api/.env      # fill in Postgres + OAuth creds
cp apps/docs/.env.example apps/docs/.env.local
npm install
npm run dev
```

The API listens on `:4254`, the docs/dashboard site on `:3000`.

## Publishing to npm

Packages are versioned with [Changesets](https://github.com/changesets/changesets)
and published unscoped — [`signflow`](https://www.npmjs.com/package/signflow) and
[`signflow-core`](https://www.npmjs.com/package/signflow-core) — from the
[`ubaton-ray`](https://www.npmjs.com/settings/ubaton-ray/packages) npm account.

1. After a change to `packages/core` or `packages/react`, run `npm run changeset`
   and describe the change.
2. Commit the generated `.changeset/*.md` file with your PR.
3. On merge to `main`, CI opens a "Version Packages" PR bumping versions and
   updating changelogs.
4. Merging that PR triggers `npm publish` for the changed packages.

### One-time setup (repo owner)

- Create an npm [automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
  on the `ubaton-ray` account with publish access.
- Add it as the `NPM_TOKEN` secret in the GitHub repo (Settings → Secrets → Actions).
- Push this project to a GitHub repo — the workflows in `.github/workflows/`
  pick up automatically once there.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, test, and build on every PR
and push to `main`. `.github/workflows/release.yml` handles versioning and
publishing (see above).
