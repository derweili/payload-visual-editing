# Changesets

Versioning for the packages under `packages/` (the test app and the demo are ignored). With every
change to a package, add a changeset in the same pull request:

```sh
pnpm changeset   # pick the packages, the bump (0.x: minor = breaking, patch = the rest), a summary
```

The three packages are `fixed`: they always share one version. The release workflow
(`.github/workflows/release.yml`) turns merged changesets into a "Version Packages" pull request;
merging that publishes to npm. See the root `README.md`.
