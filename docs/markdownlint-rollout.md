---
title: markdownlint rollout plan
folder: docs
description: Phased promotion of markdownlint from advisory to blocking gate.
entry_point: false
---

# markdownlint rollout plan

The repo deferred `markdownlint-cli2` because an initial trial found ~2000 findings across all Markdown files. Enabling it as a blocking gate immediately would halt all PR work. This document tracks the phased promotion plan.

## Current state

A non-blocking workflow (`.github/workflows/markdownlint.yml`) runs on PRs touching `**/*.md` files. It installs pinned `markdownlint-cli2@0.22.1`, reports findings in the CI log, and marks only the lint result as advisory.

## Promotion phases

### Phase 1 — advisory only (current)

Workflow runs. Findings visible in CI log. Does not block.
Goal: build awareness of rule violations without disrupting work.

### Phase 2 — fix high-signal rules

Fix these first (highest signal, least controversy):

| Rule | What it catches | Fix strategy |
|---|---|---|
| MD040 | Fenced code blocks missing language tag | Add language tag (` ```bash`, ` ```yaml`, ` ```json`) |
| MD001 | Heading levels skip (e.g. H1 → H3) | Fix heading hierarchy |
| MD024 | Duplicate headings | Merge or rename duplicate headings |
| MD055/MD056 | Table formatting inconsistency | Align pipes and trailing pipes |
| MD009 | Trailing spaces | Fix in editor or via `sed` |

Track cleanup PRs here:

- [ ] Fix MD040 across `docs/` and `specs/`
- [ ] Fix MD001 across all files
- [ ] Fix MD024 in `README.md` and `docs/`

### Phase 3 — promote to blocking (after Phase 2)

- Add `.markdownlint.jsonc` with rule overrides at repo root
- Remove `continue-on-error: true` from the lint result step
- Add `markdownlint` to the required-status-checks list in the GitHub ruleset docs
- Update `docs/security-ci.md` posture map: Deferred → Implemented

## Rule configuration

Create `.markdownlint.jsonc` at repo root when promoting to blocking:

```jsonc
{
  "default": true,
  "MD013": false,
  "MD033": false,
  "MD041": false
}
```
