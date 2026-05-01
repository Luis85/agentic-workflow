# PR 3 — Release readiness check + tests

Tasks: T-V05-004, T-V05-005  
Issue: #90

## T-V05-004 — Add release readiness check
Owner: dev | Estimate: M | Depends on: T-V05-001, T-V05-002

Implement deterministic check covering: version, tag, changelog, lifecycle release notes, package metadata, release config, workflow permissions.

Satisfies: REQ-V05-007, REQ-V05-010, NFR-V05-003, SPEC-V05-005, SPEC-V05-008

## T-V05-005 — Test release readiness behavior
Owner: qa | Estimate: M | Depends on: T-V05-004

Focused tests for: valid release, missing changelog entry, missing lifecycle release notes, package metadata drift, unsafe workflow permissions.

Satisfies: REQ-V05-007, REQ-V05-010, NFR-V05-003, SPEC-V05-005, SPEC-V05-008
