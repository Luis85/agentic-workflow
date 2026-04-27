---
description: Discovery Track — Phase 5 (Validate). Invokes the facilitator to sequence user-researcher (run sessions, capture verbatims) and critic (verdict per concept). Produces validation.md with a sprint verdict (go / no-go / pivot).
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /discovery:validate

Run **Phase 5 — Validate** of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.5.

1. Resolve the sprint slug from `$1` or `discovery-state.md`.
2. Confirm `prototype.md` is `complete`. If not, recommend `/discovery:prototype` first.
3. **Spawn the `facilitator` subagent**. The facilitator will:
   - Sequence: `user-researcher` first (recruit + run ≥ 3 sessions per concept, capture verbatims, JTBD post-test, 4-measure scoring), then `critic` (verdict per concept against the falsification criterion from `prototype.md`).
   - Produce `discovery/<slug>/validation.md` from [`templates/discovery-validation-template.md`](../../../templates/discovery-validation-template.md).
   - Set the sprint verdict in the artifact's frontmatter `verdict:` field: `go | no-go | pivot`.
   - Run the quality gate.
4. Update `discovery-state.md`: mark `validation.md: complete`. Set sprint `status:` to match the verdict (`active` if `go` and proceeding to handoff; `no-go`; `pivot`).
5. Recommend next:
   - On `go` → `/discovery:handoff`.
   - On `no-go` → close the sprint; capture lessons in the final hand-off note.
   - On `pivot` → either re-open Phase 1 with new framing or close and start a fresh sprint.

## Don't

- Don't run sessions with the team's own employees. If real-customer access is impossible, document the constraint and surface to the user.
- Don't soften a verdict. "It kind of worked" is `inconclusive`, not `supported`.
- Don't rewrite the hypothesis post-test to make it look supported. The hypothesis is frozen at test time.
- Don't skip the surprises section. A test that surfaced no surprises was probably leading.
