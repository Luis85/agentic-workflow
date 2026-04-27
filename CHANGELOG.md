# Changelog

All notable changes to Specorator are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v0.2] — 2026-04-27

### Added
- Skills layer: `orchestrate`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track` workflow-conductor skills
- Operational bots: `review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`
- Portfolio Manager Track ([ADR-0009](docs/adr/0009-add-portfolio-manager-role.md)) — P5 Express X/Y/Z cycles for multi-project management
- Project Manager Track ([ADR-0008](docs/adr/0008-add-project-manager-track.md)) — P3.Express client engagement governance
- Stock-taking Track ([ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md)) — brownfield/legacy system inventory before ideation
- Sales Cycle Track ([ADR-0006](docs/adr/0006-add-sales-cycle-track-before-discovery.md)) — Qualify → Scope → Estimate → Propose → Order
- Discovery Track ([ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md)) — Frame → Diverge → Converge → Prototype → Validate → Handoff
- Branching, verify-gate, and worktree guides (`docs/branching.md`, `docs/verify-gate.md`, `docs/worktrees.md`)
- `cli-todo` worked example (Stages 1–3 complete)

---

## [v0.1] — 2026-04-26

### Added
- Workflow definition: 11-stage SDLC lifecycle (Idea → Research → Requirements → Design → Specification → Tasks → Implementation → Testing → Review → Release → Learning)
- Specialist agents for every stage (analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective)
- Orchestrator agent for cross-stage routing
- Markdown templates for every stage artifact
- EARS notation for functional requirements ([ADR-0003](docs/adr/0003-adopt-ears-for-functional-requirements.md))
- Traceability matrix scheme (`REQ-X-NNN` → `T-X-NNN` → `TEST-X-NNN`)
- Quality framework and per-stage gates
- Architecture Decision Records — ADR-0001 through ADR-0004
- `memory/constitution.md` — governing principles
- `docs/steering/` — scoped agent context (product, tech, ux, quality, ops)
