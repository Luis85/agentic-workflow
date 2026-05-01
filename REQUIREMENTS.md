# Requirements

What you need to run this template, by capability tier. Pick the smallest tier that covers your use case.

The template is a **folder of Markdown conventions**, not a runtime. Most users only need Tier 1. Tier 2 unlocks the local verify gate; Tier 3 unlocks CI, automation, and the public product page.

> Quick links: [`README.md`](README.md) · [`AGENTS.md`](AGENTS.md) · [`docs/verify-gate.md`](docs/verify-gate.md) · [`docs/branching.md`](docs/branching.md) · [`docs/worktrees.md`](docs/worktrees.md)

---

## Tier 0 — Read-only

You only want to read the template (browse the workflow, copy patterns, evaluate fit).

| Need | Version | Why |
|---|---|---|
| Web browser **or** Markdown-aware editor | any | Render the docs and templates |
| Git *(optional)* | 2.30+ | Clone instead of browsing on github.com |

**Install:** nothing. Browse [github.com/Luis85/agentic-workflow](https://github.com/Luis85/agentic-workflow) or `git clone` and open the folder.

---

## Tier 1 — Minimum (drive the workflow)

You want to actually use the workflow — open Claude Code, talk through stages, produce specs and ADRs.

| Need | Version | Why |
|---|---|---|
| **Git** | 2.30+ | Branch-per-concern, worktrees, history (see [`docs/branching.md`](docs/branching.md)) |
| **AI coding agent** *(one of)* | latest | Drive stages, run skills, dispatch specialist agents |
| &nbsp;&nbsp;• [Claude Code](https://claude.ai/code) — **first-class**, free tier works | — | Skills, slash commands, hooks all natively supported |
| &nbsp;&nbsp;• Cursor / Aider / Copilot / Codex / Gemini CLI — supported | — | Read [`AGENTS.md`](AGENTS.md) as root context; slash commands won't auto-run |
| Plain-text editor | any | Edit Markdown artifacts |

**Install:**

```bash
git clone https://github.com/Luis85/agentic-workflow.git my-project
cd my-project
claude   # or your preferred AI tool
```

**What you get at Tier 1:** every stage (Idea → Retrospective), every track (Discovery, Stock-taking, Sales, Project Manager, Roadmap, Portfolio, Quality Assurance), every artifact template, every ADR. No automated checks.

**What you can't do yet:** run `npm run verify` (no local quality gate), regenerate the ADR / command / script-doc indexes, run `doctor` or `self-check`.

---

## Tier 2 — Recommended (local verify gate + integrity scripts)

You want the verify gate, generated-doc repair helpers, and pre-PR integrity checks running on your machine.

| Need | Version | Why |
|---|---|---|
| Everything in Tier 1 | — | — |
| **Node.js** | **>= 20** (LTS) | `package.json#engines.node` requires it; `tsx` runtime |
| **npm** | bundled with Node | Install dev deps + run scripts |

**Install:**

```bash
npm install
npm run doctor    # environment + repo health (read-only)
npm run verify    # full pre-PR gate (read-only)
```

**What you get at Tier 2:** `verify`, `verify:changed`, `verify:json`, `doctor`, `self-check`, `check:*` (frontmatter, links, ADR index, agents, traceability, workflow docs, command docs, script docs, Obsidian metadata, product page, token budget, …), `fix:*` (regenerate ADR index, command docs, script docs, sites tokens, Obsidian).

**What you still can't do:** open PRs from the CLI, run CI, deploy the product page, run the security workflows locally.

> Project owners adopting the template: see [`docs/verify-gate.md`](docs/verify-gate.md) for the verify contract.

---

## Tier 3 — Full capacity (CI, automation, product page)

You want the whole template firing — CI mirrors local verify on every PR, secret + spell scans run on every PR, workflow-file security scans run when `.github/` changes, the product page deploys, operational bots can run.

| Need | Version | Why |
|---|---|---|
| Everything in Tier 2 | — | — |
| **GitHub account** + repo (own or fork) | — | Host the project, run Actions, host Pages |
| **GitHub Actions** enabled | — | Verify mirror, security scans, Pages deploy ([`.github/workflows/`](.github/workflows/)) |
| **GitHub Pages** enabled (deploy from `sites/`) | — | Public product page (see [`docs/sink.md`](docs/sink.md)) |
| **GitHub CLI** (`gh`) | 2.40+ | PR / issue / release automation, project scaffolding (`npm run project:setup:github`), review-loop scripts |

**Install:**

```bash
# GitHub CLI — pick your platform
winget install GitHub.cli                # Windows
brew install gh                          # macOS
sudo apt install gh                      # Debian/Ubuntu (after adding GH apt source)
gh auth login
```

**CI workflows you get for free** (no local install — they run in Actions):

| Workflow | Tool | Trigger | Purpose |
|---|---|---|---|
| [`verify.yml`](.github/workflows/verify.yml) | Node + npm | every PR + push to `main` | Mirrors `npm run verify` |
| [`pr-title.yml`](.github/workflows/pr-title.yml) | — | every PR | Enforces Conventional Commits in PR titles |
| [`pages.yml`](.github/workflows/pages.yml) | — | push to `main` | Deploys [`sites/`](sites/) to GitHub Pages |
| [`gitleaks.yml`](.github/workflows/gitleaks.yml) | gitleaks | every PR + weekly cron | Secret scanning |
| [`typos.yml`](.github/workflows/typos.yml) | typos | every PR | Typo scan |
| [`actionlint.yml`](.github/workflows/actionlint.yml) | actionlint | only when `.github/workflows/**` or `.github/actions/**` change | Workflow file linter |
| [`zizmor.yml`](.github/workflows/zizmor.yml) | zizmor | only when `.github/workflows/**` or `.github/actions/**` change + weekly cron | GitHub Actions security audit (SARIF → Security tab) |

> See [`docs/security-ci.md`](docs/security-ci.md) for the security-CI rationale.

---

## Optional

| Tool | Tier | Purpose |
|---|---|---|
| [Obsidian](https://obsidian.md/) | any | Browse `specs/` and `docs/` as a linked vault; the repo includes Obsidian-friendly metadata and asset checks (`check:obsidian`, `check:obsidian-assets`) |
| TypeDoc | 2 | Regenerate `docs/scripts/` from JSDoc — already wired into `npm run docs:scripts` and `npm run fix:script-docs`; no extra install |
| Operational bots ([`agents/operational/`](agents/operational/)) | 3 | Scheduled review-bot, dep-triage-bot, etc. — opt-in; run them one at a time as the team gets comfortable |

---

## Capability matrix

| Capability | T0 | T1 | T2 | T3 |
|---|:-:|:-:|:-:|:-:|
| Read template, copy patterns | x | x | x | x |
| Drive stages with an AI agent | | x | x | x |
| Produce specs / ADRs / artifacts | | x | x | x |
| Run any optional track (Discovery, Sales, …) | | x | x | x |
| Local verify gate (`npm run verify`) | | | x | x |
| `doctor` / `self-check` / `check:*` / `fix:*` | | | x | x |
| Regenerate ADR / command / script docs | | | x | x |
| CI mirrors verify on PR | | | | x |
| Security scans (gitleaks, zizmor, typos, actionlint) | | | | x |
| PR / issue / release automation (`gh`) | | | | x |
| Public product page (GitHub Pages) | | | | x |
| Operational bots (scheduled routines) | | | | x |

---

## Platform notes

- **Windows.** Tested on Windows 11 with PowerShell. Use `git bash` or PowerShell — both work for `npm` and `gh`. The verify gate is platform-agnostic Node.
- **macOS / Linux.** Standard. `brew` / `apt` / `dnf` install all listed tools.
- **Containers / CI.** The `verify.yml` workflow shows the canonical CI shape: `actions/checkout` → `actions/setup-node` (with `cache: npm`) → `npm ci` → `npm run verify`.

## What this template does *not* require

- A database, broker, or runtime service. The workflow is file-based.
- Python, Ruby, Go, Rust, Java toolchains. Scripts are TypeScript via `tsx` (Node-only).
- Paid tooling. Claude Code's free tier is sufficient. Every other dependency is open source or bundled with Node.
- A specific cloud provider. GitHub Pages is the documented host for the product page; any static host works.

## When dependencies should change

Adding a runtime / language / package to the template = ADR. Open a [`record-decision`](.claude/skills/record-decision/SKILL.md) discussion before adding to this file. Light dev tooling (a new lint rule, a new `check:*` script) does not need an ADR but does need an entry here when it shifts a tier.
