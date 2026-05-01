---
id: RESEARCH-CLI-001
title: CLI Todo App — ecosystem, stack, and scope research
stage: research
feature: cli-todo
status: draft
owner: analyst
inputs:
  - IDEA-CLI-001
created: 2026-04-27
updated: 2026-04-27
---

# Research — CLI Todo App

## Research questions

Carried forward from `idea.md`. Each is answered below; see the relevant section for full treatment.

| ID | Question | Status |
|---|---|---|
| Q1 | Storage format: plain text vs. JSON vs. SQLite | answered |
| Q2 | Implementation language: Go vs. Rust vs. Python vs. Node | answered |
| Q3 | v1 feature scope: strict CRUD vs. CRUD + extras | answered |
| Q4 | Concurrent access: lockfile, atomic-rename, last-writer-wins, or out-of-scope | answered |
| Q5 | Data file location: `~/.todo.json` vs. XDG vs. env-var override | answered |
| Q6 | Distribution: source-only vs. pre-built binaries vs. Homebrew | answered |

> **Note on library names.** This is a worked example. Where the analysis below names a specific third-party library (e.g., a particular XDG or atomic-rename helper), treat it as **illustrative, not prescriptive** — the implementation stage picks the actual dependency. Stdlib APIs are referenced at the *behavioural* level (e.g., "atomic temp-file rename") rather than by version-pinned function name, to keep the artifact from rotting as the language evolves.

---

## Market / ecosystem

The CLI todo space is mature. The tools below represent the main prior-art archetypes.

| Solution | Approach | Strengths | Weaknesses | Source |
|---|---|---|---|---|
| Taskwarrior | C++, binary protocol, SQLite-backed; 100+ subcommands | Extremely powerful; active project; rich reporting | Steep learning curve; requires server sync daemon (taskd/taskchampion) for multi-device; far too large for a didactic example | https://taskwarrior.org/ |
| todo.txt (Gina Trapani) | Plain-text spec; one task per line; priorities/contexts/projects as inline tokens | Human-readable; grep/sed-compatible; portable across any editor | No built-in IDs; ordering is positional (fragile); completion just moves lines; no structured query | https://github.com/todotxt/todo.txt |
| topydo | Python; todo.txt-format compliant; adds due dates, recurrence, dependency | Fully interoperable with todo.txt ecosystem; installable via pipx | Requires Python runtime; not a single binary; heavier than a "tiny example" warrants | https://github.com/topydo/topydo |
| dstask | Go; YAML-per-task; git-based sync; single binary | Single binary; git sync is elegant; priorities and tags | git dependency raises setup bar; per-file YAML means many small files; over-engineered for v1 | https://github.com/naggie/dstask |
| devtodo | C; per-directory XML `.todo` file; hierarchical | Directory-scoped lists are novel | XML is verbose; project appears unmaintained; C build chain is a barrier | https://debaday.debian.net/2008/08/31/devtodo-a-remindertask-program-aimed-at-developers/ |

**Gap this example fills:** none of the above are simultaneously (a) tiny enough to read source + spec in one sitting, (b) written in a language that is approachable to the broadest engineer audience, and (c) designed to serve as a didactic specorator walkthrough.

---

## User needs

No primary research (interviews, surveys, analytics) was conducted for this example — it is a specorator demonstration, not a product being shipped to real users. The need is treated as stipulated by the problem statement in `IDEA-CLI-001`.

**Assumptions that must hold for the stipulated need to be real:**

1. Terminal-native engineers do encounter the friction described (scratch-buffer todos, lost tasks) — plausible given broad developer experience, but unvalidated.
2. Existing tools are genuinely too heavy for the "five-minute capture" use case — plausible given Taskwarrior's surface area, but could be validated with a 5-question user interview.
3. A sub-5-command interface is learnable from `--help` alone in under two minutes — testable via a quick usability pass once a prototype exists.

**How to validate (for a real product):** run 3–5 contextual interviews with solo engineers; observe their current "quick capture" habit; confirm the drop-off point with existing tools.

**Didactic user (secondary):** specorator contributors reading the worked example. Their need is explicit and observable: they want a small-but-realistic artifact they can study. This need is definitionally satisfied by keeping the implementation minimal.

---

## Alternatives considered

The three alternatives below represent genuinely different trade-off positions, not flavour variations. They are evaluated against two equally-weighted goals: (1) realistic enough to exercise the workflow, and (2) readable enough to serve the didactic purpose.

### Alternative A — Go + JSON file

**Description:** A Go CLI (using stdlib argument parsing or a third-party CLI helper — choice deferred to implementation) that reads/writes a single JSON file (`~/.local/share/todo/tasks.json` with `$TODO_FILE` override). Tasks are a JSON array of objects with `id`, `text`, `done`, `created_at`. Atomic writes via temp-file rename. Single binary via `go build`.

**Pros:**
- `go install github.com/...` produces a single static binary; no runtime dependency on the target machine.
- Cross-compilation is first-class (`GOOS`, `GOARCH` env vars); one CI job covers macOS/Linux/Windows.
- Go is readable by a wide audience: Python, Java, JS, and Rust engineers can follow the logic without learning a new paradigm. The type system is simple enough that a spec-to-code mapping is clear on first read.
- JSON is inspectable with `cat` / `jq` and trivially editable by hand.
- Standard library contains everything needed (no third-party deps for a basic implementation).
- Sequential integer IDs (`1`, `2`, `3`) are adequate for local-only use and immediately human-usable (`todo done 3`).
- Atomic rename is well-supported: the stdlib temp-file + rename pattern covers Linux, macOS, and (with a small Windows-safe helper if needed) Windows. Specific helper library is an implementation-stage choice.

**Cons:**
- JSON loses ordering on map keys (struct-serialised arrays avoid this, but it's a subtlety).
- Not as "safe" from corruption as SQLite journalling, but adequate for the use case.
- Go module system adds a `go.sum` / `go.mod` file, which is a small amount of boilerplate for readers unfamiliar with Go modules.

### Alternative B — Rust + SQLite

**Description:** A Rust CLI (using a standard CLI argument parser) backed by a SQLite file (`~/.local/share/todo/tasks.db`). Tasks stored as rows.

**Pros:**
- Rust produces the smallest, fastest binary.
- SQLite gives proper ACID transactions — concurrent writes are safe out of the box.
- `cargo install` is a clean install path.

**Cons:**
- Rust's learning curve (borrow checker, lifetimes) makes the source harder to follow for engineers who don't already know Rust. The didactic goal requires that a contributor can read source alongside the spec; Rust raises the cognitive overhead significantly.
- A typical SQLite Rust binding links against libsqlite3, which may require a system C library on some targets; full static linking requires extra toolchain steps.
- SQLite binary is not human-inspectable without an external SQLite CLI; it cannot be edited in a text editor or versioned in git without extra tooling.
- For a single-user local tool, SQLite's concurrency advantage is theoretical, not practical.
- Compile times are substantially longer than Go, which slows the development loop during the worked example.

### Alternative C — Python + plain text (todo.txt-style)

**Description:** A Python CLI (using a stdlib or third-party argument parser) that reads/writes a `~/.local/share/todo/tasks.txt` file in a simplified todo.txt-inspired format (one task per line, `x` prefix for done, numeric ID embedded as `id:N` key:value).

**Pros:**
- Python source is maximally readable to the broadest audience; nearly pseudocode.
- No compilation step; the source file is the artifact.
- todo.txt format is human-readable and grep-compatible.
- `pipx install` gives an isolated install without polluting system Python.

**Cons:**
- Not a single binary. Requires Python ≥ 3.9 on the target machine, plus pipx or pip. On Windows, this is a non-trivial setup path.
- Plain-text format requires careful parsing to embed IDs without breaking human-readability; the todo.txt `id:N` extension is non-standard and not universally supported.
- Atomic writes in Python require either a stdlib replace-and-temp-file pattern or a third-party helper; the pattern is slightly less idiomatic than Go's.
- The "single binary or single-runtime install" constraint in `IDEA-CLI-001` is met only loosely; pipx is a prerequisite that many users won't have.
- Cross-platform path resolution (via stdlib path utilities plus a platform-dirs helper) adds a dependency or verbose conditional logic.

---

## Technical considerations

### Q1 — Storage format

Three options: plain text, JSON, SQLite.

- **Plain text (todo.txt style):** Human-readable; grep/sed-friendly; no parser library needed. Drawbacks: no natural ID field (IDs are positional line numbers — fragile on delete); concurrent appends can produce partially-written lines; migration to richer schema means line-format changes.
- **JSON (single file, array of objects):** Structured; easy to read/write with stdlib; IDs are explicit fields; adding new fields is backward-compatible. The file as a whole must be read and rewritten on every mutation (acceptable for <10 k tasks). Atomic write via temp-file rename avoids partial writes. **Recommended for v1.**
- **SQLite:** Best durability and concurrent-access story. Overkill for local single-user v1; requires either a C dependency or a pure-Go driver; binary format is not human-inspectable.

### Q2 — Implementation language

Evaluated against single-binary distribution AND didactic clarity for specorator readers:

| Language | Single binary | Install path | Source readability (mixed audience) | Cross-platform path handling |
|---|---|---|---|---|
| Go | Yes (static by default) | `go install` / pre-built release | High — approachable to most engineers | stdlib home-dir + a third-party XDG helper |
| Rust | Yes (with flags) | `cargo install` / pre-built release | Medium — borrow checker surprises newcomers | a directories / XDG crate |
| Python | No (requires runtime) | `pipx install` | Very high | stdlib path utilities + a platform-dirs helper |
| Node | No (requires runtime; bundlers for binary-style packaging) | `npm install -g` | High | stdlib home-dir + a third-party XDG package |

Go is the strongest fit: single binary without flags, easy cross-compilation, readable to a wide audience, and strong stdlib for CLI and file I/O.

### Q3 — v1 scope floor

The floor that exercises every stage of the workflow without bloating the example is **strict CRUD with five commands**: `add`, `list`, `done`, `rm`, `help`. This produces:

- At least 5 functional requirements (one per command) plus 2–3 non-functional ones (data persistence, atomic write, cross-platform install).
- A meaningful but not overwhelming task list (~10 implementation tasks).
- A test plan that covers the happy path and two edge cases per command.

Due dates, priorities, tags, and search are explicitly out of scope for v1. They could be added in a hypothetical v2 example showing incremental evolution of a spec.

### Q4 — Concurrent access

For a single-user local-only tool, true concurrent access (two terminals calling `todo` simultaneously) is an edge case, not a primary scenario. The recommended posture:

- **Atomic-rename writes** as the default: write to a temp file in the same directory, then `rename`/`replace` over the target. This prevents partial writes on crash or signal.
- **No lockfile** in v1: lockfiles add complexity (stale-lock detection, platform-specific advisory vs. mandatory locking) and the scenario they guard against is unlikely in normal use.
- **Document the limitation** explicitly in the spec: "last writer wins; simultaneous invocations from separate terminals may lose one update". This is an honest, traceable decision, not an omission.

The atomic-rename pattern is well-supported in Go: a stdlib temp-file create + rename works on POSIX, and a small third-party helper handles Windows-safe rename if the implementation chooses to support it. Library selection is deferred to the implementation stage.

### Q5 — Data file location

Three options:

- `~/.todo.json` (dotfile in home): Simple. Pollutes `$HOME`. Not XDG-compliant.
- `$XDG_DATA_HOME/todo/tasks.json` (default: `~/.local/share/todo/tasks.json`): XDG-compliant on Linux/macOS. On Windows, maps to `%LOCALAPPDATA%\todo\tasks.json` via a cross-platform XDG helper (specific library chosen at implementation time). The spec can reference the XDG spec directly.
- `$TODO_FILE` env-var override: Allows power users and CI/test environments to redirect the file without touching config.

**Recommended:** XDG data dir as the default, with `$TODO_FILE` as a full-path override. This is the most principled approach, teaches XDG to readers, and keeps `$HOME` uncluttered. A cross-platform XDG helper (selected at implementation time) handles the mapping without conditional logic in application code.

### Q6 — Distribution

Three options:

- **Source-only (`go install`):** Requires Go toolchain on the user's machine. Simple for developers but excludes non-Go users. Good enough for a didactic example where the reader likely has Go installed.
- **Pre-built binaries on GitHub Releases:** Broadest reach; no toolchain requirement. Adds a CI/CD step (GitHub Actions matrix build). For a worked example, this is realistic and demonstrates a real release flow.
- **Homebrew formula:** Adds Homebrew tap maintenance overhead. Not warranted for v1 of an example.

**Recommended:** `go install` as the primary path (lowest friction for the target reader audience), with a note that pre-built binaries via GitHub Releases are the realistic v1 distribution for end users. This keeps the example honest about what a real release looks like without requiring the specorator to maintain a tap.

### ID scheme

Sequential integers (1, 2, 3…) are the right choice for a local single-user tool: they are the shortest to type (`todo done 3`), immediately human-meaningful, and trivially derivable from the JSON array. ULIDs or UUIDs would make `todo done 01HXYZ...` cumbersome. The only downside — IDs are not globally unique — is irrelevant for a local-only app. IDs should be assigned at insert time and never reused (even after `rm`), to avoid confusion.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | **Example bloat** — scope creeps to include due dates, priorities, or search before v1 is stable, making the worked example too large to read in one sitting | high | med | Hold the v1 scope to five commands (add/list/done/rm/help). Any additional feature must be gated by a separate "v2 example" decision. The pm stage should enforce this gate explicitly. |
| RISK-002 | **Language alienation** — readers unfamiliar with Go find the source opaque, undermining the didactic goal | med | low | Go's syntax is intentionally simple. Mitigate further by keeping the implementation in a single file or two files maximum, with inline comments that cross-reference requirement IDs. Avoid Go-isms (goroutines, channels, complex interfaces) entirely in v1. |
| RISK-003 | **Data corruption on concurrent writes** — two simultaneous invocations produce a truncated or interleaved JSON file | med | low | Atomic-rename write pattern (temp file + rename) prevents partial writes. Document the last-writer-wins caveat in the spec. |
| RISK-004 | **Pulled-into-real-product trap** — a contributor forks the example and uses it as a production codebase, inheriting its deliberate simplifications (no auth, no backup, last-writer-wins) | med | low | Add a prominent notice in `README.md` and `spec.md` header: "This is a specorator demonstration. It omits production concerns deliberately." The spec's out-of-scope list is the contractual boundary. |
| RISK-005 | **Windows path handling edge cases** — the chosen XDG helper or temp-file rename behaves unexpectedly on Windows | low | med | Test on Windows in CI (e.g., a Windows runner) as part of the pre-built binary build. If the example does not run CI, document "Linux/macOS only" clearly. |
| RISK-006 | **Migration cost** — if the JSON schema changes between example iterations, existing users' data files become unreadable | low | low | Include a `version` field in the JSON root object from day one. Document migration strategy (re-read old format, write new) in a follow-up example if needed. |

---

## Recommendation

**Recommended stack for v1:** Go + JSON file + XDG data dir + `$TODO_FILE` override + `go install` distribution.

**Rationale:**

- Go produces a genuine single static binary without extra flags, satisfying the constraint in `IDEA-CLI-001` cleanly.
- Go source is readable by a broad engineer audience (Python, Java, JS background) without requiring familiarity with a complex type system or borrow checker. A specorator reader can map `requirements.md` → source code in one pass.
- JSON over a temp-file atomic rename gives adequate durability for a local single-user tool, is human-inspectable, and can be read/written with Go's stdlib alone (no third-party driver).
- XDG data dir (`~/.local/share/todo/tasks.json`) is principled, cross-platform via a small XDG helper library (selected at implementation time), and teaches readers a real cross-platform pattern.
- `go install` is the honest minimum distribution path for this audience; the example can note that a real release would add a GitHub Actions matrix build for pre-built binaries.

**v1 scope floor:** Five commands — `add <text>`, `list`, `done <id>`, `rm <id>`, and `--help` on every subcommand. No due dates, no priorities, no tags, no search. This is the smallest surface area that still exercises the full EARS requirement set, the test plan, and the traceability matrix.

**What still needs validating before Requirements:**

- TBD — owner: pm — confirm that the five-command scope maps cleanly to a non-trivial requirement set (target: 7–12 functional requirements). If it comes in below 7, add one more observable behaviour (e.g., `todo list --all` to show completed tasks) to give the test plan sufficient coverage.
- TBD — owner: analyst/pm — Windows CI coverage: decide at requirements stage whether the example explicitly supports Windows or narrows scope to Linux/macOS with a documented gap.

---

## Sources

- [Taskwarrior — official site](https://taskwarrior.org/)
- [Taskwarrior — GitHub](https://github.com/GothenburgBitFactory/taskwarrior)
- [todo.txt format spec — GitHub](https://github.com/todotxt/todo.txt)
- [todo.txt — project site](http://todotxt.org/)
- [topydo — GitHub](https://github.com/topydo/topydo)
- [dstask — GitHub](https://github.com/naggie/dstask)
- [devtodo — Debian Package of the Day archive](https://debaday.debian.net/2008/08/31/devtodo-a-remindertask-program-aimed-at-developers/)
- [XDG Base Directory Specification — freedesktop.org](https://specifications.freedesktop.org/basedir/basedir-spec-latest.html)
- [XDG Base Directory — ArchWiki](https://wiki.archlinux.org/title/XDG_Base_Directory)
- [adrg/xdg — Go implementation of XDG Base Directory Specification](https://github.com/adrg/xdg)
- [pipx — PyPI](https://pypi.org/project/pipx/)
- [cargo install — The Cargo Book](https://doc.rust-lang.org/cargo/commands/cargo-install.html)
- [google/renameio — Go atomic rename package](https://pkg.go.dev/github.com/google/renameio)
- [Atomic file writes — Python recipes (ActiveState)](https://code.activestate.com/recipes/579097-safely-and-atomically-write-to-a-file/)
- [UUID vs ULID vs Integer IDs — ByteAether](https://byteaether.github.io/2025/uuid-vs-ulid-vs-integer-ids-a-technical-guide-for-modern-systems/)
- [Go documentation — go.dev](https://go.dev/doc/)

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] ≥ 2 alternatives explored (three alternatives: A, B, C).
- [x] User needs supported by evidence (or assumptions explicit — primary research not conducted; assumptions listed with validation path).
- [x] Technical considerations noted.
- [x] Risks listed with severity and mitigation.
- [x] Recommendation made.
