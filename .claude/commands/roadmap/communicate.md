---
description: Roadmap Management Track - Communicate. Produce and log a focused roadmap update for stakeholders or the delivery team.
argument-hint: <roadmap-slug> [audience]
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /roadmap:communicate

Prepare a focused roadmap communication and log it. Delegates to the `roadmap-manager` agent.

## Inputs

- `$1` - roadmap slug.
- `$2...` - optional audience or situation, such as `leadership`, `delivery-team`, `customer`, `client`, `sales`, `support`, or `all-hands`.
- Roadmap artifacts under `roadmaps/$1/`.
- `templates/roadmap-communication-log-template.md`
- `templates/roadmap-decision-log-template.md`

## Procedure

Invoke the `roadmap-manager` agent to:

1. Select the audience and communication purpose.
2. Summarize what changed, why it matters, confidence level, risks, and decisions needed.
3. Draft a concise update suitable for that audience.
4. Append the planned or sent update to `communication-log.md`.
5. Record any decision request or approval in `decision-log.md`.
6. Update `roadmap-state.md`.

## Don't

- Don't present tentative roadmap items as committed.
- Don't expose internal delivery uncertainty to external audiences without approved wording.
- Don't mark an update as sent unless the user confirms it.
