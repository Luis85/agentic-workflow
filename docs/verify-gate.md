# The verify gate

The verify gate is a **project‑level contract**: every project that uses this workflow defines a single command — conventionally `verify` — that runs all of these stages, in order, exits non‑zero on first failure, and is the *one* command an agent or human runs before pushing or opening a PR.

## The five stages

| # | Stage | Purpose |
| --- | --- | --- |
| 1 | **Format check** | Confirms code matches the project formatter's output without writing changes. Catches whitespace / import‑order drift early. |
| 2 | **Lint** | Catches the project's lint rules (style, suspicious patterns, dead code). |
| 3 | **Static check** | Type checker, schema validator, contract checker — whatever the project's "before runtime" gate is. |
| 4 | **Tests** | The full test suite. No `--only`, no skipping, no coverage relaxation. |
| 5 | **Build** | Produces the deliverable artifact (library bundle, container image, binary). Catches dead imports and broken module shape. |

If any stage fails, **stop**. Fix the failure. Re‑run only the failing stage in isolation while iterating, then re‑run the full `verify` once it's green.

## What this looks like in practice

The exact command differs per language:

| Stack | Composite command | Stages |
| --- | --- | --- |
| Node / TS | `npm run verify` | `format:check && lint && typecheck && test && build` |
| Python | `make verify` or `just verify` | `ruff format --check && ruff check && mypy . && pytest && python -m build` |
| Go | `make verify` | `gofmt -l . && go vet ./... && go build ./... && go test ./...` |
| Rust | `just verify` or `make verify` (Cargo has no built-in alias mechanism — wrap the script in a runner) | `cargo fmt --check && cargo clippy -- -D warnings && cargo build && cargo test` |
| Mixed | `just verify` | recipes per stage |

The composite name (`verify`) is the contract. Whatever lives behind it is the project's choice.

## This template repo

This repository implements its own verify gate with Node/npm:

```bash
npm install
npm run verify
```

The check scripts are read-only TypeScript files and live in `scripts/`. `npm run verify` uses a small task runner that stops on the first failing check and prints the exact command to rerun while iterating. The template repo currently typechecks and tests the script tooling, then checks Markdown links, ADR index drift, command inventory drift, TypeDoc-generated script documentation drift, workflow documentation contract drift, frontmatter conventions, lifecycle workflow-state consistency, and traceability ID references. Local repair helpers are intentionally separate: `npm run fix` runs all generated-block repairs, `npm run fix:adr-index` regenerates the ADR index, `npm run fix:commands` regenerates command inventories, and `npm run fix:script-docs` regenerates `docs/scripts/` from TypeScript source comments.

## Reporting

When an agent runs verify, it reports:

- **On pass:** one line. `verify green — ready to PR.` Don't enumerate.
- **On fail:** name the failing stage, quote the **first** error (not the last), suggest the single command to reproduce. Don't dump full stack traces.

```
verify failed at typecheck.

  src/foo.ts:42:7 — Property 'bar' does not exist on type 'Baz'.

reproduce: npm run typecheck
```

## Hard rules

- **Never** use `--no-verify` (or its equivalents) to skip commit hooks. See [`feedback_pr_hygiene.md`](../.claude/memory/feedback_pr_hygiene.md).
- **Never** weaken any stage to make verify pass.
- **Never** disable a flaky test silently. Open an issue, document the skip, name an owner.
- **Never** delete tests to reduce the test count.
- **Never** commit build outputs (`dist/`, `target/`, `build/`).

## What verify is **not**

- It is **not** a security audit. Run those separately (typically as a scheduled job or CI gate, not on every push).
- It is **not** a benchmark suite. Performance regressions need a different feedback loop.
- It is **not** a substitute for review. Verify catches what tools can catch; review catches what tools can't.

## Why one composite command

Three reasons:

1. **Cacheable in muscle memory.** Agents and humans both end up running it dozens of times a day; one name is one less thing to remember.
2. **Cacheable in CI.** A single script makes it trivial to mirror local and CI behaviour exactly. "Works on my machine" failures usually trace to a divergence between local steps and the CI pipeline; one command keeps them aligned.
3. **Bundles the build into pre‑PR.** A class of bugs (broken imports, dead exports, unresolved type refs) shows up only at build time, never in unit tests. Including build in verify catches them before review.

## Adoption

If your project doesn't have a `verify` command yet:

1. Pick the composite name (`verify` is conventional; whatever your runner prefers is fine — `make verify`, `just verify`, `npm run verify`).
2. Wire the five stages so they run in order and exit non‑zero on first failure.
3. Document the command in the project's README.
4. Update the operational bots' prompts that reference "the project verify gate" — most just reference *this* document, so you don't need to edit them per project.

See the [`verify` skill](../.claude/skills/verify/SKILL.md) for what an agent does after running it.
