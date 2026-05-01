---
title: "Product Page UI Kit"
folder: ".claude/skills/specorator-design/ui_kits/product-page"
description: "High-fidelity React recreation of the live Specorator product page — reference component split per section."
entry_point: true
---
# Product Page UI Kit

High-fidelity React recreation of the [Specorator product page](https://luis85.github.io/agentic-workflow/) — the canonical brand surface. Components are split per section so they can be remixed.

## Files

| File                  | What                                                              |
| --------------------- | ----------------------------------------------------------------- |
| `index.html`          | Composed full page, scrolling, all sections wired up              |
| `Header.jsx`          | Sticky brand bar with skip-link, brand mark, nav, CTAs            |
| `Hero.jsx`            | Two-column hero: copy + workflow SVG, eyebrow, proof grid         |
| `WhyPanels.jsx`       | Problem / Solution two-up colored panels                          |
| `TeamGrid.jsx`        | 8-card lane-coded specialist roles grid                           |
| `FitGrid.jsx`         | "Good fit / Probably too much" two-up                             |
| `FeatureGrid.jsx`     | Dark section, 9 feature cards                                     |
| `AudienceGrid.jsx`    | 4 big-numeral cards with "you'd say" pattern                      |
| `Workflow.jsx`        | Discovery + Lifecycle stage rails                                 |
| `TrackGrid.jsx`       | 8 opt-in track cards with phases + commands                       |
| `Roster.jsx`          | Dark section, 6 roster groups, all 30 agents                      |
| `RepoGrid.jsx`        | 6 file-tree code chips                                            |
| `ArtifactExample.jsx` | 3-card artifact chain with markdown specimens                     |
| `Faq.jsx`             | 6-up Q&A grid                                                     |
| `StartSteps.jsx`      | Dark section, 4 numbered steps + terminal quickstart              |
| `Footer.jsx`          | License + footer links                                            |
| `app.jsx`             | Page composition root                                             |
| `kit.css`             | Component CSS lifted near-verbatim from `sites/styles.css`        |

The CSS in `kit.css` is a direct import of the live product page styles, with class names preserved so JSX is a 1:1 visual match.
