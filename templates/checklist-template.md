---
id: CHECKLIST-<AREA>-NNN
title: <Checklist name>
purpose: <One sentence: what this checklist guarantees>
applies_to: <stage(s) or artifact(s)>
owner: <role>
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Checklist — <Title>

> Use checklists for repeatable quality gates that aren't worth automating yet. Each item is a falsifiable yes/no question.

## Items

- [ ] Item 1 — *<one sentence stating the check, falsifiably>*
- [ ] Item 2 — …
- [ ] Item 3 — …

## How to use

1. Copy this checklist into the active stage's working area.
2. Walk every item. No "N/A" without a one-line reason.
3. Fail-fast: if an item fails, stop and resolve before continuing.
4. Save the completed checklist alongside the artifact it gated.

## Maintenance

- Items that *never* fail can be removed (or automated).
- Items that *always* fail point at a process problem — fix the process, not the checklist.
- Add items via PR; explain in the PR description what defect they would have caught.
