---
id: DESIGN-CLI-001
title: Design — specorator-cli
stage: design
feature: extract-scripts-cli
area: CLI
status: accepted
owner: architect
created: 2026-05-05
updated: 2026-05-05
---

# Design — specorator-cli

## A — UX

### User flows

**Flow 1: Developer running the verify gate locally**
```
cd my-project          # project root
specorator verify      # replaces: npm run verify
```

**Flow 2: CI pipeline invoking a targeted check**
```
specorator check:fast  # replaces: npm run check:fast
specorator check:content
```

**Flow 3: Running a fixer**
```
specorator fix:adr-index   # replaces: npm run fix:adr-index
```

**Flow 4: Explicit project root (CI subdirectory)**
```
specorator --cwd /path/to/project verify
```

**Flow 5: Discovery**
```
specorator --help          # lists all subcommands
specorator verify --help   # usage for one subcommand
```

### Information architecture

The `specorator` binary is a thin dispatcher. It is not a framework — it does not introduce plugin registration, configuration schemas, or middleware. Every subcommand delegates immediately to the existing `scripts/<name>.ts` entry point, passing all remaining args through unchanged. No new user-facing concepts are introduced.

### Empty / error states

- Unknown subcommand → print error + `specorator --help` hint, exit 1.
- No project root found (walk-up exhausted) → print actionable error: "specorator: could not locate a project root (no package.json or .git found above <cwd>). Run from your project root or use --cwd."; exit 1.
- Subcommand exits non-zero → propagate exit code as-is (no wrapping message from the dispatcher).

### Accessibility / ergonomics

- Subcommand names match existing `npm run` names exactly (including colons: `check:fast`, `fix:adr-index`) so muscle memory transfers.
- `--cwd` is the single global flag; no other global flags in v1.
- Help text is auto-derived from the task definitions already in `scripts/lib/tasks.ts`.

---

## B — UI (CLI surface only)

### Help output shape

```
specorator — Specorator workflow CLI

Usage:
  specorator <subcommand> [options]
  specorator --help
  specorator <subcommand> --help

Subcommands:
  verify               Run the full verify gate (format → lint → check → test → build)
  check:fast           Fast subset: frontmatter, ADR index, commands, script docs
  check:content        Content checks: links, agents, workflow docs, product page
  check:workflow       Domain checks: specs, roadmaps, traceability, token budget
  fix                  Run all deterministic generated-content fixers
  fix:adr-index        Regenerate docs/adr/README.md index
  fix:commands         Regenerate .claude/commands docs
  fix:script-docs      Regenerate docs/scripts/ reference
  fix:obsidian         Fix Obsidian frontmatter compatibility
  fix:sites-tokens     Sync design tokens into sites/
  self-check           Quality self-review of the template
  doctor               Diagnose common repository setup issues
  quality:metrics      Emit deterministic quality KPIs
  roadmap:digest       Produce a roadmap digest report
  roadmap:evidence     Produce roadmap evidence links

Run `specorator <subcommand> --help` for subcommand-specific options.
```

### Diagnostic output

All diagnostic output is produced by the existing script, not the dispatcher. The dispatcher is transparent — it does not add a wrapper prefix or alter stdout/stderr.

---

## C — Architecture

### System overview

```
┌─────────────────────────────────────────────┐
│  scripts/cli.ts  (NEW — bin entry point)    │
│                                             │
│  1. parse argv[2] as subcommand             │
│  2. resolve project root (walk-up / --cwd)  │
│  3. set process.env.SPECORATOR_ROOT         │
│  4. spawn:  tsx scripts/<subcommand>.ts     │
│             forwarding remaining args        │
└──────────────────┬──────────────────────────┘
                   │ spawnSync (inherits stdio)
                   ▼
┌─────────────────────────────────────────────┐
│  scripts/<subcommand>.ts  (unchanged)       │
│                                             │
│  imports scripts/lib/repo.ts                │
│  reads repoRoot from env / walk-up          │
└─────────────────────────────────────────────┘
```

### Components

**`scripts/cli.ts`** (new)
- Shebang: `#!/usr/bin/env tsx`
- Parses `process.argv[2]` as subcommand name.
- Accepts `--cwd <path>` as a global flag (consumed before forwarding remaining args).
- Resolves project root via `findRepoRoot(cwd)` from `scripts/lib/repo.ts`.
- Sets `process.env.SPECORATOR_ROOT` to the resolved root.
- Validates that the subcommand is in the known command registry.
- Spawns `tsx scripts/<subcommand>.ts` with the remaining argv, inheriting stdio.
- Exits with the child's exit code.

**`scripts/lib/repo.ts`** — `repoRoot` fix (change to existing file)
- Remove the `import.meta.url`-based derivation.
- Add `findRepoRoot(startDir?: string): string` — walks up from `startDir ?? process.cwd()` looking for `package.json` or `.git`; throws if not found.
- `repoRoot` becomes: `process.env.SPECORATOR_ROOT ?? findRepoRoot()`.
- When the CLI sets `SPECORATOR_ROOT`, all downstream scripts consume it without needing their own walk-up.
- All existing callers of `repoRoot` continue to work unchanged — the public symbol is preserved.

**`package.json`** (changes)
- Add `"bin": { "specorator": "./scripts/cli.ts" }`.
- Move `tsx` from `devDependencies` to `dependencies`.
- Add `"scripts/cli.ts"` to the `files` array.

### Data flow

```
argv                      → cli.ts dispatcher
--cwd / process.cwd()     → findRepoRoot()  →  repoRoot string
repoRoot string           → process.env.SPECORATOR_ROOT
SPECORATOR_ROOT + subcommand argv  → spawned scripts/<sub>.ts
scripts/<sub>.ts          → imports lib/repo.ts → reads SPECORATOR_ROOT → repoRoot
```

### Architecture decisions

See **ADR-0034** — "Expose specorator scripts as a CLI binary via bin entry in the existing package."

### State transitions

The CLI dispatcher is stateless. No config files are read or written by the dispatcher itself.

### Edge cases

| Case | Behavior |
|---|---|
| Subcommand contains path traversal (`../../evil`) | Dispatcher validates against an allowlist of known subcommand names; rejects unknown names with exit 1 |
| `SPECORATOR_ROOT` already set in environment | Dispatcher respects the existing value; does not overwrite unless `--cwd` is supplied |
| `tsx` not on PATH | `spawnSync('tsx', …)` fails; error propagated with message "specorator: could not find tsx in PATH. Is it installed?" |
| Script itself uses `import.meta.url` for non-root purposes | Unaffected — only `repoRoot` derivation changes; other `import.meta.url` uses remain valid |
| Running from inside a subdirectory of the project | Walk-up from `process.cwd()` finds the root; behavior is identical to running from root |

### Testing strategy

- **Unit test `findRepoRoot`:** test against a temp-dir fixture that has `package.json` at various depths; assert correct root is returned, assert error thrown when no sentinel found.
- **Integration test CLI dispatcher:** spawn `specorator --help` in the test environment; assert exit 0 and expected output.
- **Regression: `npm run verify` parity:** run both `npm run verify` and `specorator verify` on the repo; assert identical exit codes.
- **Installed-context simulation:** test `findRepoRoot` with `startDir` pointing into a simulated `node_modules/` path; assert it walks up to the correct sentinel.

### Open decisions deferred to implementation

- Whether to emit the command registry from `scripts/lib/tasks.ts` (which already has `name` and `label` per task) or maintain a separate `scripts/lib/commands.ts` registry for help text. The tasks file is the natural single source of truth.
- Whether `scripts/cli.ts` spawns `tsx scripts/<sub>.ts` or calls the script's exported function directly. Spawn preserves full isolation and keeps the dispatcher change-free as scripts evolve; direct call is faster but requires every script to export its logic. Spawn is recommended for the first cut.
