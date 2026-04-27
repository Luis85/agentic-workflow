---
id: ADR-0007
title: Add an opt-in Project Manager Track based on P3.Express
status: accepted
date: 2026-04-27
deciders: [repo-owner]
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [process, agents, project-management, p3express, service-provider]
---

# ADR-0007 — Add an opt-in Project Manager Track based on P3.Express

## Status

Accepted

## Context

The Spec Kit (Stages 1–11) and the Discovery Track (ADR-0005) together address the full software development lifecycle — from blank-page ideation through feature delivery. Both tracks are scoped to **product** concerns: what to build, how to build it, and whether it was built correctly.

Teams using this template in a **service-provider context** — i.e., building software for clients rather than for an internal product — have a set of concerns that neither track addresses:

- **Scope management**: what did we agree to deliver, and has that changed?
- **Stakeholder communication**: who needs to know what, how often, and in which format?
- **Schedule and budget tracking**: are we on track against the engagement contract?
- **Risk and issue management**: what could go wrong, and what is already going wrong?
- **Change control**: when the client asks for something new, how is that logged, assessed, and approved before work begins?
- **Project closure**: how is the engagement formally completed, and what lessons are captured?

These concerns are **cross-feature and cross-sprint**. A single client engagement may include multiple discoveries, multiple feature deliveries, and potentially multiple release cycles. The `orchestrator` and `workflow-state.md` operate at the feature level; there is no artifact or agent responsible for the *project* level.

### Why P3.Express

P3.Express (https://p3.express/) is a lightweight, process-oriented project management framework by Nader K. Rad and Frank Turley, released under Creative Commons. It organises project processes into three categories:

| Category | When it runs | Examples |
|---|---|---|
| **Transitional** | At project start, stage gates, closure | Initiation, Planning, Closure |
| **Periodic** | On a cadence (daily, weekly, monthly) | Status review, log updates |
| **Situational** | When triggered | Issue handling, change control, risk response |

P3.Express was chosen over heavier standards (PRINCE2, PMI PMBOK) because:

1. **Scale fit** — a single-agent PM that shadows one human is P3.Express-sized, not PMBOK-sized.
2. **Artifact minimalism** — the framework's outputs (charter, plan, risk register, issue log, change log, status report, closure) map cleanly to Markdown files and the existing repo sink layout.
3. **Process cadence** — the weekly review cycle maps well to sprint-style development; the daily log works as an append-only file.
4. **Open licence** — the framework is publicly documented and citable without a paywall.

### Why a new track (not an extension of Stage 3 or the orchestrator)

The existing `pm` agent (Stage 3) produces a requirements document. It does not manage schedules, stakeholders, budgets, or change control — and it should not. Article II (Separation of Concerns) forbids cross-stage shortcuts.

The `orchestrator` routes within a single feature lifecycle. It has no concept of a project that spans multiple features or multiple teams over months.

A dedicated **Project Manager Track** follows the established precedent (ADR-0004 for operational agents, ADR-0005 for the discovery track) of adding sibling tracks rather than expanding the scope of an existing stage or agent.

## Decision

We adopt a **Project Manager Track** as an opt-in sibling to the 11-stage lifecycle and the Discovery Track:

- The track lives at the repo root under **`projects/<project-slug>/`**, parallel to `specs/`, `discovery/`, and `agents/operational/`.
- A project corresponds to a **client engagement** or **delivery programme** — it is the container for one or more feature deliveries (`specs/<slug>/`), one or more discovery sprints (`discovery/<slug>/`), and the cross-cutting PM artefacts.
- The track has one agent: **`project-manager`** — scoped to project-level governance, stakeholder management, risk/issue/change tracking, and periodic reporting. It does not do feature implementation, architecture, or testing.
- The track's lifecycle maps directly to P3.Express and uses **four management documents** (the P3.Express minimal set):

  | Phase | P3.Express mapping | Entry command | Output artifacts |
  |---|---|---|---|
  | **Initiation** | Transitional — Group A | `/project:initiate` | `project-description.md`, `deliverables-map.md`, `followup-register.md` (seeded), `health-register.md` (seeded) |
  | **Weekly review** | Periodic — Groups C+D | `/project:weekly` | appended entry in `weekly-log.md`; updates to `followup-register.md` |
  | **Change request** | Situational — D01 | `/project:change` | appended entry in `followup-register.md` (type: change-request) |
  | **Issue / Risk** | Situational — D01 | inline in `/project:weekly` or direct | appended entry in `followup-register.md` (type: issue or risk) |
  | **Status report** | Periodic — on-demand | `/project:report` | `status-report.md` (replaces prior; one current report) |
  | **Closure** | Transitional — Group F | `/project:close` | `project-closure.md` |
  | **Post-project** | Group G (months later) | `/project:post` | appended section in `project-closure.md` |

  The P3.Express design decision: risks, issues, change requests, and lessons all share a **single Follow-Up Register** (`followup-register.md`). There are no separate `risk-register.md`, `issue-log.md`, or `change-log.md` files.

- The track is **opt-in**. Teams using the Spec Kit for internal product development and teams with a brief already established may skip it entirely. No existing workflow is affected.
- State lives in **`projects/<slug>/project-state.md`**, owned by `/project:*` commands.
- The project-manager agent carries a **`WebSearch` and `WebFetch`** tool because client-side research (market data, public company information, technology scouting) is a legitimate PM task in a service-provider context. All other lifecycle agents lack this tool.
- Feature work (`specs/<slug>/`) and discovery work (`discovery/<slug>/`) remain owned by their own agents. The `project-manager` **links to** but does not rewrite those artifacts.

### Slash commands

```
/project:start <slug>     — Bootstrap projects/<slug>/ and project-state.md
/project:initiate         — Charter + stakeholder register
/project:plan             — Project plan + risk register
/project:weekly           — Weekly review entry in weekly-log.md
/project:change           — Log and assess a change request in change-log.md
/project:report           — Generate/refresh current status-report.md
/project:close            — Project closure document
```

Conversational entry: the **`project-run`** skill (auto-triggers on "let's start a project" / "set up a client engagement").

## Considered options

### Option A — Extend the `pm` agent (Stage 3) with project-management duties (rejected)

- Pros: no new agent; one familiar entry point.
- Cons: violates Article II (Separation of Concerns) and Article VI (Agent Specialisation). Stage 3 produces requirements; it is not a coordination hub. The pm agent runs once per feature; a project manager runs for the project's duration. The tool lists are different (pm has no WebSearch/WebFetch).

### Option B — Add project management duties to the `orchestrator` (rejected)

- Pros: orchestrator already reads across features.
- Cons: orchestrator is a routing agent (Read, Grep only); giving it PM duties would require tool broadening. It is already responsible for intra-feature routing; cross-project concerns would make it a god object. Its scope is explicitly one workflow run at a time.

### Option C — Project Manager Track as a sibling (chosen)

- Pros: respects Article II and VI; follows the established ADR-0004/0005 pattern; clean artifact separation; enables service-provider teams to adopt incrementally; does not affect existing users.
- Cons: a third top-level track; one new agent; seven new commands; nine new templates. The repo surface area grows. Mitigation: the track is fully opt-in and documented in its own methodology file (`docs/project-track.md`).

## Consequences

### Positive

- Service-provider teams have a lightweight, process-driven PM layer that wraps existing feature and discovery work.
- P3.Express cadences (weekly review) pair well with sprint-based development, making the PM artefacts naturally up to date.
- The `project-manager` agent can carry the PM role when no human PM is assigned, or serve as a research/drafting assistant when one is.
- Existing lifecycle (Stages 1–11) and discovery workflows are unchanged.

### Negative

- A third top-level directory (`projects/`) grows the repo surface area.
- Teams must understand the distinction between a *project* (PM track) and a *feature* (spec track).
- The `project-manager` agent has broader tools than most lifecycle agents (WebSearch, WebFetch) — this broadening requires discipline to scope properly.

### Neutral

- The `project-manager` is a **single agent** (not a multi-specialist track like the discovery track). The PM role in P3.Express is an integrator, not a team of specialists. If a project becomes large enough to need a programme manager, a portfolio manager, or a business analyst, those would be separate ADRs.
- `projects/<slug>/` is the container. The linked `specs/<slug>/` directories remain under their own ownership; the PM track never writes to them.

## Compliance

- **The reviewer** (Stage 9) checks that any feature whose `workflow-state.md` references a project also has a corresponding `projects/<slug>/project-state.md`.
- **The `project-manager` agent** may not edit `specs/`, `discovery/`, or `.claude/` directories. It links but does not overwrite.
- **The retrospective** (Stage 11) includes a project-level section (status against charter scope, budget, schedule) when the feature is part of a project.

## References

- Constitution: [`memory/constitution.md`](../../memory/constitution.md) — Articles II, VI, IX.
- [ADR-0004](0004-adopt-operational-agents-alongside-lifecycle-agents.md) — precedent for sibling agent classes.
- [ADR-0005](0005-add-discovery-track-before-stage-1.md) — precedent for sibling tracks.
- [`docs/project-track.md`](../project-track.md) — full methodology, cadence definitions, and artifact descriptions.
- P3.Express: https://p3.express/ — Nader K. Rad & Frank Turley, CC-licensed project management framework.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
