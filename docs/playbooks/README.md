# Playbooks

Operational runbooks. Used by the `sre` agent and on-call humans.

## Recommended files (add as needed)

- `incident.md` — on-call rota, severity definitions, paging rules, communication channels, declaration / closure procedure.
- `launch.md` — pre-launch checklist, launch-day runbook, rollback triggers.
- `rollback.md` — per-service rollback steps, data-implication notes, communication plan.
- `<service>.md` — per-service operational notes: dashboards, SLOs, common diagnoses.

## Style

- Lists, not prose. The reader is at 2 a.m.
- Each step is a verifiable action (a command, a URL, a click).
- Every "if X" branches to a concrete next step or escalation.
- Include the "happy path" and the most common failures.

## Linking

`docs/steering/operations.md` should link to specific playbooks once they exist (e.g. "see `docs/playbooks/incident.md` for the rota and severity definitions").

> This file is the directory's `.gitkeep` substitute — leave it in place even when no playbooks are filed yet.
