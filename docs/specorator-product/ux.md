# Specorator UX Steering

## Design Principles

- **Make the next action obvious** - Do point users to the smallest useful surface; do not make them read the whole repository first.
- **Show the artifact path** - Do connect concepts to concrete files and commands; do not leave process advice detached from where work lives.
- **Respect role boundaries** - Do clarify which agent or human owns each decision; do not blur stages into one generic AI prompt.
- **Prefer evidence over persuasion** - Do link claims to demos, checks, release notes, or specs; do not rely on marketing copy alone.
- **Keep starter surfaces reusable** - Do preserve blank downstream templates; do not fill them with Specorator-only context.

## Information Architecture

- `README.md` is the public entry point and quick-start map.
- `sites/index.html` is the public product page.
- `AGENTS.md` is the cross-tool source of truth for agent operating rules.
- `.claude/`, `.codex/`, and future adapter folders are tool-specific projections.
- `docs/specorator.md` defines the full workflow.
- `docs/specorator-product/` defines this repository's own product steering.
- `docs/steering/` remains adopter-facing starter context.

## Interaction And Content Patterns

- Use short sections with concrete links to files.
- Keep role-specific paths separate from exhaustive reference material.
- Mark optional tracks as optional.
- Name commands exactly as users run them.
- Preserve status and caveats near claims that depend on future PRs or evidence.
- For product-page changes, keep the first viewport focused on Specorator and reveal the next section without making a marketing-only splash screen.

## Accessibility

- Public HTML must keep semantic headings, keyboard-reachable controls, visible focus states, and sufficient color contrast.
- Documentation links must use descriptive labels, not "click here".
- Avoid relying on color alone for status.
- Keep Mermaid and diagram use backed by surrounding text for screen-reader and plain Markdown readers.

## Content Standards

- Use sentence case for headings unless a file already uses title case.
- Prefer active voice.
- Keep examples short and realistic.
- Explain reversible opt-in behavior before advanced controls.
- Avoid security or compliance overclaims.

## Common Agent Mistakes

- Treating `docs/steering/` as Specorator's own filled-in context.
- Adding a new workflow stage without an ADR.
- Updating public positioning before evidence exists.
- Duplicating canonical rules into tool adapters instead of pointing back to `AGENTS.md`.
