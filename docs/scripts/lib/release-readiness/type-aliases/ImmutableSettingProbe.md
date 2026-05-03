[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / ImmutableSettingProbe

# Type Alias: ImmutableSettingProbe

> **ImmutableSettingProbe** = `"enabled"` \| `"disabled"` \| `"denied"` \| `"unknown"`

Result of probing the "Immutable releases" repo setting.

Discriminated four-state instead of `boolean | null` so the warning
surface can distinguish "setting confirmed on" from "probe could not
verify" (Codex P2 round 4 on PR #242). Round 3 coerced 401/403 -> true
to surface a warning, but that produced an indistinguishable false
positive against repos where the workflow token simply cannot read the
endpoint — operators saw "ENABLED" every dispatch even when the setting
was off.

- `enabled` — endpoint returned HTTP 200 with `enabled=true` (or org-level
  enforcement).
- `disabled` — endpoint returned HTTP 404, the documented disabled state.
- `denied` — endpoint returned 401 / 403 / "Bad credentials" /
  "Resource not accessible". The probe could not verify the setting;
  surface a distinct warning so the operator checks manually.
- `unknown` — network blip, parse error, or another unrecognized response.
  Fail quiet — a transient signal must not block dispatch.
