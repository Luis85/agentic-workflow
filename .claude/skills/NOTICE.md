# Caveman Skills

These skills are vendored from [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman),
copyright (c) 2026 Julius Brussee, licensed under the MIT License.

Included skills:

- `caveman/` — ultra-compressed response mode (lite / full / ultra / wenyan-*)
- `caveman-commit/` — terse Conventional Commits messages
- `caveman-review/` — one-line PR review comments
- `caveman-help/` — quick-reference card for caveman commands
- `compress/` — compress prose-heavy markdown files (CLAUDE.md, notes) into
  caveman form to save input tokens; depends on the Python scripts in
  `compress/scripts/`

## Usage

The skills are auto-discovered by Claude Code from `.claude/skills/`. Trigger
the main mode with `/caveman` (or `/caveman lite|full|ultra|wenyan|wenyan-lite|wenyan-ultra`),
and stop with "stop caveman" or "normal mode". See each skill's `SKILL.md` for
details, or run `/caveman-help` for a reference card.

The original upstream repo also ships SessionStart hooks, a statusline badge,
and an `npx skills` installer for other agents. Those are not vendored here —
this directory contains only the skill definitions themselves. See the upstream
repo if you want auto-activation on every session start.

## License

MIT. Full license text:
<https://github.com/juliusbrussee/caveman/blob/main/LICENSE>
