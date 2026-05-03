---
id: ADR-0032
title: Bridge Design Track handoff into /spec:design Stage 4
status: accepted
date: 2026-05-03
deciders:
  - human
consulted:
  - design-lead
  - ui-designer
informed:
  - all stage agents
supersedes: []
superseded-by: []
tags: [design-track, spec-design, integration, workflow]
---

# ADR-0032 — Bridge Design Track handoff into /spec:design Stage 4

## Status

Accepted

## Context

ADR-0019 added the Design Track as an opt-in workflow that produces `design-handoff.md` — a spec-quality artifact containing screen inventory, component assignments, named token references, microcopy, an accessibility checklist, and open questions. The ADR noted that this handoff "feeds directly into `/spec:design` or the engineer" and that `ui-designer` should "consume it (component assignments, token references, microcopy, accessibility checklist) rather than redoing the work."

`docs/specorator.md` (§4, Stage 4 pre-stage notes) explicitly flagged: *"A future ADR will codify a design-handoff-aware branch in `/spec:design`; until then, treat the handoff as authoritative and use Part B to surface only feature-level deltas."*

That bridge was never built. As a result:

1. `/spec:design` ignores any `design-handoff.md` that exists for the feature's surface — `ui-designer` redoes work already decided in the Design Track.
2. The two tracks are nominally integrated but practically disconnected: the handoff sits unused in `designs/<slug>/` while Stage 4 reinvents token choices and microcopy.
3. There is no canonical discovery mechanism for the command to find the relevant handoff without the user supplying it manually.

## Decision

We extend `/spec:design` with a **scan-based design-handoff check** inserted after the Arc42 baseline check and before spawning `ui-designer`.

### Discovery mechanism

Scan-based: at the start of `/spec:design`, after resolving the feature slug, the command scans `designs/*/design-handoff.md` for any file whose `downstream` frontmatter field matches the current feature slug. If a match is found, the handoff is read and passed to `ui-designer` as Part B canonical input.

Scan-based discovery was chosen over an explicit `$2` argument for three reasons:

1. **Zero user burden.** The user runs `/spec:design <slug>` as before. No flag to remember, no lookup required.
2. **Handles renamed slugs.** The `downstream` field in `design-handoff.md` is set at handoff time by `design-lead` — it remains correct even if the feature slug is later renamed.
3. **Consistent with existing pre-checks.** Steps 4 and 5 of `/spec:design` already use file-existence checks (`design-comparison.md`, `arc42-questionnaire.md`) to gate and inject prior work. This follows the same pattern.

### Behavioural contract

When a matching `design-handoff.md` is found:

- It is read in full before `ui-designer` is spawned.
- It is passed to `ui-designer` as **Part B canonical input**: component assignments, token references, and final microcopy are treated as decided. `ui-designer` writes only **feature-level deltas** — elements the Design Track did not cover (e.g. a new interaction pattern specific to this feature, a state not in the surface sketch).
- The handoff artifact path and status are noted in `design.md` under a `## Design Track handoff` section, so the traceability chain is clear.
- If the handoff has `status: draft` (not yet approved by the human), the command surfaces a warning and recommends completing the Design Track before proceeding. It does not block — the user may proceed at their discretion.

When no matching handoff is found, `/spec:design` runs as before: `ui-designer` does the full Part B.

### Surfaces patched

| Surface | Change |
|---|---|
| `.claude/commands/spec/design.md` | New step 5.5 — scan for design-handoff, pass to ui-designer |
| `docs/specorator.md` | Remove "future ADR" placeholder note; add cross-reference to ADR-0032 |
| `docs/sink.md` | Add `designs/<slug>/` directory tree (gap independent of this bridge) |
| `docs/design-track.md` | Promote from v0.1/Draft to v1.0/Stable |

## Considered options

### Option A — Scan-based auto-discovery (chosen)

- **Pros:** Zero user burden. Consistent with existing pre-checks. `downstream` field makes intent explicit at the artifact level.
- **Cons:** Scan adds a small I/O step. If two design slugs both declare `downstream: <same-slug>`, both are read (unlikely; flagged as a warning in the command).

### Option B — Explicit `$2` argument

- **Pros:** Unambiguous. No filesystem scan. Works even if `downstream` field is wrong.
- **Cons:** User must remember a flag. Breaks the convention that `spec:*` commands take only the feature slug. Easy to omit silently.

### Option C — No bridge; document-only

- **Pros:** No command change.
- **Cons:** The handoff remains unused. Design work is redone at Stage 4. The integration claim in ADR-0019 and `specorator.md` is misleading.

We choose Option A. Option B adds friction without meaningful safety gain. Option C perpetuates the disconnect.

## Consequences

### Positive

- The Design Track's output is consumed, not ignored. `design-handoff.md` becomes a first-class input to Stage 4.
- Token choices and microcopy decided in the Design Track are inherited rather than reinvented. Reduces drift between brand-reviewed design decisions and Stage 4 output.
- The workflow claim that the Design Track "feeds directly into `/spec:design`" becomes literally true.

### Negative

- A mismatched `downstream` field (user forgot to update it) silently bypasses the integration. Mitigation: `design-lead` sets `downstream` at handoff; the field is required in the template.
- A `status: draft` handoff being passed through generates a warning but does not block. If the user ignores the warning, Stage 4 inherits a non-approved design.

### Neutral

- `ux-designer` (Part A) is unaffected. The Design Track's UX output (flows, IA, states) is not a direct input to Part A — the brief and sketch are consulted as context, not as canonical artifacts, since feature UX may differ from surface UX.
- The bridge is opt-in by nature: if no `designs/` folder exists, `/spec:design` runs identically to before.

## Compliance

- `.claude/commands/spec/design.md` step 5.5 implements the scan.
- `docs/specorator.md` removes the "future ADR" placeholder; references this ADR.
- `docs/sink.md` documents `designs/<slug>/`.
- `docs/design-track.md` promoted to v1.0/Stable.

## References

- [`ADR-0019`](0019-add-design-track.md) — adds the Design Track and `design-handoff.md`.
- [`docs/design-track.md`](../design-track.md) — full Design Track methodology.
- [`templates/design-handoff-template.md`](../../templates/design-handoff-template.md) — `downstream` field definition.
- [`docs/specorator.md`](../specorator.md) — Stage 4 pre-stage notes.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
