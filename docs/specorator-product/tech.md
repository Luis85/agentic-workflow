# Specorator Technical Steering

## Stack

- **Primary artifact format:** Markdown with YAML frontmatter where required.
- **Runtime for checks:** Node.js 20+.
- **Language for automation:** TypeScript run through `tsx`.
- **Package manager:** npm with `npm-shrinkwrap.json`.
- **Public page:** static HTML/CSS/JS under `sites/`, deployed by GitHub Pages.
- **CI/CD:** GitHub Actions for verify, security scans, typos, product-page checks, release/publish workflows, and PR title rules.
- **Distribution:** GitHub source archive and GitHub Packages npm package, with package shape governed by release-package docs and checks.

## Repository Layout

```text
AGENTS.md       - cross-tool operating source of truth
CLAUDE.md       - Claude Code entry point
.codex/         - Codex-specific instructions and workflows
.claude/        - Claude agents, commands, skills, memory, settings
docs/           - methodology, steering, quality, release, and reference docs
specs/          - per-feature workflow artifacts and state
templates/      - blank artifacts for downstream use
scripts/        - deterministic checks, fixers, reports, and helpers
tests/          - script and library tests
sites/          - public product page
```

## Coding Conventions

- Keep scripts deterministic and read-only unless explicitly named `fix:*`.
- Use shared helpers under `scripts/lib/` before adding one-off parsing logic.
- Prefer structured parsers for YAML, Markdown frontmatter, and repository inventories.
- Add or update tests when script behavior changes.
- Regenerate generated docs when TypeScript script APIs change.
- Commit messages are imperative and reference task IDs or issue numbers.

## Documentation Conventions

- Keep methodology docs in Markdown.
- Use stable IDs for requirements, tasks, tests, ADRs, and findings.
- One folder gets one `README.md`; non-root README files need folder frontmatter.
- Preserve downstream templates as templates. Put Specorator-specific reality in `docs/specorator-product/`.
- Link to canonical sources rather than duplicating large sections.

## Build, Test, Run

```bash
npm ci
npm run check:fast          # or: specorator check:fast
npm run verify:changed
npm run verify              # or: specorator verify
```

Use `npm run verify` (or `specorator verify`) as the final local gate before pushing implementation PRs. Use narrower checks while iterating.

## CLI Binary

After `npm install`, the `specorator` binary is available via `node_modules/.bin/specorator`:

```bash
specorator verify           # full gate
specorator check:fast       # fast subset
specorator fix              # all deterministic fixers
specorator --help           # list all subcommands
specorator <sub> --help     # subcommand usage
specorator --cwd <path> verify  # explicit project root
```

All `npm run <target>` aliases remain and produce identical output. The binary is a thin dispatcher — each subcommand delegates to the corresponding `scripts/<name>.ts` entry point. See ADR-0034 and `specs/extract-scripts-cli/` for the design and distribution model rationale.

## Dependency Policy

- New runtime or dev dependencies require a PR justification.
- Architecturally significant dependencies require an ADR.
- Security-sensitive dependencies require explicit review.
- Keep package metadata and release-package checks in sync.

## Security Baseline

- Do not commit secrets, tokens, private keys, or customer data.
- Treat hooks and agentic-security checks as opt-in until an ADR promotes them.
- Keep destructive operations behind explicit human authorization.
- Keep adapters thin so workflow authority does not drift away from canonical sources.

## Common Agent Mistakes

- Editing the main checkout instead of the topic worktree.
- Running only a targeted check and forgetting the final `npm run verify`.
- Adding generated docs without updating the generating script or vice versa.
- Making a tool adapter authoritative instead of a pointer to the canonical workflow.
