# Specorator Quality Steering

## Quality Model

Specorator quality is evidence-backed workflow integrity: artifacts match their inputs, traceability is preserved, checks are deterministic, and human acceptance points remain explicit.

The canonical quality framework lives in [`docs/quality-framework.md`](../quality-framework.md). This file narrows it to template-improvement work.

## Definition Of Tested

A Specorator template change is tested when:

1. The changed behavior is covered by an automated check, a targeted fixture, or a documented manual evidence note.
2. The verification references the relevant task, requirement, spec item, or issue.
3. `npm run verify` passes before push, or the skipped check is named with rationale.
4. User-facing docs or product-page changes are checked for links, frontmatter, and claim accuracy.

## Verification Layers

| Layer | Use |
|---|---|
| `npm run check:fast` | Quick local feedback for common content, workflow, and script issues. |
| `npm run verify:changed` | Targeted gate based on changed files. |
| `npm run verify` | Final PR gate before push or ready-for-review. |
| GitHub Actions | Remote confirmation for verify, PR title, security scans, spelling, and release workflows. |
| Critic / reviewer pass | Judgment on scope, traceability, risk, and claims. |

## Review Checklist

- [ ] The change satisfies a named requirement, task, issue, or ADR.
- [ ] Specs are updated before implementation when requirements change.
- [ ] Downstream starter templates remain reusable.
- [ ] Public claims are backed by committed evidence.
- [ ] Optional controls remain opt-in unless an ADR says otherwise.
- [ ] No unrelated refactors or process changes are bundled.
- [ ] Verification evidence is recorded in the PR and, when required, the feature implementation log.

## Risk Handling

- **Traceability risk:** add or update task/spec references in the same branch.
- **Adapter drift risk:** point back to `AGENTS.md` and tool-specific owners.
- **Security overclaim risk:** state that guidance reduces internal risk and is not certification.
- **Hook false-positive risk:** keep examples advisory and document disable paths.
- **Release-package risk:** verify the fresh-surface contract before publishing.

## Common Agent Mistakes

- Treating docs-only changes as exempt from verification.
- Updating a template without preserving starter usefulness.
- Leaving `workflow-state.md` stale after a stage artifact changes.
- Marking a draft PR ready before local verification is green.
