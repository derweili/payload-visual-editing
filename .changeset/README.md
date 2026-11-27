# Changesets

Versioning for the packages under `packages/` (the test app is ignored). With every change to a
package, add a changeset:

```sh
pnpm changeset          # pick the packages, the bump (0.x: minor = breaking, patch = the rest), a summary
pnpm changeset version  # applies the pending changesets: versions + CHANGELOG.md per package
```

The packages are `"private": true` for now, so `changeset publish` skips them. See the root
`README.md` for publishing.
