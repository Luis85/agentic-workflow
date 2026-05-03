---
id: PRD-ADOPT-001
title: Repo Adoption Track
stage: requirements
feature: repo-adoption-track
status: draft
owner: pm
inputs:
  - IDEA-ADOPT-001
  - RESEARCH-ADOPT-001
created: 2026-05-03
updated: 2026-05-03
---

# PRD — Repo Adoption Track

## Summary

The Repo Adoption Track is an agent-orchestrated, four-phase opt-in conductor skill that clones a foreign git repository, installs the Specorator workflow scaffold, and opens a pull request on the foreign GitHub remote — all under explicit human gates at every phase boundary. It is built for developers, teams, and organisations that already own a live repository and want to adopt the Specorator method without rebuilding their project from scratch. Today that path is entirely manual: copy files, inspect conflicts, adapt CI, open a PR, and hope it passes review — with no quality gates, no traceability, and no standardised output. The Repo Adoption Track reduces that friction to a single command (`/adopt:start <url>`) backed by a gated Review → Parity → Enrich → Push pipeline that handles the mechanical installation and returns a reviewable, ready-to-merge PR. The track ships in the v1.1 release window, after ADR-0030 (amending the frozen v1.0 taxonomy in ADR-0026) is accepted in a predecessor PR.

## Goals

- G1. Deliver a one-shot adoption path from a foreign git URL (or local path) to a merged PR on the foreign GitHub remote, requiring no manual file copying by the adopter.
- G2. Enforce a four-phase gated pipeline — Review, Parity, Enrich, Push — where each phase completes successfully before the next begins and where the human must explicitly confirm each phase-boundary gate.
- G3. Ship configurable preset selection: one mandatory generic preset (language-agnostic scaffold) and one optional Node/TypeScript preset; Python-specific enrichment deferred to v1.2.
- G4. Make adoption idempotent: a re-run of `/adopt:start` on a previously adopted repository aborts with a clear message unless the `--refresh` flag is passed.
- G5. Satisfy Constitution Articles VI (agent escalates, does not invent), VII (human authorises the push), and IX (every action before the push is reversible; the PR is the only persistent change to the foreign repository).

## Non-goals

- NG1. Drift detection: monitoring an adopted repository for divergence from the template after the initial PR merges. Explicitly post-v1.1.
- NG2. Bi-directional sync: propagating changes from the adopted repository back to the template. Out of scope indefinitely.
- NG3. Fork-PR mode: forking the foreign repository instead of pushing to it directly. Not planned; the patch-file fallback covers write-access limitations.
- NG4. Multi-PR phase split: one PR per phase rather than a single adoption PR. Complexity exceeds benefit; deferred unless a concrete use case emerges.
- NG5. Monorepo sub-project adoption: adopting a sub-directory within a monorepo rather than the repository root. Out of scope for v1.1.
- NG6. Non-git VCS support (Mercurial, SVN, Perforce). Not planned.
- NG7. Non-GitHub remotes for `gh pr create` (GitLab, Bitbucket, self-hosted forges). The track uses `gh` exclusively in v1.1; the patch-file fallback is the exit for non-GitHub hosts.
- NG8. Custom user-defined preset manifests: allowing adopters to supply their own enrichment preset files at invocation time. The v1.1 preset set is template-defined only.
- NG9. Auto-extracting `inputs/` archives: consistent with `docs/inputs-ingestion.md`, the adoption track never auto-extracts archives; extraction is always a confirmed step.
- NG10. Python-specific enrichment (e.g., `Makefile`-based verify gate, `pyproject.toml` section, `pre-commit` config). Explicitly deferred to v1.2; must not be designed out by v1.1 choices.
- NG11. Replacing the Discovery, Stock-taking, or Project Scaffolding tracks. The adoption track is a peer, not a successor.
- NG12. Migrating spec content from a foreign repo's existing artifacts. Adopter-led work.

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Foreign-repo owner (primary adopter) | Install the Specorator scaffold into an existing repository with full visibility into every conflict, without rewriting history or losing existing work | Today the manual process is error-prone and has no quality gates; failed adoptions convert to abandonment |
| Downstream contributor of an adopted repository | Inherit consistent `AGENTS.md`, `CLAUDE.md`, `specs/`, `docs/`, and `templates/` conventions without having participated in the adoption step | Inconsistent scaffold installations produce workflow confusion across teams; standardised conventions reduce onboarding time |
| Template maintainer (custodian of presets) | Ship and evolve a preset manifest that future adopters receive without requiring code changes to Phase 3 logic | Preset extensibility determines whether v1.2 language presets (Python, Go) can be added without reworking the pipeline |

## Jobs to be done

- When I want to bring my existing repository under the Specorator workflow, I want to run a single command and be guided through each installation step with clear conflict reports, so I can adopt the scaffold without manually inspecting every file.
- When I review the adoption PR on my repository, I want to understand exactly which files were added, which were skipped due to conflicts, and why, so I can merge with confidence or make targeted adjustments.
- When the adoption pipeline encounters a conflict between my repository's existing files and the template scaffold, I want to be asked how to resolve it rather than have the agent decide silently, so I retain full control over what enters my repository.
- When I cannot push directly to the foreign remote, I want the adoption pipeline to produce a patch file and instructions I can use to open a PR from a fork, so I am not blocked by a permissions gap.

## Functional requirements (EARS)

### REQ-ADOPT-001 — Four-phase pipeline structure

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall execute exactly four sequential phases — Review, Parity, Enrich, and Push — in that order, and shall not advance to the next phase until the current phase has completed successfully and the human has confirmed the phase-boundary gate.
- **Acceptance:**
  - Given an adoption run is in progress
  - When any phase completes its primary artifact
  - Then the conductor presents the phase result and an `AskUserQuestion` gate (approve / request revision / abort) before starting the next phase
  - And the next phase does not begin until the gate returns an approve response
  - And no phase may be skipped or re-ordered
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome, constraints VII + IX), RESEARCH-ADOPT-001 (Q7, Alternative A)

---

### REQ-ADOPT-002 — Source acceptance: git URL or local path

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall accept a foreign repository source that is either a remote git URL or an absolute local path to an existing git repository, and shall derive an adoption slug deterministically from the source.
- **Acceptance:**
  - Given a valid git URL such as `https://github.com/owner/repo.git`
  - When the adopter invokes `/adopt:start <url>`
  - Then the conductor derives the slug as `<owner>-<repo>` (lowercase, kebab-case, owner and repo name components separated by a hyphen)
  - And given an absolute local path
  - When the adopter invokes `/adopt:start <path>`
  - Then the conductor derives the slug from the directory name (lowercase, kebab-case)
  - And slugs are bounded to a maximum of 32 characters to respect Windows MAX_PATH constraints
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints), RESEARCH-ADOPT-001 (§Technical considerations b, c)

---

### REQ-ADOPT-003 — Working tree location

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall clone the foreign repository into `adoptions/<slug>/repo/` within the template repository, and shall not clone the foreign repository into `.worktrees/` or the template repository root.
- **Acceptance:**
  - Given a successful clone of a foreign repository with slug `owner-repo`
  - When the adopter inspects the file system
  - Then the foreign repository's working tree exists at `adoptions/owner-repo/repo/`
  - And no foreign-repository files exist at `.worktrees/adopt-owner-repo/` or the template repository root
  - And a `.gitignore` file inside `adoptions/owner-repo/` contains the entry `repo/` so that the foreign working tree is never committed to the template repository
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints), RESEARCH-ADOPT-001 (§Technical considerations b, recommendation)

---

### REQ-ADOPT-004 — Adoption state persistence

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall write and maintain `adoptions/<slug>/adoption-state.md` throughout the pipeline, recording the current phase, phase status, upstream URL, preset, and clone SHA, so that a partially completed adoption can be resumed in a later session.
- **Acceptance:**
  - Given an adoption run that completes Phase 1 and is then interrupted
  - When the adopter re-invokes `/adopt:start` for the same slug
  - Then the conductor reads the existing `adoption-state.md`, identifies the last completed phase, and resumes from that phase without re-cloning
  - And `adoption-state.md` is committed to the template repository as an auditable record
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (Q7, §Technical considerations b)

---

### REQ-ADOPT-005 — Phase 1 (Review): repo signals collected

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall produce `adoptions/<slug>/review.md` that records, for the foreign repository: language census by file extension, detected build tools, CI system presence, existing documentation files, license file content and detected license type, existing agentic-workflow markers, repository size in file count, and any existing `.specorator-version` file content.
- **Acceptance:**
  - Given an adoption agent operating on a cloned foreign repository
  - When Phase 1 runs to completion
  - Then `review.md` contains at minimum: a language census table, a build-tool list, a CI-presence flag, a documentation inventory, a license identifier, an agentic-workflow-markers section, a file count, and a `.specorator-version` collision note if that file exists with unrecognised content
  - And `review.md` contains no judgment, recommendations, or proposed actions — only observed facts
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (§Phase contracts 5.1)

---

### REQ-ADOPT-006 — Phase 1 (Review): license warning

- **Pattern:** WHEN Phase 1 runs and the foreign repository's `LICENSE` file does not identify MIT, Apache 2.0, or BSD as the license, THEN the adoption agent shall emit a non-blocking warning in `review.md` explaining that the installed scaffold files carry an MIT-origin license and that the adopter is responsible for license compatibility under their repository's governance.
- **Pattern label:** Event-driven
- **Statement:** WHEN Phase 1 runs and the foreign repository's `LICENSE` file does not identify MIT, Apache 2.0, or BSD as the license, THEN the adoption agent shall include a non-blocking license-compatibility warning in `review.md`.
- **Acceptance:**
  - Given a foreign repository whose LICENSE file identifies GPL-3.0 (or any non-MIT/Apache/BSD license)
  - When Phase 1 completes
  - Then `review.md` contains a clearly labelled `## License Warning` section explaining the MIT-origin of installed files
  - And the adoption pipeline does not abort or gate on this warning alone
  - And the warning text is reproduced in the adoption PR description in Phase 4
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q5), RESEARCH-ADOPT-001 (Q5 recommendation, RISK-003)

---

### REQ-ADOPT-007 — Phase 2 (Parity): gap and conflict identification

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall produce `adoptions/<slug>/parity.md` that lists every file in the selected preset's manifest with one of three statuses: `present` (file already exists in the foreign repository with matching content), `missing` (file does not exist in the foreign repository), or `conflict` (file exists in the foreign repository with different content from the template version).
- **Acceptance:**
  - Given a foreign repository that contains an existing `AGENTS.md` different from the template version
  - When Phase 2 runs to completion
  - Then `parity.md` lists `AGENTS.md` with status `conflict`
  - And `parity.md` lists every other required path in the preset manifest with either `present` or `missing`
  - And each `conflict` entry records a `resolution` field initialised to `TBD`
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome, Q8), RESEARCH-ADOPT-001 (Q8 recommendation)

---

### REQ-ADOPT-008 — Phase 2 (Parity): conflict resolution is human-owned

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall not resolve any `conflict` status entry in `parity.md` automatically; every conflict entry shall remain at `resolution: TBD` until the human sets it to one of `accept-template-version`, `skip-this-file`, or `manual-merge-needed`.
- **Acceptance:**
  - Given `parity.md` contains one or more entries with `status: conflict`
  - When the Phase 2 gate is presented
  - Then every conflict entry shows `resolution: TBD`
  - And the gate prompt lists all conflict entries and requires the human to set a resolution for each before approving Phase 3
  - And any entry with `resolution: manual-merge-needed` blocks the Phase 4 push until the human clears it
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, Articles VI and VII), RESEARCH-ADOPT-001 (Q8 recommendation)

---

### REQ-ADOPT-009 — Phase 3 (Enrich): files generated per chosen preset

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall generate all files in the chosen preset's manifest that have `status: missing` in `parity.md` into the working tree at `adoptions/<slug>/repo/`, and shall produce `adoptions/<slug>/enrich-preview.md` listing every file generated with a one-line description of its purpose.
- **Acceptance:**
  - Given a `parity.md` containing five `missing` entries for the generic preset
  - When Phase 3 runs to completion
  - Then all five files exist under `adoptions/<slug>/repo/` at their manifest paths
  - And `enrich-preview.md` lists each generated file with a one-line purpose description
  - And no `conflict` entry with `resolution: skip-this-file`, `resolution: manual-merge-needed`, or `resolution: TBD` is overwritten in the working tree during Phase 3
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (Q3, §Phase contracts 5.3)

---

### REQ-ADOPT-010 — Phase 3 (Enrich): Node/TypeScript preset is opt-in

- **Pattern:** WHERE the Node/TypeScript optional preset is selected, the adoption agent shall generate `package.json`, `tsconfig.json`, and a starter `verify.yml` into the working tree, and shall not generate those files for the generic preset.
- **Pattern label:** Optional feature
- **Statement:** WHERE the Node/TypeScript optional preset is selected, the adoption agent shall generate Node/TypeScript-specific scaffold files (`package.json`, `tsconfig.json`, and a starter `verify.yml`) into the working tree.
- **Acceptance:**
  - Given an adopter selects the Node/TypeScript preset at the Phase 3 gate
  - When Phase 3 generates files
  - Then `package.json`, `tsconfig.json`, and a starter `verify.yml` are generated into `adoptions/<slug>/repo/`
  - And given an adopter selects the generic preset
  - When Phase 3 generates files
  - Then `package.json`, `tsconfig.json`, and `verify.yml` are not generated
- **Priority:** should
- **Satisfies:** IDEA-ADOPT-001 (Q2, Q3), RESEARCH-ADOPT-001 (Q2 recommendation, Q3 recommendation, CLAR-ADOPT-002, CLAR-ADOPT-003)

---

### REQ-ADOPT-011 — Phase 3 (Enrich): `verify.yml` is an explicit opt-in with human review

- **Pattern:** WHEN the adoption agent proposes installing a CI workflow file (`verify.yml`) into the foreign repository, THEN the conductor shall present the full file content to the human and require explicit approval before including it in the enrichment.
- **Pattern label:** Event-driven
- **Statement:** WHEN the adoption agent proposes installing `verify.yml` into a foreign repository that does not already have a CI workflow at that path, THEN the conductor shall present the full proposed file content to the human and require explicit approval before including the file in Phase 3 output.
- **Acceptance:**
  - Given the Node/TypeScript preset is selected and `verify.yml` does not exist in the foreign repository
  - When Phase 3 reaches the `verify.yml` generation step
  - Then the conductor displays the complete proposed `verify.yml` content in an `AskUserQuestion` prompt
  - And Phase 3 only includes `verify.yml` in the generated files if the human explicitly approves
  - And if the human declines, `verify.yml` is recorded in `enrich-preview.md` as `status: declined` and is not generated
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q2, constraints), RESEARCH-ADOPT-001 (Q2 recommendation, CLAR-ADOPT-002, RISK-004)

---

### REQ-ADOPT-012 — Phase 3 (Enrich): existing CI must not be overwritten

- **Pattern:** IF a CI workflow file already exists in the foreign repository at the path proposed by the enrichment preset, THEN the adoption agent shall record the file as `status: conflict` in `enrich-preview.md` and shall not write to that path.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF a CI workflow file already exists in the foreign repository at a path that the enrichment preset would install, THEN the adoption agent shall not overwrite that file and shall record the conflict in `enrich-preview.md`.
- **Acceptance:**
  - Given a foreign repository that already has `.github/workflows/ci.yml`
  - When Phase 3 runs and the selected preset would install a file at `.github/workflows/ci.yml`
  - Then the existing file is not modified
  - And `enrich-preview.md` records the path with `status: conflict, resolution: skipped` and a note identifying the existing file
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q2), RESEARCH-ADOPT-001 (Q2 recommendation, RISK-004)

---

### REQ-ADOPT-013 — Phase 4 (Push): idempotency marker installed in commit

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall write a `.specorator-version` file at the root of the foreign repository as part of the Phase 4 commit, recording the template's git commit SHA and the date of adoption, so that subsequent re-runs of the adoption pipeline can detect a previously completed adoption.
- **Acceptance:**
  - Given Phase 4 commits enriched files into the adoption branch
  - When the commit is assembled
  - Then `.specorator-version` is included in the same commit, containing at minimum the template git commit SHA and the ISO date of adoption
  - And `.specorator-version` is the first file checked by the idempotency guard on re-run
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q4), RESEARCH-ADOPT-001 (Q4 recommendation, §Technical considerations d)

> **PM rationale for idempotency marker choice:** `.specorator-version` is chosen over `.specorator/adoption.json` because it is visible to the foreign repository's CI and maintainers without navigating a subdirectory, and because a flat file at the repo root is a well-understood convention (cf. `.editorconfig`, `.nvmrc`). The architect must validate that the name does not collide with foreign-repo conventions; if a collision rate proves problematic, namespacing to `.specorator/adoption.json` is the architect's fallback (see CLAR-ADOPT-004).

---

### REQ-ADOPT-014 — Idempotency: re-run aborts unless `--refresh` is passed

- **Pattern:** IF the `.specorator-version` file exists in the foreign repository's working tree when the adoption conductor starts Phase 2, THEN the conductor shall abort with a clear error message unless the `--refresh` flag was passed at `/adopt:start`.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the `.specorator-version` file exists in the foreign repository at the start of Phase 2, THEN the adoption conductor shall abort with an error message identifying the prior adoption version and date and instructing the adopter to rerun with `--refresh`, unless `--refresh` was passed.
- **Acceptance:**
  - Given a foreign repository that already has a valid `.specorator-version` file
  - When the adopter runs `/adopt:start <url>` without `--refresh`
  - Then the conductor aborts before any Phase 2 operations with a message stating the prior adoption date and version and instructing use of `--refresh`
  - And given the adopter reruns with `--refresh`
  - Then the conductor proceeds through all four phases, overwriting the prior adoption
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (Q4, §Technical considerations d)

---

### REQ-ADOPT-015 — Phase 4 (Push): branch, commit, push, open PR via `gh`

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall create an adoption branch in the foreign repository's working tree, stage all generated and marker files, commit them, push to the foreign remote, and open a pull request via `gh pr create`, writing the PR URL to `adoptions/<slug>/push-record.md`.
- **Acceptance:**
  - Given Phase 3 is approved and the adoption branch does not already exist on the foreign remote
  - When Phase 4 runs to completion
  - Then a branch named `adopt/specorator` exists on the foreign remote
  - And the branch contains exactly the enriched files from Phase 3 plus the `.specorator-version` marker in a single commit
  - And a pull request is open on the foreign repository's default branch
  - And `push-record.md` records the branch name, commit SHA, PR URL, and push timestamp
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (§Phase contracts 5.4, Q9)

---

### REQ-ADOPT-016 — Phase 4 (Push): gate before irreversible push

- **Pattern:** WHEN Phase 3 completes and the adoption conductor is ready to push, THEN the conductor shall present the full draft PR body to the human and require explicit approval before executing any `git push` or `gh pr create` command.
- **Pattern label:** Event-driven
- **Statement:** WHEN Phase 3 is approved and Phase 4 is ready to push, THEN the adoption conductor shall present the draft PR body and branch name to the human and require explicit confirmation before executing any push or PR-creation command.
- **Acceptance:**
  - Given Phase 3 has been approved and the conductor has assembled the draft PR body
  - When the Phase 4 gate is presented
  - Then the conductor displays the complete PR title, branch name, and PR body text
  - And the push proceeds only after the human explicitly confirms
  - And if the human requests revision, the conductor allows editing the PR body before re-presenting the gate
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, Article VII), RESEARCH-ADOPT-001 (Q7, §7.1 Constitution compliance)

---

### REQ-ADOPT-017 — Phase 4 (Push): patch-file fallback when push is denied

- **Pattern:** IF `git push` to the foreign remote fails with a permission-denied error, THEN the adoption conductor shall generate a patch file at `adoptions/<slug>/specorator-adoption.patch` and provide the adopter with written instructions for creating a fork-based PR.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF `git push` to the foreign remote returns a permission-denied error, THEN the adoption conductor shall produce a patch file and written instructions, record both paths in `push-record.md`, and shall not attempt any further automated push operations.
- **Acceptance:**
  - Given the adopter lacks push access to the foreign remote
  - When Phase 4 attempts `git push`
  - Then the push fails and the conductor generates the deterministic file `adoptions/<slug>/specorator-adoption.patch` from `git format-patch <base>..adopt/specorator --stdout`
  - And `push-record.md` records `push_mode: patch-fallback`, the patch file path, and written fork-PR instructions
  - And the conductor does not retry the push automatically
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, Article IX), RESEARCH-ADOPT-001 (Q9, §Phase contracts 5.4)

---

### REQ-ADOPT-018 — Non-GitHub remote: loud error with patch fallback suggestion

- **Pattern:** IF the foreign repository's remote URL does not have `github.com` as its host, THEN the adoption conductor shall emit a clear error message identifying the detected host and instructing the adopter to use the patch-file fallback path, and shall not attempt to execute `gh pr create`.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the foreign repository's remote URL is not a `github.com` URL, THEN the adoption conductor shall abort Phase 4 push operations with a clear error message and suggest the patch-file fallback path.
- **Acceptance:**
  - Given a foreign repository whose remote URL has host `gitlab.com` or `bitbucket.org` or any non-`github.com` host
  - When Phase 4 reaches the push and PR-creation step
  - Then the conductor aborts without executing `git push` or `gh pr create`
  - And the error message identifies the detected host by name, states that the Repo Adoption Track v1.1 supports GitHub only, and directs the adopter to `docs/manual-adoption.md` for the patch-file path
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q9, out of scope NG7), RESEARCH-ADOPT-001 (Q9 recommendation, RISK-001)

---

### REQ-ADOPT-019 — Push to template remote is blocked

- **Pattern:** IF the foreign remote URL resolved by the adoption conductor matches the template repository's own remote URL, THEN the conductor shall abort Phase 4 with a clear error message and shall not execute any push operation.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the adoption conductor detects that the foreign remote URL matches the template repository's own `origin` remote URL, THEN the conductor shall abort Phase 4 with an error before executing any push.
- **Acceptance:**
  - Given a conductor that has loaded the template repository's own remote URL at startup
  - When Phase 4 assembles the push command
  - Then the conductor compares the target remote URL to the template repo's `origin` URL
  - And if they match, the conductor aborts with an error message: "Phase 4 aborted: the adoption target is the template repository itself. Check the URL passed to /adopt:start."
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (RISK-001)

---

### REQ-ADOPT-020 — Auditability: phase artifacts committed to template repository

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall commit `review.md`, `parity.md`, `enrich-preview.md`, `push-record.md`, and `adoption-state.md` to the template repository under `adoptions/<slug>/`, so that every adoption run has an auditable record in the template repository's git history.
- **Acceptance:**
  - Given a completed adoption run
  - When the adopter inspects the template repository's git log
  - Then `adoptions/<slug>/review.md`, `parity.md`, `enrich-preview.md`, `push-record.md`, and `adoption-state.md` are committed
  - And the foreign repository's working tree at `adoptions/<slug>/repo/` is not committed (gitignored)
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (desired outcome), RESEARCH-ADOPT-001 (§4.5, constitution Article V)

---

### REQ-ADOPT-021 — Agent tool surface: read-only git only

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall have access only to the tool set Read, Write, Edit, Glob, Grep, and a restricted Bash allowlist (`git status`, `git log`, `git ls-files`, `git diff` only), and shall not have access to Bash commands that write to git history, delete files, or push to any remote.
- **Acceptance:**
  - Given the adoption agent definition file
  - When a reviewer inspects the agent's tool configuration
  - Then the agent's Bash allowlist contains only read-only git commands and no write-side git verbs (`git push`, `git commit`, `git add`, `git rm`, `git checkout -b`)
  - And the agent's tool list does not include unrestricted Bash access
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, Article VI), RESEARCH-ADOPT-001 (Q6 recommendation, §3.1)

---

### REQ-ADOPT-022 — Agent write access scoped to adoption directory

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall write files only within `adoptions/<slug>/` (state and artifact files) and `adoptions/<slug>/repo/` (foreign repository working tree), and shall not write to any path in the template repository outside `adoptions/<slug>/`.
- **Acceptance:**
  - Given the adoption agent operating during Phases 1 through 3
  - When the agent writes any file
  - Then every write operation targets a path under `adoptions/<slug>/` or `adoptions/<slug>/repo/`
  - And no file is written to `specs/`, `docs/`, `templates/`, `.claude/`, `memory/`, or the template repository root during an adoption run
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, Articles VI and IX), RESEARCH-ADOPT-001 (Q6 recommendation)

---

### REQ-ADOPT-023 — Pre-flight: target-scoped `gh auth status` checked before Phase 1

- **Pattern:** WHEN the adoption conductor starts and the foreign source is a GitHub URL, THEN the conductor shall run `gh auth status --hostname github.com --active` and abort with a clear authentication error message if the check fails.
- **Pattern label:** Event-driven
- **Statement:** WHEN the adoption conductor starts with a GitHub remote URL as the source, THEN the conductor shall verify that `gh` is authenticated for `github.com` before cloning, and shall abort with a clear message if authentication is not established for that host.
- **Acceptance:**
  - Given an adopter who has not run `gh auth login`
  - When the adopter invokes `/adopt:start <github-url>`
  - Then the conductor runs `gh auth status --hostname github.com --active`
  - And if authentication is not established, the conductor aborts before cloning and outputs the message: "GitHub CLI authentication not found. Run `gh auth login` and retry."
  - And authentication failures for unrelated configured `gh` hosts do not block a `github.com` adoption run
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (A2 user assumption, Q9)

---

### REQ-ADOPT-024 — Slug collision handling

- **Pattern:** IF an `adoptions/<slug>/` directory already exists when a new adoption run is started, THEN the adoption conductor shall prompt the human to choose between appending a numeric suffix to the slug, resuming the existing adoption, or aborting.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the derived adoption slug collides with an existing `adoptions/<slug>/` directory, THEN the adoption conductor shall present the human with three options before proceeding: append a numeric suffix (`-2`, `-3`, etc.), resume the existing adoption, or abort.
- **Acceptance:**
  - Given an `adoptions/owner-repo/` directory already exists
  - When a new adoption run derives the slug `owner-repo`
  - Then the conductor pauses and presents the three options described above
  - And the conductor does not overwrite the existing adoption directory without human confirmation
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (§4.4, §7 error handling — slug collision)

---

### REQ-ADOPT-025 — Large repository warning before clone

- **Pattern:** IF the foreign repository's reported size exceeds 500 MB or 10,000 files, THEN the adoption conductor shall warn the adopter and require explicit confirmation before proceeding with the clone.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the foreign repository's reported size exceeds 500 MB or 10,000 files (checked via the GitHub API or git remote info before full clone), THEN the adoption conductor shall warn the adopter and require explicit confirmation before cloning.
- **Acceptance:**
  - Given a foreign repository whose reported size is 600 MB
  - When the conductor checks repository size before cloning
  - Then the conductor displays a warning stating the detected size and a recommendation to verify the correct repository was specified
  - And the clone proceeds only after the human explicitly confirms
- **Priority:** should
- **Satisfies:** RESEARCH-ADOPT-001 (§7 error handling — clone size)

---

### REQ-ADOPT-026 — Enrich rollback on parity-validation failure

- **Pattern:** IF the post-generation parity validation script exits non-zero after Phase 3 file generation, THEN the adoption conductor shall roll back all files written during Phase 3 in the working tree and return the conductor to the Phase 3 gate.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the post-generation parity validation script exits non-zero after Phase 3 generates files, THEN the adoption conductor shall remove all Phase-3-generated files from the working tree, record the failure diagnostics in `enrich-preview.md`, and re-present the Phase 3 gate without committing any partial output.
- **Acceptance:**
  - Given Phase 3 generates files but the parity validation script reports a broken markdown link
  - When the validation script exits non-zero
  - Then all Phase-3-generated files are removed from `adoptions/<slug>/repo/`
  - And `enrich-preview.md` records the specific validation failure with file path and error
  - And the Phase 3 gate is re-presented so the adopter may retry or abort
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (§7 error handling — enrich failure, §6.2)

---

### REQ-ADOPT-027 — Orphan prevention on mid-phase abort

- **Pattern:** IF the adoption conductor is aborted mid-phase by the user, THEN the conductor shall leave the adoption state at the last successfully completed phase, with `phase_status: gate_blocked`, and shall not leave partial phase artifacts without a corresponding state record.
- **Pattern label:** Unwanted behaviour
- **Statement:** IF the adoption pipeline is aborted by the user during an active phase, THEN the conductor shall record the abort in `adoption-state.md`, set `phase_status: gate_blocked` at the last completed phase, and shall not leave the adoption directory in an unrecoverable state.
- **Acceptance:**
  - Given an adoption run in Phase 2
  - When the user aborts the session
  - Then `adoption-state.md` reflects `phase: parity, phase_status: gate_blocked`
  - And the previously committed Phase 1 artifact (`review.md`) remains intact
  - And the adoption directory contains no partial artifact from the aborted phase without a state record
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (§7 error handling — user abort)

---

### REQ-ADOPT-028 — PR description includes license notice

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall include a standard license-notice block in every adoption PR description stating that the installed files carry an MIT-origin provenance from the Specorator template and that the adopter is responsible for license compatibility.
- **Acceptance:**
  - Given Phase 4 assembles the PR description
  - When the conductor generates the PR body
  - Then the PR body contains a `## License Notice` section with the standard text: "Files installed by this PR were generated from the Specorator workflow template (https://github.com/Luis85/agentic-workflow), which is available under the MIT License. These files retain their MIT provenance. See the installed files for individual attribution."
  - And if a license warning was emitted in Phase 1, the same warning text is reproduced in the PR body
- **Priority:** must
- **Satisfies:** RESEARCH-ADOPT-001 (Q5 recommendation, §Technical considerations e, RISK-003)

---

### REQ-ADOPT-029 — Intake gate: `inputs/` consulted at conductor start

- **Pattern:** Ubiquitous
- **Statement:** The adoption conductor shall consult `inputs/` at the start of every adoption run and ask the adopter which items (if any) are relevant to the adoption, consistent with the cross-track `inputs/` ingestion contract.
- **Acceptance:**
  - Given the adoption conductor starts
  - When it reaches the intake gate
  - Then the conductor lists any files present in `inputs/` (excluding `README.md`) and asks the adopter which are relevant
  - And if `inputs/` contains only `README.md` or is empty, the conductor prints "inputs/ is empty — no source material to consult" and proceeds
  - And the conductor never auto-extracts any archive from `inputs/`
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints), RESEARCH-ADOPT-001 (§Inputs intake gate), AGENTS.md (inputs ingestion rule)

---

### REQ-ADOPT-030 — Preset manifest supports future language presets without logic changes

- **Pattern:** Ubiquitous
- **Statement:** The preset manifest structure shall be designed so that a new language-specific preset (such as a Python preset for v1.2) can be added by creating a new manifest entry and renderer without modifying Phase 3 pipeline logic.
- **Acceptance:**
  - Given the v1.1 implementation of Phase 3
  - When a reviewer inspects the preset manifest structure
  - Then the generic and Node/TypeScript presets are defined as named entries in a shared manifest structure that is loaded by Phase 3 at runtime
  - And Phase 3 does not contain hard-coded preset names in its core pipeline logic
  - And the manifest structure can accommodate a new language entry without requiring changes to Phase 3 logic
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (Q3), RESEARCH-ADOPT-001 (Q3 recommendation, CLAR-ADOPT-003)

---

### REQ-ADOPT-031 — ADR-0030 referenced before implementation begins

- **Pattern:** Ubiquitous
- **Statement:** The implementation PR for the Repo Adoption Track shall reference an accepted ADR-0030 (or next available ADR number) that supersedes ADR-0026 and adds the Repo Adoption Track as a v1.1 opt-in companion track.
- **Acceptance:**
  - Given the implementation PR for the Repo Adoption Track is opened
  - When a reviewer inspects the PR description
  - Then it references an accepted ADR number that supersedes ADR-0026
  - And that ADR has been merged in a predecessor PR before the implementation PR opens
- **Priority:** must
- **Satisfies:** IDEA-ADOPT-001 (constraints, ADR-0026), RESEARCH-ADOPT-001 (Q1 recommendation, CLAR-ADOPT-001)

---

### REQ-ADOPT-032 — Phase 3 (Enrich): overwrite files with `accept-template-version` resolution

- **Pattern:** Ubiquitous
- **Statement:** The adoption agent shall overwrite each file in the working tree at `adoptions/<slug>/repo/` whose corresponding `parity.md` entry carries `resolution: accept-template-version` with the canonical template version of that file, and shall list each such overwrite in `adoptions/<slug>/enrich-preview.md` with a notation of `overwrite (accept-template-version)`.
- **Acceptance:**
  - Given `parity.md` contains a `conflict` entry for `.claude/settings.json` with `resolution: accept-template-version`
  - When Phase 3 runs to completion
  - Then the file at `adoptions/<slug>/repo/.claude/settings.json` matches the template canonical version byte-for-byte
  - And `enrich-preview.md` lists `.claude/settings.json` with the notation `overwrite (accept-template-version)`
  - And given a separate conflict entry has `resolution: skip-this-file`
  - Then that file is not modified in the working tree
- **Priority:** must
- **Satisfies:** CLAR-ADOPT-018 (Option A resolution), REQ-ADOPT-009 (Phase 3 write scope extended)

---

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-ADOPT-001 | performance | Clone time for the foreign repository shall not block the adoption pipeline on normally-sized repositories | Clone completes within 120 seconds for repositories under 500 MB on a broadband connection; conductor warns (REQ-ADOPT-025) but does not auto-abort for larger repos |
| NFR-ADOPT-002 | performance | Phase 1 through Phase 3 artifact generation shall complete within 60 seconds for a repository with fewer than 10,000 files, excluding clone time | Phase run time measured from phase start to artifact write completion; no LLM round-trip is included in this target |
| NFR-ADOPT-003 | reliability | A failed network connection during Phase 4 push shall not corrupt the adoption state | On network failure mid-push, `adoption-state.md` retains the last known good phase; the adopter can re-enter Phase 4 by re-running `/adopt:start` with no data loss in the template repository |
| NFR-ADOPT-004 | reliability | The adoption pipeline shall be resumable after a session interruption at any phase boundary | Re-running `/adopt:start` for an in-progress adoption resumes from the last completed phase without re-cloning, consistent with REQ-ADOPT-004 |
| NFR-ADOPT-005 | security | No credentials or authentication tokens shall be recorded in any adoption artifact | `adoption-state.md`, `review.md`, `parity.md`, `enrich-preview.md`, `push-record.md`, and `adoption-manifest.json` shall not contain GitHub tokens, SSH keys, or any authentication material |
| NFR-ADOPT-006 | security | The adoption agent shall not read or write paths outside `adoptions/<slug>/` and `adoptions/<slug>/repo/` in the template repository file system | Verified by agent tool-list inspection (REQ-ADOPT-021, REQ-ADOPT-022); no unrestricted Bash access |
| NFR-ADOPT-007 | portability | All path construction in adoption TypeScript scripts shall use `path.join()` (or equivalent cross-platform API) and shall not use raw string concatenation with `/` or `\` | Zero raw-string path concatenations in adoption scripts; verified by code review or lint rule |
| NFR-ADOPT-008 | portability | The adoption slug shall be bounded to a maximum of 32 characters to ensure total path depth does not exceed Windows MAX_PATH (260 characters) for typical template repository paths | Slug truncation or error emitted if derived slug exceeds 32 characters; consistent with REQ-ADOPT-002 |
| NFR-ADOPT-009 | usability | Each phase gate shall present a summary of the phase result that is self-contained and readable without consulting prior phase artifacts | Phase gate summary is a single Markdown block containing: phase name, key findings count, any warnings, and the required human action |
| NFR-ADOPT-010 | usability | Each phase artifact (`review.md`, `parity.md`, `enrich-preview.md`, `push-record.md`) shall be a standalone readable document without requiring access to other artifacts for comprehension | Verified by reading each artifact in isolation during Stage 8 testing |
| NFR-ADOPT-011 | traceability | Every functional requirement (REQ-ADOPT-NNN) shall have at least one corresponding test (TEST-ADOPT-NNN) in Stage 8 | Traceability matrix in `specs/repo-adoption-track/traceability.md` links each REQ to at least one TEST by Stage 9 review |
| NFR-ADOPT-012 | traceability | Commit messages for the adoption track implementation shall reference task IDs (`T-ADOPT-NNN`) and, where applicable, requirement IDs | Verified by reviewer in Stage 9; commit messages without ID references are a Stage 9 finding |
| NFR-ADOPT-013 | operability | No adoption artifact files shall remain in an inconsistent state if the adoption pipeline aborts mid-phase | Consistent with REQ-ADOPT-027; verified by integration test using fixture repos with simulated mid-phase abort |
| NFR-ADOPT-014 | operability | The adoption track shall not add any adoption-related scripts to the `npm run verify` gate; adoption scripts run only within `/adopt:*` commands | Zero adoption-script entries in `package.json` `verify` script; consistent with prior-art design §6.4 |

## Success metrics

- **North star:** Percentage of adoption pipeline runs that complete end-to-end (clone through merged PR) without requiring manual intervention outside the defined phase gates. Target: ≥ 80% of runs on typical GitHub repositories complete without the adopter needing to make changes outside the gate prompts.
- **Supporting — adoption speed:** Time from `/adopt:start` invocation to a mergeable PR on the foreign repository (excluding human gate response time). Target: under 10 minutes for a repository under 500 MB.
- **Supporting — adopter confidence:** Adopter NPS or satisfaction signal collected post-adoption (in-PR comment or follow-up survey). Target: positive sentiment on the conflict-visibility and phase-gate clarity dimensions.
- **Supporting — language breadth:** Number of distinct primary languages (by Phase 1 census) successfully adopted in the first 90 days after release. Target: at least three distinct language profiles (TypeScript, Python, and generic/other).
- **Counter-metric — wrong adoption PRs:** Number of adoption PRs opened on the foreign repository that are subsequently closed without merging, attributed to incorrect or unwanted scaffold content. A high rate indicates the Phase 3 enrichment or conflict handling is producing incorrect output. Target: fewer than 20% of adoption PRs closed without merging.
- **Counter-metric — Phase 1 abandonment:** Number of adoption pipeline runs that are aborted at the Phase 1 review gate (immediately after reviewing the conflict/signal report). A high rate indicates the Phase 1 report surface is confusing or the conflict count is too high to be actionable. Target: fewer than 25% of pipeline runs aborted at Phase 1.

## Release criteria

- [ ] All `must` requirements (REQ-ADOPT-001 through REQ-ADOPT-029, REQ-ADOPT-030, REQ-ADOPT-031, REQ-ADOPT-032, excluding REQ-ADOPT-010 and REQ-ADOPT-025 which are `should`) pass their acceptance tests.
- [ ] All `should` requirements (REQ-ADOPT-010, REQ-ADOPT-025) are either accepted or explicitly deferred with a rationale recorded in the design document or ADR.
- [ ] All NFRs are met or explicitly waived with a recorded rationale (ADR or design document).
- [ ] ADR-0030 (or next available slot) is filed, reviewed, and merged in a predecessor PR before the implementation PR opens.
- [ ] End-to-end manual test passed against a real GitHub repository the adopter owns with write access, following the test plan at §8.6 of the prior-art design spec: (1) adopt a small public repo; (2) verify PR file set; (3) merge PR; (4) if Node/TypeScript preset: run `npm install && npm run verify` in the adopted repo; for generic/other presets: confirm the appropriate preset validation passes; (5) run `/spec:start example-feature` in the adopted repo; (6) re-run `/adopt:start <same-url>` and confirm idempotency blocks; (7) re-run with `--refresh` and confirm a new PR is opened.
- [ ] `npm run verify` is green on the implementation PR(s).
- [ ] `docs/repo-adoption-track.md` methodology document shipped in the same PR as the implementation.
- [ ] `adoptions/README.md` folder entry-point shipped.
- [ ] `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, and `.claude/skills/README.md` updated to reference the Repo Adoption Track as a first-party opt-in companion track.
- [ ] No critical (S1/S2) bugs open against the adoption track at time of release.

## Open questions / clarifications

The following items were carried forward from the research's "what still needs validating" list and from new PM-level observations during requirements writing. Items that require design decisions are escalated to CLAR-ADOPT-NNN entries for `/spec:clarify` or architect resolution.

**CLAR-ADOPT-004 — Idempotency marker naming (owner: architect)**
The PM has chosen `.specorator-version` as the idempotency marker (see rationale in REQ-ADOPT-013). The architect must validate this name against the risk of collision with foreign-repo conventions (RISK-002). If collision rate in Phase 1 review data proves problematic post-launch, the fallback is `.specorator/adoption.json`. This decision must be made before Stage 5 (Specification) so that the marker format can be specified. Does not block Stage 4 (Design).

**CLAR-ADOPT-005 — Agent definition enforcement mechanism (owner: architect)**
The agent tool-list restriction in REQ-ADOPT-021 specifies the desired tool surface. The architect must specify the enforcement mechanism: agent definition file frontmatter, `.claude/settings.json` deny rules, or both. This is potentially ADR-class if it requires broadening or narrowing the enforcement model beyond what `.claude/settings.json` currently provides (research §Q6). Blocks Stage 5 (Specification).

**CLAR-ADOPT-006 — Preset manifest format (owner: architect)**
REQ-ADOPT-030 requires a manifest structure that supports adding language presets in v1.2 without changing Phase 3 logic. The architect must specify the manifest schema (file format, location, how renderers are referenced, how presets are versioned). Blocks Stage 5 (Specification).

**CLAR-ADOPT-007 — Windows MAX_PATH validation (owner: architect/dev)**
NFR-ADOPT-008 sets a 32-character slug limit. The architect or dev must validate the total path depth formula `len(template-repo-root) + len("adoptions/") + len(slug) + len("/repo/") + len(deepest-expected-file-path)` against the 260-character Windows MAX_PATH with the actual template repository path on the developer's machine. If 32 characters is too long or short, adjust REQ-ADOPT-002 and NFR-ADOPT-008 in Stage 5. Does not block Stage 4.

**CLAR-ADOPT-008 — Patch-file fallback specification (owner: pm/architect)**
REQ-ADOPT-017 specifies the patch-file fallback behaviour at the requirement level. The architect must specify the exact patch format (`git format-patch` options), where instructions are written, and what the instructions contain. The PM must confirm whether `docs/manual-adoption.md` (referenced in REQ-ADOPT-018 error message) is in scope for v1.1 or whether the error message should reference a different resource. Blocks Stage 5 (Specification).

**CLAR-ADOPT-009 — Adoption branch name (owner: architect)**
REQ-ADOPT-015 uses `adopt/specorator` as the branch name. The architect must confirm this name does not conflict with any existing branch-naming convention in typical foreign repositories, and must define behaviour when the branch already exists on the foreign remote (append suffix, overwrite, or abort). Blocks Stage 5 (Specification).

**CLAR-ADOPT-010 — PR body template location and format (owner: architect)**
REQ-ADOPT-028 specifies the license notice block in the PR description. The architect must specify where the full PR body template lives (likely `templates/adoption-pr-body.md` per prior-art design §10.6), what fields it contains, and how Phase 1 license warnings are interpolated into it. Does not block Stage 4.

**CLAR-ADOPT-011 — ADR-0030 slot confirmation (owner: pm/human maintainer)**
Research (RISK-005) notes that ADR slots 0028 and 0029 may be pre-claimed by parallel work. The PM must verify the next available ADR slot before filing. REQ-ADOPT-031 references "ADR-0030 or next available slot" — this must be resolved to a specific ADR number before the predecessor PR is opened. Blocks the predecessor ADR PR. Does not block Stage 4.

## Out of scope

Explicitly will not be built in this cycle:

- Drift detection after adoption PR merges (NG1).
- Bi-directional sync from adopted repo back to template (NG2).
- Fork-PR mode (NG3); patch-file fallback (REQ-ADOPT-017) covers write-access limitations.
- Multi-PR phase split (NG4).
- Monorepo sub-project adoption (NG5).
- Non-git VCS support (NG6).
- Non-GitHub remotes for PR creation (NG7); patch-file fallback is the exit.
- Custom user-defined preset manifests at invocation time (NG8).
- Auto-extracting `inputs/` archives (NG9).
- Python-specific enrichment preset (NG10); v1.2 only.
- Migration of existing spec artifacts from the foreign repository (NG12).
- CLI distribution (`npx specorator-adopt`) — a different distribution channel that may coexist in future but is not v1.1 scope.
- Adoption refresh before a prior adoption PR merges — undefined behaviour; documented as "wait for merge first."
- `npm run verify` integration for adoption scripts — adoption scripts run only within `/adopt:*` commands (NFR-ADOPT-014).

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has a stable ID.
- [x] Acceptance criteria testable (concrete, no vague verbs — all use return / exist / contain / abort / emit / record).
- [x] NFRs listed with targets.
- [x] Success metrics defined (including counter-metrics).
- [x] Release criteria stated.
- [ ] `/spec:clarify` returned no open questions — **8 open clarifications remain (CLAR-ADOPT-004 through CLAR-ADOPT-011); run `/spec:clarify` before Stage 4 design begins. CLAR-ADOPT-005 and CLAR-ADOPT-006 block Stage 5 (Specification); CLAR-ADOPT-008, CLAR-ADOPT-009, CLAR-ADOPT-011 block their respective predecessor steps. None block Stage 4 (Design) outright, but the architect should be aware of all eight before producing the design document.**
