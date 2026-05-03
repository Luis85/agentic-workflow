---
title: "Specorator — Product Brief"
description: "Baseline product reference for stakeholders, shareholders, and adopters."
version: "0.5.1"
updated: "2026-05-03"
---

# Specorator — Product Brief

**v0.5.1 · open-source · MIT license**

---

## For Stakeholders

### What Specorator Is

Specorator is an open-source workflow template for building software with AI agents. It enforces a spec-first discipline: humans decide what to build and why; specialist agents handle how; every requirement, decision, task, test, and release note stays traceable in plain Markdown files.

### The Problem

Most AI coding assistants jump straight to implementation. They produce code quickly, but they also bake in unclear requirements, missing decisions, and late-stage rework. The result is fast output with slow delivery — because what was written is rarely what was meant.

### How It Works

Specorator structures software delivery into 11 sequential stages — from Idea to Retrospective — each producing one artifact, owned by one specialist agent, and exiting through a quality gate. Nothing reaches code until requirements, design, and a specification exist. Every output links back to its inputs through stable IDs (`REQ-*`, `T-*`, `TEST-*`, `ADR-*`), so the full chain from a business requirement to a test result is always verifiable. Optional tracks extend the core for pre-sales, discovery, roadmaps, quality assurance, and more — without changing the lifecycle for teams that don't need them.

### Who It's For

| Persona | Core need |
|---|---|
| **Solo builder** | Disciplined path from idea to shipped feature without managing a full team |
| **Product or engineering team** | AI-assisted delivery that preserves product intent, reviewability, and handoffs across roles |
| **Service provider or agency** | Repeatable discovery, scoping, delivery, QA, and release records for client work |
| **Enterprise evaluator** | Evidence of governance, auditability, security posture, and reversibility before adopting agentic workflows |
| **Brownfield maintainer** | Inventory an existing system and introduce one traceable feature without a rewrite |

### Feature Map

**Core lifecycle**
- 11 stages from Idea to Retrospective, each with a defined artifact, owner, and quality gate
- Spec-driven: code is an artifact of the spec, not the starting point
- EARS-formatted functional requirements that map 1:1 to tests
- Stable traceability IDs across requirements, tasks, code, and tests
- Architecture Decision Records (ADRs) for irreversible decisions
- Mandatory retrospective — even on clean ships

**Companion tracks (opt-in)**
- **Discovery Track** — 5-phase ideation sprint for blank-slate projects
- **Project Scaffolding** — onboard existing docs/folders as starter artifacts
- **Sales Cycle** — qualify, scope, estimate, and propose for client engagements
- **Project Manager Track** — client-engagement governance (P3.Express)
- **Roadmap Management** — outcome-led roadmaps, stakeholder alignment, communication logs
- **Portfolio Track** — multi-feature program management (P5 Express)
- **Quality Assurance Track** — ISO 9001-aligned readiness reviews and improvement plans
- **Project Review** — evidence-backed history review → tracked improvement PR
- **Design Track** — brand-aware surface creation (Frame → Sketch → Mock → Handoff)
- **Issue Breakdown** — decompose a GitHub issue into vertical-slice draft PRs

**Automation and tooling**
- `npm run verify` as the single local and CI confidence gate
- Slash commands for every lifecycle stage and companion track
- Operational bots: PR review, docs review, plan reconciliation, dependency triage, actions bump
- GitHub Actions: verify, gitleaks, typos, zizmor security scan, GitHub Pages deploy, release publish

**Distribution**
- GitHub repository (`Luis85/agentic-workflow`) — fork or clone to adopt
- GitHub Package (`@luis85/agentic-workflow`) — install via npm
- GitHub Release — source archive + tarball asset per version
- Ships as a fresh-surface starter: empty intake folders, stub docs, no pre-baked ADRs

### Current Status

**v0.5.1** — recovery release for v0.5. No behavioral changes; republishes the GitHub Release page after the Immutable Releases incident. v0.5.0 shipped the release workflow, GitHub Release and Package distribution, and the fresh-surface package contract.

Active development is on **v0.6**, targeting cross-tool adapters, a live proof, hooks, and security hardening.

### Roadmap

| Version | Status | Focus |
|---|---|---|
| v0.5.1 | Done | Recovery release — republished GitHub Release page |
| v0.6 | Active | Cross-tool adapters, live proof, hooks, security |
| v1.0 | Planned | Release readiness checklist and v1.0 taxonomy lock |

---

## For Adopters

### Entry Points By Role

| You are | Start here | Outcome |
|---|---|---|
| **Product manager or designer** | Say "let's start a feature" or "let's run a design sprint" in Claude Code | `idea.md`, research notes, and `requirements.md` that engineering can review |
| **Developer** | Read `specs/<feature>/workflow-state.md`, then say "continue this feature" | Next stage runs from the existing artifact state |
| **Team lead** | Fork the repo, adapt `memory/constitution.md`, fill `docs/steering/` | Project-local workflow with explicit quality gates |
| **Solo builder** | Say "drive this end-to-end: `<idea>`" in Claude Code | Orchestrator walks all 11 stages with you |
| **Non-Claude user** | Open your tool guide under `docs/cross-tool/` | Manual stage execution using the same Markdown artifacts |

**5-minute quick start:**
```bash
git clone https://github.com/Luis85/agentic-workflow.git my-project
cd my-project && npm install && npm run verify
claude
```
Then say: `let's start a feature: user login with email and password`

### The 11 Lifecycle Stages

| # | Stage | Output artifact | Owner |
|---|---|---|---|
| 1 | Idea | `idea.md` | Analyst |
| 2 | Research | `research.md` | Analyst |
| 3 | Requirements | `requirements.md` | PM |
| 4 | Design | `design.md` + ADRs | UX + UI + Architect |
| 5 | Specification | `spec.md` | Architect |
| 6 | Tasks | `tasks.md` | Planner |
| 7 | Implementation | code + `implementation-log.md` | Dev |
| 8 | Testing | `test-plan.md`, `test-report.md` | QA |
| 9 | Review | `review.md`, `traceability.md` | Reviewer |
| 10 | Release | `release-notes.md` | Release Manager |
| 11 | Learning | `retrospective.md` | Retrospective |

All artifacts land in `specs/<feature-slug>/`. State lives in `specs/<feature>/workflow-state.md`.

Optional gates: `/spec:clarify` (interrogate active artifact) · `/spec:analyze` (cross-artifact consistency check)

### Companion Tracks

| Track | When to use | Entry command | Key output |
|---|---|---|---|
| Discovery | No brief exists yet — blank slate | `/discovery:start <slug>` | `chosen-brief.md` |
| Project Scaffolding | Existing docs/folders, no canonical artifacts yet | `/scaffold:start <slug> <source>` | `starter-pack.md`, `handoff.md` |
| Sales Cycle | Service provider / agency pre-contract work | `/sales:start` | `qualification.md` → `order.md` |
| Project Manager | Client-engagement governance | `/project:start` | `project-description.md`, status reports |
| Roadmap Management | Outcome roadmap, stakeholder alignment, comms | `/roadmap:start <slug>` | `roadmap-board.md`, `delivery-plan.md` |
| Portfolio | Multi-feature program management | `/portfolio:start` | `portfolio-definition.md`, cycle reviews |
| Quality Assurance | Release readiness, audit prep, ISO 9001 alignment | `/quality:start <slug>` | `quality-plan.md`, `improvement-plan.md` |
| Project Review | Evidence-backed history review + improvement PR | `/project-review:start <slug> <scope>` | `findings.md`, draft PR |
| Design Track | New user-visible surface (not a feature UI tweak) | `/design:start <slug>` | `design-handoff.md` |
| Issue Breakdown | Decompose a GitHub issue into draft PRs | `/issue:breakdown` | Draft PRs per vertical slice |
| Stock-taking | Brownfield: inventory existing system before new work | `/stock-taking:start` | `stock-taking-inventory.md` |

### Agent Roster

| Agent | Stage / role |
|---|---|
| `analyst` | Stages 1–2: Idea and Research |
| `pm` | Stage 3: Requirements |
| `ux-designer` | Stage 4: UX — flows, IA, accessibility |
| `ui-designer` | Stage 4: UI — visuals, interaction, design tokens |
| `architect` | Stage 4 (architecture) + Stage 5: Specification |
| `planner` | Stage 6: Tasks |
| `dev` | Stage 7: Implementation |
| `qa` | Stage 8: Testing |
| `reviewer` | Stage 9: Review |
| `release-manager` | Stage 10: Release |
| `retrospective` | Stage 11: Learning |
| `orchestrator` | Cross-cutting: stage routing and hand-off |
| `sre` | Cross-cutting: post-release ops, incident response |
| `design-lead` | Design Track orchestrator |
| `project-scaffolder` | Project Scaffolding Track |
| `project-reviewer` | Project Review workflow |

Each agent has a narrow tool list by design. Tool restrictions are intentional — missing tool = feature, not bug.

### Slash Commands Cheat Sheet

**Lifecycle**

| Command | Purpose |
|---|---|
| `/spec:start <slug>` | Scaffold a new feature folder |
| `/spec:idea` | Stage 1 — Idea |
| `/spec:research` | Stage 2 — Research |
| `/spec:requirements` | Stage 3 — Requirements |
| `/spec:design` | Stage 4 — Design |
| `/spec:specify` | Stage 5 — Specification |
| `/spec:tasks` | Stage 6 — Tasks |
| `/spec:implement [task-id]` | Stage 7 — Implementation |
| `/spec:test` | Stage 8 — Testing |
| `/spec:review` | Stage 9 — Review |
| `/spec:release` | Stage 10 — Release |
| `/spec:retro` | Stage 11 — Retrospective |
| `/spec:clarify` | Optional gate — interrogate active artifact |
| `/spec:analyze` | Optional gate — cross-artifact consistency check |

**Companion tracks**

| Command | Purpose |
|---|---|
| `/discovery:start <slug>` | Begin Discovery sprint |
| `/scaffold:start <slug> <source>` | Begin Project Scaffolding |
| `/sales:start` | Begin Sales Cycle |
| `/project:start` | Begin Project Manager Track |
| `/roadmap:start <slug>` | Begin Roadmap Management |
| `/portfolio:start` | Begin Portfolio Track |
| `/quality:start <slug>` | Begin Quality Assurance Track |
| `/project-review:start <slug> <scope>` | Begin Project Review |
| `/design:start <slug>` | Begin Design Track |
| `/issue:breakdown` | Begin Issue Breakdown |
| `/stock-taking:start` | Begin Stock-taking Track |

**Template improvement**

| Command | Purpose |
|---|---|
| `/specorator:update "<idea>"` | Classify and guide a template improvement |
| `/specorator:add-script "<purpose>"` | Add or change a repository script |
| `/specorator:add-tooling "<purpose>"` | Add CI, automation, or developer tooling |
| `/specorator:add-workflow "<purpose>"` | Add or change a workflow, track, or handoff |
| `/adr:new "<title>"` | File a new Architecture Decision Record |

### Tool Support

Specorator is tool-agnostic. Claude Code gets native slash commands, agents, and skills. Other tools use the same Markdown artifacts and stage order.

| Tool | Guide |
|---|---|
| Claude Code | Native — slash commands, agents, skills in `.claude/` |
| Codex | `docs/cross-tool/codex.md` |
| Cursor | `docs/cross-tool/cursor.md` |
| Aider | `docs/cross-tool/aider.md` |
| Copilot | `docs/cross-tool/copilot.md` |
| Gemini | `docs/cross-tool/gemini.md` |

---

## References

- Workflow definition: [`docs/specorator.md`](specorator.md)
- Quality framework: [`docs/quality-framework.md`](quality-framework.md)
- Traceability: [`docs/traceability.md`](traceability.md)
- Slash commands inventory: [`docs/slash-commands.md`](slash-commands.md)
- Repository map: [`docs/repo-map.md`](repo-map.md)
- Product page: <https://luis85.github.io/agentic-workflow/>
- GitHub repository: <https://github.com/Luis85/agentic-workflow>
