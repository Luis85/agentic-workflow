---
description: Portfolio Track — Bootstrap. Scaffold a new portfolio folder under portfolio/<slug>/ with portfolio-state.md and portfolio-definition.md initialised.
argument-hint: <portfolio-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /portfolio:start

Bootstrap a new P5 Express portfolio. Read [`docs/portfolio-track.md`](../../../docs/portfolio-track.md) for the full methodology.

## Inputs

- `$1` — portfolio slug (kebab-case, ≤ 6 words, required). Name the **portfolio scope**, not a specific project.
  - Good: `platform-portfolio`, `client-services-q1`, `internal-tools-portfolio`
  - Bad: `auth-feature`, `payments-redesign` (those are Specorator feature slugs)

## Procedure

1. If `$1` is missing, ask the user for a slug. If they provide a project-level name, push back and propose a scope-level name.
2. If `portfolio/$1/` already exists, stop: inform the user and suggest running the `portfolio-track` skill instead.
3. Ask (single prompt, batch both questions):
   - **Portfolio Sponsor name/role** — the human who owns strategic decisions (required by P5 Express).
   - **Initial projects** — list of feature slugs from `specs/` to include at bootstrap (optional; can be added later via `/portfolio:z`).
4. Create directory: `mkdir -p portfolio/$1`.
5. Copy [`templates/portfolio-state-template.md`](../../../templates/portfolio-state-template.md) to `portfolio/$1/portfolio-state.md`. Fill in:
   - `portfolio: $1`
   - `status: active`
   - `last_updated: <today>`
   - `last_agent: portfolio-manager`
   - All document statuses: `definition: complete`, others `pending`.
   - Portfolio name and Sponsor in the markdown body.
6. Copy [`templates/portfolio-definition-template.md`](../../../templates/portfolio-definition-template.md) to `portfolio/$1/portfolio-definition.md`. Fill in:
   - `portfolio: $1`, `date: <today>`, `sponsor: <from step 3>`.
   - Add one row per project named in step 3 (Status: `Active`, Stage from `specs/<slug>/workflow-state.md` if readable).
7. Print a summary:
   - Path created: `portfolio/$1/`
   - Documents initialised: `portfolio-state.md`, `portfolio-definition.md`
   - Recommended next steps:
     - `/portfolio:y` — run the first monthly review (Y cycle) to assess current project health.
     - `/portfolio:x` — run the 6-monthly strategic review when ready to set the roadmap.
     - `/portfolio:z` — run daily operations to apply any immediate start/stop decisions.

## Don't

- Don't create cycle artifact files (`portfolio-roadmap.md`, `portfolio-progress.md`, etc.) — they're created by their own cycle commands.
- Don't push or commit — leave that to the user.
- Don't populate the Projects table with specs not explicitly named by the user — the Portfolio Sponsor controls what enters the portfolio.
