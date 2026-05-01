---
title: "Inputs ingestion methodology"
folder: "docs"
description: "Cross-track contract for the canonical `inputs/` ingestion folder — where work packages land, how conductors consult them, and how retention is decided."
entry_point: false
---

# Inputs ingestion methodology

> Cross-track contract for the canonical `inputs/` ingestion folder. Adopted by [ADR-0017](adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md). Linked from `AGENTS.md`, `CLAUDE.md`, and every conductor skill.

## What `inputs/` is

`inputs/` is the **single canonical location** at the repository root where humans drop source material that drives a piece of work — briefs, RFPs, design system zips, screenshots, OpenAPI specs, exported research, slide decks, reference architectures, anything else.

It is **the** place to put work packages before invoking a conductor. Every conductor consults it.

## What `inputs/` is *not*

- **Not** a long-term archive. Retention is per-track; default behaviour is to delete after consumption unless traceability demands keeping the source.
- **Not** an automatic extraction zone. Archives are never unpacked without explicit human approval (Constitution Article VII).
- **Not** a place for sensitive material. Items in `inputs/` are committed and visible to everyone with repo access. Sensitive PDFs, credentials, signed contracts, or anything covered by an NDA must be excluded with per-file `.gitignore` rules — never committed and then deleted later.
- **Not** a substitute for canonical artifacts. Once a work package is consumed, its content lives in the track's canonical artifact (`idea.md`, `chosen-brief.md`, `scope.md`, `stock-taking-inventory.md`, etc.); the file in `inputs/` is the *source*, not the truth.

## How conductors consult it

Every conductor skill (`orchestrate`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track`, `project-scaffolding`, `roadmap-management`, `quality-assurance`, `specorator-improvement`) runs an **intake gate** at the start of its scope phase:

1. **List `inputs/` non-recursively.** Surface every item — file or folder — to the user.
2. **Single `AskUserQuestion`** asking the user which items are relevant to the active work. Multi-select.
3. **For zips and large folders, never extract or recurse without explicit approval.** Extraction is a separate confirmed step.
4. **Read the relevant items** at depth appropriate to the track (a brief is read; a 100-file folder is sampled and the user is asked which paths matter).
5. **Capture content into the canonical artifact** for the track (e.g., a brief read by `discovery-sprint` becomes context for `frame.md`; an architecture zip read by `stock-taking` becomes evidence cited in `audit.md`).
6. **Record the source** — every quote, decision, or constraint lifted from `inputs/` is cited by relative path in the canonical artifact, so the lineage is auditable.

The shared scaffolding lives in [`.claude/skills/_shared/conductor-pattern.md`](../.claude/skills/_shared/conductor-pattern.md). Conductors that link the shared file inherit the gate; conductors that do not link it carry an inline reference.

## Why "every conductor asks"

The cost of asking the user "I see N items in `inputs/`, which are relevant?" is one extra question per conductor invocation. The cost of missing evidence is rework, missed constraints, and the user repeating themselves. Asking always is the cheaper default.

If `inputs/` is empty, the gate prints one line ("`inputs/` is empty — no source material to consult") and proceeds.

## Retention policy

Retention is **per-track** and **always the user's decision**. Defaults:

| Track | Default retention | Why |
|---|---|---|
| `discovery-sprint` | Delete after `chosen-brief.md` is written | Source material is captured into the brief; archive is the brief, not the inputs. |
| `stock-taking` | Keep until `stock-taking-inventory.md` is approved | Auditors may want to verify lifted facts against source. |
| `sales-cycle` | Keep until `order.md` is signed | Pre-contract evidence is load-bearing during negotiation. |
| `orchestrate` (Specorator lifecycle) | Delete after Stage 1 (`idea.md`) | Source material is captured into the idea. |
| `project-scaffolding` | Keep until `handoff.md` is accepted | The scaffolder's whole job is to lift evidence out of source folders. |
| `project-run`, `portfolio-track`, `roadmap-management`, `quality-assurance`, `specorator-improvement` | Decide per work package | These tracks vary; the conductor asks the user. |

The user can always override the default — keep for traceability, delete for cleanliness, move to a per-track location for posterity. The conductor recommends; the human decides.

## What to put in `inputs/`

| Material | OK in `inputs/`? | Notes |
|---|---|---|
| Briefs, RFPs, problem statements | Yes | Even if a few pages. |
| Reference architectures, OpenAPI specs, schemas | Yes | Cite in canonical artifact. |
| Design system zips, asset packs | Yes | Do not auto-extract; ask first. |
| Screenshots of competitor product | Yes | Compress before committing if large. |
| Exported research bundles, interview transcripts | Yes | Anonymise PII before committing. |
| Slide decks (PDF, PPTX) | Yes | Convert to PDF for diff-friendliness. |
| Build artifacts, compiled binaries | No | These belong in `.gitignore`. |
| Credentials, API keys, signed contracts | **No** | Per-file `.gitignore`; never commit. |
| Anything covered by an NDA | **No** | Same. |
| Files larger than ~5 MB | Discuss first | Consider Git LFS, an external store, or a pointer file. |

## What conductors do *not* do

- **Do not** auto-extract zips, PDFs, or compressed archives. Always ask.
- **Do not** commit content from `inputs/` into anywhere outside the canonical artifact tree (`specs/`, `discovery/`, etc.) without explicit human direction.
- **Do not** delete items from `inputs/` automatically. Retention is the user's call.
- **Do not** treat `inputs/` as authoritative — it is the *source*, not the truth. The canonical artifact is the truth.

## Per-track examples

### Discovery Sprint

```
User runs /discovery:start.
Conductor lists inputs/ → ["client-brief.pdf", "user-interviews/"]
Conductor asks: "I see 2 items in inputs/. Which are relevant for this sprint?"
User selects both.
Conductor reads client-brief.pdf into the Frame phase as JTBD evidence.
Conductor samples 3 of 12 user-interviews and cites them in frame.md.
After validation, chosen-brief.md is written.
Conductor asks: "Discovery sprint is wrapping. Default is to delete inputs/client-brief.pdf
and inputs/user-interviews/ now that chosen-brief.md captures the content. Keep, delete,
or move to discovery/<slug>/sources/?"
```

### Stock-taking

```
User runs /stock:start on a brownfield project.
Conductor lists inputs/ → ["legacy-arch-diagrams.zip", "ops-runbook.pdf", "DB_SCHEMA.sql"]
Conductor asks: "Which of these are relevant for the audit?"
User selects all three.
Conductor asks: "legacy-arch-diagrams.zip is a 12 MB archive. Extract for inventory?"
User approves.
Conductor extracts to inputs/legacy-arch-diagrams/ (preserves the zip).
audit.md cites paths into inputs/legacy-arch-diagrams/ and inputs/ops-runbook.pdf.
After handoff, inputs are kept until stock-taking-inventory.md is approved.
```

### Specorator Improvement (this very feature)

```
User runs the specorator-improvement loop with inputs/Specorator Design System.zip in place.
Conductor lists inputs/ → ["Specorator Design System.zip"]
Conductor asks: "I see 1 item. Is it the source for this improvement?"
User confirms + asks for extraction approval.
Conductor extracts, reads PR_DESCRIPTION.md and integration-plan-design-system.md,
proposes Phase 0+1 as the work package.
After the design-system PR is opened, the zip can be deleted (its content is now in
.claude/skills/specorator-design/).
```

## Compliance

- `inputs/README.md` is committed and documents folder purpose + retention.
- This file (`docs/inputs-ingestion.md`) is the canonical methodology reference.
- AGENTS.md carries the operating rule: "Consult `inputs/` at the start of every track."
- `.claude/skills/_shared/conductor-pattern.md` carries the shared intake gate.
- Every conductor skill references the gate in its scope phase.

## See also

- [ADR-0017](adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md) — decision rationale
- [`inputs/README.md`](../inputs/README.md) — folder purpose at a glance
- [`.claude/skills/_shared/conductor-pattern.md`](../.claude/skills/_shared/conductor-pattern.md) — shared scaffolding
- Constitution Article VII (Human Oversight) and Article IX (Reversibility)
