[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-staging-safety](../README.md) / STAGING\_MARKER\_FILE

# Variable: STAGING\_MARKER\_FILE

> `const` **STAGING\_MARKER\_FILE**: `".release-staging-marker"` = `".release-staging-marker"`

Marker file written at the root of a built staging directory so subsequent
tooling can prove a directory is the output of `npm run build:release-archive`
(T-V05-013) and not an arbitrary path that happens to exist.

Two consumers rely on the marker:

1. [assertSafeOutDir](../functions/assertSafeOutDir.md) refuses to recursively delete an existing
   `--out` target unless the dir is empty, non-existent, or contains the
   marker (P1 finding on PR #202: a mistyped `--out .` could otherwise
   erase the repo).
2. `scripts/release-prepack-guard.mjs` blocks `npm pack` of the
   `@luis85/agentic-workflow` package from any cwd that lacks the marker
   (P2 finding on PR #202: top-level `.npmignore` cannot remove paths
   that the `package.json#files` allowlist explicitly includes, so bare
   `npm pack` from the repo root would otherwise ship numbered ADRs).
