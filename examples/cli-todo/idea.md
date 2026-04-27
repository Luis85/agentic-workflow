---
id: IDEA-CLI-001
title: A tiny CLI todo app
stage: idea
feature: cli-todo
status: draft
owner: analyst
created: 2026-04-27
updated: 2026-04-27
---

# Idea — A tiny CLI todo app

## Problem statement

Solo engineers and terminal-native developers want to capture, list, and complete short-lived tasks without leaving the shell. Existing options either pull them into a browser/GUI, require an account, sync to a cloud they don't trust, or carry enough surface area (Taskwarrior, JIRA CLIs) that the cost of learning the tool exceeds the value of the tasks tracked. The result is that "quick todo" thoughts get lost in scratch buffers, stickies, or chat DMs and never get done.

## Target users

- **Primary:** solo engineers who live in the terminal and want a single-binary, local-first todo tool with a learnable surface area (≤ 5 commands).
- **Secondary:** contributors reading this spec-kit who need a small-but-realistic worked example to learn the workflow on. The example's didactic value is itself a goal.

## Desired outcome

A binary called `todo` that supports the basic lifecycle: `add`, `list`, `done`, `rm`. State persists across invocations in a single local file. A new user can install it and complete their first add → list → done cycle in under two minutes, reading no documentation other than `todo --help`. The implementation is small enough that a contributor can read the source and the spec side-by-side in a single sitting.

## Constraints

- **Time:** ~1–2 days of focused implementation work, so the example fits within a normal sprint slot.
- **Budget:** zero infrastructure cost. Local-only; no servers, no accounts, no telemetry.
- **Technical:** single binary or single-runtime install; cross-platform (macOS, Linux, Windows); no background daemon; no network calls in the default path. Language choice deferred to research (stage 2).
- **Policy / compliance:** MIT-licensed; no telemetry; data file lives under the user's own home / config directory.
- **Other:** the implementation must remain didactic — a contributor reading `spec.md` alongside the source should be able to map every requirement to its code in one pass.

## Open questions

> These become the research agenda in stage 2.

- Q1 — **Storage format.** Plain text (`todo.txt` style), JSON file, or embedded SQLite? Trade-offs around durability, concurrent writes, human-readability, and migration.
- Q2 — **Implementation language.** Go, Rust, Python (pipx-installed), or Node? Trade-offs around single-binary distribution, readability for the example's audience, and ecosystem fit.
- Q3 — **v1 feature scope.** Strictly CRUD, or do we include due dates, priorities, tags, search? Where is the floor that still demonstrates the workflow without bloating the example?
- Q4 — **Concurrent access.** Two terminals running `todo` at once: do we need a lockfile, atomic-rename writes, or accept last-writer-wins?
- Q5 — **Data file location.** `~/.todo.json`, XDG config dir, configurable via env var? What is the cross-platform-friendly default?
- Q6 — **Distribution.** Source-only (`go install`, `cargo install`, `pipx install`), pre-built binaries, Homebrew formula? What is the minimum that still makes the install path realistic?

## Out of scope (preliminary)

What we are explicitly **not** considering, even at the idea stage:

- Multi-user collaboration, sharing, or cloud sync.
- GUI or full-screen TUI (we are CLI-only; no `curses`-style interface).
- Notifications, reminders, or recurring tasks.
- Calendar / external-service integrations.
- Plugin / extension architecture.
- Project hierarchy or nested sub-tasks.

These may become candidates for follow-up examples but must not creep into v1.

## References

- `todo.txt` format and the surrounding ecosystem — prior art for human-readable, line-oriented todo storage.
- `taskwarrior` — feature-rich CLI todo manager; useful as a *contrast* for "what we are not building".
- `gh` and `git` CLI ergonomics — reference for subcommand structure and `--help` output style.

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
