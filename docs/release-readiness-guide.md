---
title: "Release readiness guide"
folder: "docs"
description: "Reference for using a release readiness guide to align product perspectives and stakeholder requirements before production."
entry_point: false
---
# Release readiness guide

The release readiness guide is an optional Stage 10 companion artifact for releases that need an explicit go/no-go packet before production. It helps the release manager gather product, user, stakeholder, engineering, security, operations, support, data, commercial, and communication evidence in one place.

Use it when `release-notes.md` alone would hide important approval conditions or stakeholder requirements. The guide feeds the final release notes, quality review, authorization request, and retrospective; it does not replace those artifacts.

## Artifact

Create `specs/<feature>/release-readiness-guide.md` from [`templates/release-readiness-guide-template.md`](../templates/release-readiness-guide-template.md) when any of these are true:

- the release changes user-visible behavior, pricing, customer commitments, data handling, or operations,
- more than one stakeholder group must approve the production decision,
- the release has conditions, waivers, or known gaps that need an explicit owner,
- the team needs a meeting-ready go/no-go record.

The artifact is lazy: small internal releases may skip it and document readiness directly in `release-notes.md`.

## Relationship to Stage 10

`/spec:release` still produces `release-notes.md` as the canonical Stage 10 output. The release readiness guide is supporting evidence that the release manager may create during the prepare phase before asking for production authorization.

The guide should answer four questions:

1. What increment is going to production, and why now?
2. Which product perspectives and stakeholder requirements must be satisfied?
3. What evidence proves each requirement is satisfied, conditional, not applicable, or a gap?
4. Who owns the go/no-go decision and any release conditions?

## Readiness perspectives

The template uses these default perspectives:

| Perspective | Release question |
|---|---|
| Product value | Does the increment deliver the promised user, customer, or business outcome? |
| User experience | Are core journeys, edge states, accessibility, and docs ready? |
| Customer / stakeholder | Have affected stakeholders accepted impact, timing, and tradeoffs? |
| Engineering | Are implementation, tests, traceability, and limitations acceptable? |
| Security / privacy / compliance | Are security, privacy, regulatory, and data obligations satisfied? |
| Operations / SRE | Are deploy, rollback, observability, incident response, and on-call coverage ready? |
| Support / success | Can support explain, triage, and escalate user issues? |
| Data / analytics | Can the team measure adoption, health, and unintended outcomes? |
| Commercial / finance | Are pricing, packaging, contract, billing, and revenue effects handled? |
| Communications | Are internal and external messages approved and scheduled? |

Teams may mark a perspective `not-applicable`, but should not silently delete one unless the project has an equivalent local release checklist.

## Verdicts

Use the same readiness language as the Quality Assurance Track where possible:

- `ready` — all required perspectives are satisfied.
- `ready-with-conditions` — the release may proceed only if named conditions have owners, due dates, and accepted impact.
- `not-ready` — one or more gaps stop the release.
- `blocked` — the team cannot make the decision because required evidence or authority is missing.

## Handoff

After the guide is complete:

- copy user-facing impact, limitations, verification, rollback, observability, and communication items into `release-notes.md`,
- link any execution-health gaps to a `/quality:*` review when evidence needs deeper audit,
- move unresolved learning or process gaps into `retrospective.md`,
- ask for explicit authorization before irreversible actions such as tagging, publishing, or deploying.
