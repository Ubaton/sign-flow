# Changesets

Run `npm run changeset` after a change to `packages/core` or `packages/react`
that should ship a new version. Pick the bump type (patch/minor/major) and
describe the change — that file is committed alongside your PR.

On merge to `main`, CI opens a "Version Packages" PR that applies the pending
changesets. Merging that PR triggers the actual `npm publish`.
