# How to customize agent permissions

**Goal:** add or remove a tool, Bash command, or path permission for a specific agent — at the per-agent level (`.claude/agents/<name>.md` frontmatter) or at the project level (`.claude/settings.json`).

**When to use:** an agent fails because a tool it needs is denied, **or** an agent has a tool it should not have.

**Prerequisites:**

- Working tree on a topic branch.
- You know which agent (e.g. `dev`, `qa`, `release-manager`) and which permission is involved.
- For loosening (removing a deny rule): a clear rationale ready for an ADR.

## Steps

1. Open the agent file at `.claude/agents/<name>.md` and read the `tools:` line in its frontmatter. The tools listed are the only ones it can call.
2. Read [`.claude/settings.json`](../../.claude/settings.json) for project-wide permission rules — `permissions.allow`, `permissions.deny`, and any hooks.
3. Decide scope. **Per-agent** change → edit the frontmatter `tools:` list. **Project-wide** → edit `.claude/settings.json`.
4. Make the edit. Keep tool lists minimal — add only what the failure traces to.
5. If you are loosening a deny rule, file an ADR with `/adr:new "<title>"`. Tightening (removing an allow rule) does not need an ADR.
6. Re-run the failing scenario; confirm the previously-blocked operation now succeeds (or, for tightening, that it now fails as intended).
7. Run `npm run verify` to confirm no other check broke.

## Verify

The previously-failing operation now succeeds in the agent's session, AND `npm run verify` is green.

## Related

- Reference — [`.claude/settings.json`](../../.claude/settings.json) — permission baseline.
- Reference — [`.claude/agents/`](../../.claude/agents/) — per-agent tool lists.
- Explanation — [`AGENTS.md`](../../AGENTS.md) — why tool restrictions are deliberate (Article VI — Agent Specialisation).
- How-to — [`add-adr.md`](./add-adr.md) — file the ADR when loosening.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
