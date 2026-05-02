[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / GitHubInterface

# Interface: GitHubInterface

Minimal GitHub API facade for repository-state probes that the git CLI
cannot answer. [checkRepoImmutableSetting](../functions/checkRepoImmutableSetting.md) uses this to inspect
the most recent Release's `immutable` flag — a workaround because the
`/repos/{owner}/{repo}` API does not currently expose the
"Immutable releases" repo setting (UI-only beta). Returns:

- `true` — most recent Release is immutable (heuristic: setting is on).
- `false` — most recent Release is mutable (heuristic: setting is off).
- `null` — no Releases yet, or API error (fail quiet; no warning).

## Methods

### latestReleaseImmutable()

> **latestReleaseImmutable**(): `boolean` \| `null`

#### Returns

`boolean` \| `null`
