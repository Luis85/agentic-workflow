# PR-E — Agentic security review path

> Implementer brief for the v0.6 agentic-security slice. Branch: `feat/v06-agentic-security`. Tracking issue: [#91](https://github.com/Luis85/agentic-workflow/issues/91). Milestone: v0.6.

## Tasks

| ID | Title | Owner role | Estimate |
|---|---|---|---|
| T-V06-010 | Add agentic security review path | reviewer | L |

## Goal

Add an OWASP-aligned review path for risks unique to autonomous tool-using agents. Frame as internal risk-reduction guidance — no certification or completeness claims.

## Spec references

- [requirements.md](./requirements.md) — REQ-V06-007, REQ-V06-008
- [design.md](./design.md) — *Agentic security review model*
- [spec.md](./spec.md) — SPEC-V06-005
- [tasks.md](./tasks.md) — T-V06-010

## Requirements satisfied

- REQ-V06-007 — Add agentic security review path (must)
- REQ-V06-008 — Avoid overstated security claims (unwanted-behavior, must)
- NFR-V06-003 — Hooks/security automation start opt-in and reversible
- NFR-V06-005 — Public claims backed by evidence
- SPEC-V06-005 — Agentic security review

## Test scenarios

| ID | Scenario | Expected |
|---|---|---|
| TEST-V06-007 | Reviewer runs the agentic security review path | Findings cover OWASP-aligned agent risks + human authorization boundaries |
| TEST-V06-008 | Public docs describe security controls | Claims limited to internal risk reduction; no certification language |

## CLAR resolution required (BLOCKING)

**CLAR-V06-002** — Confirm whether the agentic security review is a new optional track, a QA checklist extension, or both. **Resolve in #91 before T-V06-010 begins.** The answer drives doc location, skill structure, and whether new track scaffolding is needed.

## Review categories (per design.md)

- Goal and instruction hijacking
- Tool misuse, unsafe permissions, destructive operations
- Excessive agency and missing human authorization
- Memory, context, or artifact poisoning
- Secrets, credentials, private data exposure
- Inter-agent handoff failures, unreviewed autonomous outputs
- Observability and audit trail for agent actions

## Implementation outline

1. Resolve CLAR-V06-002 → land doc structure choice.
2. Land `docs/agentic-security-review.md` with risk taxonomy + checklist + findings template.
3. If track: scaffold `quality/<slug>/` style folder under chosen path, register state file, add new `.claude/skills/agentic-security-review/SKILL.md`.
4. If QA-extension: add section to `docs/quality-framework.md` or `docs/quality-assurance-track.md` referencing the same checklist.
5. Either way: provide a finding-record template (`templates/agentic-security-findings.md`) capturing finding, mitigation, residual risk, follow-up.
6. Wire into AGENTS.md and CLAUDE.md as opt-in path.
7. Update README + product page section *only* via PR-H (positioning) — do not duplicate here.

## Files of interest

- New `docs/agentic-security-review.md`
- New `templates/agentic-security-findings.md`
- New `.claude/skills/agentic-security-review/SKILL.md` (if track or skill chosen)
- Possibly extend `docs/quality-framework.md` / `docs/quality-assurance-track.md`
- `AGENTS.md`, `CLAUDE.md` — pointer entries
- `tools/automation-registry.yml` — register new skill or check

## Definition of Done

- [ ] CLAR-V06-002 resolved on #91
- [ ] T-V06-010 review path doc landed with all 7 risk categories
- [ ] Finding-record template landed
- [ ] Public-facing language states limits + avoids certification claims
- [ ] Path wired as opt-in (no default-path change)
- [ ] `npm run verify` green
- [ ] PR title matches `feat(v06): ...`

## Workflow refs

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/specorator.md`](../../docs/specorator.md)
- [`docs/quality-framework.md`](../../docs/quality-framework.md)
- [`docs/quality-assurance-track.md`](../../docs/quality-assurance-track.md)
- [`docs/security-ci.md`](../../docs/security-ci.md)
- [`memory/constitution.md`](../../memory/constitution.md) — Article IX Reversibility

## Coordination

- No file overlap with other Wave 1 PRs.
- T-V06-012 (positioning) cites this path after merge — coordinate language.
