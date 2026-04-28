# PR delivery workflow

This repo treats Codex as an autonomous topic-branch contributor. When a human asks Codex to make a non-trivial repo change, Codex should complete the full PR loop unless the human explicitly asks for local-only work.

## Default delivery loop

1. Read the required project context from `AGENTS.md` and `.codex/instructions.md`.
2. Check the main checkout is clean enough to start and identify the integration branch (`main` for Shape A, `develop` for Shape B).
3. Create a fresh worktree under `.worktrees/<slug>/` from the integration branch:

   ```bash
   git fetch origin
   git worktree add .worktrees/<slug> -b <prefix>/<slug> origin/<integration-branch>
   ```

4. Work only inside that worktree.
5. Keep the change to one concern and update the corresponding docs, state files, or issue records in the same branch.
6. Run the relevant verification gate before pushing. In this template, use `npm run verify`. If a downstream project has no single `verify` command for the change type, run targeted checks and say exactly what passed.
7. Commit with an imperative message that references relevant IDs or issue paths.
8. Push the topic branch to `origin`.
9. Open a pull request against the integration branch.
10. Re-check PR mergeability or CI status when available.
11. Final response must include the PR URL, branch, commit, verification result, and any remaining risk.
12. Ask the human what they want next: review, merge, follow-up changes, or cleanup after merge.

## When Codex should pause

Pause and ask before continuing when:

- The change would require direct push to `main` or `develop`.
- Verification fails and the fix is unclear or out of scope.
- The work requires an irreversible action: deploy, delete, force-push, publish externally, or merge without the repository's autonomous-merge criteria.
- The requested change conflicts with the constitution, active spec state, or branch-per-concern rule.

## PR body checklist

Every Codex-opened PR should include:

- Summary of the user-visible changes.
- Verification commands or checks run.
- Linked requirement, task, ADR, issue, or local issue file when one exists.
- Known limitations or skipped checks.

Codex should not stop at "pushed a branch" when GitHub access is available. The expected endpoint is an open PR and an explicit next-step prompt for the human.
