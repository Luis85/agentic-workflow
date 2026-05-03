---
id: ADR-0025
title: Adopt a doc-as-contract review protocol
status: proposed
date: 2026-05-02
deciders:
  - human
consulted:
  - reviewer
  - release-manager
informed:
  - lifecycle agents
supersedes: []
superseded-by: []
tags: [review, documentation, source-contracts]
---

# ADR-0025 - Adopt a doc-as-contract review protocol

## Status

Proposed

## Context

Some documentation in this repository is not explanatory prose; it is a contract
that downstream release, quality, or automation work consumes. Examples include
documents that describe script exports, generated JSON shapes, diagnostic code
surfaces, workflow-state fields, or CI gate semantics.

The v0.4 retrospective recorded a repeated defect pattern during T-V04-012:
the handoff document described source-backed quality signals from memory instead
of from a live reading of the relevant source exports. Review caught real drift
across four rounds: array cardinality, maturity-level names, doctor advisory
semantics, branch readiness edges, and source-defined naming. The common failure
mode was review of the prose without first verifying the referenced source
contracts.

Stage 9 review already requires the reviewer to read workflow artifacts and the
diff. It does not distinguish ordinary documentation from source-backed
contract documentation. Adding that distinction changes reviewer expectations
and should be decided before editing the reviewer agent or `/spec:review`
workflow.

## Decision

We will adopt a doc-as-contract review protocol for source-backed documentation.

When a changed document claims to describe scripts, generated data, diagnostic
codes, exported types, workflow schemas, CI gate semantics, or other source
contracts, Stage 9 review must:

- identify the referenced source files, exported symbols, generated fixtures, or
  command outputs that define the contract;
- read those source definitions before reviewing the prose;
- verify each normative claim in the document against the live source contract;
- record source evidence in `review.md` for any approval or finding; and
- fail closed when a referenced source contract cannot be found.

This protocol applies to review stance and evidence collection. It does not make
documentation the source of truth when source code or generated artifacts define
the actual runtime contract.

After this ADR is accepted, the reviewer agent and `/spec:review` workflow may
be updated to make this protocol operational. Until then, this ADR remains a
proposal and no reviewer prompt change is implied.

## Considered options

### Option A - Keep current review scope

- Pros: No prompt, workflow, or training change.
- Cons: Leaves the v0.4 defect pattern unaddressed; reviewers can approve
  source-backed documents without reading the source contract.

### Option B - Add a lightweight reviewer checklist

- Pros: Smallest implementation; easy to add to reviewer prompt.
- Cons: Checklist language can be skipped or applied inconsistently unless it
  requires explicit source evidence.

### Option C - Adopt an explicit doc-as-contract protocol

- Pros: Defines trigger conditions, required source reading, evidence, and
  fail-closed behaviour before implementation. Gives reviewers a different
  stance for source-backed documents without changing ordinary documentation
  review.
- Cons: Adds review effort for contract-like documentation and requires reviewer
  prompt/workflow updates after acceptance.

## Consequences

### Positive

- Source-backed documents are reviewed against the live source of truth.
- Drift between generated/runtime contracts and handoff prose is caught earlier.
- `review.md` records the evidence behind doc-as-contract approvals and
  findings.

### Negative

- Stage 9 review takes longer when documentation describes source contracts.
- Reviewers need enough source-reading access to inspect exported types,
  validators, scripts, fixtures, and command outputs.

### Neutral

- Ordinary narrative documentation continues through the existing review flow.
- The implementation should be a reviewer prompt and `/spec:review` workflow
  amendment, not a new lifecycle stage.

## Compliance

- Reviewer prompt change: after acceptance, `.claude/agents/reviewer.md` must
  include a doc-as-contract trigger and evidence requirement.
- Workflow change: after acceptance, `.claude/commands/spec/review.md` must
  ensure the reviewer distinguishes source-backed contract docs from ordinary
  docs.
- Review artifact evidence: `review.md` should cite the source files, exports,
  command outputs, or generated fixtures used to validate doc-as-contract claims.
- Retrospective linkage: issue #214 tracks the v0.4 retrospective action that
  produced this ADR proposal.

## References

- Issue #214: <https://github.com/Luis85/agentic-workflow/issues/214>
- v0.4 retrospective:
  [`specs/version-0-4-plan/retrospective.md`](../../specs/version-0-4-plan/retrospective.md)
- Reviewer agent:
  [`.claude/agents/reviewer.md`](../../.claude/agents/reviewer.md)
- `/spec:review` workflow:
  [`.claude/commands/spec/review.md`](../../.claude/commands/spec/review.md)
