---
id: ADR-0021
title: Ship the released template package as a fresh-surface starter
status: accepted
date: 2026-05-02
deciders:
  - human
  - architect
consulted:
  - pm
  - release-manager
  - reviewer
informed:
  - all stage agents
  - all track conductor skills
  - operational bots
supersedes: []
superseded-by: []
tags: [release, packaging, distribution, template, methodology]
---

# ADR-0021 — Ship the released template package as a fresh-surface starter

## Status

Accepted

## Context

The Specorator repository is both **the working codebase that builds the workflow itself** and **the source of the released template that downstream consumers adopt**. These two roles disagree on what should ship.

While building the workflow, the repository accumulates state that is meaningful to maintainers but actively unhelpful to a fresh consumer:

- Per-feature working folders under `specs/` (for example `specs/version-0-5-plan/`, `specs/v04-quality-and-metrics/`).
- Discovery sprints, project engagements, portfolio cycles, scaffolding sessions, sales deals, stock-taking inventories, quality reviews, roadmaps, and inputs payloads under their respective folders.
- Architecture Decision Records that record decisions made *about how to build Specorator itself* (`ADR-0001`–`ADR-0020+`). A consumer who adopts the template should write their own `ADR-0001`, not inherit ours.
- Documentation pages that have grown built-up content — examples drawn from the template's own history, version-specific commentary, accumulated cross-references — instead of the stub shape they were originally designed as.

The v0.5 release and distribution work (`PRD-V05-001`, `REQ-V05-005` package contract, `SPEC-V05-004` package contract and publication) made the gap concrete: defining what ships in the GitHub Package forced the question of whether built-up state ships with it. The answer matters template-wide and across every future release, not only for v0.5.

The forces in play:

- **Consumer onboarding.** A fresh adopter expects an empty `specs/` so their first feature is `specs/<their-feature>/`, not a directory full of our v0.4 / v0.5 work. Same for every other intake folder.
- **ADR semantics.** ADRs record decisions for *one project*. Shipping `ADR-0001` "Record architecture decisions" to a consumer's project where they have not yet decided to record architecture decisions is wrong on the face of it. ADR numbering is project-local; the consumer's first ADR must be their own `ADR-0001`.
- **Documentation drift.** The longer the template lives, the more documentation accretes context that is meaningful only inside the maintainers' history. A consumer reading `docs/release-readiness-guide.md` should see a stub they fill in for their own product, not a guide thick with examples drawn from this template's release.
- **Determinism.** Whatever rule we adopt has to be machine-checkable so the release readiness check (`SPEC-V05-005`) and the manual release workflow (`SPEC-V05-002`) can enforce it before publish.

## Decision

The released template package — whether distributed as a GitHub Release source archive, a GitHub Package, or any future packaging target — ships as a **fresh-surface starter**. This rule is template-wide and applies to every release, not only v0.5.

The contract has three concrete sub-decisions.

### 1. Documentation in the released package = stub form

Every `docs/` page that ships in the released package is a **stub**: structure, frontmatter, headings, and intent are present; built-up content is removed. The reference shape is `templates/release-package-stub.md`.

Concretely, a stub:

- Keeps the document's title, frontmatter, top-level headings, and a one-paragraph statement of the document's purpose.
- Replaces accumulated examples, case studies, version-specific commentary, and template-history references with `<!-- TODO: <what consumer fills in> -->` markers.
- Keeps cross-references to other template files only when those files also ship in the package.
- Does not delete the document. Stripping is to a stub, not to absence.

The packaging step is responsible for producing stub form from the codebase form. The codebase form remains as authored.

### 2. ADRs are excluded from the released package

`docs/adr/0\d{3}-*.md` files do not ship in the released package. The released `docs/adr/` either ships empty, or ships only `docs/adr/README.md` rewritten as a stub that explains:

- ADR numbering is project-local; the consumer's first ADR is `ADR-0001`.
- How to file an ADR using `templates/adr-template.md` and `/adr:new`.

This ADR commits to **shipping `docs/adr/README.md` as a stub** (rather than excluding it entirely) so the consumer has orientation in the otherwise-empty folder. The `templates/adr-template.md` itself ships unchanged — it is a template, not a decision record.

### 3. Intake folders ship empty

Every "work happens here" folder ships either absent or containing only its top-level `README.md` (rewritten as a stub if needed). The enumerated folders:

1. `inputs/`
2. `specs/`
3. `discovery/`
4. `projects/`
5. `portfolio/`
6. `roadmaps/`
7. `quality/`
8. `scaffolding/`
9. `stock-taking/`
10. `sales/`

No per-feature subdirectories, no per-deal files, no per-engagement state, no in-flight workflow state ship. The `examples/` folder is **not** an intake folder — it is a demonstration zone and may continue to ship as authored, since its purpose is to show consumers what a real project looks like.

When a new intake folder is added to the template (a new track, a new state-bearing folder), the enumeration above must be updated in the same PR that adds the folder. This is a maintenance rule called out in `docs/release-package-contents.md`.

## Considered options

### Option A — Ship the full template state as-is

- Pros: Zero packaging work. The released artifact mirrors the codebase exactly.
- Cons: Consumers inherit our `specs/version-0-5-plan/`, our 20+ ADRs, our discovery sprints, our project history. Their first feature is `specs/their-feature/` next to ours, which is incoherent. Their first ADR is `ADR-0021`, which is wrong because ADR numbering is project-local. Built-up documentation leaks our internal history into their workspace. **Rejected.**

### Option B — Selectively prune at release time without a written contract

- Pros: Faster to start; the release-manager picks what to strip on each release.
- Cons: Fragile and drifts. Different release managers strip different things. New intake folders get missed. Maintainer accidents (a forgotten feature folder under `specs/`) ship to consumers. Cannot be enforced by CI because there is no contract to check against. **Rejected.**

### Option C — Explicit fresh-surface contract enforced by release readiness

- Pros: Deterministic. The contract is documented (`docs/release-package-contents.md`), referenced by an ADR (this one), enumerated path-by-path, and machine-checkable. New intake folders get added to the enumeration in the same PR that adds them. CI catches drift before publish. **Chosen.**

We adopt Option C.

## Consequences

### Positive

- Clean consumer onboarding. A fresh adopter sees empty intake folders and their own `ADR-0001`.
- Smaller released artifact. Fewer files, fewer megabytes, no accidental leaks of in-flight maintainer state.
- No leakage of internal decisions. Our ADRs about how we built Specorator stay in the codebase where they belong.
- Documentation that ships is documentation the consumer can fill in for their own product.
- The contract is machine-checkable; the release readiness check can refuse to publish when the contract is violated.

### Negative

- Every release needs a packaging step that strips and stubifies. Until that step is automated, the release-manager runs it manually with the docs/release-package-contents.md checklist.
- CI must validate the contract before publish (assertion list under "Compliance"). New intake folders that are added to the template without updating the enumeration will either ship as drift (until CI catches them) or break release readiness — we accept the latter.
- Stubifying requires a reference shape; `templates/release-package-stub.md` is that shape and must be kept current as the docs evolve.
- The codebase form of `docs/` is no longer the released form. Maintainers reading the codebase see one shape; consumers receive another. This is intentional but adds a mental step.

### Neutral

- This ADR itself ships **in the codebase** (it documents the policy) but is excluded from the released package by the very policy it records. Consumers do not need to know the policy; they receive the policy's effect.
- `templates/` content is unaffected. Templates are how consumers fill in their own artifacts; they ship unchanged.
- `examples/` is unaffected. It is a demonstration zone, not an intake folder.

## Compliance

The contract is enforced by two existing v0.5 surfaces:

- **Release readiness check (`T-V05-004`, `SPEC-V05-005`).** Before authorizing publish, the check asserts:
  1. No file matching `docs/adr/0\d{3}-*.md` is present in the published archive.
  2. Each of the 10 enumerated intake folders is either absent from the archive or contains only a `README.md` (no per-feature subdirectories, no per-deal files, no per-engagement state files, no per-cycle log files).
  3. Every `docs/` page that ships in the archive matches the stub shape defined in `templates/release-package-stub.md` (frontmatter present, top-level headings present, no built-up sections beyond the stub shape).
- **Manual release workflow (`T-V05-006`, `SPEC-V05-002`).** The publish workflow refuses to attach assets or publish a package version until the readiness check passes. Drift is caught before the irreversible publish step.

The package contract document (`T-V05-002` deliverable, written by `pm` after this ADR) is the place where these assertions become concrete include / exclude lists for the published archive. It cites this ADR as its source of truth.

When a new intake folder is added to the template, the enumeration in this ADR's "Decision §3" and in `docs/release-package-contents.md` must be updated in the same PR. The release readiness check uses the documented enumeration as its checklist; an un-enumerated folder will leak into the released artifact until the check is updated.

## References

- `REQ-V05-005` — Define package contract (this ADR sharpens what "contents" means).
- `REQ-V05-012` — Released package fresh-surface contract (added by `pm` in the same PR; reciprocally references this ADR).
- `SPEC-V05-004` — Package contract and publication.
- `SPEC-V05-005` — Release readiness validation (compliance mechanism).
- `SPEC-V05-010` — Release package fresh-surface contract (the spec form of this ADR's assertions).
- `SPEC-V05-002` — Publish authorization contract (manual release workflow).
- `docs/release-package-contents.md` — Canonical, template-wide doc for the fresh-surface contract.
- `templates/release-package-stub.md` — Reference shape for stub-form documentation.
- `docs/specorator.md` §3.10 (Release stage) — Forward link.
- Constitution Article IX (Reversibility) — publishing is irreversible; the contract is enforced before publish.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
