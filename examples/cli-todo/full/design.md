---
id: DESIGN-CLI-001
title: CLI Todo App — Design
stage: design
feature: cli-todo
status: complete
owner: architect
collaborators:
  - ux-designer
  - ui-designer
  - architect
inputs:
  - PRD-CLI-001
  - RESEARCH-CLI-001
adrs: [ADR-CLI-0001]
created: 2026-04-27
updated: 2026-04-27
---

# Design — CLI Todo App

<!-- Parts A, B, C filled sequentially by ux-designer → ui-designer → architect -->

## Context

`todo` is a single-binary command-line task manager for terminal-native engineers who need to capture, track, and close short-lived tasks without leaving their shell. PRD-CLI-001 defines five subcommands (`add`, `list`, `done`, `rm`, and `--help` coverage on all of them), local data persistence with no network dependency, and a strict non-interactive interface. The tool doubles as the primary worked example for the specorator: every artifact from idea through retrospective must remain small enough that a contributor can read the complete spec alongside the source code in a single sitting.

## Goals (design-level)

- **D1** — A new user can complete a full `todo add` → `todo list` → `todo done` cycle in under two minutes, guided by `--help` alone, with no external documentation.
- **D2** — Every command follows a single, predictable invocation shape (`todo <subcommand> [argument]`) so there is nothing novel to learn between subcommands.
- **D3** — Every output string — success, empty, and error — communicates exactly what happened and, where applicable, what to do next; no terse codes, no silent exits.
- **D4** — The interaction design is pipe-friendly and script-safe: success output goes to stdout, error output goes to stderr, and exit codes are reliable.
- **D5** — The design artifact itself is co-readable with the PRD in one sitting, serving the didactic goal for specorator contributors (Morgan persona).

## Non-goals

- **ND1** — No full-screen TUI or interactive prompts of any kind (maps to PRD NG2).
- **ND2** — No ANSI colour, bold, or other terminal escape sequences in default output (keeps output pipe-safe and avoids a visual design dependency).
- **ND3** — No pagination or pager integration for `todo list` output (maps to PRD out-of-scope: no sorting or filtering beyond `--all`).
- **ND4** — No machine-readable output flag (e.g., `--json`) in v1 (maps to PRD out-of-scope).
- **ND5** — No interactive confirmation prompts before destructive operations (`rm`) — the ID argument is the confirmation (maps to PRD NG2; keeps the tool script-safe).

---

## Part A — UX

### User flows

#### Flow 1 — Happy path: add → list → done cycle

```mermaid
flowchart TD
    A([User opens terminal]) --> B["todo add &quot;buy coffee&quot;"]
    B --> C{Data store readable?}
    C -->|No| ERR1[/"stderr: Error: cannot read data store at [path]: [reason]\nHint: check the file for corruption or remove it to start fresh.\nexit 1"/]
    C -->|Yes| D[Assign next sequential ID\nPersist task to data store]
    D --> E[/"stdout: Added task 1: buy coffee\nexit 0"/]
    E --> F["todo list"]
    F --> G{Data store readable?}
    G -->|No| ERR1
    G -->|Yes, tasks exist| H[/"stdout: 1  buy coffee\nexit 0"/]
    G -->|Yes, no open tasks| EMPTY1[/"stdout: No open tasks. Run 'todo add &lt;text&gt;' to create one.\nexit 0"/]
    H --> I["todo done 1"]
    I --> J{ID exists?}
    J -->|No| ERR2[/"stderr: Error: no task with ID 1.\nexit 1"/]
    J -->|Yes| K[Mark task done\nPersist to data store]
    K --> L[/"stdout: Done: task 1 buy coffee\nexit 0"/]
    L --> M([Cycle complete])
```

#### Flow 2 — Remove a task

```mermaid
flowchart TD
    A([User has a task to delete]) --> B["todo rm 3"]
    B --> C{Data store readable?}
    C -->|No| ERR1[/"stderr: Error: cannot read data store at [path]: [reason]\nHint: check the file for corruption or remove it to start fresh.\nexit 1"/]
    C -->|Yes| D{ID 3 exists?}
    D -->|No| ERR2[/"stderr: Error: no task with ID 3.\nexit 1"/]
    D -->|Yes| E[Delete task permanently\nPersist to data store\nID 3 never reused]
    E --> F[/"stdout: Removed task 3: [task text]\nexit 0"/]
    F --> G([Done])
```

#### Flow 3 — Help discovery

```mermaid
flowchart TD
    A([User is new or unsure]) --> B["todo --help"]
    B --> C[/"stdout: Usage: todo &lt;command&gt; [arguments]\n\nCommands:\n  add &lt;text&gt;   Add a new task\n  list          List open tasks\n  list --all    List all tasks including done\n  done &lt;id&gt;    Mark a task done\n  rm &lt;id&gt;      Remove a task permanently\n\nRun 'todo &lt;command&gt; --help' for command-specific help.\nexit 0"/]
    C --> D{User picks a subcommand}
    D --> E["todo add --help"]
    D --> F["todo list --help"]
    D --> G["todo done --help"]
    D --> H["todo rm --help"]
    E --> I[/"stdout: Usage: todo add &lt;text&gt;\n\nCreates a new open task with the given text.\nThe task is assigned a unique integer ID.\n\nExample:\n  todo add &quot;write design doc&quot;\nexit 0"/]
    F --> J[/"stdout: Usage: todo list [--all]\n\nLists open tasks. With --all, includes completed tasks.\nEach line shows the task ID, status (if --all), and text.\n\nExamples:\n  todo list\n  todo list --all\nexit 0"/]
    G --> K[/"stdout: Usage: todo done &lt;id&gt;\n\nMarks the task with the given integer ID as done.\nThe task will no longer appear in 'todo list' output.\n\nExample:\n  todo done 2\nexit 0"/]
    H --> L[/"stdout: Usage: todo rm &lt;id&gt;\n\nPermanently removes the task with the given integer ID.\nThis action cannot be undone.\n\nExample:\n  todo rm 5\nexit 0"/]
```

#### Flow 4 — Error: unknown ID (done or rm)

```mermaid
flowchart TD
    A(["todo done 99  (or  todo rm 99)"]) --> B{Data store readable?}
    B -->|No| ERR1[/"stderr: Error: cannot read data store at [path]: [reason]\nexit 1"/]
    B -->|Yes| C{Task ID 99 exists?}
    C -->|Yes| D[Normal done/rm flow]
    C -->|No| E[/"stderr: Error: no task with ID 99.\nexit 1\n\nData store is unchanged."/]
```

#### Flow 5 — Error: corrupt data store (data-accessing subcommands only)

```mermaid
flowchart TD
    A(["todo add / list / done / rm invoked"]) --> B[Attempt to read data store]
    B --> C{File readable and valid?}
    C -->|Yes| D[Normal command flow]
    C -->|No — file unreadable or unparseable| E[/"stderr: Error: cannot read data store at [path]: [reason]\nHint: check the file for corruption or remove it to start fresh.\nexit 1\n\nData store is NOT overwritten."/]
    F(["todo --help  or  todo &lt;cmd&gt; --help"]) --> G[Print help text without reading data store]
    G --> H[/"exit 0 regardless of data store state"/]
```

#### Flow 6 — Error: empty text for add

```mermaid
flowchart TD
    A(["todo add &quot;&quot;  or  todo add  (no argument)"]) --> B{Text argument present and non-empty?}
    B -->|Yes| C[Normal add flow]
    B -->|No| D[/"stderr: Error: task text cannot be empty. Provide a description after 'todo add'.\nExample: todo add &quot;write design doc&quot;\nexit 1\n\nData store is unchanged."/]
```

---

### Information architecture

#### Command hierarchy

```
todo
├── add <text>          positional argument, required, non-empty string
├── list                no required arguments
│   └── --all           optional named flag (long form only)
├── done <id>           positional argument, required, positive integer
├── rm <id>             positional argument, required, positive integer
└── --help              available on the root binary and every subcommand
    ├── todo --help
    ├── todo add --help
    ├── todo list --help
    ├── todo done --help
    └── todo rm --help
```

#### Argument and flag conventions

| Convention | Rule |
|---|---|
| Subcommand | Always first token after `todo`. No subcommand → print root help and exit 0. |
| Positional arguments | `add` takes one positional string (the task text). `done` and `rm` take one positional integer (the task ID). Order is fixed and documented in `--help` for each subcommand. |
| Named flags | `--all` on `list` is the only named flag in v1. Long form only (`--all`, not `-a`) to keep the surface minimal and unambiguous. |
| `--help` | Accepted as the first argument to the root binary or as any argument to a subcommand. Always exits 0 and never reads the data store. |
| No short flags | No single-character flag aliases (e.g., `-a`) in v1. Reduces the surface area to learn and matches the didactic goal. |
| No `=` syntax | Flag values use space separation if they ever carry values; `--all` is boolean and takes no value. |

#### Exit-code contract

| Code | Meaning |
|---|---|
| `0` | Success. The command completed as expected. For `--help`, also 0. For `list` with no tasks, also 0 (empty is not an error). |
| `1` | User or data error. Unknown ID, empty text, corrupt data store, or unrecognised subcommand. Scripts must treat any non-zero exit as failure. |

No other exit codes are defined in v1. The architect may define additional codes in Part C if distinguishing error categories (e.g., I/O failure vs. validation failure) is needed for testability — this is flagged as a decision point for handoff.

#### Deep-link / invocation convention

There are no URLs. The equivalent of a deep link is the full shell invocation. Scripts that embed a specific `todo done <id>` call are coupling to the ID, which is intentional and documented (IDs are stable for the lifetime of a task; they are never reused).

The data store path is discoverable via the `TODO_FILE` environment variable or the platform-standard default location. No subcommand exposes the data file path in normal output (it only appears in error messages when the file cannot be read).

---

### Empty / loading / error states

There is no loading state in a synchronous CLI tool. All states are either immediate success, immediate error, or empty output.

#### Empty: `todo list` with no open tasks

```
No open tasks. Run 'todo add <text>' to create one.
```

- Printed to stdout.
- Exit code 0 (empty is not an error; scripts should not treat it as one).

#### Empty: `todo list --all` with no tasks at all

```
No tasks yet. Run 'todo add <text>' to create your first task.
```

- Printed to stdout.
- Exit code 0.

#### Success: `todo add`

```
Added task [id]: [text]
```

Example: `Added task 4: write design doc`

- Printed to stdout.
- Exit code 0.

#### Success: `todo done`

```
Done: task [id] [text]
```

Example: `Done: task 2 buy coffee`

- Printed to stdout.
- Exit code 0.

#### Success: `todo rm`

```
Removed task [id]: [text]
```

Example: `Removed task 3: review PR`

- Printed to stdout.
- Exit code 0.

#### Error: unknown ID (`done` or `rm`)

```
Error: no task with ID [id].
```

Example: `Error: no task with ID 99.`

- Printed to stderr.
- Exit code 1.
- Data store is unchanged.

#### Error: corrupt or unreadable data store

```
Error: cannot read data store at [path]: [reason]
Hint: check the file for corruption or remove it to start fresh.
```

Example:
```
Error: cannot read data store at /home/alex/.local/share/todo/tasks: unexpected end of data
Hint: check the file for corruption or remove it to start fresh.
```

- Printed to stderr.
- Exit code 1.
- Data store is NOT overwritten.
- This error applies only to `add`, `list`, `done`, and `rm`. Help invocations (`--help` on any command) do not read the data store and are unaffected.

#### Error: empty text for `add`

```
Error: task text cannot be empty. Provide a description after 'todo add'.
Example: todo add "write design doc"
```

- Printed to stderr.
- Exit code 1.
- Data store is unchanged.

#### Error: unrecognised subcommand

```
Error: unknown command "[token]". Run 'todo --help' for a list of commands.
```

Example: `Error: unknown command "delete". Run 'todo --help' for a list of commands.`

- Printed to stderr.
- Exit code 1.

#### Error: missing required argument

```
Error: [subcommand] requires [description of argument]. Run 'todo [subcommand] --help' for usage.
```

Example: `Error: done requires a task ID. Run 'todo done --help' for usage.`

- Printed to stderr.
- Exit code 1.

---

### Accessibility considerations

This is a terminal tool. Accessibility for CLI tools addresses: pipe-friendliness, screen-reader compatibility of terminal output, scripting safety, and non-interactive use.

#### Pipe-friendly output (no ANSI colour in non-TTY mode)

- The tool must not emit ANSI colour codes, bold, or any other terminal escape sequences when stdout is not a TTY (i.e., when piped to another command or redirected to a file).
- When stdout is a TTY, the tool may emit no ANSI codes at all in v1 (plain text is always acceptable; this is left to `ui-designer` to decide in Part B).
- This ensures `todo list | grep coffee` and `todo list > tasks.txt` produce clean plain text.

#### Stderr vs. stdout routing

- All success output and list output goes to stdout.
- All error messages go to stderr.
- This routing is mandatory, not advisory. It allows scripts to capture output (`output=$(todo list)`) without capturing error messages, and to redirect errors independently (`todo list 2>/dev/null`).

#### Exit codes for scripting

- Exit code 0 = success, including empty list.
- Exit code 1 = any error (unknown ID, empty text, corrupt store, bad subcommand).
- Scripts that depend on exit codes must not need to parse output text to determine success or failure. The exit code alone is the machine-readable signal.

#### No interactive prompts

- The tool never prompts for confirmation, asks for input mid-execution, or reads from stdin in any flow.
- This ensures the tool works correctly in non-interactive contexts: CI pipelines, cron jobs, shell scripts, and editors that shell out.

#### Screen-reader compatibility of terminal output

- All output is plain text with no ASCII art, box-drawing characters, or decorative symbols that a screen reader would vocalise as noise.
- List output (`todo list`) uses a simple two-column layout (ID, then text) separated by whitespace, so it reads linearly and naturally when vocalised by a terminal screen reader (e.g., Orca on Linux, VoiceOver + terminal on macOS).
- `todo list --all` adds a status indicator between ID and text. The indicator must be a word, not a symbol. Prescribed forms: `done` and `open` (not `✓`/`✗` or `[x]`/`[ ]`).

Example `todo list --all` output:
```
1  open   buy coffee
2  done   write design doc
3  open   review PR
```

#### ARIA and focus management

Not applicable — this is a CLI tool with no DOM, no focus model, and no ARIA roles.

---

### Requirements coverage (Part A)

| REQ ID | Addressed in Part A |
|---|---|
| REQ-CLI-001 | Flow 1 (happy path add); Empty/error states: success add message, empty-text error |
| REQ-CLI-002 | Flow 1 (happy path list); Empty/error states: empty list message; IA: `todo list` command shape |
| REQ-CLI-003 | IA: `todo list --all` flag convention; Empty/error states: empty `--all` message; Accessibility: `done`/`open` word indicators |
| REQ-CLI-004 | Flow 1 (happy path done); Flow 4 (unknown ID error); Empty/error states: success done message |
| REQ-CLI-005 | Flow 2 (remove flow); Flow 4 (unknown ID error); Empty/error states: success rm message |
| REQ-CLI-006 | Flow 3 (help discovery); IA: `--help` on root and all subcommands; Empty/error states: help text prescriptions |
| REQ-CLI-007 | Implicit in all flows — persistence is a prerequisite for every data-accessing flow; no UX state needed beyond what other flows define |
| REQ-CLI-008 | No UX surface — atomic write is an implementation concern; handed to architect (Part C) |
| REQ-CLI-009 | Error states: data store path appears in corrupt-file error message; IA note on `TODO_FILE` env var as invocation-convention context |
| REQ-CLI-010 | Flow 4 (unknown ID error — done); Empty/error states: unknown ID error message |
| REQ-CLI-011 | Flow 4 (unknown ID error — rm); Empty/error states: unknown ID error message |
| REQ-CLI-012 | Flow 5 (corrupt data store error); Empty/error states: corrupt store error message; Accessibility: stderr routing |
| REQ-CLI-013 | Flow 6 (empty text error); Empty/error states: empty text error message |

<!-- Part B: ui-designer — continue here with visual/presentation design for the CLI output format -->

---

## Part B — UI

> For a CLI tool, "UI" means the textual output conventions: how every output state is formatted, what the confirmation and error lines look like, what microcopy appears in every state. There are no screens, components, or design tokens in the GUI sense. The sections below are adapted accordingly.

### Output states inventory

Every distinct output a user can see, across all 13 FRs.

| State | Trigger | Channel | Example output |
|---|---|---|---|
| Add — success | `todo add <text>` with non-empty text, data store readable | stdout | `Added task 1: buy coffee` |
| Done — success | `todo done <id>` with valid existing ID | stdout | `Done: task 2 buy coffee` |
| Rm — success | `todo rm <id>` with valid existing ID | stdout | `Removed task 3: review PR` |
| List — open tasks present | `todo list`, at least one open task | stdout | `1  buy coffee` (one task per line) |
| List — no open tasks | `todo list`, zero open tasks | stdout | `No open tasks. Run 'todo add <text>' to create one.` |
| List --all — mixed tasks | `todo list --all`, tasks of any status exist | stdout | `1  open   buy coffee` / `2  done   write design doc` (one task per line) |
| List --all — no tasks at all | `todo list --all`, data store is empty | stdout | `No tasks yet. Run 'todo add <text>' to create your first task.` |
| Help — root | `todo --help` or `todo` with no subcommand | stdout | Usage block (see microcopy section) |
| Help — add subcommand | `todo add --help` | stdout | add-specific usage block |
| Help — list subcommand | `todo list --help` | stdout | list-specific usage block |
| Help — done subcommand | `todo done --help` | stdout | done-specific usage block |
| Help — rm subcommand | `todo rm --help` | stdout | rm-specific usage block |
| Error — unknown ID (done) | `todo done <id>` where `<id>` does not exist | stderr | `Error: no task with ID 99.` |
| Error — unknown ID (rm) | `todo rm <id>` where `<id>` does not exist | stderr | `Error: no task with ID 42.` |
| Error — corrupt/unreadable data store | Any data-accessing subcommand, data store unreadable or unparseable | stderr | `Error: cannot read data store at [path]: [reason]` + hint line |
| Error — empty text for add | `todo add ""` or `todo add` with no argument | stderr | `Error: task text cannot be empty. Provide a description after 'todo add'.` + example line |
| Error — unknown subcommand | `todo <unrecognised-token>` | stderr | `Error: unknown command "[token]". Run 'todo --help' for a list of commands.` |
| Error — missing required argument | `todo done` or `todo rm` with no ID argument | stderr | `Error: done requires a task ID. Run 'todo done --help' for usage.` |

---

### Output format conventions

These conventions are precise enough to be referenced directly in the spec. No implementation detail is implied.

#### Task line format — `todo list` (open only)

```
[id]  [text]
```

- Two spaces between the ID and the text.
- No leading spaces before the ID.
- One task per line.
- No header row, no separator lines, no trailing blank line.
- IDs are left-aligned; no padding or zero-filling (ID 1 appears as `1`, not `01`).

Illustrative output:

```
1  buy coffee
4  write design doc
7  review PR
```

#### Task line format — `todo list --all`

```
[id]  [status]   [text]
```

- Two spaces between ID and status; three spaces between status and text.
- Status is always exactly one of two words: `open` or `done`. No symbols, no brackets.
- Column widths are fixed by convention: status field is four characters (`open`) or four characters (`done`) — they are the same width, so text alignment is consistent without padding.
- One task per line. No header row, no separator lines, no trailing blank line.

Illustrative output:

```
1  open   buy coffee
2  done   write design doc
3  open   review PR
```

#### Confirmation line — add

```
Added task [id]: [text]
```

- Colon and one space before the text.
- `[id]` is the integer assigned to the new task.
- `[text]` is the exact text the user provided, untransformed.

#### Confirmation line — done

```
Done: task [id] [text]
```

- Colon after `Done`; one space before `task`.
- `[id]` and `[text]` are separated by a single space; no colon between them.
- `[text]` is the exact task text.

#### Confirmation line — rm

```
Removed task [id]: [text]
```

- Colon and one space before the text.
- `[text]` is the exact task text at the time of removal.

#### Error line format

All errors follow a two-rule structure:

1. First line: `Error: [specific message ending with a full stop]`
2. Hint or example line (only where defined below): plain sentence, no `Hint:` prefix on the example line, `Hint:` prefix retained on the hint line only where it adds navigation value (corrupt data store case).

No multi-line errors beyond the prescribed two-line cases. No stack traces in user-facing output.

---

### Spacing and alignment conventions (tokens)

There are no GUI design tokens. The following conventions serve the equivalent role for this CLI.

| Convention | Value | Rationale |
|---|---|---|
| ID-to-text gap (`list`) | 2 spaces | Readable without being wide; narrower than a tab stop so short IDs don't leave long gaps |
| ID-to-status gap (`list --all`) | 2 spaces | Same as above; consistent with the non-`--all` format |
| Status-to-text gap (`list --all`) | 3 spaces | Extra space makes the text column visually distinct from the 4-char status word |
| No separator lines | — | No `---` or `===` rows between tasks or between output sections; output stays pipe-clean |
| No header row | — | Column headers would appear in `grep` and `wc -l` output; they are noise in scripting |
| No trailing newline beyond standard line ending | — | One `\n` per output line; no blank line after the last entry |
| Error prefix | `Error:` | Consistent prefix on all error messages; casing is sentence-case |
| Hint prefix | `Hint:` | Used only on the second line of the corrupt-data-store error; nowhere else |

No ANSI colour codes, bold, or terminal escape sequences in any output state (ND2).

---

### Content / microcopy

All strings are specified exactly. Variable parts use `[angle-bracket placeholders]`.

#### Confirmation messages

**Add:**
```
Added task [id]: [text]
```

**Done:**
```
Done: task [id] [text]
```

**Rm:**
```
Removed task [id]: [text]
```

#### Empty-list messages

**`todo list` with no open tasks:**
```
No open tasks. Run 'todo add <text>' to create one.
```

**`todo list --all` with no tasks at all:**
```
No tasks yet. Run 'todo add <text>' to create your first task.
```

#### Error messages

**Unknown ID — done:**
```
Error: no task with ID [id].
```

**Unknown ID — rm:**
```
Error: no task with ID [id].
```

(Same pattern for both subcommands; the offending ID is always included.)

**Corrupt or unreadable data store:**
```
Error: cannot read data store at [path]: [reason]
Hint: check the file for corruption or remove it to start fresh.
```

**Empty text for add:**
```
Error: task text cannot be empty. Provide a description after 'todo add'.
Example: todo add "write design doc"
```

**Unknown subcommand:**
```
Error: unknown command "[token]". Run 'todo --help' for a list of commands.
```

**Missing required argument — done:**
```
Error: done requires a task ID. Run 'todo done --help' for usage.
```

**Missing required argument — rm:**
```
Error: rm requires a task ID. Run 'todo rm --help' for usage.
```

#### Help text — root (`todo --help` or `todo` with no subcommand)

```
Usage: todo <command> [arguments]

Commands:
  add <text>   Add a new task
  list          List open tasks
  list --all    List all tasks including done
  done <id>    Mark a task done
  rm <id>      Remove a task permanently

Run 'todo <command> --help' for command-specific help.
```

#### Help text — `todo add --help`

```
Usage: todo add <text>

Creates a new open task with the given text.
The task is assigned a unique integer ID.

Example:
  todo add "write design doc"
```

#### Help text — `todo list --help`

```
Usage: todo list [--all]

Lists open tasks. With --all, includes completed tasks.
Each line shows the task ID, status (if --all), and text.

Examples:
  todo list
  todo list --all
```

#### Help text — `todo done --help`

```
Usage: todo done <id>

Marks the task with the given integer ID as done.
The task will no longer appear in 'todo list' output.

Example:
  todo done 2
```

#### Help text — `todo rm --help`

```
Usage: todo rm <id>

Permanently removes the task with the given integer ID.
This action cannot be undone.

Example:
  todo rm 5
```

---

### Accessibility verification

| Check | Result |
|---|---|
| No information conveyed by colour alone | Pass — no colour is used; status is conveyed by the words `open` and `done` |
| Screen-reader linearity | Pass — all output is plain text, left-to-right, one task per line; `list --all` words read naturally when vocalised |
| No ASCII art or box-drawing characters | Pass — none used anywhere |
| Error messages do not blame the user | Pass — all errors describe the condition, not the user's fault; `Hint:` lines are constructive |
| Pipe-safe output | Pass — no escape sequences; stdout and stderr are routed separately |
| No interactive prompts | Pass — no stdin reads in any flow |
| Help text usable without prior documentation | Pass — every subcommand help includes a concrete example |

---

### Requirements coverage (Part B)

| REQ ID | Addressed in Part B |
|---|---|
| REQ-CLI-001 | Output states: Add — success; Microcopy: add confirmation, empty-text error |
| REQ-CLI-002 | Output states: List — open tasks, List — no open tasks; Format conventions: task line format |
| REQ-CLI-003 | Output states: List --all — mixed, List --all — empty; Format conventions: `list --all` task line format with `open`/`done` word indicators |
| REQ-CLI-004 | Output states: Done — success; Microcopy: done confirmation, unknown-ID error |
| REQ-CLI-005 | Output states: Rm — success; Microcopy: rm confirmation, unknown-ID error |
| REQ-CLI-006 | Output states: Help — root and all four subcommands; Microcopy: all help text blocks |
| REQ-CLI-007 | No additional UI surface — persistence is transparent to the user; handled architecturally |
| REQ-CLI-008 | No additional UI surface — atomic write is invisible to the user in the success path |
| REQ-CLI-009 | Microcopy: `[path]` placeholder in corrupt-data-store error is the only place the data store path appears in output |
| REQ-CLI-010 | Output states: Error — unknown ID (done); Microcopy: unknown-ID error copy |
| REQ-CLI-011 | Output states: Error — unknown ID (rm); Microcopy: unknown-ID error copy |
| REQ-CLI-012 | Output states: Error — corrupt/unreadable data store; Microcopy: two-line error with Hint |
| REQ-CLI-013 | Output states: Error — empty text for add; Microcopy: two-line error with Example |

---

## Part C — Architecture

> No `arc42-questionnaire.md` exists for this feature; the deltas below are self-contained. This is a single-binary, single-process, local-only CLI tool — there is no network surface, no daemon, no shared infrastructure. The "architecture" is the binary's internal layering.

### System overview

```mermaid
flowchart TB
  user([User shell]) -->|argv| entry[Entry point / main]
  entry --> dispatcher[Command dispatcher]
  dispatcher --> add_h[add handler]
  dispatcher --> list_h[list handler]
  dispatcher --> done_h[done handler]
  dispatcher --> rm_h[rm handler]
  dispatcher --> help_h[help handler]
  add_h --> storage[Storage layer]
  list_h --> storage
  done_h --> storage
  rm_h --> storage
  storage --> path[Path resolver]
  storage --> store[(Data store on disk)]
  path -. reads .-> env[/TODO_FILE env var/]
  path -. fallback .-> xdg[/XDG data dir/]
  add_h -->|stdout / stderr| user
  list_h -->|stdout / stderr| user
  done_h -->|stdout / stderr| user
  rm_h -->|stdout / stderr| user
  help_h -->|stdout| user
```

The boundary the user crosses is `argv` in, exit code + stdout/stderr out. Everything between `entry` and `store` is in-process, in-memory, single-threaded.

### Components and responsibilities

| Component | Responsibility | Owns | Dependencies |
|---|---|---|---|
| Entry point / main | Read `argv`; route to the dispatcher; translate handler results into exit codes; flush output | Process exit code; top-level panic recovery (if any) | Command dispatcher |
| Command dispatcher | Map the first positional token to a subcommand handler; route `--help` to the help handler at any position; emit the unknown-subcommand error and the missing-required-argument error | Subcommand routing table; argument-shape validation (presence, count, basic types) | All five handlers |
| `add` handler | Validate that the text argument is present and non-empty; load the store; assign the next ID; append the task; write the store back atomically; print the success line | Add success output; empty-text error output | Storage layer; task model |
| `list` handler | Load the store; filter by status (open only, or all when `--all` is set); render each task line per the Part B format; print the empty-list message if appropriate | List rendering (open and `--all` variants); empty-list output | Storage layer; task model |
| `done` handler | Validate the ID argument; load the store; locate the task; mark it done; write the store back atomically; print the success line; emit the unknown-ID error if no task matches | Done success output; unknown-ID error output | Storage layer; task model |
| `rm` handler | Validate the ID argument; load the store; locate the task; remove it (without releasing its ID for reuse); write the store back atomically; print the success line; emit the unknown-ID error if no task matches | Rm success output; unknown-ID error output | Storage layer; task model |
| `help` handler | Print the root or subcommand-specific usage text per Part B microcopy; never read the data store | All help text | (none) |
| Storage layer | Resolve the data store path; load the store into memory; persist the store via atomic temp-file rename; surface a single corrupt-store error type when the file is unreadable or unparseable | Read path; write path; corrupt-store error | Path resolver; task model |
| Path resolver | Return the data store path: the value of `TODO_FILE` if set and non-empty, otherwise the XDG-default path; ensure the parent directory exists before any write | Path resolution policy | Environment; XDG default rules |
| Task model | In-memory representation of a single task and the store envelope; used by every handler and the storage layer | Task and store data shapes; ID-allocation rule (next-highest, never reused) | (none) |

### Data model

The data model has two entities: the **task** and the **store envelope** that wraps the task list.

**Task**

| Field | Type | Constraints |
|---|---|---|
| `id` | positive integer | Assigned at insert time. Strictly greater than every previously used ID, including IDs of removed tasks. Never reused. |
| `text` | non-empty string | Exactly the text the user supplied. Not transformed, trimmed, or normalised. Maximum length is bounded only by what the user can pass on the command line. |
| `done` | boolean | `false` at creation; flipped to `true` exactly once by the `done` handler. Never flipped back in v1. |
| `created_at` | timestamp | Set at insert time, in UTC, to the wall-clock instant of creation. Used for ordering when no other key is available; not displayed in v1 output. |

**Store envelope**

| Field | Type | Constraints |
|---|---|---|
| `version` | positive integer | Format version of the data store. Set to `1` for v1. Carried from day one (per RISK-006) so that a future schema change can detect old files without ambiguity. |
| `tasks` | ordered list of tasks | Insertion order is preserved. There are no duplicate IDs. Empty list is valid (a fresh store). |
| `next_id` | positive integer | The ID to assign to the next inserted task. Strictly greater than every ID currently or previously present. Allows the never-reused-ID property to survive round-trips through the file. |

The store as a whole is a single structured-text record. The serialisation format itself (how these fields are encoded on disk) is a `spec.md`-stage decision; this section names only the fields and their invariants.

**Migration impact:** none for v1 (greenfield). The `version` field is the migration hook; future iterations that change the schema must read `version`, transform, and rewrite. v1 reads accept only `version: 1`.

### Data flow

The two primary scenarios share a read step and diverge on what they do next.

**Write path — `add`, `done`, `rm`**

```mermaid
flowchart LR
  A[handler invoked] --> B[storage.load]
  B -->|store unreadable / unparseable| ERR[corrupt-store error\nstderr, exit 1, file unchanged]
  B -->|ok| C[mutate in memory]
  C --> D[storage.save]
  D --> E[write temp file in target directory]
  E --> F[fsync temp file]
  F --> G[rename temp over target]
  G --> H[print success line on stdout]
  H --> I[exit 0]
```

The mutate step is handler-specific: `add` appends a task and increments `next_id`; `done` flips a single task's `done` field; `rm` removes a task from the list (and does *not* decrement `next_id`). Every mutation goes through `storage.save`, which is the single atomic-write entry point (per ADR-CLI-0001).

**Read path — `list`**

```mermaid
flowchart LR
  A[list handler invoked] --> B[storage.load]
  B -->|store unreadable / unparseable| ERR[corrupt-store error\nstderr, exit 1]
  B -->|ok, empty list| EMPTY[print empty-list message on stdout, exit 0]
  B -->|ok, has tasks| C{--all flag set?}
  C -->|no| D[filter to open tasks]
  C -->|yes| E[take all tasks]
  D --> F[render each line per Part B format]
  E --> F
  F --> G[print to stdout, exit 0]
```

The read path never writes. A corrupt store on a `list` invocation is surfaced as the same error as on a write invocation, but the file is untouched by definition.

**Help path** never touches the storage layer. It executes entirely from in-binary string constants.

### Interaction / API contracts

The binary's public contract is its CLI surface. The full grammar lives in `spec.md`; the architectural shape is below.

**Invocation grammar**

```
todo                                   -> root help on stdout, exit 0
todo --help                            -> root help on stdout, exit 0
todo <unknown-token>                   -> unknown-subcommand error on stderr, exit 1
todo add <text>                        -> add handler
todo add ""                            -> empty-text error on stderr, exit 1
todo add                               -> empty-text error on stderr, exit 1
todo add --help                        -> add help on stdout, exit 0
todo list                              -> list (open only)
todo list --all                        -> list (all)
todo list --help                       -> list help on stdout, exit 0
todo done <id>                         -> done handler
todo done                              -> missing-argument error on stderr, exit 1
todo done <id-not-found>               -> unknown-ID error on stderr, exit 1
todo done --help                       -> done help on stdout, exit 0
todo rm <id>                           -> rm handler
todo rm                                -> missing-argument error on stderr, exit 1
todo rm <id-not-found>                 -> unknown-ID error on stderr, exit 1
todo rm --help                         -> rm help on stdout, exit 0
```

**Exit-code contract (resolved decision)**

| Code | Meaning |
|---|---|
| `0` | Success. Includes empty `list` output and every `--help` invocation. |
| `1` | Any error: unknown subcommand, missing required argument, empty `add` text, unknown ID for `done`/`rm`, corrupt or unreadable data store. |

This resolves the open question handed off from Part A. The decision is to **use a single non-zero code (exit 1) for every failure** in v1.

Rationale:

- The common scripting idiom is `if todo done $id; then …; fi`, not `case $?`. Splitting errors across multiple non-zero codes (e.g., `2` for I/O, `1` for validation) adds a contract surface that real callers do not exercise at this scale.
- The error *message* on stderr already disambiguates the failure category for humans; a numeric code adds nothing for them and would risk drifting out of sync with the message.
- A single non-zero code is the simplest contract consistent with POSIX convention, and it leaves room to introduce additional codes later without breaking existing scripts (any script that treats non-zero as failure remains correct).
- The didactic goal (G4) penalises gratuitous surface area. One success code, one failure code is the smallest contract that works.

If the QA agent finds that a specific automated scenario *requires* distinguishing failure categories programmatically, this is a CLAR for that stage; v1 ships with the single-code contract.

**No machine-readable output, no streaming, no stdin reads.** The contract is strictly request/response: argv in, single output block out, single exit code out.

### Key decisions

| Decision | Choice | Why | ADR |
|---|---|---|---|
| Exit-code scheme | `0` for success, `1` for every error | Single failure code matches the dominant scripting idiom; smaller contract surface; consistent with the didactic goal. Additional codes can be added later non-breakingly. | (in this table) |
| Atomic-write pattern | Temp file in the *target's* directory + `fsync` + `rename` over target | Survives crash/SIGKILL mid-write without leaving a partial or zero-byte file (REQ-CLI-008). Same-directory temp keeps the rename within one filesystem. | ADR-CLI-0001 |
| Concurrency posture | No lockfile; last-writer-wins for the update-update race; documented in spec | Lockfile complexity (stale-lock detection, advisory vs. mandatory) outweighs the value for a single-user local tool. Atomic rename already prevents the partial-write race. | ADR-CLI-0001 |
| ID scheme | Sequential positive integers, assigned at insert, **never reused** even after `rm` | Short to type, immediately human-meaningful, stable across the lifetime of a task. The `next_id` field in the store envelope makes the never-reused property survive file round-trips. | (in this table) |
| Data file location | XDG data directory by default; `TODO_FILE` env var (when set and non-empty) overrides with a full path | XDG is the principled cross-platform default and teaches a real pattern. The env-var override is the standard escape hatch for tests, CI, and power users. | (in this table) |
| Storage layer is the sole mutation entry point | Every handler that mutates state calls `storage.save`; no handler writes the data file directly | Concentrates the durability invariant (atomic rename) in one place. Reviewers and QA have one call site to audit. | ADR-CLI-0001 |
| Help handlers do not touch the storage layer | `--help` returns exit 0 even when the data store is corrupt | Help must always work, including in the recovery scenario where the user is troubleshooting a broken store. Matches PRD acceptance for REQ-CLI-012. | (in this table) |

### Alternatives considered

The stack-level alternatives were exhausted in RESEARCH-CLI-001 (Alternative B — Rust + SQLite, Alternative C — Python + plain text). Neither is revisited here:

- **Rust + SQLite** was rejected because the borrow checker raises the cognitive overhead for the mixed-audience didactic reader (G4), and SQLite's concurrency advantage is theoretical for a single-user local tool. See RESEARCH-CLI-001 §Alternatives, Alternative B.
- **Python + plain text** was rejected because it is not a single binary and the runtime install path is non-trivial outside developer machines. See RESEARCH-CLI-001 §Alternatives, Alternative C.

The design-stage alternatives that *were* live decisions:

- **Lockfile-based concurrency control** — rejected; see ADR-CLI-0001.
- **Multiple non-zero exit codes** — rejected; see the exit-code rationale above.
- **ID reuse after `rm`** — rejected. Reusing an ID after deletion would mean a script that captured `todo add` output (e.g., `id=$(todo add "x" | extract-id)`) and later ran `todo done $id` could silently target a different task. The cost of the never-reused rule (a single integer in the store envelope) is trivial compared to the surprise it prevents.
- **Read-modify-write with file truncation in place** — rejected; fails REQ-CLI-008 directly.

### Risks

Carried forward from RESEARCH-CLI-001 plus architecture-level additions.

| ID | Risk | Mitigation |
|---|---|---|
| RISK-001 | Example bloat — features creep beyond v1, making the worked example too large to read alongside the spec in one sitting | Architecture is intentionally small: 9 components, one data entity plus an envelope, two data flows. Any new component in v1 requires explicit reconsideration. |
| RISK-002 | Language alienation — readers unfamiliar with the chosen language find the source opaque | The architecture deliberately maps one component to one obvious source unit (one handler per file, one storage helper). The shape is recognisable to anyone who has read a CLI tool, regardless of language background. |
| RISK-003 | Data corruption on concurrent writes — two simultaneous invocations produce a truncated or interleaved file | Atomic temp-file rename prevents the partial-write failure mode. The update-update race is documented as last-writer-wins (ADR-CLI-0001); test plan covers the SIGKILL-mid-write scenario. |
| RISK-004 | Pulled-into-real-product trap — a contributor forks the example and ships it as a production tool, inheriting deliberate simplifications | Architecture documents the no-lockfile decision, the no-network posture, and the no-observability posture explicitly. README and spec headers carry the "specorator demonstration, not a production tool" notice. |
| RISK-CLI-ARCH-001 | Cross-filesystem temp file — `TODO_FILE` points into a different filesystem than the system temp dir, and the rename silently becomes non-atomic | The atomic-write helper places the temp file in the *target's* directory, not the system temp dir. Documented in ADR-CLI-0001 and enforced by the storage layer's contract. |
| RISK-CLI-ARCH-002 | Parent directory missing on first run — XDG data dir or a `TODO_FILE` parent does not exist, and the first write fails | Path resolver creates the parent directory (with permissions inherited from the user's umask) before any write. First-run scenario is in the test plan. |

### Performance, security, observability

**Performance.** All command paths read the entire data store into memory, mutate, and (for write commands) serialise back. At the NFR-CLI-001 ceiling of 10,000 tasks, the round-trip is dominated by file I/O, not by parsing or rendering. Sub-second wall-clock on a 2015-era commodity laptop is comfortable headroom; no caching, no incremental write, and no in-memory persistence is needed. Read-all-then-write-all is acceptable at this scale and keeps the storage layer trivially correct.

**Security.** No network surface (NFR-CLI-004). No authentication or authorisation surface — the operating system's user account is the security boundary. No sensitive data by category; the data store contains whatever text the user typed. The data store inherits the user's umask and is not specially hardened (file permissions are typically `0644` or `0600` depending on umask, both of which are appropriate for a personal home directory). v1 introduces no special hardening; if a user stores sensitive content, they retain ownership of the file's permissions.

**Observability.** v1 has **no structured logging**. The observability surface is exactly stderr: every error message is human-readable and identifies the failing condition (and, where applicable, the data store path). There are no metrics, no traces, no audit log. This is appropriate for a local single-user tool with synchronous, terminal-visible failure modes — the user *is* the alerting channel. Flagged for a hypothetical v2: if the tool grows multi-process or daemon behaviour, structured logging (and a reproducible log path) becomes worth the surface area.

---

## Cross-cutting

### Requirements coverage

Every functional requirement in PRD-CLI-001 maps to at least one section of this design.

| REQ ID | Addressed in (UX / UI / Arch section) |
|---|---|
| REQ-CLI-001 (add a task) | UX Flow 1, Empty/error states; UI Output states (Add success, empty-text error), Microcopy; Arch Components (`add` handler), Data flow (write path), Data model (`id` allocation, `text` invariant) |
| REQ-CLI-002 (list open tasks) | UX Flow 1, Empty/error states; UI Output states (List open, no open tasks), Format conventions (task line); Arch Components (`list` handler), Data flow (read path) |
| REQ-CLI-003 (list --all) | UX IA (`--all` flag), Empty/error states; UI Output states (List --all mixed, empty), Format conventions (`list --all` line), Tokens (status word width); Arch Components (`list` handler) |
| REQ-CLI-004 (mark a task done) | UX Flow 1, Flow 4; UI Output states (Done success, unknown-ID), Microcopy; Arch Components (`done` handler), Data flow (write path), Data model (`done` field one-way flip) |
| REQ-CLI-005 (remove a task) | UX Flow 2, Flow 4; UI Output states (Rm success, unknown-ID), Microcopy; Arch Components (`rm` handler), Data flow (write path), Key decisions (ID never reused) |
| REQ-CLI-006 (help on every subcommand) | UX Flow 3, IA (`--help` rules); UI Output states (5 help blocks), Microcopy (help text); Arch Components (help handler), Key decisions (help never touches storage) |
| REQ-CLI-007 (persistence across invocations) | UX Flow 1 (implicit); UI (no surface); Arch Components (Storage layer, Path resolver), Data flow (read and write paths), Data model (store envelope) |
| REQ-CLI-008 (atomic write protection) | UX (no surface — invisible in success path); UI (no surface); Arch Data flow (write path: temp + fsync + rename), Key decisions (atomic-write pattern), ADR-CLI-0001 |
| REQ-CLI-009 (data file location convention) | UX IA (`TODO_FILE` invocation note), Empty/error states (path appears in error); UI Microcopy (`[path]` placeholder); Arch Components (Path resolver), Key decisions (XDG default + env-var override) |
| REQ-CLI-010 (error on unknown ID for done) | UX Flow 4, Empty/error states; UI Output states (unknown-ID done), Microcopy; Arch Components (`done` handler), Interaction grammar (unknown-ID row) |
| REQ-CLI-011 (error on unknown ID for rm) | UX Flow 4, Empty/error states; UI Output states (unknown-ID rm), Microcopy; Arch Components (`rm` handler), Interaction grammar (unknown-ID row) |
| REQ-CLI-012 (graceful corrupt-file handling) | UX Flow 5, Empty/error states; UI Output states (corrupt store), Microcopy (two-line error with Hint); Arch Components (Storage layer single error type), Data flow (both paths short-circuit on corrupt store), Key decisions (help never reads store) |
| REQ-CLI-013 (non-empty text for add) | UX Flow 6, Empty/error states; UI Output states (empty-text), Microcopy; Arch Components (`add` handler argument validation), Interaction grammar (`todo add ""` row) |

### Open questions

None. The exit-code question handed off from Part A is resolved in Part C (single non-zero code; rationale recorded in the key decisions table). No new CLAR entries opened during architecture.

---

## Quality gate

- [x] UX: primary flows mapped; IA clear; empty/loading/error states prescribed. *(Part A)*
- [x] UI: key screens identified; design system referenced. *(Part B — adapted for CLI: output states inventory and format conventions stand in for screens and design tokens.)*
- [x] Architecture: components, data flow, integration points named. *(Part C — system overview, 9-component table, two data-flow diagrams, CLI grammar.)*
- [x] Alternatives considered and rejected with rationale. *(Stack-level in RESEARCH-CLI-001; design-level in Part C — lockfile, multiple exit codes, ID reuse, in-place writes.)*
- [x] Irreversible architectural decisions have ADRs. *(ADR-CLI-0001 covers atomic-rename + no-lockfile, the durability/correctness load-bearing decision. Other decisions are easily reversible and remain in the key-decisions table.)*
- [x] Risks have mitigations. *(Six risks: four carried from research, two new architecture-level risks; all have mitigations or documented acceptances.)*
- [x] Every PRD requirement is addressed. *(All 13 REQ-CLI-NNN appear in the requirements coverage table with at least one Part A / B / C section each.)*
