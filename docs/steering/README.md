# Steering Files

Persistent, scoped context loaded by agents on demand. Inspired by Kiro's `.kiro/steering/` pattern.

| File | Loaded by | When |
|---|---|---|
| `product.md` | PM, UX, UI, Reviewer, Release Manager | Product-shaped work |
| `tech.md` | Architect, Dev, QA, SRE | Technical work |
| `ux.md` | UX, UI, PM | Experience-shaped work |
| `quality.md` | QA, Reviewer | Test plans, reviews |
| `operations.md` | SRE, Release Manager | Release, deploy, incident |

**These files are templates.** Replace the placeholders with your project's reality. Keep each file under ~200 lines — split or `@import` if you need more.

## Loading rules

- **Always-loaded:** none, by default. Steering files are scoped on purpose.
- **Conditionally loaded:** agents declare in their frontmatter which steering files they need.
- **Manually loaded:** humans can `@docs/steering/<file>.md` in a prompt to inject context.

## Style

- Imperative mood. *"Use TypeScript strict mode"*, not *"We try to use TypeScript strict mode"*.
- Specific over general. *"Tailwind v4, no inline styles"*, not *"Use a CSS framework"*.
- Cite the source if non-obvious (a design doc, an ADR, a vendor constraint).
- Update via PR — these files are part of the contract.
