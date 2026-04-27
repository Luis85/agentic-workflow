---
description: Discovery Track — Handoff. Writes chosen-brief.md (one per surviving concept) and recommends /spec:start + /spec:idea. Only runs when validation verdict is "go".
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /discovery:handoff

Run the **Handoff** phase of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.6.

1. Resolve the sprint slug from `$1` or `discovery-state.md`.
2. Read `validation.md`'s frontmatter `verdict:` field.
3. **If verdict is `no-go`** — there is nothing to hand off. Set `discovery-state.md` `status: no-go` (if not already), confirm the final hand-off note captures lessons, and report to the user that the sprint successfully killed the candidates. Do not create `chosen-brief.md`. Do not recommend `/spec:start`.
4. **If verdict is `pivot`** — recommend either re-running `/discovery:frame` with new framing on the same sprint, or closing this sprint and starting a fresh one (`/discovery:start <new-slug>`). Do not create `chosen-brief.md`.
5. **If verdict is `go`** — proceed:
   1. **Spawn the `facilitator` subagent** (consulted: `product-strategist`).
   2. For each concept whose hypothesis was *supported* in `validation.md`, produce one `chosen-brief.md` (or `chosen-brief-c-NNN.md` if multiple) from [`templates/discovery-chosen-brief-template.md`](../../../templates/discovery-chosen-brief-template.md).
   3. Each brief carries forward: validation evidence, customer segment, JTBD, North Star served, remaining riskiest assumptions (becomes the analyst's research agenda), open questions, constraints, MDA framing, and a recommended feature slug + AREA.
   4. Update `discovery-state.md`: `status: complete`, `chosen_briefs: [<feature-slug>, ...]`, append a final hand-off note.
   5. **Only after the brief(s) are written**, recommend the next slash commands per surviving brief:

      ```
      /spec:start <recommended_feature_slug> [<AREA>]
      /spec:idea
      ```

      Note for the user: the analyst will read `chosen-brief.md` *and* the upstream phase artifacts as mandatory inputs to `idea.md`. The brief seeds the idea — it does not replace it.

   For `no-go` and `pivot` verdicts (steps 3 and 4), **stop after** their respective actions. Do not fall through to the `go` recommendations — there is no surviving concept to hand off.

## Don't

- Don't run handoff when the verdict is `no-go` or `pivot`. There is nothing to hand off.
- Don't open a feature folder yourself. The handoff command stops at `chosen-brief.md`; `/spec:start` opens `specs/<feature>/`.
- Don't merge multiple chosen concepts into one feature. One brief per feature, even if the briefs share infrastructure.
- Don't lose the sprint folder. `discovery/<slug>/` is preserved as historical context — Stage 11 (Retrospective) will read it.
