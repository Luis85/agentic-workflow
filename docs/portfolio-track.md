# Portfolio Track — P5 Express Portfolio Management

**Version:** 0.1 · **Status:** Draft · **Stability:** Opt-in · **ADR:** [ADR-0009](adr/0009-add-portfolio-manager-role.md)

An opt-in management track for organisations running **multiple parallel features** or acting as **service providers** managing portfolios on behalf of clients. It operates above the Specorator 11-stage lifecycle — one portfolio manages many features — and produces the five management documents defined by [P5 Express](https://p5.express/).

> If you are managing a single feature, **skip this track** and go straight to `/spec:start`.

## Table of contents

1. [Why a Portfolio Track](#1-why-a-portfolio-track)
2. [Where it lives](#2-where-it-lives)
3. [The three cycles](#3-the-three-cycles)
4. [The five documents](#4-the-five-documents)
5. [Roles](#5-roles)
6. [Quality gates](#6-quality-gates)
7. [Connecting to the Specorator](#7-connecting-to-the-specorator)
8. [Sources and further reading](#8-sources-and-further-reading)

---

## 1. Why a Portfolio Track

The Specorator's eleven stages assume a single feature in flight. Once you're managing **multiple features in parallel** — for your own product, for clients, or across business units — you need a second level of management that looks across the whole portfolio rather than inside any one feature.

The Portfolio Track applies when:

- You are a **service provider** and each client engagement is a Specorator feature running in parallel with others.
- Your organisation has a **portfolio manager role** (or equivalent) responsible for value delivery across multiple features or programs.
- You need to answer questions like: "Which projects should we stop? Which should we accelerate? Where are resources contended across projects?"
- You need to produce **stakeholder communications** summarising overall portfolio health on a regular cadence.

It does **not** apply when:

- You have one feature in flight — go straight to `/spec:start` + `/spec:idea`.
- Portfolio management is handled externally (Jira, ProductPlan, etc.) and the repo only tracks implementation — the portfolio artifacts would duplicate rather than add.
- Your organisation has no portfolio manager role or equivalent — Portfolio Sponsor authority (see §5) cannot be implicit.

The track is opinionated about three things:

1. **Cadence-driven.** Strategic decisions (stop/start/pivot) belong to a 6-monthly review cycle; progress signals belong to a monthly review cycle; operational decisions (resource balance, follow-ups) belong to a daily cycle. Mixing cadences produces noise.
2. **Surfaces, never decides.** The `portfolio-manager` agent surfaces data and proposes options; the **Portfolio Sponsor** (always human) makes stop/start/pivot decisions. This enforces Article VII of the constitution (Human Oversight).
3. **Read-only on the Specorator side.** The portfolio track reads `specs/*/workflow-state.md` and other spec artifacts for health signals, but never modifies them. The boundary is hard by design (agent tool scope).

---

## 2. Where it lives

Each portfolio is a directory under `portfolio/<portfolio-slug>/` at the repo root. This is **parallel** to `specs/` (feature folders) and `discovery/` (ideation sprints).

```
portfolio/
└── <portfolio-slug>/
    ├── portfolio-state.md          # cycle state machine, owned by /portfolio:* commands
    ├── portfolio-definition.md     # Doc 1 — scope, projects, governance, resources
    ├── portfolio-roadmap.md        # Doc 2 — 6-monthly strategy (X cycle)
    ├── portfolio-progress.md       # Doc 3 — monthly health snapshot (Y cycle)
    ├── portfolio-improvements.md   # Doc 4 — monthly improvement plan (Y cycle)
    └── portfolio-log.md            # Doc 5 — daily operations log (Z cycle, append-only)
```

Multiple portfolios may coexist (`portfolio/client-a/`, `portfolio/client-b/`). The `portfolio-track` skill detects them all; you pick which to manage each session.

---

## 3. The three cycles

P5 Express defines three nested management cycles. Each has its own cadence, its own activities, and its own output documents.

### X Cycle — 6-Monthly Strategic Review

**Cadence:** Every 6 months (guard: warn if < 90 days since last X).
**Command:** `/portfolio:x <portfolio-slug>`
**Output:** `portfolio-roadmap.md` (updated)

| Activity | Name | What happens |
|---|---|---|
| X1 | Evaluate generated value | Collect health signals from all `specs/*/workflow-state.md` files; compute value delivered vs. investment |
| X2 | Optimise value generation strategy | Re-prioritise; update roadmap with strategic priorities, investment allocation, and stop/start proposals |
| X3 | Focused communication | Append a one-page executive summary to `portfolio-roadmap.md` ready for stakeholder distribution |

### Y Cycle — Monthly Tactical Review

**Cadence:** Every month (due when `last_y` is null or ≥ 30 days ago).
**Command:** `/portfolio:y <portfolio-slug>`
**Output:** `portfolio-progress.md` (new), `portfolio-improvements.md` (new or updated)

| Activity | Name | What happens |
|---|---|---|
| Y1 | Evaluate stakeholder satisfaction | Assign 🟢/🟡/🔴 satisfaction signal per project; cite source artifact (`retrospective.md`, `review.md`, `release-notes.md`) |
| Y2 | Evaluate ongoing programs/projects | Assign RAG health per project from `workflow-state.md` status and `last_updated` age |
| Y3 | Plan improvements | Write improvement actions for each 🟡/🔴 project; carry over open actions from previous period |
| Y4 | Focused communication | Compile `portfolio-progress.md` and `portfolio-improvements.md` as publishable documents |

### Z Cycle — Daily Operations

**Cadence:** Daily or as decisions arise (no minimum guard).
**Command:** `/portfolio:z <portfolio-slug> [decisions]`
**Output:** `portfolio-log.md` (appended), `portfolio-definition.md` (updated for Z2 decisions)

| Activity | Name | What happens |
|---|---|---|
| Z1 | Manage follow-up items | Review open items from last log entry; mark resolved, open, or overdue |
| Z2 | Start, stop, or pause programs/projects | Apply decisions passed as arguments to `portfolio-definition.md` status |
| Z3 | Balance resources | Flag resource contention across Active projects; propose reallocation options |

---

## 4. The five documents

The five management documents map 1:1 to P5 Express's document model.

| # | Document | Produced by | Cadence | Template |
|---|---|---|---|---|
| 1 | `portfolio-definition.md` | `/portfolio:start`, Z cycle (Z2) | Ongoing | `templates/portfolio-definition-template.md` |
| 2 | `portfolio-roadmap.md` | X cycle (X2, X3) | 6-monthly | `templates/portfolio-roadmap-template.md` |
| 3 | `portfolio-progress.md` | Y cycle (Y4) | Monthly | `templates/portfolio-progress-template.md` |
| 4 | `portfolio-improvements.md` | Y cycle (Y3, Y4) | Monthly | `templates/portfolio-improvements-template.md` |
| 5 | `portfolio-log.md` | Z cycle (Z3) | Daily, append-only | `templates/portfolio-log-template.md` |

**Ownership rules:**
- `portfolio-state.md` is owned by `/portfolio:*` commands. No agent edits it outside a cycle run.
- `portfolio-definition.md` is primarily owned by `/portfolio:start` and the Z cycle. X and Y cycles read it but do not rewrite it (except the Z2 status changes).
- `portfolio-log.md` is strictly **append-only**. The Z cycle adds entries; no earlier entry is ever edited or deleted.
- `portfolio-progress.md` and `portfolio-improvements.md` are **replaced** each Y cycle (not appended). Previous versions are preserved only in git history.
- `portfolio-roadmap.md` is **updated in place** by each X cycle (new sections appended to the executive summary history; strategic sections overwritten with the latest view).

---

## 5. Roles

P5 Express defines two roles. Both are required; the track does not function with only one.

### Portfolio Sponsor (human, always)

- Owns **intent**: what the portfolio is for and why.
- Owns **strategic decisions**: which projects start, stop, pivot, or receive more investment.
- Owns **acceptance**: declares a cycle's outputs fit for distribution.
- Receives the X3 and Y4 communications.
- Cannot be delegated to an agent.

### Portfolio Manager (agent: `portfolio-manager`)

- Owns **day-to-day operations**: cycle runs, artifact production, health signal collection.
- Owns **surfacing**: brings data and options to the Sponsor; does not decide.
- Owns **tactical authority**: resource re-allocation within an agreed envelope (Z cycle).
- Never makes stop/start/pivot decisions — these always require Sponsor approval.

> The `portfolio-manager` agent (`.claude/agents/portfolio-manager.md`) implements this role. Its tool scope (`Read, Edit, Write, Grep`) enforces the boundary: no `Bash` means no file system mutations outside the agent's own write paths, and no direct spec artifact modification.

---

## 6. Quality gates

Each cycle produces documents that must meet these criteria before the cycle is marked complete.

### X Cycle gate (before marking `roadmap: complete`)

- [ ] All projects in `portfolio-definition.md` have a value signal in X1 with a cited source artifact and date.
- [ ] `portfolio-roadmap.md` lists at least one value objective, one strategic priority, and one investment allocation row.
- [ ] Stop/start proposals are listed with rationale — not left implicit.
- [ ] Executive summary (X3) fits on one page and states at least one decision required from the Sponsor.

### Y Cycle gate (before marking `progress: complete`, `improvements: complete`)

- [ ] Every Active project has a satisfaction signal (Y1) with a cited source artifact.
- [ ] Every Active project has a RAG health assignment (Y2) with a cited `workflow-state.md` date.
- [ ] Every 🟡 or 🔴 project has at least one improvement action in `portfolio-improvements.md` (Y3).
- [ ] Carry-overs from the previous `portfolio-improvements.md` are explicitly listed with updated status.
- [ ] `portfolio-progress.md` "Decisions required from Sponsor" is populated (or explicitly states "None").

### Z Cycle gate (before updating `last_z`)

- [ ] Z1 review covers all open items from the previous log entry — none silently dropped.
- [ ] Z2 applies only decisions explicitly passed as arguments — no inferred decisions.
- [ ] New log entry appended to `portfolio-log.md`; no previous entry edited.
- [ ] `portfolio-definition.md` Change log updated for any Z2 status changes.

---

## 7. Connecting to the Specorator

The portfolio track and the Specorator are **parallel, non-overlapping layers**.

```
Portfolio Track (portfolio/<slug>/)
    ↕ reads only (health signals)
Specorator (specs/<feature-slug>/)
    ↕ reads only (brief from chosen-brief.md, optional)
Discovery Track (discovery/<sprint-slug>/)
```

**Information flows:**

| From | To | What |
|---|---|---|
| `specs/*/workflow-state.md` | Portfolio Y and X cycles | Project health (stage, status, last_updated) |
| `specs/*/retrospective.md` | Portfolio Y cycle (Y1) | Stakeholder satisfaction signal |
| `specs/*/review.md` | Portfolio Y cycle (Y1) | Review verdict as satisfaction signal |
| `specs/*/release-notes.md` | Portfolio X cycle (X1), Y cycle (Y1) | Value delivered signal |
| `portfolio-definition.md` | Human / Portfolio Sponsor | Stop/start decisions that humans then execute via `/spec:start` or by pausing a spec workflow |

**The portfolio track does not create spec folders.** When a stop/start decision results in starting a new feature, the human (or Portfolio Sponsor) runs `/spec:start <slug>` and adds the new slug to `portfolio-definition.md` via the next Z cycle.

---

## 8. Sources and further reading

- [P5 Express](https://p5.express/) — the source methodology. Free, open, Creative Commons Attribution.
- [P5 Express manual](https://p5.express/manual/) — cycle activities (X1/X2/X3, Y1–Y4, Z1–Z3) and document definitions.
- [ADR-0009](adr/0009-add-portfolio-manager-role.md) — the decision record for adding this track.
- [ADR-0005](adr/0005-add-discovery-track-before-stage-1.md) — the Discovery Track ADR (same opt-in parallel-track pattern).
- `docs/specorator.md` — the Specorator 11-stage lifecycle that the portfolio track sits above.
- `docs/sink.md` — where all artifacts (including `portfolio/`) live in the repo.
