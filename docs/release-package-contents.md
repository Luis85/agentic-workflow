---
title: Release package contents
folder: docs
description: Template-wide contract for what ships in the released Specorator package and in what shape.
entry_point: false
---

# Release package contents

The released Specorator template package — whether distributed as a GitHub Release source archive, a GitHub Package, or any future packaging target — ships as a **fresh-surface starter**. This page is the canonical, template-wide reference for the rule. It applies to **every release**, not only v0.5.

Source of truth: [ADR-0021 — Ship the released template package as a fresh-surface starter](adr/0021-release-package-fresh-surface.md).

## Why a fresh-surface contract

The Specorator repository is both **the working codebase that builds the workflow itself** and **the source of the released template that downstream consumers adopt**. These two roles disagree on what should ship. While building the workflow, the repository accumulates state — feature folders, discovery sprints, project engagements, ADRs about how we built Specorator, documentation thick with examples drawn from our own history — that is meaningful to maintainers but actively unhelpful to a fresh consumer.

The released package strips that state so the consumer's first feature is genuinely their first feature, their first ADR is `ADR-0001`, and their documentation is theirs to fill in for their product.

## What ships, in what shape

The contract has three exclusion classes.

### 1. Documentation ships as stubs

Every `docs/` page that ships keeps:

- Title, frontmatter (`title`, `folder`, `description`, `entry_point`), and top-level headings.
- A one-paragraph statement of the document's purpose.
- Cross-references to other template files only when those files also ship.

Every `docs/` page that ships removes:

- Accumulated examples and case studies drawn from this template's own history.
- Version-specific commentary ("v0.4 introduced…", "v0.5 added…").
- Built-up content beyond the stub shape.

Stripped content is replaced with `<!-- TODO: <what consumer fills in> -->` markers. The reference shape is [`templates/release-package-stub.md`](../templates/release-package-stub.md).

The packaging step is responsible for producing stub form from the codebase form. The codebase form remains as authored — maintainers reading the codebase see one shape, consumers receive another.

### 2. ADRs are excluded

`docs/adr/[0-9][0-9][0-9][0-9]-*.md` files **do not ship**. ADR numbering is project-local: a consumer who adopts the template writes their own `ADR-0001`, not a continuation of ours.

What ships:

- `docs/adr/README.md` — rewritten as a stub that explains how the consumer files their own ADRs starting at `ADR-0001`.
- `templates/adr-template.md` — unchanged. Templates are how consumers fill in their own artifacts.

What does not ship:

- `docs/adr/0001-record-architecture-decisions.md` through `docs/adr/NNNN-*.md` — all of them.

### 3. Intake folders ship empty

Each "work happens here" folder ships either absent or containing only its top-level `README.md`. The 10 enumerated folders:

| Folder | Purpose | What ships |
|---|---|---|
| `inputs/` | Cross-track ingestion zone for new work packages. | `inputs/README.md` only (rewritten as stub). |
| `specs/` | Per-feature lifecycle workspaces. | `specs/README.md` only (or absent). No `specs/<slug>/`. |
| `discovery/` | Per-sprint discovery workspaces. | `discovery/README.md` only (or absent). No `discovery/<sprint>/`. |
| `projects/` | Per-engagement Project Manager Track state. | `projects/README.md` only (or absent). No `projects/<slug>/`. |
| `portfolio/` | Per-portfolio P5 cycles. | `portfolio/README.md` only (or absent). No `portfolio/<slug>/`. |
| `roadmaps/` | Per-roadmap workspaces. | `roadmaps/README.md` only (or absent). No `roadmaps/<slug>/`. |
| `quality/` | Per-review QA Track state. | `quality/README.md` only (or absent). No `quality/<review>/`. |
| `scaffolding/` | Per-onboarding scaffolding sessions. | `scaffolding/README.md` only (or absent). No `scaffolding/<slug>/`. |
| `stock-taking/` | Per-engagement legacy inventories. | `stock-taking/README.md` only (or absent). No `stock-taking/<slug>/`. |
| `sales/` | Per-deal sales cycle state. | `sales/README.md` only (or absent). No `sales/<deal>/`. |
| `issues/` | Canonical local mirror of feature issue tracking. | `issues/README.md` only (or absent). No `issues/<number>-<slug>.md`. Per [ADR-0030](adr/0030-adopt-issues-folder-for-canonical-issue-tracking.md). |

`examples/` is **not** an intake folder. It is a demonstration zone whose purpose is to show consumers what a real project that adopted the template would produce. `examples/` ships as authored.

## How the contract is enforced

The rule is machine-checkable. Two surfaces enforce it before publish:

- **Release readiness check.** `scripts/check-release-package-contents.ts` (future T-V05-004 surface) asserts the three exclusion classes against the candidate archive. See [SPEC-V05-005](../specs/version-0-5-plan/spec.md) and [SPEC-V05-010](../specs/version-0-5-plan/spec.md).
- **Manual release workflow.** The publish step refuses to attach assets or publish a package version until readiness passes. See [SPEC-V05-002](../specs/version-0-5-plan/spec.md).

Drift is caught before the irreversible publish step. A failed assertion fails the readiness check with stable diagnostics; the operator either fixes the archive or records an explicit waiver.

## How to add a new intake folder

Adding a new intake folder to the template is a template-wide change. Do these in **the same PR**:

1. Add the folder under the repository root (with its `README.md` and any per-engagement state schema).
2. Add the folder to [`docs/sink.md`](sink.md) — the layout, the ownership table, and any sub-tree section that explains its purpose.
3. **Add the folder to the enumeration in this page** (the table under "3. Intake folders ship empty") **and to `ADR-0021`'s "Decision §3"** (cite the supersession ADR if `ADR-0021` is itself superseded by then).
4. Update `scripts/check-release-package-contents.ts` so the readiness check enumerates the new folder (the check uses the documented enumeration as its checklist; an un-enumerated folder will leak into the released archive).
5. Add a release note entry describing the new intake folder so consumers of the next release know it exists.

The maintenance rule is: **the enumeration in this page, the enumeration in `ADR-0021`, and the enumeration in the readiness check stay in lockstep**. The readiness check is the backstop only for the enumerated set.

## References

- [ADR-0021 — Ship the released template package as a fresh-surface starter](adr/0021-release-package-fresh-surface.md) — source of truth.
- [`templates/release-package-stub.md`](../templates/release-package-stub.md) — reference shape for stub-form documentation.
- [`docs/release-operator-guide.md`](release-operator-guide.md) — runnable operator path that consumes this contract before publish.
- [`docs/specorator.md`](specorator.md) §3.10 (Release stage) — forward link.
- [`docs/sink.md`](sink.md) — folder ownership and layout.
- `specs/version-0-5-plan/spec.md` SPEC-V05-005 (release readiness validation) and SPEC-V05-010 (fresh-surface contract).
- `specs/version-0-5-plan/requirements.md` REQ-V05-005 (package contract) and REQ-V05-012 (fresh-surface requirement, owned by `pm`).
