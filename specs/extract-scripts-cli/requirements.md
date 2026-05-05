---
id: REQ-CLI-000
title: Requirements — specorator-cli
stage: requirements
feature: extract-scripts-cli
area: CLI
status: accepted
owner: pm
created: 2026-05-05
updated: 2026-05-05
---

# Requirements — specorator-cli

## Functional requirements

### Binary exposure

**REQ-CLI-001** — When `@luis85/agentic-workflow` is installed, the system SHALL provide a `specorator` binary accessible from the project's `node_modules/.bin/` directory.

**REQ-CLI-002** — When a user runs `specorator <subcommand>`, the system SHALL execute the corresponding script from the `scripts/` directory using the same logic as the existing `npm run <target>` alias.

**REQ-CLI-003** — The system SHALL expose at minimum the following subcommands: `verify`, `check:fast`, `check:content`, `check:workflow`, `fix`, `self-check`, `doctor`, and `quality:metrics`.

**REQ-CLI-004** — When `specorator --help` is run, the system SHALL display a list of available subcommands with one-line descriptions.

**REQ-CLI-005** — When `specorator <subcommand> --help` is run, the system SHALL display the usage and flag documentation for that subcommand.

### Root discovery

**REQ-CLI-006** — When `specorator` is invoked, the system SHALL resolve the project root by walking up from `process.cwd()` until a `package.json` or `.git` directory is found, rather than deriving the root from `import.meta.url`.

**REQ-CLI-007** — When `specorator` is invoked with a `--cwd <path>` flag, the system SHALL treat the supplied path as the project root, overriding the walk-up discovery.

**REQ-CLI-008** — When no project root can be found by walking up from `process.cwd()`, the system SHALL emit an error message and exit with a non-zero code.

### Backward compatibility

**REQ-CLI-009** — All existing `npm run <target>` aliases in `package.json` SHALL continue to work unchanged after the CLI binary is added.

**REQ-CLI-010** — The `npm run verify` gate SHALL produce identical output and exit codes before and after the CLI extraction.

**REQ-CLI-011** — The existing `scripts/lib/` shared helper API SHALL remain unchanged for internal callers; no public API is broken by the root discovery fix.

### Runtime dependency

**REQ-CLI-012** — The `tsx` package SHALL be declared as a `dependency` (not `devDependency`) so the `specorator` binary is executable from an installed package without requiring consumers to separately install `tsx`.

### Distribution

**REQ-CLI-013** — The CLI binary and its supporting scripts SHALL ship inside the existing `@luis85/agentic-workflow` npm package; no separate package is introduced in this version.

**REQ-CLI-014** — The `scripts/cli.ts` dispatcher entry point SHALL be included in the `files` array of `package.json`.

### CI and verify gate

**REQ-CLI-015** — The CI verify workflow SHALL invoke `specorator verify` (or continue to invoke `npm run verify`) and the exit code SHALL remain the gating signal; no CI logic is changed in the first cut.

**REQ-CLI-016** — When `specorator verify` exits with a non-zero code, CI SHALL fail the run, identical to the existing `npm run verify` behavior.

## Non-functional requirements

**REQ-CLI-NFR-001 — Performance:** The CLI dispatcher SHALL add no perceptible startup overhead relative to invoking `tsx scripts/verify.ts` directly (target: <50 ms added latency).

**REQ-CLI-NFR-002 — Determinism:** All check subcommands (`check:*`) SHALL remain read-only and idempotent; this property must hold when invoked via `specorator` CLI as well as via `npm run`.

**REQ-CLI-NFR-003 — Testability:** The root-discovery logic SHALL be independently testable without spawning a child process or touching the filesystem outside the test fixture.

**REQ-CLI-NFR-004 — Error messaging:** All error messages emitted by the CLI dispatcher SHALL be human-readable and include the failing subcommand name and the resolved project root path.

## Out of scope (first cut)

- Extracting scripts into a separate npm package (`@luis85/specorator-cli`).
- Monorepo workspace restructuring.
- Independent versioning of CLI and template.
- Plugin/extension model for user-defined subcommands.
- Global install support (`npm install -g @luis85/specorator-cli`).
- Compiling scripts to plain JavaScript for zero-runtime-dependency distribution.

## Success metrics

| Metric | Target |
|---|---|
| `specorator verify` exit code matches `npm run verify` exit code | 100% identical across all repo states |
| `npm run verify` remains green in CI after the change | No regressions |
| `scripts/lib/repo.ts` root discovery works when scripts are in `node_modules/` | Confirmed by a test fixture that simulates installed context |
| `tsx` listed in `dependencies` in `package.json` | Verified by `check:release-package-contents` or a new check |

## Release criteria

- All requirements REQ-CLI-001 through REQ-CLI-016 have a passing test or a verified manual acceptance check.
- `npm run verify` is green locally and in CI.
- ADR-0034 is accepted and filed under `docs/adr/`.
- `docs/specorator-product/tech.md` is updated to reference the `specorator` binary.
- A migration note is added to `CHANGELOG.md`.
