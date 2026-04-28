---
title: "Codex"
folder: ".codex"
description: "Entry point for Codex-specific delivery mechanics layered on the shared repository rules."
entry_point: true
---
# Codex

Codex-specific operating context lives here. `AGENTS.md` remains the shared source of truth for every AI coding agent; this folder holds the extra delivery mechanics that help Codex work cleanly in this repository.

Read in this order for non-trivial work:

1. [`AGENTS.md`](../AGENTS.md) for project-wide rules.
2. [`instructions.md`](instructions.md) for Codex-specific defaults.
3. The workflow playbook that matches the task:
   - [`workflows/pr-delivery.md`](workflows/pr-delivery.md) for normal repo changes.
   - [`workflows/review-response.md`](workflows/review-response.md) for PR review feedback.
   - [`workflows/cleanup-after-merge.md`](workflows/cleanup-after-merge.md) after a PR merges.

This folder is versioned because it is part of the template. Local Codex cache, secrets, or session state should not be committed here.
