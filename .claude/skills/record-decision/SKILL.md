---
name: record-decision
description: File ADR for irreversible decision. Wraps /adr:new with workflow guidance. Triggers "record a decision", "file an ADR".
argument-hint: <one-line decision title>
---

# Record decision (ADR)

ADRs are for **decisions you'd regret silently changing later**. Not every choice deserves one. After Nygard's ADR pattern, Pocock's `domain-model`/`improve-codebase-architecture` ADR discipline, and our own `templates/adr-template.md`.

## When to file an ADR

File an ADR when **all three** are true:

1. The decision is **hard to reverse** — undoing it costs days or weeks of rework, or breaks public contracts.
2. It is the result of a **real trade-off** — there are at least two reasonable alternatives, and the choice is non-obvious without context.
3. Future readers will be **surprised** without it — they'd ask "why did they do it this way?"

Examples that qualify:
- Choosing event sourcing over CRUD.
- Adopting a particular framework with deep API coupling.
- Picking a deployment topology (monolith vs. microservices).
- Mandating a notation (e.g. ADR 0003 — adopting EARS).

Examples that don't qualify:
- Choice of variable name.
- Local refactor.
- Anything fully reversible in <1 day.
- Anything obvious from the spec.

## When NOT to file an ADR

- The decision is implicit in the constitution or steering files. Cite those instead.
- It's a stage artifact (PRD, design, spec). Those *are* the decision record for what to build; ADRs are for *how*.
- The decision is project-specific to one feature. Document it inline in `specs/<slug>/design.md`.
- You're tempted to ADR every choice. ADR fatigue dilutes the signal — the seed ADRs (0001–0003) set the bar.

## Procedure

1. **Confirm the decision is ADR-worthy** against the three criteria above. If two of three fail, decline and recommend inline documentation.
2. **Pick the next ADR number** — find the highest number under `docs/adr/` and add 1, zero-padded to 4 digits.
3. **Invoke `/adr:new "<title>"`**. The slash command scaffolds `docs/adr/NNNN-<slug>.md` from `templates/adr-template.md`.
4. **Fill the ADR** with:
   - **Status**: Proposed → Accepted (after gate) → Superseded (later).
   - **Context**: what forces are at play. Cite upstream artifacts (`specs/<slug>/design.md`, `docs/CONTEXT.md`).
   - **Decision**: what we're doing. One paragraph.
   - **Alternatives considered**: at least two real alternatives with one-paragraph trade-off each.
   - **Consequences**: positive, negative, and neutral. The negative ones are the load-bearing part.
5. **Link back** — append a dated line to the `## Hand-off notes` free-form section of `specs/<slug>/workflow-state.md` recording the ADR path (e.g. `2026-04-26 (architect): filed ADR-0007 — adopt event sourcing for billing`), and add the ADR path to the active stage artifact's "Decisions" section. Do not introduce an `adrs:` frontmatter key — the workflow-state schema is fixed.

## After filing

- Notify the orchestrator that an ADR was filed; the orchestrator records the ADR path as a dated line in the `## Hand-off notes` section of `workflow-state.md` (no schema fields are added).
- **ADR bodies are immutable from creation** (per ADR-0001: "ADRs are immutable. Changes are made by superseding, not editing."). Only the YAML `status` field (`proposed` → `accepted` → `deprecated` → `superseded by ADR-NNNN`, all lowercase per `templates/adr-template.md`) and the `superseded-by` / `supersedes` pointers may change after the file is written. Rationale, context, decision text, alternatives, and consequences are frozen.
- The status flips from `proposed` to `accepted` once the stage's quality gate passes — this is a status-only edit (the prose `## Status` heading in the body may be capitalized for readability, but the YAML enum value is lowercase).
- To change the **decision** (not just status), file a **new** ADR with status `accepted`, populate its `supersedes:` list with the old ADR's ID, and update the old ADR's `superseded-by:` list and YAML `status` to `superseded by ADR-NNNN`. Do not edit the old ADR's body — its frozen rationale is exactly the audit trail future readers need.
- If you discover an error in a `proposed` ADR before it's accepted (typo, wrong link, unclear sentence), the correction path is the same: supersede it. The cost of one extra ADR file is much lower than the cost of an editable audit trail.

## Boundaries — who should file an ADR

ADRs are auto-discoverable, but the *right* agent to file one depends on the decision domain:

- **`architect`** — architectural choices (data flow, deployment topology, framework lock-in, event vs. CRUD). The default ADR author.
- **`pm`** — process or product-shape decisions that bind the kit (e.g., adopting EARS, mandating retros).
- **`release-manager`** — versioning, release-cadence, rollback-policy decisions.
- **`sre`** — operational guarantees that constrain design (SLOs, observability contracts).

Other agents (`analyst`, `ux-designer`, `ui-designer`, `dev`, `qa`, `reviewer`, `retrospective`) **flag** decisions that need an ADR rather than filing directly. The flag goes to the orchestrator (or to the appropriate decision-owning agent), which then dispatches `record-decision` with the right author. This preserves the v0.1 agent scoping discipline.

## Rules

- Keep ADRs ≤ one page. If you need more, you're explaining how, not what.
- Use **plain language**. ADRs are read by future humans (and agents) who don't have context.
- Cite specific upstream artifacts. Don't restate them.
- Always include rejected alternatives. Without them, the ADR has no evidence of trade-off.
