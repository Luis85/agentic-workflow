# Issue: Fix broken relative links in templates and skill docs

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Resolved
- **Area:** Documentation integrity

## Summary
A repository-wide markdown link audit found multiple broken relative links in `templates/` and `.claude/skills/project-run/SKILL.md`. These links currently resolve to non-existent paths and create dead navigation in key onboarding artifacts.

## Evidence
Broken links discovered by automated scan:

- `templates/discovery-frame-template.md` → `../../docs/discovery-track.md`
- `templates/deliverables-map-template.md` → `../../specs/feature-slug/workflow-state.md`
- `templates/deliverables-map-template.md` → `../../discovery/sprint-slug/discovery-state.md`
- `templates/weekly-log-template.md` → `../../specs/slug/workflow-state.md`
- `templates/project-description-template.md` → `../../specs/feature-a/requirements.md`
- `.claude/skills/project-run/SKILL.md` → `../../docs/project-track.md`
- `.claude/skills/project-run/SKILL.md` → `../../docs/adr/0008-add-project-manager-track.md`
- `.claude/skills/project-run/SKILL.md` → `../../.claude/agents/project-manager.md`

## Why it matters
These files are core entry points for contributors and agents. Broken links reduce trust in the workflow and can cause agents to miss authoritative instructions.

## Proposed fix
- Correct relative path depth in every affected file.
- Add a CI or local verification check that fails on broken local markdown links.

## Acceptance criteria
- All links in listed files resolve successfully.
- A repeat run of the markdown link scanner reports zero non-placeholder broken local links.

## Resolution
Resolved in branch `fix/doc-review-issues` by correcting real relative paths, preserving generated-artifact-relative template links where required, and converting placeholder example paths to non-clickable code spans.
