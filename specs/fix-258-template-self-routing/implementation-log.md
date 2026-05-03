---
feature: fix-258-template-self-routing
area: FIX258
---

# Implementation log — fix-258-template-self-routing

## 2026-05-03 — Options A + D + branch guard (specorator-improvement)

**Issue:** #258 — superpowers brainstorming bypassed Specorator Improvement Track for template-self changes.

**Surfaces changed:**

- `CLAUDE.md` — added "Template-self changes route through `/specorator:update`" to Conventions and "What not to do"
- `AGENTS.md` — added routing rule to Operating rules; updated no-direct-commits rule to mention the new PreToolUse hook
- `.claude/skills/specorator-improvement/SKILL.md` — updated `description` frontmatter with TRIGGER/SKIP keywords; added "When to invoke" section with explicit keyword list
- `.claude/settings.json` — added `PreToolUse` Bash hook that refuses `git commit` when `HEAD` is `main` or `develop`

**Acceptance criteria met:**
- Option A implemented: CLAUDE.md and AGENTS.md both have explicit routing instructions
- Option D implemented: SKILL.md description and body now include `new track`, `new agent`, `new skill`, `new workflow`, and file-path triggers
- Comment remediation: PreToolUse hook provides local-deny mirroring the existing push-deny
