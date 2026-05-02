# Specorator Product Steering

## Mission

Specorator helps humans build software with AI agents without surrendering intent, traceability, or quality gates. The workflow is the product: a repository-native method for moving from idea to release through explicit artifacts, specialist agents, and deterministic verification.

## Target Users

- **Solo builder** - wants a disciplined path from vague idea to shipped feature without managing a full team. Needs clear prompts, resumable state, and low ceremony.
- **Product or engineering team** - wants AI-assisted delivery that preserves product intent, reviewability, and handoffs across roles.
- **Service provider or agency** - wants repeatable discovery, scoping, delivery, QA, and release records for client work.
- **Enterprise evaluator** - wants evidence of governance, auditability, security posture, and reversibility before adopting agentic workflows.
- **Brownfield maintainer** - wants to inventory an existing system and introduce one traceable feature without a rewrite.

## Value Proposition

Specorator is a file-based operating system for agentic software delivery: specs first, role-scoped agents, quality gates, and traceability in plain Markdown.

## Strategic Priorities

1. Make first-run adoption legible without reading the whole repository.
2. Back public claims with repository evidence: verified demos, checks, release notes, and traceable artifacts.
3. Keep the template portable across AI coding tools while preserving `AGENTS.md` and the workflow docs as source of truth.
4. Keep advanced controls optional and reversible until an ADR promotes them.
5. Improve the template without breaking downstream starter value.

## Non-Goals

- Do not turn Specorator into a hosted SaaS product.
- Do not replace human acceptance, prioritization, or intent-setting.
- Do not claim ISO certification, OWASP compliance, or complete security coverage.
- Do not make every optional track mandatory for small projects.
- Do not fragment the method into independent tool-specific manuals.

## Success Metrics

- A first-time adopter can identify the right starting path in under five minutes.
- Lifecycle artifacts maintain traceability from requirements to tests and review.
- `npm run verify` remains the single local confidence gate for contributors.
- Public release claims link to evidence, examples, checks, or source docs.
- Template improvements land through branch-per-concern PRs with documented verification.

## Voice And Tone

- Be plain, operational, and specific.
- Prefer "run `npm run verify`" over "ensure quality".
- State limits and caveats directly.
- Avoid hype, certification language, and claims that are not backed by committed evidence.

## Stakeholders

| Role | Decision rights |
|---|---|
| Human maintainer | Product intent, priority, acceptance, irreversible changes. |
| Lifecycle agents | Stage-specific artifact production inside their defined scope. |
| Reviewer / QA agents | Quality verdicts, findings, verification evidence, residual risk. |
| Release manager | Release readiness, public claims, package and tag hygiene. |
| Downstream adopters | Their own product steering after they fork or instantiate the template. |
