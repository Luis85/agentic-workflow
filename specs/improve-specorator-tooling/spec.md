---
id: SPECDOC-IST-001
title: Specorator improvement command specification
stage: specification
feature: improve-specorator-tooling
status: accepted
owner: architect
inputs:
  - PRD-IST-001
  - DESIGN-IST-001
created: 2026-04-28
updated: 2026-04-28
---

# Specification — Specorator improvement command specification

### SPEC-IST-001 — Command namespace

- **Behavior:** Add `/specorator:update`, `/specorator:add-script`, `/specorator:add-tooling`, and `/specorator:add-workflow`.
- **Satisfies:** REQ-IST-001, REQ-IST-002, REQ-IST-003, REQ-IST-004

### SPEC-IST-002 — Shared skill

- **Behavior:** Add `specorator-improvement` with modes for `update`, `script`, `tooling`, and `workflow`.
- **Satisfies:** REQ-IST-001, REQ-IST-002, REQ-IST-003, REQ-IST-004, NFR-IST-001

### SPEC-IST-003 — Documentation integration

- **Behavior:** Update the core docs, skill catalog, sink, and generated command inventories.
- **Satisfies:** REQ-IST-005, NFR-IST-001
