---
description: Project Manager Track — Group G (Post-Project). Evaluates whether expected benefits were realised. Run 3-6 months after project closure, repeatable annually for up to 5 years.
allowed-tools: [Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /project:post

Run the P3.Express Group G — Post-Project Management activities. Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

Run this command 3–6 months after `/project:close`, and optionally once a year for up to 5 years after closure. The sponsor owns the mandate for running this; it may require delegating execution to a successor PM.

## Pre-conditions

- `project-state.md` shows `phase: closed` or `phase: post-project`.

## Procedure

1. Read `project-description.md` — extract the **expected benefits** stated at project start.
2. Read `project-closure.md` — what was delivered and what lessons were captured.
3. Collect benefit-realisation evidence from the human: metrics, customer feedback, adoption data, business outcomes. (Use WebSearch/WebFetch if public data is relevant — e.g., client public announcements, product reviews.)
4. Append a dated benefits-evaluation section to `project-closure.md`:

```markdown
## Post-Project Evaluation — YYYY-MM-DD

### G01 — Benefits realised

| Expected benefit | Target metric | Actual outcome | Verdict |
|---|---|---|---|
| ... | ... | ... | realised / partial / not realised / too early |

**Unexpected benefits:** [list or "none identified"]
**Dis-benefits (unexpected negative outcomes):** [list or "none identified"]
**Benefits too early to evaluate:** [list with next evaluation date]

### G02 — New ideas

[Ideas for follow-on work generated from the experience of this project. These are inputs for future discovery sprints or feature briefs — not commitments.]

### G03 — Focused comms note

[Post-project communication to relevant stakeholders: what was achieved, what's next.]
```

5. Update `project-state.md`: set `phase: post-project`, `last_updated: <today>`.
6. If more evaluations are planned, append a note to `project-state.md` with the next evaluation date.

## Don't

- Don't invent benefit metrics — mark as `TBD — awaiting data from <owner>` if unavailable.
- Don't rewrite or erase the original closure document — append only.
- Don't confuse post-project benefit tracking with project retrospective (Stage 11 of the Spec Kit) — they are complementary: Stage 11 retrospectives evaluate the delivery process; G01 evaluates the delivered value.
