---
name: arc42-baseline
description: Drive an Arc42 + 12-Factor questionnaire to baseline architecture and operability decisions before /spec:design. Pre-fills from upstream, grills the user on TBDs, files ADRs for accepted key decisions, and produces specs/<slug>/arc42-questionnaire.md as canonical input for the architect's Part C — Architecture. Applicable to any software project — SaaS, on-premises, embedded, internal tool, or platform. Use during stage 4 (Design) on non-trivial features, when the user wants an Arc42 baseline, says "fill the questionnaire", "Arc42", "12-factor check", or whenever non-functional and operability decisions need to be locked before design proper.
argument-hint: [feature-slug]
---

# Arc42 baseline

Pre-design skill. Turn [Arc42](https://arc42.org) sections + [12-Factor App](https://12factor.net) self-assessment into structured fill-in. Works for **any** software — Arc42 general standard, not SaaS-only. Sibling to `design-twice`: `design-twice` explore divergent module shapes, `arc42-baseline` lock cross-cutting non-functional + operability decisions before Part C — Architecture written.

Artifact = **questionnaire**, not free prose. Every section has question, every answer becomes decision in `design.md`, ADR in `docs/adr/`, or open clarification in `workflow-state.md`. Sections not applicable marked `N/A` with one-line reason — never silently skip.

## When to invoke

Invoke when **any** true:

- Feature introduces or changes system architecture (deployment topology, data model, service boundaries, external integrations).
- Non-functional concerns (availability, scalability, security, performance, maintainability) load-bearing for design.
- User asks for Arc42 baseline, 12-factor check, or "fill the questionnaire".
- Architect agent flags Part C of design template doesn't cover what feature needs.
- Project type architecture-significant: SaaS, on-prem, embedded firmware, CLI tool with complex integration, internal back-office, or library with public API.

## When not to invoke

- Work = UI tweak, copy fix, localized bug fix. Arc42 overkill.
- `arc42-questionnaire.md` exists for feature, status `answered` — re-run = busywork. Use `/spec:clarify` against it instead.
- Pure additive change inside domain whose Arc42 lives in sibling artifact (link, don't duplicate).

## Procedure

### Step 1 — Frame and pre-fill

Read upstream **before asking user anything**. Many answers already settled.

- `specs/<slug>/idea.md`, `research.md`, `requirements.md`
- `docs/steering/product.md`, `docs/steering/tech.md`, `docs/steering/operations.md`, `docs/steering/quality.md`
- `docs/CONTEXT.md`, `docs/glossary/*.md` (per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` if present)
- `docs/adr/` — existing decisions you must respect

Copy `templates/arc42-questionnaire-template.md` to `specs/<slug>/arc42-questionnaire.md`. Pre-fill every cell from those sources. Leave `_TBD_` only where upstream silent. Confirm: "Pre-filled N of M sections from upstream. Walking remainder now — one section at a time."

### Step 2 — Grill the TBDs in priority order

Use `grill` skill semantics: one question per turn, always recommended answer, this order. Stop each section, write user's answer, move on.

1. **§1.5 Business context** — deployment model (SaaS / on-prem / embedded / internal), expected scale, monetisation. Determines which later sections `N/A`.
2. **§3.4 / §3.5 Deployment scope** — single-machine, single-region, multi-region, or offline; data residency constraints.
3. **§4.1 Architectural style** — load-bearing structural decision.
4. **§4.3 Multi-tenancy strategy** — only for systems with multiple independent tenants. Mark `N/A` and skip if not applicable.
5. **§4.2 Technology stack** — only layers not pinned by `docs/steering/tech.md`.
5. **§7 Deployment view** — environments, IaC, secrets, rollback.
6. **§8 Crosscutting** — auth, observability, error handling, data management.
7. **§10 Quality requirements** — SLOs, performance budgets, scalability targets.
8. **§11 Risks and intentional debt** — name three each, minimum.
9. **§12 Glossary** — only terms not in `docs/glossary/`. Cross-link to per-term file, don't duplicate. (Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` may exist on older forks.)
10. **Part II — 12-Factor readiness** — mark each factor `Ready` / `Partial` / `Gap`. Every `Partial` or `Gap` becomes §9.2 row or §11.2 row.

When question fully answered upstream, **state answer** and confirm — don't ask blind. When user picks non-default, capture rejected alternatives in same cell so §9 keeps trade-off context.

### Step 3 — File ADRs for §9.1 Key decisions

For each row in §9.1 with status `proposed`, apply `record-decision` criteria (see `.claude/skills/record-decision/SKILL.md` for three qualifying criteria: irreversible, real trade-off, future-reader-surprising). If qualifies, file ADR:

1. Find next free `NNNN` under `docs/adr/`.
2. Copy `templates/adr-template.md` to `docs/adr/NNNN-<imperative-slug>.md`, fill in.
3. Replace `ADR-NNNN` in §9.1 with real ID. Flip status to `accepted` once design gate passes (architect does in `/spec:design`, not you).
4. Add ADR ID to questionnaire frontmatter `adrs:` list.

Row doesn't qualify (reversible, project-local) → keep inline in §9.1, note "inline — not ADR-worthy" in rationale column.

### Step 4 — Reconcile open items

- Every remaining `_TBD_` → numbered row in **§9.2 Open Decisions** with leaning-toward + blocker.
- Every `Partial` or `Gap` 12-factor cell → §9.2 row (decision needed) or §11.2 row (intentional debt with deadline).
- Append each open clarification to active feature's `specs/<slug>/workflow-state.md` → **Open clarifications** section as `CLAR-NNN — <one-line summary>`.

### Step 5 — Hand off to /spec:design

1. Flip questionnaire frontmatter `status` from `draft` to `answered`.
2. Append dated line to `specs/<slug>/workflow-state.md` → **Hand-off notes**:
   `YYYY-MM-DD (arc42-baseline): questionnaire answered. ADRs filed: ADR-NNNN, ADR-NNNN. Open clarifications: CLAR-NNN, CLAR-NNN.`
3. Tell user: "Run `/spec:design` next. Architect reads `arc42-questionnaire.md` and inherits decisions into `design.md` Part C."

Architect in `/spec:design` reads `arc42-questionnaire.md` as canonical input for §5.x (building blocks), §6.x (runtime), §7.x (deployment), §8.x (crosscutting). Don't duplicate those back into `design.md` — link from Part C to questionnaire, capture only **feature-specific** deltas in `design.md`.

## Reporting

When done, report:

- **Path** of produced questionnaire.
- **N ADRs filed** with IDs and titles.
- **N open clarifications** carried into `workflow-state.md`.
- **12-factor readiness summary** — count `Ready` / `Partial` / `Gap`.
- **Next step** — `/spec:design`.

Under 10 lines.

## Rules

- One question per turn in Step 2. Never batch.
- Always state recommended answer with one-sentence reasoning. User should say "yes do that" and move on.
- Don't invent constraints. Neither upstream nor user settled question → mark `_TBD_`, carry as §9.2 open decision. Don't guess.
- Don't write production code, design diagrams, or full ADR-worthy decisions outside §9.1. Architect owns Part C; you set baseline.
- Don't modify `requirements.md`, `research.md`, or `idea.md`. Questionnaire surfaces requirements gap → escalate as clarification. No silent rewrite upstream.
- Don't add new frontmatter keys to `workflow-state.md`. Use **Hand-off notes** and **Open clarifications** free-form sections only.
- ADR bodies immutable from creation. Wrong rationale → file superseding ADR. Don't edit.

## Do not

- Do not run after `/spec:design` — architect locked Part C, re-run creates drift.
- Do not skip Step 4. Questionnaire with `_TBD_` cells and no §9.2 entries = hidden tech debt, not done.
- Do not duplicate domain glossary terms already in `docs/glossary/`. Link to per-term file. (Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md); legacy `docs/UBIQUITOUS_LANGUAGE.md` may exist on older forks.)
- Do not call `/adr:new` — slash commands not invoked from inside skills. File ADRs directly via Step 3.