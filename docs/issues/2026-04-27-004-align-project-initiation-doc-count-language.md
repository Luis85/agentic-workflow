# Issue: Align `/project:initiate` language with actual output doc count

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Open
- **Area:** Process documentation consistency

## Summary
`docs/project-track.md` states that `/project:initiate` "Produces the three founding documents" but the same section lists four outputs, including `health-register.md`.

## Evidence
- Statement: "Produces the three founding documents..."
- Outputs list: `project-description.md`, `deliverables-map.md`, `followup-register.md`, `health-register.md`

## Why it matters
This creates ambiguity about the required initiation deliverables and can lead maintainers to omit `health-register.md` when validating project setup.

## Proposed fix
Update the sentence to match the output contract, for example:

```md
Produces the four foundational documents and gates on human approval (A08).
```

If `health-register.md` is intentionally seeded outside initiation, remove it from the outputs list and define when it is first created.

## Acceptance criteria
- The `/project:initiate` section uses one consistent deliverable count.
- The text and outputs list match exactly.
