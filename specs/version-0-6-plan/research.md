---
id: RESEARCH-V06-001
title: Version 0.6 productization and trust plan - Research
stage: research
feature: version-0-6-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V06-001
created: 2026-05-01
updated: 2026-05-01
---

# Research - Version 0.6 productization and trust plan

## Context

The repository already has the pieces of a credible product: AGENTS.md as cross-tool context, Claude agents and skills, Codex delivery instructions, quality metrics, worktree discipline, CI/security workflows, an Obsidian UI layer, and a public product page. The remaining gap is that users must infer how these pieces become an adoption path. Several steering docs still contain placeholder copy, the first-feature tutorial is desk-validated rather than live-run, and cross-tool support is described more as portability than as installable adapter surfaces.

## Market and platform signals

- Anthropic's Claude Code best practices emphasize verification, exploring before planning and coding, keeping `CLAUDE.md` concise, using skills for on-demand workflows, using subagents for isolated investigation, and using hooks for actions that must happen every time. Source: <https://code.claude.com/docs/en/best-practices>.
- OpenAI Codex documents `AGENTS.md`, skills, hooks, plugins, subagents, and the Codex GitHub Action as first-class customization and automation surfaces. Sources: <https://developers.openai.com/codex/guides/agents-md>, <https://developers.openai.com/codex/skills>, <https://developers.openai.com/codex/hooks>, <https://developers.openai.com/codex/github-action>.
- GitHub Copilot customization now includes custom instructions, prompt files, custom agents, agent skills, hooks, and MCP servers, with project skills accepted under `.github/skills/`, `.claude/skills/`, or `.agents/skills/`. Source: <https://docs.github.com/en/copilot/reference/customization-cheat-sheet>.
- GitHub Spec Kit has a clear install and init story, supported AI coding agent integrations, extension catalogs, presets, and community examples. Source: <https://github.com/github/spec-kit>.
- Sonar's 2026 State of Code survey reports that AI-generated code is a large and growing share of committed code, while many developers do not always verify it before committing. Source: <https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding>.
- OWASP's Top 10 for Agentic Applications 2026 provides a peer-reviewed operational starting point for autonomous-agent risks. Source: <https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/>.
- ISO lists ISO/FDIS 9001 as expected to replace ISO 9001:2015 in September 2026. Source: <https://www.iso.org/standard/88464.html>.

## Alternatives

### Alternative A - Productization and trust release

Use v0.6 to improve adoption proof, cross-tool compatibility, deterministic hooks, and agentic security governance.

**Pros:** Directly addresses adoption, trust, and current market needs without changing the lifecycle.

**Cons:** Touches several docs/tooling surfaces and needs careful scoping to avoid becoming a broad cleanup release.

### Alternative B - Obsidian plugin acceleration

Move directly into the v2.0 Obsidian plugin direction after v0.5.

**Pros:** Strong user-facing interface story and aligns with issue #96.

**Cons:** Depends on released packages and stable installation/update semantics that v0.6 should prove first.

### Alternative C - v1.0 stabilization only

Skip v0.6 and focus all effort on the v1.0 release readiness checklist.

**Pros:** Reduces version sprawl and keeps attention on stable release mechanics.

**Cons:** Leaves productization, cross-tool adapters, live proof, and agentic security gaps unresolved before v1.0.

## Recommendation

Choose Alternative A. v0.6 should be a productization and trust release that bridges v0.5 distribution to v1.0 stability and v2.0 Obsidian UX. It should not add a mandatory stage or a plugin. It should make the existing workflow easier to adopt, easier to verify, easier to run across agent tools, and easier to defend from agent-specific risk.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-V06-001 | Cross-tool adapters drift from the canonical `AGENTS.md` and Claude surfaces. | high | Generate or validate adapter inventories from a source-of-truth map and document ownership. |
| RISK-V06-002 | Hook packs become too aggressive and block legitimate local work. | high | Ship hooks as opt-in profiles first, with dry-run/advisory mode and documented disable paths. |
| RISK-V06-003 | Agentic security claims overstate protection. | high | Align to OWASP risk categories, state limits clearly, and avoid certification claims. |
| RISK-V06-004 | Golden-path demo is brittle or too slow for CI. | medium | Start with deterministic artifact validation and promote to CI execution only after a stable dry run. |
| RISK-V06-005 | Adoption profiles duplicate docs and add maintenance overhead. | medium | Keep profiles as short entry-point maps linking to existing docs, not parallel manuals. |
| RISK-V06-006 | ISO 9001:2026 references become stale before final publication. | medium | Add a watch item and avoid updating QA requirements until the published standard is final. |

## Sources

- Claude Code best practices: <https://code.claude.com/docs/en/best-practices>
- OpenAI Codex AGENTS.md guide: <https://developers.openai.com/codex/guides/agents-md>
- OpenAI Codex skills: <https://developers.openai.com/codex/skills>
- OpenAI Codex hooks: <https://developers.openai.com/codex/hooks>
- OpenAI Codex GitHub Action: <https://developers.openai.com/codex/github-action>
- GitHub Copilot customization cheat sheet: <https://docs.github.com/en/copilot/reference/customization-cheat-sheet>
- GitHub Spec Kit: <https://github.com/github/spec-kit>
- OWASP Top 10 for Agentic Applications 2026: <https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/>
- Sonar 2026 State of Code survey: <https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding>
- ISO/FDIS 9001: <https://www.iso.org/standard/88464.html>
