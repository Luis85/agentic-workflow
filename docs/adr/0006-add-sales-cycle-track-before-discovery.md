---
id: ADR-0006
title: Add a Sales Cycle Track that precedes the Discovery Track and Stage 1
status: accepted
date: 2026-04-27
deciders: [repo-owner]
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [process, agents, sales, pre-sales, scoping, proposal, sow]
---

# ADR-0006 — Add a Sales Cycle Track that precedes the Discovery Track and Stage 1

## Status

Accepted

## Context

The Spec Kit workflow (Stages 1–11) and the Discovery Track (pre-Stage 1) both assume that the decision to build something has already been made and a project mandate exists. They are delivery-side workflows.

Service providers — development agencies, consulting firms, independent studios — face a structurally prior problem: **they first need to win the project**. Before a spec folder is opened, before a discovery sprint is run, a commercial process must happen:

1. A lead appears (inbound request, RFP, referral, outbound outreach).
2. The provider must decide whether the opportunity is worth pursuing.
3. If yes, they must understand the client's problem well enough to price it.
4. They must turn that understanding into a written offer (proposal or Statement of Work).
5. The client accepts, negotiates, or declines.
6. On acceptance, a project is kicked off and the delivery workflow begins.

This commercial cycle is absent from the kit. Teams currently handle it ad hoc, which produces inconsistent proposals, underestimated projects, scope creep rooted in under-specified offers, and missed handoffs from sales context into delivery context.

Industry practice is well-established:

- **BANT / MEDDIC / MEDDPIC** — qualification frameworks that prevent wasted effort on unwinnable or unprofitable deals. BANT (Budget, Authority, Need, Timeline; IBM, 1950s) and MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion; Jack Napoli, PTC, 1990s) are the canonical forms. ([Miller Heiman — MEDDIC](https://www.millerheiman.com/))
- **Scoping workshops** — structured pre-sales sessions that surface the client's real problem, not just their stated request, using facilitation techniques drawn from design thinking and discovery. The output is a bounded problem statement and a first-cut scope, not a full spec. ([Treloar — Scoping Software Projects](https://www.thoughtworks.com/insights/blog/how-scope-software-project))
- **Statement of Work (SOW)** — the contractual backbone of a fixed-price or time-and-materials project. A well-formed SOW covers: executive summary, solution overview, in-scope / out-of-scope work, deliverables, milestones, pricing, payment terms, assumptions and exclusions, change-control process, validity period. ([PMI — Statement of Work](https://www.pmi.org/learning/library/statement-of-work-sow-critical-first-step-8114))
- **Effort estimation** — structured decomposition of scope into work breakdown elements, with explicit uncertainty bands. Common techniques: three-point estimation (PERT), analogy-based estimation, planning poker for T-shaped teams. Risk multipliers (novelty, dependency, team familiarity) are applied before pricing. ([Cohn — *Agile Estimating and Planning*](https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning))
- **Pricing models** — fixed-price, time-and-materials (T&M), retainer, and hybrid (fixed discovery + T&M build). Model choice follows risk allocation: fixed-price transfers risk to the provider; T&M transfers it to the client; retainer is appropriate for ongoing, amorphous work. ([Weiss — *Value-Based Fees*](https://alanweiss.com/books/value-based-fees/))
- **Pre-sales to delivery handoff** — a documented transition that preserves the context built during sales (client vocabulary, pain points, non-negotiables, political landscape) and seeds the delivery workflow. Without it, delivery teams lose weeks re-discovering what the sales team already knew. ([Adaptive — Pre-Sales to Delivery Handoff](https://www.adaptivecatalyst.com/blog/how-to-hand-off-from-pre-sales-to-delivery))

None of these activities belong inside the Discovery Track (which is about concept exploration for a team that already has a mandate) or inside Stage 1 (which structures a brief that already exists). Adding them there would violate **Article II — Separation of Concerns**.

This ADR records the introduction of a **Sales Cycle Track** — a sibling pre-workflow that a service provider can run *before* a project is formally started.

## Decision

We adopt a **Sales Cycle Track** as a sibling to the Discovery Track and the 11-stage lifecycle workflow:

- The track lives at the repo root under `sales/<deal-slug>/` (parallel to `discovery/` and `specs/`). One directory per deal. A deal is a single commercial engagement with one client. A deal may spawn one or more feature workflows after the order is placed.
- The track is **5 phases** plus a bootstrap:

  | # | Phase | Key methods | Output artifact |
  |---|---|---|---|
  | — | Bootstrap | — | `deal-state.md` |
  | 1 | Qualify | BANT, MEDDIC, win-probability scoring | `qualification.md` |
  | 2 | Scope | Scoping workshop, impact mapping, problem framing | `scope.md` |
  | 3 | Estimate | WBS, three-point estimation, risk register, pricing model | `estimation.md` |
  | 4 | Propose | SOW / proposal writing, internal review | `proposal.md` |
  | 5 | Order | Acceptance, change log, project kickoff brief | `order.md` |

- The deal state machine:

  ```
  lead → qualifying → scoping → estimating → proposing → negotiating → ordered
                                                                      ↘ no-go
                                                                      ↘ on-hold
  ```

- The track is **owned by 4 specialist agents**, each scoped to a narrow commercial role:

  | Agent | Human role | Scope |
  |---|---|---|
  | `sales-qualifier` | Account executive / BD | Phases 1 — qualification only |
  | `scoping-facilitator` | Solutions architect / presales consultant | Phase 2 — scoping workshop facilitation |
  | `estimator` | Lead engineer / project manager | Phase 3 — effort, timeline, risk, pricing |
  | `proposal-writer` | Bid manager / account director | Phase 4 — proposal / SOW authoring + internal review |

  Phase 5 (Order) is owned by the `proposal-writer` with human sign-off (no autonomous agent closes a contract).

- Slash commands `/sales:start`, `/sales:qualify`, `/sales:scope`, `/sales:estimate`, `/sales:propose`, `/sales:order` are added under `.claude/commands/sales/`. Conversational entry is the `sales-cycle` skill.

- **The critical handoff**: `order.md` contains a **Project Kickoff Brief** section that seeds the downstream delivery workflow. On order confirmation the brief is read by the `orchestrate` skill (for a defined project) or the `discovery-sprint` skill (for a more exploratory mandate) to open a `specs/<slug>/` or `discovery/<sprint-slug>/` folder. This is the canonical link between the sales track and the delivery track.

- A deal may end at **any phase** with outcome `no-go` (provider declines to pursue) or `on-hold` (suspended pending new information). These are valid, recorded outcomes — not failures.

## Considered options

### Option A — Expand the Discovery Track to cover pre-sales (rejected)

Add qualification and scoping as extra phases inside the Discovery Track before Frame.

- Pros: one pre-delivery workflow to learn; reuses discovery state machine.
- Cons: violates Article II — commercial qualification (BANT/MEDDIC) is not the same concern as concept exploration (HMW/Crazy 8s); conflates "should we bid?" with "what should we build?"; forces the facilitator agent to wear an account executive hat; Discovery Track is opt-in for teams without a brief — pre-sales is opt-in for service providers, a different axis.

### Option B — A pre-Stage 0 inside `specs/<deal-slug>/` (rejected)

Add commercial phases as stages −2 and −1 inside the existing `specs/` folder structure.

- Pros: symmetric with existing 11 stages.
- Cons: at the sales stage *there is no feature yet* and there may never be one (no-go). Mixing commercial artifacts (pricing, client-identifiable data) with technical specs in one folder creates security and confidentiality concerns. A deal that spawns multiple features cannot be modelled.

### Option C — Sales Cycle Track as a sibling to discovery and lifecycle stages (chosen)

Add `sales/<deal-slug>/` at the repo root. New `/sales:*` slash commands. Four new agents. `order.md` hands off to `discovery/` or `specs/` via the Project Kickoff Brief.

- Pros: respects Article II — commercial phases are a distinct concern; respects Article VI — four agents with narrow commercial scopes; matches reality (a deal is a bounded commercial unit that may or may not result in a project); cleanly hands off context to the delivery workflow; can be skipped entirely by teams that already have a project mandate.
- Cons: a third sibling pre-stage workflow; four new agent files; sink layout grows a third sibling tree.

## Consequences

### Positive

- Service providers have a structured, agent-assisted workflow for the most commercially critical phase of a project — winning it.
- Scoping artifacts (`scope.md`) produced during pre-sales feed directly into `idea.md` and `requirements.md`, eliminating the "we already found this out during sales" syndrome.
- Estimation artifacts inform the project's budget constraint, which becomes a first-class input to design and architecture decisions.
- The "no-go" outcome is a valid, recorded result — preventing teams from wasting engineering effort on poorly-specified or unwinnable contracts.
- The Project Kickoff Brief in `order.md` is the single, canonical handoff from commercial to delivery teams, preserving client vocabulary, pain points, non-negotiables, and political context.

### Negative

- A third pre-delivery workflow to learn and maintain.
- The sales track is highly context-specific: pricing models, legal terms, and contract structures vary significantly by jurisdiction and business type. Templates are guidance, not law.
- Sensitive data (client names, pricing, contract terms) lives in `sales/` — teams must apply appropriate access controls (not handled by this kit).

### Neutral

- The `sales/` directory sits at the repo root, parallel to `discovery/` and `specs/`. The naming is deliberate: each directory represents a distinct phase of the engagement lifecycle (commercial → conceptual → delivery).
- The order is `sales/` → `discovery/` → `specs/`: a deal produces a kickoff brief; the brief seeds a discovery sprint or idea; the idea seeds a spec. Each tree can be entered independently when the upstream work has been done by other means.
- Existing teams with a project mandate skip the sales track entirely by going straight to `/discovery:start` or `/spec:start`.

## Compliance

How will we know this decision is being honoured?

- The `orchestrate` skill checks `sales/<deal-slug>/order.md` for a linked Project Kickoff Brief when a feature traces back to a commercial deal. Missing link is flagged as a finding.
- The `reviewer` (Stage 9) notes when `requirements.md` or `design.md` constraints reference budget/timeline that are absent from both `idea.md` and any linked `order.md` — a signal that commercial context was lost in handoff.
- The retrospective (Stage 11) includes a pre-sales section when the feature originated from a sales deal, capturing estimation accuracy, scope stability, and client communication quality.

## References

- Constitution: [`memory/constitution.md`](../../memory/constitution.md) — Articles II (Separation of Concerns), III (Incremental Progression), VI (Agent Specialisation), VII (Human Oversight), IX (Reversibility).
- [`docs/spec-kit.md`](../spec-kit.md) — the 11-stage delivery workflow this track precedes.
- [`docs/discovery-track.md`](../discovery-track.md) — the discovery track this track may feed into.
- [ADR-0005](0005-add-discovery-track-before-stage-1.md) — the precedent for a sibling pre-stage track.
- [ADR-0004](0004-adopt-operational-agents-alongside-lifecycle-agents.md) — the precedent for sibling agent classes outside the lifecycle table.

### External sources informing the design

- Napoli, J. *MEDDIC Sales Methodology*. PTC, 1990s. [meddic.com](https://meddic.com/)
- Miller, R., Heiman, S. *The New Strategic Selling*. 1985. [millerheiman.com](https://www.millerheiman.com/)
- PMI. *Statement of Work: A Critical First Step*. [pmi.org](https://www.pmi.org/learning/library/statement-of-work-sow-critical-first-step-8114)
- Cohn, M. *Agile Estimating and Planning*. 2005. [mountaingoatsoftware.com](https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning)
- Weiss, A. *Value-Based Fees*. 2002. [alanweiss.com](https://alanweiss.com/books/value-based-fees/)
- Rackham, N. *SPIN Selling*. 1988. McGraw-Hill.
- Treloar, G. *How to Scope a Software Project*. Thoughtworks. [thoughtworks.com](https://www.thoughtworks.com/insights/blog/how-scope-software-project)
- Ries, E. *The Lean Startup*. 2011. (for assumption-testing framing in early scoping)
- Schwaber, K., Sutherland, J. *The Scrum Guide*. 2020. (for iterative scoping and definition of ready)

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
