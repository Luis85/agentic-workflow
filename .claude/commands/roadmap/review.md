---
description: Roadmap Management Track - Review. Run a cadence review, update confidence, and identify stakeholder/team communication needs.
argument-hint: <roadmap-slug>
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /roadmap:review

Run a roadmap cadence review. Delegates to the `roadmap-manager` agent.

## Inputs

- `$1` - roadmap slug.
- Roadmap artifacts under `roadmaps/$1/`.
- Linked `specs/`, `projects/`, and `portfolio/` artifacts listed in `roadmap-strategy.md`.

## Timing guard

Read `roadmap-state.md`.

- If `next_review` is in the future, tell the user the planned date and ask whether to continue.
- Continue without warning if the user says priorities, delivery status, stakeholder expectations, market context, or team capacity changed.

## Procedure

Invoke the `roadmap-manager` agent to:

1. Re-read linked evidence.
2. Update item status, horizon, confidence, risks, and dependencies.
3. Flag stale items, missing measures, and overcommitment.
4. Identify stakeholder conflicts and team communication needs.
5. Update `communication-log.md` with the next recommended update.
6. Update `decision-log.md` for decisions requested or made.
7. Set `last_review`, `next_review`, and `last_updated` in `roadmap-state.md`; `last_review` and `next_review` must be ISO dates (`YYYY-MM-DD`), not cadence text.

## Don't

- Don't silently move items into `Now`; record why the horizon changed.
- Don't overwrite decision history.
- Don't edit linked feature, project, or portfolio artifacts.
