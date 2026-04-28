---
name: arc42-baseline
description: Drive an Arc42 + 12-Factor questionnaire to baseline architecture and operability decisions before /spec:design. Pre-fills from upstream, grills the user on TBDs, files ADRs for accepted key decisions, and produces specs/<slug>/arc42-questionnaire.md as canonical input for the architect's Part C — Architecture. Applicable to any software project — SaaS, on-premises, embedded, internal tool, or platform. Use during stage 4 (Design) on non-trivial features, when the user wants an Arc42 baseline, says "fill the questionnaire", "Arc42", "12-factor check", or whenever non-functional and operability decisions need to be locked before design proper.
argument-hint: [feature-slug]
---

# Arc42 baseline

A pre-design skill that turns the [Arc42](https://arc42.org) sections plus the [12-Factor App](https://12factor.net) self-assessment into a structured fill-in exercise. Applicable to **any** software system — Arc42 is a general architecture documentation standard, not SaaS-specific. Sibling to `design-twice`: where `design-twice` explores divergent module shapes, `arc42-baseline` locks the cross-cutting non-functional and operability decisions before Part C — Architecture is written.

The artifact is intentionally a **questionnaire**, not free-form prose — every section has a question, every answer becomes either a decision in `design.md`, an ADR in `docs/adr/`, or an open clarification in `workflow-state.md`. Sections that don't apply to the project type are marked `N/A` with a one-line reason, not silently skipped.

## When to invoke

Invoke when **any** of these is true:

- The feature introduces or meaningfully changes system architecture (deployment topology, data model, service boundaries, external integrations).
- Non-functional concerns (availability, scalability, security, performance, maintainability) are load-bearing for the design.
- The user explicitly asks for an Arc42 baseline, a 12-factor check, or "fill the questionnaire".
- The architect agent flags that Part C of the design template doesn't cover what the feature actually needs.
- The project type is anything architecture-significant: SaaS platform, on-premises system, embedded firmware, CLI tool with complex integration, internal back-office tool, or library with public API contracts.

## When not to invoke

- The work is a UI tweak, a copy fix, or a localized bug fix — Arc42 is overkill.
- An existing `arc42-questionnaire.md` already exists for the feature and is `answered` — re-running is busywork; use `/spec:clarify` against it instead.
- The feature is a pure additive change inside a domain whose Arc42 already lives in a sibling artifact (link, don't duplicate).

## Procedure

### Step 1 — Frame and pre-fill

Read upstream **before asking the user anything**. Many answers are already settled.

- `specs/<slug>/idea.md`, `research.md`, `requirements.md`
- `docs/steering/product.md`, `docs/steering/tech.md`, `docs/steering/operations.md`, `docs/steering/quality.md`
- `docs/CONTEXT.md`, `docs/glossary/*.md` (per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` if present)
- `docs/adr/` — existing decisions you must respect

Copy `templates/arc42-questionnaire-template.md` to `specs/<slug>/arc42-questionnaire.md` and pre-fill every cell you can from those sources. Leave `_TBD_` only where upstream is genuinely silent. Confirm with the user: "Pre-filled N of M sections from upstream. Walking the remainder now — one section at a time."

### Step 2 — Grill the TBDs in priority order

Use the `grill` skill semantics: one question per turn, always with a recommended answer, in this order. Stop at each section, write the user's answer in, and move on.

1. **§1.5 Business context** — deployment model (SaaS / on-prem / embedded / internal), expected scale, monetisation. This answer determines which later sections are `N/A`.
2. **§3.4 / §3.5 Deployment scope** — single-machine, single-region, multi-region, or offline; data residency constraints.
3. **§4.1 Architectural style** — the load-bearing structural decision.
4. **§4.3 Multi-tenancy strategy** — only for systems with multiple independent tenants; mark `N/A` and skip if not applicable.
5. **§4.2 Technology stack** — only the layers not already pinned by `docs/steering/tech.md`.
5. **§7 Deployment view** — environments, IaC, secrets, rollback.
6. **§8 Crosscutting** — auth, observability, error handling, data management.
7. **§10 Quality requirements** — SLOs, performance budgets, scalability targets.
8. **§11 Risks and intentional debt** — name three each, minimum.
9. **§12 Glossary** — only terms not already in `docs/glossary/`. Cross-link to the per-term file instead of duplicating. (Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` may also exist on older forks.)
10. **Part II — 12-Factor readiness** — mark each factor `Ready` / `Partial` / `Gap`. Every `Partial` or `Gap` becomes a §9.2 row or a §11.2 row.

When a question is fully answered upstream, **state the answer** and confirm with the user — don't ask blind. When the user picks a non-default, capture the rejected alternatives in the same cell so §9 doesn't lose the trade-off context.

### Step 3 — File ADRs for §9.1 Key decisions

For each row in §9.1 with status `proposed`, apply the `record-decision` criteria (see `.claude/skills/record-decision/SKILL.md` for the three qualifying criteria: irreversible, real trade-off, future-reader-surprising). If it qualifies, file the ADR:

1. Find the next free `NNNN` under `docs/adr/`.
2. Copy `templates/adr-template.md` to `docs/adr/NNNN-<imperative-slug>.md` and fill it in.
3. Replace `ADR-NNNN` in §9.1 with the real ID and flip status to `accepted` once the design gate passes (the architect does this in `/spec:design`, not you).
4. Add the ADR ID to the questionnaire frontmatter `adrs:` list.

If a row doesn't qualify (reversible, project-local), keep it inline in §9.1 only and note "inline — not ADR-worthy" in the rationale column.

### Step 4 — Reconcile open items

- Every remaining `_TBD_` becomes a numbered row in **§9.2 Open Decisions** with a leaning-toward and a blocker.
- Every `Partial` or `Gap` 12-factor cell becomes either a §9.2 row (decision needed) or a §11.2 row (intentional debt with a deadline).
- Append each open clarification to the active feature's `specs/<slug>/workflow-state.md` → **Open clarifications** section as `CLAR-NNN — <one-line summary>`.

### Step 5 — Hand off to /spec:design

1. Flip the questionnaire's frontmatter `status` from `draft` to `answered`.
2. Append a dated line to `specs/<slug>/workflow-state.md` → **Hand-off notes**:
   `YYYY-MM-DD (arc42-baseline): questionnaire answered. ADRs filed: ADR-NNNN, ADR-NNNN. Open clarifications: CLAR-NNN, CLAR-NNN.`
3. Tell the user: "Run `/spec:design` next. The architect will read `arc42-questionnaire.md` and inherit its decisions into `design.md` Part C."

The architect inside `/spec:design` reads `arc42-questionnaire.md` as canonical input for §5.x (building blocks), §6.x (runtime), §7.x (deployment), and §8.x (crosscutting). Do not duplicate those sections back into `design.md` — link from Part C to the questionnaire and capture only the **feature-specific** deltas in `design.md`.

## Reporting

When done, report:

- **Path** of the produced questionnaire.
- **N ADRs filed** with IDs and titles.
- **N open clarifications** carried into `workflow-state.md`.
- **12-factor readiness summary** — how many `Ready` / `Partial` / `Gap`.
- **Next step** — `/spec:design`.

Keep it under 10 lines.

## Rules

- One question per turn during Step 2. Never batch.
- Always state your recommended answer with one-sentence reasoning. The user should be able to say "yes do that" and move on.
- Don't invent constraints. If neither upstream nor the user has settled a question, mark `_TBD_` and carry it as a §9.2 open decision — don't guess.
- Don't write production code, design diagrams, or full ADR-worthy decisions outside §9.1. The architect owns Part C; you set its baseline.
- Don't modify `requirements.md`, `research.md`, or `idea.md`. If the questionnaire surfaces a requirements gap, escalate as a clarification — do not silently rewrite upstream.
- Don't introduce new frontmatter keys to `workflow-state.md`. Use the **Hand-off notes** and **Open clarifications** free-form sections only.
- ADR bodies are immutable from creation. If you write the wrong rationale, file a superseding ADR — don't edit.

## Do not

- Do not run after `/spec:design` — the architect has already locked Part C and re-running creates drift.
- Do not skip Step 4. A questionnaire with `_TBD_` cells and no §9.2 entries is not done; it is hidden tech debt.
- Do not duplicate domain glossary terms already in `docs/glossary/`. Link to the per-term file. (Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` may also exist on older forks.)
- Do not call `/adr:new` — slash commands are not invoked from inside skills. File ADRs directly via the procedure in Step 3.
