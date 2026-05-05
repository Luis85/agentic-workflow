---
id: RESEARCH-CLI-001
title: Research — specorator-cli extraction
stage: research
feature: extract-scripts-cli
area: CLI
status: accepted
owner: analyst
created: 2026-05-05
updated: 2026-05-05
sources:
  - https://eslint.org/blog/2024/07/whats-coming-next-for-eslint/
  - https://eslint.org/blog/2025/01/eslint-2024-year-review/
  - https://spin.atomicobject.com/cli-scripts-tsx/
  - https://tsx.is/getting-started
  - https://biomejs.dev/guides/migrate-eslint-prettier/
  - https://jsdev.space/complete-monorepo-guide/
---

# Research — specorator-cli extraction

## 1. Distribution model options

Three credible paths exist:

| Option | Description | Adopter install weight | Maintenance | Versioning complexity | CI impact | Repo restructuring |
|---|---|---|---|---|---|---|
| **A — bin in existing package** | Add `bin` field + shebang entry to `@luis85/agentic-workflow` | Heavy (full template) | Low | None | Minimal | None |
| **B — separate `@luis85/specorator-cli`** | Second package; scripts only | Lean | Medium | Peer-dep coordination | Second publish job | Moderate |
| **C — npm workspaces monorepo** | `packages/cli/` + `packages/template/` in same repo | Lean | High | Changesets config | Workspace-aware CI | Significant |

**Option A** is the lowest-cost first step and the only one that requires no restructuring. It makes all scripts available as named CLI subcommands, keeps the single `package.json` and publish pipeline, and requires only two changes: a `bin` entry pointing at a new dispatcher entry point, and a fix to `scripts/lib/repo.ts` root discovery. The sole downside is that adopters installing the CLI still download the full template corpus. Options B and C earn their overhead only if a concrete user need emerges to install the tooling without the template, or if independent versioning becomes necessary — neither has materialized yet.

## 2. Prior art

**ESLint (monolith → package split, 2024–2025):** Extracted `@eslint/core`, `@eslint/js`, and language plugins into a separate monorepo. Lesson: the split was motivated by extensibility and extensibility only — it took years and a planned shim period. Disproportionate for a CLI-only extraction.

**Prettier (single package with bin):** Ships formatter + Node API + CLI in one package. Users download the full package for any use case. Lesson: single-package consolidation is sustainable when the surface area is cohesive — Prettier has not suffered from this model.

**Biome (single binary):** Formatter + linter + config in one package/binary. Lesson: single-package reduces user confusion at the cost of granularity.

**`create-react-app` → `cra-template` split:** Separated the scaffold (one-time install) from the template (recurring). Lesson: split pays off when template and tooling are consumed at different times or by different audiences. Currently, Specorator's scripts and template are always co-installed — the split case has not arrived.

**Nx workspaces:** Independent versioning via Changesets. Lesson: workspace model is powerful but high-setup. Worth considering after the bin interface stabilises.

## 3. `bin` entry patterns for `tsx`-based CLIs

Minimal `package.json`:
```json
"bin": { "specorator": "./scripts/cli.ts" }
```

Entry file first line:
```
#!/usr/bin/env tsx
```

The entry must be `chmod +x`. `tsx` resolves TypeScript imports at runtime — no compile step needed for local testing. For distribution, `tsx` must move from `devDependencies` to `dependencies` in the CLI package so the bin is usable from an installed copy, OR scripts must be pre-compiled to JS (removes the runtime `tsx` requirement, adds a build step). Given Specorator's current "no compile step" philosophy, moving `tsx` to `dependencies` is the simpler path for the first cut.

## 4. Config discovery — key risk

`scripts/lib/repo.ts` currently anchors the repo root two levels above `import.meta.url`:

```typescript
export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
```

This works only when the scripts live inside the target repo. Once installed into `node_modules/`, `import.meta.url` points into `node_modules/` and the `../..` walk lands in the wrong directory.

**Established fix patterns:**
- **Walk-up from `process.cwd()`** looking for a sentinel (`package.json`, `.git`). Used by ESLint, Prettier, Biome. Most robust.
- **Explicit `--cwd` flag.** Unambiguous for scripted/CI use. Used by Biome, ESLint.
- **`process.cwd()` assumption.** Simplest — assume the user runs `specorator` from the project root. Brittle in subdirectories but acceptable for a developer gate tool.

This is the single most important pre-extraction fix regardless of which distribution model is chosen.

## 5. Versioning — lockstep vs. independent

| Strategy | When it fits | Cost |
|---|---|---|
| **Lockstep** (single version, always published together) | Template and CLI always go together | Forced CLI release on doc-only template changes |
| **Peer dependency** (`specorator-cli` declares peer on template) | Independent release cadences needed | Two version ranges to manage; npm peer-dep warnings |
| **Custom engines constraint** (non-standard, validated by a check script) | Lightweight signal without enforcement | Non-standard; relies on documentation + custom check |

Lockstep is appropriate for Option A (single package). A peer-dep or custom constraint becomes relevant only if Option B or C is chosen.

## 6. Risks

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| `repoRoot` from `import.meta.url` breaks in `node_modules/` | High | Certain | Walk-up from `process.cwd()` + `--cwd` flag |
| Hardcoded `../..` relative imports in `scripts/lib/` break on move | High | High (B/C) | Audit all `path.resolve(… "../..")` before moving files |
| `tsx` not available on consumer machines (currently devDep) | Medium | Medium | Move to `dependencies` in CLI package, or pre-compile |
| `npm-shrinkwrap.json` invalidated on split | Medium | Certain (B/C) | Per-package shrinkwrap or drop it in the CLI package |
| Tests assume scripts are co-located with repo under test | Medium | High | Path injection or `--project-root` argument after extraction |
| `npm run verify` breaks for current adopters | Low | Low (A avoids entirely) | Migration guide; `npm run` aliases preserved in Option A |

## Recommended direction

**Start with Option A.** Add a `bin` dispatcher to `@luis85/agentic-workflow`, fix `scripts/lib/repo.ts` root discovery, and move `tsx` to `dependencies`. This delivers the `specorator` CLI binary with zero restructuring and no version-coordination overhead. Document the Option B/C path in the ADR as a deferred decision, to be revisited after the bin interface stabilises and if a concrete "install CLI without template" use case emerges.
