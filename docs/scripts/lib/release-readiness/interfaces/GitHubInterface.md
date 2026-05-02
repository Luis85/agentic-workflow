[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / GitHubInterface

# Interface: GitHubInterface

Minimal GitHub API facade for repository-state probes that the git CLI
cannot answer. [checkRepoImmutableSetting](../functions/checkRepoImmutableSetting.md) uses this to read the
"Immutable releases" repo setting directly via
`GET /repos/{owner}/{repo}/immutable-releases` (Codex round 2 on
PR #242 — the dedicated REST endpoint is documented and live, so the
earlier most-recent-Release heuristic is unnecessary).

Returns:

- `true` — setting is enabled on the repo (or enforced by the org).
- `false` — setting is explicitly disabled.
- `null` — endpoint unavailable (older `gh` / API access denied / network
  error). Fail quiet so a missing signal cannot block dispatch.

## Methods

### immutableReleasesEnabled()

> **immutableReleasesEnabled**(): `boolean` \| `null`

#### Returns

`boolean` \| `null`
