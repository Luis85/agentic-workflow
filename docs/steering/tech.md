# Technical Steering

> **Replace this whole file** with your stack's reality. The placeholders below show the shape.

## Stack

- **Language(s):** …
- **Runtime / framework:** …
- **Package manager:** …
- **Database(s):** …
- **Infra / hosting:** …
- **CI/CD:** …
- **Observability:** logs, metrics, traces — what tools, where they go.

## Repo layout

```
src/        — application code
tests/      — automated tests
docs/       — documentation (this kit)
specs/      — per-feature work product
templates/  — artifact templates
.claude/    — Claude Code subagents and commands
```

## Coding conventions

- Style guide: …
- Linter / formatter (and config location): …
- Type checking: strictness level …
- Naming: …
- Tests live next to source / under `tests/` (pick one).
- Commit style: imperative, reference task IDs (`feat(auth): T-AUTH-014 …`).

## Dependency policy

- New dependencies require: a one-line justification in the PR, ADR if architecturally significant, security review if it touches auth / crypto / data.
- Pin versions in lockfiles. No floating ranges in production manifests.

## Build, test, run

```sh
# Install
…

# Build
…

# Lint
…

# Test (unit)
…

# Test (integration / e2e)
…

# Run locally
…
```

## Performance budgets

- API p95 latency: …
- Page TTI: …
- Memory ceiling: …

## Security baseline

- Secrets management: …
- AuthN / AuthZ patterns: …
- Threat model: link to `docs/threat-model.md` (when present).

## Things agents commonly get wrong here

- (List as you discover them. e.g. "Don't add `any` to silence the type-checker.")
