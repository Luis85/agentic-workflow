---
id: PRD-CLI-001
title: CLI Todo App — v1
stage: requirements
feature: cli-todo
status: draft
owner: pm
inputs:
  - IDEA-CLI-001
  - RESEARCH-CLI-001
created: 2026-04-27
updated: 2026-04-27
---

# PRD — CLI Todo App (v1)

## Summary

We are building `todo`, a single-binary command-line task manager for terminal-native engineers who need to capture, list, and close short-lived tasks without leaving their shell. The tool is also the primary worked example for the specorator: every artifact from idea through retrospective is kept purposefully small so a contributor can read the spec alongside the source in a single sitting. The project is timely because no existing CLI todo manager is simultaneously small enough to be a readable example, distributed as a true single binary, and designed to serve as a didactic walkthrough of the full specorator workflow.

## Goals

- **G1** — Deliver a binary called `todo` that implements the full task lifecycle (add, list, mark done, remove) with a learnable surface area of five subcommands.
- **G2** — Persist tasks reliably across invocations in a local data file with no network calls, no accounts, and no background process.
- **G3** — Enable a new user to complete a full add → list → done cycle in under two minutes, guided by `--help` output alone, with no prior documentation.
- **G4** — Serve as a didactic worked example: the implementation source and the spec must be co-readable in one sitting, with every requirement traceable to its code location.
- **G5** — Keep scope hard-bounded at v1: no features beyond the five commands, so the example does not outgrow the workflow it is meant to illustrate.

## Non-goals

- **NG1** — No cloud sync, remote backup, or multi-device support.
- **NG2** — No GUI or full-screen TUI; the interface is strictly a shell command.
- **NG3** — No reminders, notifications, or due dates.
- **NG4** — No recurring tasks.
- **NG5** — No nested sub-tasks or project hierarchy.
- **NG6** — No plugin or extension architecture.
- **NG7** — No telemetry, analytics, or network calls in the default execution path.
- **NG8** — No priorities, tags, or search in v1.
- **NG9** — No JSON schema migration tooling in v1; schema changes are a hypothetical v2 concern.
- **NG10** — **Windows is not a v1 target.** The v1 platform scope is Linux and macOS. Windows presents cross-platform rename edge cases and CI-matrix overhead that would dilute the didactic value of this example. A hypothetical v2 example could add Windows coverage; until then, behaviour on Windows is undefined and undocumented. See Out of scope.

> **Rationale for NG10:** RISK-005 in research.md identifies Windows path-handling edge cases as a real concern. Keeping v1 to Linux + macOS means a single CI target, simpler XDG path logic, and a smaller implementation surface — all of which directly serve the didactic goal (G4). If a contributor uses this example to bootstrap a production tool, they own the Windows decision.

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| **Alex — Terminal-native engineer** | Capture and close short-lived tasks without leaving the shell; no accounts, no browser, no cloud | Represents the primary functional user; drives all five command requirements and the data persistence story |
| **Morgan — Spec-kit contributor** | A small, realistic worked artifact to study the full specorator workflow from idea to retrospective | Represents the secondary user from IDEA-CLI-001; drives the didactic constraints (minimal deps, readable source, inline requirement cross-references) |

## Jobs to be done

- When I think of a task while coding, I want to capture it with a single command, so I can return to my editor immediately without losing the thought.
- When I sit down to work, I want to list my open tasks in one command, so I can choose what to tackle next without switching tools.
- When I finish a task, I want to mark it done by ID, so I have a clear record of what I completed without manually editing a file.
- When a task is no longer relevant, I want to remove it by ID, so my list stays clean without accumulating stale entries.
- When I am learning the specorator, I want to trace every requirement in this PRD to a line of source code, so I can understand how the workflow produces a real implementation.

## Functional requirements (EARS)

> Every requirement uses EARS notation. One requirement per entry. `shall` throughout. No design language (no file formats, library names, or data structures). See `docs/ears-notation.md`.

---

### REQ-CLI-001 — Add a task

- **Pattern:** Event-driven
- **Statement:** WHEN the user invokes `todo add` with a non-empty text argument, the CLI shall create a new task with a unique sequential integer ID and persist it so that it appears in subsequent `todo list` output.
- **Acceptance:**
  - Given no prior task exists with the given text
  - When the user runs `todo add "buy coffee"`
  - Then the CLI exits with code 0
  - And a subsequent `todo list` shows an entry with a unique integer ID and the text "buy coffee"
  - And the ID is one greater than the previously highest ID (or 1 if no tasks exist)
- **Priority:** must
- **Satisfies:** IDEA-CLI-001, RESEARCH-CLI-001 (Q3 scope floor, ID scheme)

---

### REQ-CLI-002 — List open tasks

- **Pattern:** Event-driven
- **Statement:** WHEN the user invokes `todo list`, the CLI shall display all tasks whose status is not done, each on its own line, showing the task ID and text.
- **Acceptance:**
  - Given three tasks exist, two open and one marked done
  - When the user runs `todo list`
  - Then exactly the two open tasks are printed, each on its own line
  - And each line shows the integer ID and the task text
  - And the done task does not appear
- **Priority:** must
- **Satisfies:** IDEA-CLI-001, RESEARCH-CLI-001 (Q3 scope floor)

---

### REQ-CLI-003 — List all tasks including completed

- **Pattern:** Event-driven
- **Statement:** WHEN the user invokes `todo list --all`, the CLI shall display every task regardless of status, each on its own line, showing the task ID, text, and whether it is done.
- **Acceptance:**
  - Given two open tasks and one done task exist
  - When the user runs `todo list --all`
  - Then all three tasks appear, each on its own line
  - And each line shows the integer ID, done/open indicator, and task text
- **Priority:** should
- **Satisfies:** IDEA-CLI-001, RESEARCH-CLI-001 (analyst hand-off: add `--all` if needed to reach ≥ 7 FRs; also provides genuine user value for reviewing completed work)

---

### REQ-CLI-004 — Mark a task done

- **Pattern:** Event-driven
- **Statement:** WHEN the user invokes `todo done` with a valid integer ID, the CLI shall mark the identified task as done and confirm the action with a single-line success message.
- **Acceptance:**
  - Given a task with ID 2 exists and is open
  - When the user runs `todo done 2`
  - Then the CLI exits with code 0 and prints a confirmation line referencing ID 2
  - And a subsequent `todo list` does not show task 2
  - And a subsequent `todo list --all` shows task 2 with a done indicator
- **Priority:** must
- **Satisfies:** IDEA-CLI-001, RESEARCH-CLI-001 (Q3 scope floor)

---

### REQ-CLI-005 — Remove a task

- **Pattern:** Event-driven
- **Statement:** WHEN the user invokes `todo rm` with a valid integer ID, the CLI shall permanently delete the identified task and confirm the action with a single-line success message.
- **Acceptance:**
  - Given a task with ID 3 exists
  - When the user runs `todo rm 3`
  - Then the CLI exits with code 0 and prints a confirmation line referencing ID 3
  - And a subsequent `todo list --all` does not show task 3
  - And no future task is assigned ID 3 (IDs are never reused)
- **Priority:** must
- **Satisfies:** IDEA-CLI-001, RESEARCH-CLI-001 (Q3 scope floor, ID scheme)

---

### REQ-CLI-006 — Help output on every subcommand

- **Pattern:** Event-driven
- **Statement:** WHEN the user passes `--help` to the `todo` binary or to any of its subcommands (`add`, `list`, `done`, `rm`), the CLI shall print usage information for that command and exit with code 0.
- **Acceptance:**
  - Given the binary is installed
  - When the user runs `todo --help`
  - Then usage text is printed covering all subcommands and exits with code 0
  - And when the user runs `todo add --help`, usage text specific to `add` is printed and exits with code 0
  - And the same holds for `todo list --help`, `todo done --help`, and `todo rm --help`
- **Priority:** must
- **Satisfies:** IDEA-CLI-001 (desired outcome: learnable from `--help` alone)

---

### REQ-CLI-007 — Persistence across invocations

- **Pattern:** Ubiquitous
- **Statement:** The CLI shall persist all task data to a local file so that tasks added in one invocation are available in every subsequent invocation on the same machine.
- **Acceptance:**
  - Given the user runs `todo add "read spec"` and the CLI exits
  - When the user opens a new shell session and runs `todo list`
  - Then the task "read spec" appears in the output
- **Priority:** must
- **Satisfies:** IDEA-CLI-001 (state persists across invocations), RESEARCH-CLI-001 (Q1 storage format)

---

### REQ-CLI-008 — Atomic write protection

- **Pattern:** Ubiquitous
- **Statement:** The CLI shall write all task data mutations via an atomic replace operation so that a crash or signal during a write leaves the existing data file intact.
- **Acceptance:**
  - Given a valid data file with two tasks exists
  - When a write operation is interrupted (simulated by sending SIGKILL mid-write)
  - Then the data file remains readable and contains the two original tasks
  - And no partial or zero-byte file exists at the data file path
- **Priority:** must
- **Satisfies:** RESEARCH-CLI-001 (Q4 concurrent access, atomic-rename recommendation; RISK-003)

---

### REQ-CLI-009 — Data file location convention

- **Pattern:** Ubiquitous
- **Statement:** The CLI shall store the data file in the platform-standard user data directory by default, and shall use the path specified in the `TODO_FILE` environment variable instead when that variable is set to a non-empty value.
- **Acceptance:**
  - Given `TODO_FILE` is not set
  - When any mutating command runs on Linux
  - Then the data file is created under `~/.local/share/todo/`
  - And given `TODO_FILE=/tmp/test-tasks` is set
  - When any mutating command runs
  - Then the data file is created at `/tmp/test-tasks` and no file is written to the default location
- **Priority:** must
- **Satisfies:** RESEARCH-CLI-001 (Q5 data file location)

---

### REQ-CLI-010 — Error on unknown ID for done

- **Pattern:** Unwanted behaviour
- **Statement:** IF the user invokes `todo done` with an integer that does not match any existing task ID, THEN the CLI shall print an error message identifying the unknown ID and exit with a non-zero exit code.
- **Acceptance:**
  - Given no task with ID 99 exists
  - When the user runs `todo done 99`
  - Then the CLI prints an error message that includes "99" and exits with a non-zero code
  - And the data file is unchanged
- **Priority:** must
- **Satisfies:** IDEA-CLI-001 (learnable: user gets clear feedback), RESEARCH-CLI-001 (Q3 scope floor)

---

### REQ-CLI-011 — Error on unknown ID for rm

- **Pattern:** Unwanted behaviour
- **Statement:** IF the user invokes `todo rm` with an integer that does not match any existing task ID, THEN the CLI shall print an error message identifying the unknown ID and exit with a non-zero exit code.
- **Acceptance:**
  - Given no task with ID 42 exists
  - When the user runs `todo rm 42`
  - Then the CLI prints an error message that includes "42" and exits with a non-zero code
  - And the data file is unchanged
- **Priority:** must
- **Satisfies:** IDEA-CLI-001 (learnable: user gets clear feedback), RESEARCH-CLI-001 (Q3 scope floor)

---

### REQ-CLI-012 — Graceful handling of corrupt or unreadable data file

- **Pattern:** Unwanted behaviour
- **Statement:** IF a task-data subcommand (`add`, `list`, `done`, `rm`) is invoked AND the data file exists but cannot be read or parsed as valid task data, THEN the CLI shall print a human-readable error message identifying the file path and exit with a non-zero exit code without overwriting the file.
- **Acceptance:**
  - Given the data file contains invalid content (e.g., truncated or non-task data)
  - When the user runs any task-data subcommand (`todo add …`, `todo list`, `todo done <id>`, `todo rm <id>`)
  - Then the CLI prints an error message that includes the data file path and exits with a non-zero code
  - And the data file contents are unchanged after the invocation
  - And `todo --help` and every `todo <subcommand> --help` still exit with code 0 in the same scenario, because help invocations do not read the data file (consistency with REQ-CLI-006)
- **Priority:** must
- **Satisfies:** RESEARCH-CLI-001 (RISK-003; robust error handling), IDEA-CLI-001 (no silent data loss)

---

### REQ-CLI-013 — Non-empty text required for add

- **Pattern:** Unwanted behaviour
- **Statement:** IF the user invokes `todo add` with an empty string or no text argument, THEN the CLI shall print an error message and exit with a non-zero exit code without modifying the data file.
- **Acceptance:**
  - Given no prior state assumption
  - When the user runs `todo add ""` or `todo add` with no argument
  - Then the CLI prints an error message and exits with a non-zero code
  - And the task count is unchanged
- **Priority:** must
- **Satisfies:** IDEA-CLI-001 (learnable: user gets clear feedback on misuse)

---

## Non-functional requirements

> The steering files (`docs/steering/quality.md`, `docs/steering/operations.md`) are template placeholders for this repo and contain no project-specific thresholds. The targets below are introduced here and are specific to this feature. Each introduced threshold is noted with (introduced here).

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-CLI-001 | performance | Command completion time for any subcommand against a data file with up to 10,000 tasks | ≤ 1 second wall-clock on a 2015-era commodity laptop (introduced here) |
| NFR-CLI-002 | reliability | Data file integrity after any crash or signal during a write | Existing data file remains intact and parseable; no partial write visible to subsequent invocations (introduced here) |
| NFR-CLI-003 | portability | Supported shell environments | Linux (x86-64, arm64) and macOS (x86-64, arm64); Windows undefined |
| NFR-CLI-004 | privacy | Network calls in the default execution path | Zero; no telemetry, no analytics, no outbound connections of any kind (introduced here) |
| NFR-CLI-005 | maintainability | Implementation size | Single-package source readable in one sitting; target ≤ 500 lines of source code across all files excluding tests (introduced here; counter-metric also recorded in Success metrics) |
| NFR-CLI-006 | installability | Install path | Binary installable from source with a single command requiring no prerequisites beyond the language toolchain (introduced here) |
| NFR-CLI-007 | traceability | Requirement-to-code mapping | Every REQ-CLI-NNN in this document maps to at least one identified code location by the time `/spec:review` runs (introduced here) |

## Success metrics

- **North star:** A new user with the binary installed can complete a full `todo add` → `todo list` → `todo done` cycle in under 2 minutes, guided by `--help` output alone, with no prior documentation. (Target: verifiable in a usability pass with 3 participants.)
- **Supporting:**
  - A specorator contributor can map every REQ-CLI-NNN entry in this document to its corresponding code location in one pass through the source. (Target: verified during `/spec:review` traceability check.)
  - All 13 functional requirements have a corresponding automated test that fails when the requirement is violated. (Target: 100% requirement-to-test coverage at `/spec:test` completion.)
- **Counter-metric:** Total source lines of code (excluding tests and generated files) stays at or below 500. Exceeding this threshold is a signal that scope has crept and must be explicitly reviewed. (Aligns with NFR-CLI-005.)

## Release criteria

What must be true to ship the worked example as a complete stage-3 artifact.

- [ ] All `must` requirements (REQ-CLI-001 through REQ-CLI-013 except REQ-CLI-003 which is `should`) pass their acceptance criteria.
- [ ] All NFRs met or explicitly waived with a recorded ADR.
- [ ] Test plan executed; no critical bugs open (severity 1 or 2 per the quality framework).
- [ ] Documentation updated: `README.md` carries a notice that this is a specorator example, not a production tool.
- [ ] Traceability matrix (`traceability.md`) is complete: every REQ-CLI-NNN links to at least one code location and one test.
- [ ] Retrospective (`retrospective.md`) filed — never skipped per the constitution.

## Open questions / clarifications

None. Both items handed off by the analyst have been resolved:

1. **FR count:** 13 functional requirements landed (REQ-CLI-001 through REQ-CLI-013), comfortably above the 7-requirement floor. The `todo list --all` subcommand (REQ-CLI-003) was added as a `should`-priority requirement — it provides genuine user value (reviewing completed work) and contributes to test coverage without inflating the implementation meaningfully.
2. **Windows scope:** Windows is explicitly excluded from v1 (NG10). Rationale documented above.

## Out of scope

What we explicitly will not do this release cycle.

- No cloud sync, remote backup, or multi-device support.
- No GUI or full-screen TUI.
- No reminders, notifications, due dates, or recurring tasks.
- No nested sub-tasks or project hierarchy.
- No plugin or extension architecture.
- No telemetry or network calls.
- No priorities, tags, or search.
- No JSON schema migration tooling; the data file format is fixed for v1.
- **Windows platform support.** Behaviour on Windows is undefined. A hypothetical v2 example would add it.
- No `todo edit` command (editing task text after creation).
- No `todo undo` command.
- No sorting or filtering beyond `--all`.
- No machine-readable output flag (e.g., `--json`) in v1.

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has an ID.
- [x] Acceptance criteria testable.
- [x] NFRs listed with targets.
- [x] Success metrics defined (including a counter-metric).
- [x] Release criteria stated.
- [ ] `/spec:clarify` returned no open questions. *(No open questions remain; this box left unticked per template instruction — the clause reads "returned no open questions", which is satisfied: there are none. Design stage may open new ones.)*
