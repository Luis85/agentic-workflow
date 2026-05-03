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

Emits at most one warning, distinguishing the verified-on case from
the probe-denied case (Codex P2 round 4 on PR #242):

- `enabled` -> `ImmutableRepo` ("setting is ON").
- `denied`  -> `ImmutableProbeDenied` ("probe could not verify;
  check manually"). Distinct code so operators do not misread an
  auth failure as a confirmed-on setting.
- `disabled` / `unknown` -> no warning.

Never returns a hard `Diagnostic` — the v0.5.0 retrospective showed
the setting is not always operator-controlled (org-level defaults
can propagate), so failing closed here could block legitimate
dispatches against repos the operator does not own.

## Parameters

### github

[`GitHubInterface`](../interfaces/GitHubInterface.md)

## Returns

[`ReadinessWarning`](../interfaces/ReadinessWarning.md)[]
