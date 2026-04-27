# Issue: Fix ADR reference number mismatches (ADR-0007 label linking to ADR-0008)

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Open
- **Area:** Traceability and governance docs

## Summary
Multiple files label references as **ADR-0007** while linking to the ADR-0008 document path.

## Evidence
Detected mismatches:

- `.claude/memory/MEMORY.md`: text says `ADR-0007` but URL points to `0008-add-project-manager-track.md`
- `docs/project-track.md`: text says `ADR-0007` but URL points to `adr/0008-add-project-manager-track.md`
- `docs/sink.md`: text says `ADR-0007` but URL points to `adr/0008-add-project-manager-track.md`

## Why it matters
ADR IDs are immutable governance anchors. Label/path mismatch breaks traceability and can lead readers to the wrong rationale when auditing process decisions.

## Proposed fix
- Update label text to `ADR-0008` where the link target is ADR-0008.
- Run a doc consistency pass to ensure all `ADR-<id>` labels match linked filenames.

## Acceptance criteria
- No remaining ADR label/path ID mismatches in markdown docs.
- Spot-check in affected files confirms consistent numbering.
