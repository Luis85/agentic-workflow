---
id: ADR-0024
title: Lock the Specorator and agentic-workflow naming contract
status: accepted
date: 2026-05-02
deciders:
  - maintainer
consulted:
  - issue #186
informed:
  - template adopters
supersedes: []
superseded-by: []
tags: [identity, distribution, product]
---

# ADR-0024 — Lock the Specorator and agentic-workflow naming contract

## Status

Accepted

## Context

The product is called **Specorator**. The repository, package, GitHub Pages path, and existing release contract use **`agentic-workflow`**:

- GitHub repository: `Luis85/agentic-workflow`.
- GitHub Packages npm package: `@luis85/agentic-workflow`.
- Public site URL: `https://luis85.github.io/agentic-workflow/`.
- v0.5 package contract: `specs/version-0-5-plan/package-contract.md`.

Changing the repository and package name before v1.0 would improve brand symmetry, but it would also churn release automation, package install guidance, Pages URLs, and existing issue/PR references. Dropping "Specorator" would discard the product positioning already used in `docs/specorator-product/`, the design system, and public copy.

## Decision

We will use a dual-name contract:

- **Specorator** is the product, workflow method, brand, and public-facing name.
- **`agentic-workflow`** is the repository slug and GitHub Packages npm package identity.
- Public copy may mention both names when an install path, repository link, package command, or URL would otherwise be ambiguous.
- Package metadata keeps `@luis85/agentic-workflow` and includes `specorator` as product keyword and description language.

## Considered options

### Option A — Rename repository and package to Specorator

- Pros: Cleanest brand and search experience.
- Cons: Requires repository redirects, package-name migration, release workflow changes, Pages URL changes, and documentation churn before the existing release line has shipped.

### Option B — Lock the dual-name contract

- Pros: Preserves release/package stability while making public copy consistent. Requires only documentation and validation updates.
- Cons: Maintainers must explain the distinction when users search for the package or repository.

### Option C — Drop Specorator

- Pros: One name everywhere.
- Cons: Removes the stronger product name and invalidates existing Specorator product steering, design, and positioning work.

## Consequences

### Positive

- v1.0 can freeze public naming without package or repository migration.
- README, site copy, glossary, and product steering get a single explanation.
- Release automation and published package identity stay stable.

### Negative

- Users may search for "Specorator" and still need the docs to point them to `Luis85/agentic-workflow` and `@luis85/agentic-workflow`.

### Neutral

- A future rename remains possible through a superseding ADR, but it becomes a deliberate breaking distribution change.

## Compliance

- Public docs explain the distinction where product name and install identity appear together.
- `check:public-surfaces` keeps public version, changelog, and site roster copy aligned with source data.
- Package metadata keeps `specorator` in keywords and description while retaining `@luis85/agentic-workflow`.

## References

- Issue #186 — File ADR for Specorator vs agentic-workflow naming contract.
- `specs/version-0-5-plan/package-contract.md`.
- `docs/specorator-product/README.md`.
