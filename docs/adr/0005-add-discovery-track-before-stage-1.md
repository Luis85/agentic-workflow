---
id: ADR-0005
title: Add a Discovery Track that precedes Stage 1 (Idea)
status: accepted
date: 2026-04-27
deciders: [repo-owner]
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [process, agents, discovery, design-sprint, game-design]
---

# ADR-0005 — Add a Discovery Track that precedes Stage 1 (Idea)

## Status

Accepted

## Context

The Spec Kit defined in [`docs/spec-kit.md`](../spec-kit.md) starts at **Stage 1 — Idea**, whose owning agent (`analyst`) reads a brief and structures it into `idea.md`. The brief itself is assumed to exist: there is no stage in the kit for *generating* a brief, *choosing between candidate concepts*, or *de-risking the riskiest assumption* before a feature folder is opened.

In practice, teams that adopt this kit are arriving with two different shapes of upstream work:

1. **A brief already exists** (a stakeholder request, a customer pain point already named) — Stage 1 is the right entry.
2. **A blank page** — the team has a strategic outcome (a North Star, an OKR, a market) and needs to *find* the right thing to build through divergent → convergent ideation, prototyping, and validation. Stage 1 cannot serve this case; the analyst would be inventing a single idea where the actual work is choosing among many.

Existing literature treats these as two distinct activities:

- The **Double Diamond** (Design Council, 2005) splits a project into two diamonds — *Discover / Define* and *Develop / Deliver* — with divergent then convergent thinking in each. The Spec Kit today only models the second diamond. ([Design Council — Framework for Innovation](https://www.designcouncil.org.uk/our-resources/framework-for-innovation/))
- The **Google Design Sprint** (Knapp et al., 2016; AJ&Smart's 4-day "2.0" variant, 2018) is a timeboxed first-diamond ritual: Map → Sketch → Decide → Prototype → Test, ending with evidence about whether a concept is worth pursuing. ([GV — The Design Sprint](https://www.gv.com/sprint/), [AJ&Smart — Design Sprint 2.0](https://ajsmart.com/design-sprint-2-0/))
- **Continuous Discovery** (Torres, *Continuous Discovery Habits*, 2021) and the **Opportunity Solution Tree** model the activity of converting an outcome into opportunities into solutions into experiments — a portfolio activity that is structurally upstream of "feature." ([Product Talk — Opportunity Solution Trees](https://www.producttalk.org/opportunity-solution-trees/))
- Game design adds a complementary lens: **MDA** (Hunicke, LeBlanc, Zubek, 2004) — Mechanics, Dynamics, Aesthetics — and **Schell's 100 Lenses** (Schell, *The Art of Game Design*, 2008) frame ideation around what experience the user actually has, which is exactly the gap that JTBD-only framing leaves. ([MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf), [Schell — Art of Game Design](https://schellgames.com/art-of-game-design))
- **Riskiest Assumption Test** (Higham, 2016) reframes the validation goal: don't build the smallest viable product, run the smallest test of the riskiest assumption first. ([Higham — The MVP is dead. Long live the RAT.](https://hackernoon.com/the-mvp-is-dead-long-live-the-rat-233d5d16ab02))

These are **portfolio-level**, **divergent-then-convergent**, and **multi-specialist** by their nature. None of them fit cleanly inside Stage 1 (which assumes one idea, one feature folder, one analyst). Wedging them into Stage 1 would violate **Article II — Separation of Concerns** and **Article VI — Agent Specialisation**.

This ADR records the introduction of a **Discovery Track** — a pre-workflow phase, parallel in shape to the operational-agents track established by [ADR-0004](0004-adopt-operational-agents-alongside-lifecycle-agents.md), that produces the input to `/spec:idea`.

## Decision

We adopt a **Discovery Track** as a sibling to the 11-stage lifecycle workflow:

- The track lives at the repo root under `discovery/<sprint-slug>/` (parallel to `specs/` and `agents/operational/`). One directory per sprint. Sprints are portfolio-level; a single sprint may produce multiple briefs that fan out into multiple `specs/<feature>/` folders, or zero briefs (a "no-go" outcome).
- The track is **5 phases**, mapping the Design Sprint cadence onto the Double Diamond's first diamond and the run-up to the second:

  | # | Phase | Diamond mapping | Sprint analog | Output artifact |
  |---|---|---|---|---|
  | 1 | Frame | Discover + Define | Mon (Map) | `frame.md` |
  | 2 | Diverge | Develop (divergent) | Tue (Sketch) | `divergence.md` |
  | 3 | Converge | Develop (convergent) | Wed (Decide) | `convergence.md` |
  | 4 | Prototype | Deliver (build) | Thu (Prototype) | `prototype.md` |
  | 5 | Validate | Deliver (test) | Fri (Test) | `validation.md` |
  | — | Handoff | — | — | `chosen-brief.md` (input to `/spec:idea`) |

- The track is **owned by 7 specialist agents** (six specialists + a facilitator), each scoped to a specific human role and toolset. The vision is that every team has an AI agent that can either *consult* the human specialist or *take over* if no specialist is available:

  | Agent | Human role it shadows | Methods |
  |---|---|---|
  | `facilitator` | Sprint facilitator / Decider proxy | Process, gating, sprint state |
  | `product-strategist` | PM / Strategist | Lean Canvas, JTBD, North Star, Opportunity Solution Tree |
  | `user-researcher` | UX Researcher | JTBD switch interviews, playtests, RAT design |
  | `game-designer` | Game / Experience Designer | MDA, Schell's lenses, core loops, motivation models (Bartle, SDT) |
  | `divergent-thinker` | Ideation lead / Creative | How-Might-We, Crazy 8s, SCAMPER, analogies |
  | `critic` | Devil's-advocate / Decider | Lightning Decision Jam, decision matrices, RAT prioritization |
  | `prototyper` | UX Designer / Prototyper | Storyboards, paper prototypes, lo-fi flows |

- Phase ownership is **facilitator-orchestrated** with 1–2 specialists consulted per phase, mirroring how Stage 4 (Design) sequences `ux-designer → ui-designer → architect`:

  | Phase | Owner | Consulted |
  |---|---|---|
  | Frame | facilitator | product-strategist, user-researcher |
  | Diverge | facilitator | divergent-thinker, game-designer |
  | Converge | facilitator | critic, product-strategist |
  | Prototype | facilitator | prototyper, game-designer |
  | Validate | facilitator | user-researcher, critic |

- Slash commands `/discovery:start`, `/discovery:frame`, `/discovery:diverge`, `/discovery:converge`, `/discovery:prototype`, `/discovery:validate`, `/discovery:handoff` are added under `.claude/commands/discovery/`. Conversational entry is the `discovery-sprint` skill.
- The track ends with `/discovery:handoff` writing `chosen-brief.md` and recommending `/spec:start <feature-slug>` followed by `/spec:idea`. The brief is the canonical input format for the analyst — it does not replace `idea.md`; it seeds it.
- A single sprint may produce **0, 1, or N** chosen briefs. "No-go" is a valid sprint outcome and is not a failure — it is exactly the value the track delivers.

## Considered options

### Option A — Expand Stage 1 (Idea) with sub-modes (rejected)

Add an optional "discovery" sub-mode to `/spec:idea` that runs HMW + Crazy 8s + game-design lenses then converges, all inside one feature folder.

- Pros: smallest delta; one workflow to learn; no new agents.
- Cons: violates **Article II — Separation of Concerns** (one stage, one purpose); conflates portfolio-level discovery with feature-level ideation; forces the analyst to wear five hats; "no-go" outcomes can't be modelled cleanly because the feature folder already exists; multi-specialist collaboration can't happen inside a single agent.

### Option B — A numbered Stage 0 inside `specs/<feature>/` (rejected)

Add a Stage 0 — Discovery — that ships inside the same `specs/<feature>/` folder as everything else.

- Pros: symmetric with the existing 11 stages; reuses `workflow-state.md`; reuses `/spec:*` namespace.
- Cons: at the discovery stage *there is no feature yet*. The folder name is a lie. Sprints that produce zero or multiple briefs cannot be modelled. The artifact set is large enough (frame, divergence, convergence, prototype, validation, brief) that mixing it with the implementation artifacts in one folder produces visual noise and ID collisions.

### Option C — Discovery Track as a sibling to lifecycle stages (chosen)

Add `discovery/<sprint-slug>/` at the repo root. New `/discovery:*` slash commands. Seven new agents. Handoff produces `chosen-brief.md` which becomes the brief that `/spec:idea` consumes.

- Pros: respects Article II — discovery and ideation are genuinely different concerns; respects Article VI — each new agent has a narrow scope and shadows a recognizable human role; matches reality (sprints are portfolio-level and timeboxed); cleanly produces `chosen-brief.md` as the input to Stage 1; can be skipped entirely when a brief already exists; supports 0/1/N chosen-brief outcomes.
- Cons: a parallel mini-workflow to learn; seven new agent files to maintain; sink layout grows a sibling tree.

## Consequences

### Positive

- Teams arriving with a blank page have an entry point that is structurally honest about what they're doing (exploring) instead of one that pretends they already know.
- Specialist agents shadow the human roles a team would assemble for a real design sprint, so when a human specialist *is* available, the agent is a research/notes/draft consult rather than a substitute; when one is *not* available, the agent can carry the role to a passing artifact.
- Game-design framing (MDA, lenses, motivation models) becomes available for product features, not just games — a known gap in software product discovery.
- "No-go" is a valid, recordable sprint outcome. Killing a bad idea early is the actual deliverable of discovery.
- Stage 1 (Idea) is unchanged. Existing features and existing teams that already have briefs proceed exactly as before.

### Negative

- A second top-level directory (`discovery/`) parallel to `specs/` is one more thing to learn, particularly for teams adopting this template.
- Seven new agents triples the discovery-side surface area. The contracts (frontmatter, scope, tool list) are documented but require maintenance.
- The template is now opinionated about a pre-stage that may not fit every team's culture. Mitigation: the track is **opt-in**. A team with a clear brief skips straight to `/spec:start` + `/spec:idea` and never opens `discovery/`.

### Neutral

- The `discovery/` directory sits at the repo root, parallel to `specs/` and to `agents/operational/`. The naming asymmetry (`specs/` for feature work, `discovery/` for portfolio work) is deliberate — these are different shapes of work.
- The Handoff phase is the *only* link between the two trees. Before handoff, no `specs/<slug>/` directory exists; after handoff, the chosen brief is copied into the analyst's reading list and the discovery folder is preserved as historical context.

## Compliance

How will we know this decision is being honoured?

- **The reviewer** (Stage 9) flags any `idea.md` that claims to descend from a discovery sprint but doesn't reference a `discovery/<sprint-slug>/chosen-brief.md` in its frontmatter `inputs:`.
- **The orchestrator** detects discovery sprints in progress (status `active` in `discovery-state.md`) and routes the conversation to the `discovery-sprint` skill, not to `/spec:start`.
- **The `record-decision` skill** treats any cross-stage shortcut between phases (e.g., diverge before frame) as a finding requiring an ADR to override.
- **The retrospective** (Stage 11) includes a discovery-track section when the feature originated from a sprint, capturing what worked / what didn't in the upstream phase too.

## References

- Constitution: [`memory/constitution.md`](../../memory/constitution.md) — Articles II (Separation of Concerns), III (Incremental Progression), VI (Agent Specialisation), VII (Human Oversight).
- [`docs/spec-kit.md`](../spec-kit.md) — the 11-stage workflow this track precedes.
- [`docs/discovery-track.md`](../discovery-track.md) — the full methodology, phase definitions, and source list.
- [ADR-0002](0002-adopt-spec-driven-development.md) — the meta-decision that artifacts precede code; this ADR extends it: discovery precedes artifacts.
- [ADR-0004](0004-adopt-operational-agents-alongside-lifecycle-agents.md) — the precedent for sibling agent classes outside the lifecycle table.

### External sources informing the design

- Design Council. *Framework for Innovation* (Double Diamond). [designcouncil.org.uk](https://www.designcouncil.org.uk/our-resources/framework-for-innovation/)
- Knapp, J., Zeratsky, J., Kowitz, B. *Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days*. 2016. [thesprintbook.com](https://www.thesprintbook.com/)
- AJ&Smart. *Design Sprint 2.0*. 2018. [ajsmart.com/design-sprint-2-0](https://ajsmart.com/design-sprint-2-0/)
- Hunicke, R., LeBlanc, M., Zubek, R. *MDA: A Formal Approach to Game Design and Game Research*. AAAI 2004. [users.cs.northwestern.edu/~hunicke/MDA.pdf](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- Schell, J. *The Art of Game Design: A Book of Lenses*. 3rd ed., 2019. [schellgames.com/art-of-game-design](https://schellgames.com/art-of-game-design)
- Christensen, C., Moesta, B. *Competing Against Luck* (Jobs to be Done). 2016.
- Ulwick, A. *Outcome-Driven Innovation*. [strategyn.com/jobs-to-be-done](https://strategyn.com/jobs-to-be-done/)
- Torres, T. *Continuous Discovery Habits*. 2021. [producttalk.org/opportunity-solution-trees](https://www.producttalk.org/opportunity-solution-trees/)
- Maurya, A. *Running Lean* (Lean Canvas). 2010. [leancanvas.com](https://leancanvas.com/)
- Higham, R. *The MVP is dead. Long live the RAT.* 2016. [hackernoon.com/the-mvp-is-dead-long-live-the-rat](https://hackernoon.com/the-mvp-is-dead-long-live-the-rat-233d5d16ab02)
- IDEO / Stanford d.school. *How Might We Questions*. [dschool.stanford.edu/tools/how-might-we-questions](https://dschool.stanford.edu/tools/how-might-we-questions)
- AJ&Smart. *Lightning Decision Jam*. [workshopper.com/lightning-decision-jam](https://www.workshopper.com/lightning-decision-jam)
- Bartle, R. *Hearts, Clubs, Diamonds, Spades: Players Who Suit MUDs*. 1996.
- Ryan, R., Rigby, S., Przybylski, A. *The Motivational Pull of Video Games: A Self-Determination Theory Approach*. 2006. [selfdeterminationtheory.org](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf)
- Ellis, S. *North Star Metric*. [growthmethod.com/the-north-star-metric](https://growthmethod.com/the-north-star-metric/)

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
