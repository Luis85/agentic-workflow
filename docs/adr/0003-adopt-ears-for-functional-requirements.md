---
id: ADR-0003
title: Adopt EARS notation for functional requirements
status: accepted
date: 2026-04-26
deciders: [repo-owner]
tags: [process, requirements]
---

# ADR-0003 — Adopt EARS notation for functional requirements

## Status

Accepted

## Context

The biggest single failure mode in agentic development is ambiguous requirements. An LLM agent given *"the system should handle errors gracefully"* will produce twelve plausible interpretations, none of them what the human meant.

EARS (Easy Approach to Requirements Syntax, Mavin et al., Rolls-Royce, 2009) constrains functional requirements to five fixed sentence templates:

- **Ubiquitous** — *The `<system>` shall `<response>`.*
- **Event-driven** — *WHEN `<trigger>`, the `<system>` shall `<response>`.*
- **State-driven** — *WHILE `<state>`, the `<system>` shall `<response>`.*
- **Optional feature** — *WHERE `<feature>` is included, the `<system>` shall `<response>`.*
- **Unwanted behaviour** — *IF `<trigger>`, THEN the `<system>` shall `<response>`.*

EARS clauses map 1:1 to acceptance tests, which makes traceability and verification mechanical.

Kiro mandates EARS. GitHub Specorator has it as an open RFC. The pattern is now the de facto standard for spec-driven workflows.

## Decision

All functional requirements in `templates/prd-template.md` and any `requirements.md` artifact **must** use EARS notation. Each requirement gets:

- a stable ID (`REQ-<AREA>-NNN`),
- one of the five EARS patterns,
- a Given/When/Then acceptance criterion derivable from the EARS sentence,
- a MoSCoW priority (`must` / `should` / `could`),
- links to upstream and downstream artifacts.

Non-functional requirements use a separate, structured table (`category`, `target`) in the same PRD. NFRs are not constrained to EARS because performance budgets, accessibility levels, etc. are typically threshold-based, not behaviour-based.

The reference is at [`docs/ears-notation.md`](../ears-notation.md).

## Considered options

### Option A — Free-form user stories (*"As a … I want … so that …"*)

- Pros: familiar, low ceremony.
- Cons: doesn't constrain the *response* — the agentic failure mode persists.

### Option B — Gherkin Given/When/Then for everything

- Pros: directly executable.
- Cons: too verbose at requirements level; better suited to acceptance criteria *under* a higher-level requirement.

### Option C — EARS with Gherkin acceptance per requirement (chosen)

- Pros: EARS pins down ambiguity at the statement level; Gherkin gives QA a direct test scaffold.
- Cons: two notations to teach — mitigated by the reference doc and templates.

## Consequences

### Positive

- Requirements are unambiguous and testable.
- Tests can be auto-derived from acceptance criteria.
- The traceability matrix becomes mechanical.

### Negative

- Authors must learn five patterns. Practice cost is real but small.
- Some real-world requirements (long-running workflows, soft preferences) need creative pattern combination.

### Neutral

- Pattern combinations (e.g., `WHILE … WHEN …`) are explicitly allowed; we lean on author judgment for the gnarly cases.

## Compliance

- `templates/prd-template.md` requires EARS pattern + statement per requirement.
- `/spec:clarify` flags requirements that fail EARS shape checks.
- The `pm` subagent's prompt mandates EARS.
- Reviews verify EARS compliance as part of the requirements quality gate.

## References

- Alistair Mavin — *EARS: Easy Approach to Requirements Syntax* — https://alistairmavin.com/ears/
- IEEE: Mavin, Wilkinson, Harwood, Novak — *Easy Approach to Requirements Syntax (EARS)* — https://ieeexplore.ieee.org/document/5328509/
- Jama Software — *Frequently Asked Questions about EARS* — https://www.jamasoftware.com/requirements-management-guide/writing-requirements/frequently-asked-questions-about-the-ears-notation-and-jama-connect-requirements-advisor/
