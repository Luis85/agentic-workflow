[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / checkRepoImmutableSetting

# Function: checkRepoImmutableSetting()

> **checkRepoImmutableSetting**(`github`): [`ReadinessWarning`](../interfaces/ReadinessWarning.md)[]

Probe the "Immutable releases" repo setting (#233 prevention E).

Reads the setting directly via
`GET /repos/{owner}/{repo}/immutable-releases`. When the endpoint
returns `enabled: true` (or the org enforces the setting) every new
Release on the repo is auto-flagged immutable; a failed asset upload
or operator deletion then permanently burns the tag — exactly the
v0.5.0 incident pattern.

Per the [GitHubInterface.immutableReleasesEnabled](../interfaces/GitHubInterface.md#immutablereleasesenabled) contract,
the implementation returns `true` not only when the setting is
actually on but also when the probe lacks permission to verify it
(HTTP 401 / 403). The "surface on auth failure" semantics is
intentional (Codex P1 round 3 on PR #242): silently skipping the
warning when `secrets.GITHUB_TOKEN` cannot read the endpoint would
give operators a false sense that the probe ran cleanly when it did
not, which is exactly the v0.5.0 incident pattern at one remove.

Returns one warning when the setting is (or might be) on, none
otherwise. Never returns a hard `Diagnostic` — the v0.5.0 retrospective
showed the setting is not always operator-controlled (org-level
defaults can propagate), so failing closed here could block legitimate
dispatches against repos the operator does not own.

## Parameters

### github

[`GitHubInterface`](../interfaces/GitHubInterface.md)

## Returns

[`ReadinessWarning`](../interfaces/ReadinessWarning.md)[]
