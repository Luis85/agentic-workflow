---
title: "Inputs"
folder: "inputs"
description: "Canonical ingestion folder for new work packages — briefs, RFPs, design system zips, reference material — that any track may consult."
entry_point: true
---

# Inputs

Canonical ingestion folder for new **work packages** — files, folders, or archives that drive a piece of work.

Drop source material here before invoking a conductor (`/orchestrate`, `/discovery:start`, `/stock:start`, `/sales:start`, `/project:start`, `/portfolio:start`, `/scaffold:start`, `/roadmap:start`, `/quality:start`, or any `/specorator:*` command). Every conductor consults this folder at the start of its scope phase and asks which items are relevant for the active work.

> **Methodology:** [`docs/inputs-ingestion.md`](../docs/inputs-ingestion.md) — full cross-track contract, intake protocol, retention policy.
>
> **Decision:** [ADR-0017](../docs/adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md).

## Quick rules

1. **Drop source material here.** Briefs, RFPs, reference architectures, design system zips, screenshots, OpenAPI specs, exported research bundles, slide decks.
2. **Conductors ask before extracting.** Zips, PDFs, and compressed archives are never unpacked automatically — extraction is always a confirmed step.
3. **Items are committed.** Small artifacts (a few MB) live alongside the workflow that consumes them.
4. **Retention is your call.** After a work package is consumed (its content captured into the track's canonical artifact — `idea.md`, `chosen-brief.md`, `scope.md`, `stock-taking-inventory.md`, etc.), keep, delete, or move per the per-track defaults in [`docs/inputs-ingestion.md`](../docs/inputs-ingestion.md).
5. **No sensitive material.** Credentials, signed contracts, NDA-covered content do **not** belong here. Use per-file `.gitignore` rules instead.

## What does *not* belong here

- Build artifacts, compiled binaries — `.gitignore` them.
- Credentials, API keys, signed legal documents — never commit.
- Files larger than ~5 MB without prior discussion — consider Git LFS, an external store, or a pointer file.
- Long-term archive material — `inputs/` is for *active* work packages, not historical record.

## Convention at a glance

```
inputs/
  README.md                    ← this file (committed)
  client-brief.pdf             ← source for a Discovery sprint, deleted after chosen-brief.md
  legacy-arch.zip              ← source for a Stock-taking audit, kept until inventory approved
  Specorator-Design.zip        ← source for a Specorator improvement, deleted after PR opens
  rfp-acme/                    ← multi-file RFP for a Sales cycle, kept until order.md signed
```

The folder is allowed to be empty when there is no active work package. An empty `inputs/` is a feature, not a bug — the conductor's intake gate will print one line ("`inputs/` is empty — no source material to consult") and proceed.
