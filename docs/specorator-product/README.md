---
title: "Specorator Product Steering"
folder: "docs/specorator-product"
description: "Specorator's own product, UX, technical, quality, and operations steering for template-improvement work."
entry_point: true
---
# Specorator Product Steering

This folder describes Specorator itself: the workflow template, docs, scripts, agent surfaces, release package, and public product page maintained in this repository.

Use this folder when improving the template. Use [`docs/steering/`](../steering/README.md) when adopting Specorator for a downstream product or editing the blank steering templates that ship to adopters.

## Naming

Specorator is the product and workflow method. `agentic-workflow` remains the repository slug and GitHub Packages npm package identity (`@luis85/agentic-workflow`) per [ADR-0024](../adr/0024-lock-specorator-agentic-workflow-naming-contract.md). Product-facing copy should lead with Specorator and use `agentic-workflow` only for repository, package, URL, or install references.

## Decision

T-V06-001 chooses the additive split from the v0.6 design:

- `docs/steering/` remains the downstream starter-template home.
- `docs/specorator-product/` holds Specorator's own product steering.
- `AGENTS.md` and `CLAUDE.md` point template-improvement agents here.
- No ADR is required because existing steering ownership is preserved.

## Files

| File | Use when |
|---|---|
| [`product.md`](product.md) | Framing roadmap, positioning, scope, personas, and success metrics. |
| [`ux.md`](ux.md) | Changing docs IA, product-page UX, onboarding, examples, or content patterns. |
| [`tech.md`](tech.md) | Changing scripts, repository layout, package distribution, adapters, or automation. |
| [`quality.md`](quality.md) | Planning tests, verify-gate changes, review standards, or quality metrics. |
| [`operations.md`](operations.md) | Changing release, publishing, CI, branch, rollback, or incident routines. |

## Loading Rules

- Load only the files relevant to the task.
- Keep facts source-linked to repository artifacts where possible.
- Update this folder in the same PR as product-facing changes that make its guidance stale.
- Do not copy these files into downstream projects as starter templates; the starter templates are in `docs/steering/`.
