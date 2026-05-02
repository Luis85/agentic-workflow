[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / checkRepoImmutableSetting

# Function: checkRepoImmutableSetting()

> **checkRepoImmutableSetting**(`github`): [`ReadinessWarning`](../interfaces/ReadinessWarning.md)[]

Probe the most recent Release for the `immutable` flag (#233 prevention E).

The GitHub `/repos/{owner}/{repo}` endpoint does not expose the
"Immutable releases" repo setting today (UI-only beta), so the only way
to detect that the setting is on is to look at the latest Release and
check whether GitHub auto-flagged it immutable. This is a heuristic —
the operator could in principle have toggled the setting between the
latest Release and the current dispatch — but it is the best signal
available before a publish and it is exactly the signal the v0.5.0
incident retrospective surfaced as the missing precondition.

Returns one warning when the latest Release is immutable, none otherwise.
Never returns a hard `Diagnostic` — the v0.5.0 incident showed the
setting itself is not always operator-controlled (org-level defaults can
propagate), so failing closed here would block legitimate dispatches.

## Parameters

### github

[`GitHubInterface`](../interfaces/GitHubInterface.md)

## Returns

[`ReadinessWarning`](../interfaces/ReadinessWarning.md)[]
