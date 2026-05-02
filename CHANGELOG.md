# Changelog

All notable changes to Specorator are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v0.5.1] — 2026-05-02

### Notes
- Recovery release for v0.5: republishes a stable GitHub Release page after the `v0.5.0` publish dispatch hit GitHub's Immutable Releases tag-burn ([#233](https://github.com/Luis85/agentic-workflow/issues/233)). The `v0.5.0` tag remains permanently flagged "used by an immutable release" and cannot host a new Release.
- Package contents are byte-equivalent to `v0.5.0` aside from version metadata in `package.json` and `package-lock.json`. No behavioural changes.
- Repository setting "Immutable releases" is now disabled to prevent recurrence. Prevention work tracked under [#233](https://github.com/Luis85/agentic-workflow/issues/233).

---

## [v0.5.0] — 2026-05-02

### Added
- Release workflow infrastructure for manually authorized GitHub Releases and GitHub Packages publishing.
- Release operator guide, readiness checks, package contract, and fresh-surface package-content validation.
- Fresh-surface release package contract: released starter archives exclude numbered ADRs, reset intake folders, and ship docs in stub form.

### Changed
- Public distribution docs now describe the v0.5 release path and the `@luis85/agentic-workflow` package identity.
- Repository automation registry tracks the release workflow and release-readiness checks.

### Notes
- npm `@luis85/agentic-workflow@0.5.0` shipped on 2026-05-02 to GitHub Packages.
- The corresponding GitHub Release page exists only as a draft because the publish dispatch hit GitHub's Immutable Releases repo setting and the `v0.5.0` tag is now permanently flagged "used by an immutable release". Incident tracked in [#233](https://github.com/Luis85/agentic-workflow/issues/233); detail in `specs/version-0-5-plan/retrospective.md` §Incident. Package availability is unaffected. Recovery release: see `[v0.5.1]` above for the stable Release page.

---

## [v0.4.0] — 2026-05-01

### Added
- CI quality gates, quality metrics, maturity model, and release validation evidence for the workflow template.
- v0.5 handoff contract so release-readiness checks can consume quality, doctor, and verify signals.

### Changed
- Release notes and retrospectives became first-class lifecycle artifacts for versioned template work.

---

## [v0.3.0] — 2026-04-30

### Added
- Worked end-to-end examples and artifact validation for the lifecycle.
- Deterministic checks for representative workflow artifacts and traceability drift.

### Changed
- Example artifacts moved toward reusable evidence for downstream adopters and future release-readiness checks.

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
