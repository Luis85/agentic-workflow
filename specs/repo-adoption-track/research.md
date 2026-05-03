---
id: RESEARCH-ADOPT-001
title: Repo Adoption Track — Research
stage: research
feature: repo-adoption-track
status: draft
owner: analyst
inputs:
  - IDEA-ADOPT-001
created: 2026-05-03
updated: 2026-05-03
---

# Research — Repo Adoption Track

## Inputs intake gate

`inputs/` was inspected at intake. Only `inputs/README.md` is present — no source material relevant to this feature. Proceeding without external work packages.

The upstream design document referenced in `idea.md` (`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`) does not exist at that path on the current branch. It was listed as a research input; given its absence, its contents were reconstructed from the tracking issue (#257) and the process-bug issue (#258). Conclusions derived from those sources are labelled accordingly.

---

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | ADR sequencing: predecessor PR or bundled with implementation? | answered |
| Q2 | CI port-over scope: does Phase 3 enrichment install `verify.yml`? | answered |
| Q3 | Language-specific renderer breadth: one generic preset vs. Node/Python specialised presets for v1.1? | answered |
| Q4 | Template-version pin strategy: how to record which template version was installed? | answered |
| Q5 | License of generated content: agent warn-and-gate vs. adopter responsibility? | answered |
| Q6 | Agent tool-list enforcement: is `.claude/settings.json` sufficient for a worktree-scoped agent? | answered |
| Q7 | Phase-gate interface: `AskUserQuestion` callbacks or stateful confirmation protocol? | answered |
| Q8 | Conflict resolution ownership in Phase 1: agent-driven, human-interactive, or merge-strategy file? | answered |
| Q9 | Non-GitHub remotes: loud error or partial path with instructions? | answered |
| Q10 | Relation to Project Scaffolding Track: independent tracks or shared methodology? | answered |

---

## Answers to research questions

### Q1 — ADR sequencing (CLAR-ADOPT-001)

**Finding:** All four sister-track ADRs (0007, 0011, 0019, 0022) were bundled with their implementation PR rather than filed in a separate predecessor PR. The single exception to the "implementation in one PR" rule was the issue-breakdown track, where PR #182 shipped only the design spec and implementation plan (no ADR, no code) and PR #184 shipped the conductor, agent, and ADR-0022 together. That two-PR pattern was motivated by a desire to get design sign-off before building, not by ADR-first sequencing.

Specific evidence:
- ADR-0007 (Stock-taking): bundled with implementation in PR #16. The ADR was initially numbered 0006 and renumbered to 0007 in the same PR due to a collision.
- ADR-0011 (Project Scaffolding): bundled with implementation in PR #40.
- ADR-0019 (Design Track): bundled with implementation in PR #167.
- ADR-0022 (Issue Breakdown): bundled with implementation (conductor + agent) in PR #184; the spec+plan arrived first in PR #182 but without an ADR.

**Recommendation for Q1:** There is no precedent for filing an ADR in a standalone predecessor PR before implementation begins. However, ADR-0030 supersedes ADR-0026 (which froze the track taxonomy), which means it is a governance-class ADR that must be accepted before the track ships as a first-party workflow, not merely before code is written. The safest sequencing is: file ADR-0030 in a dedicated PR that is reviewed and merged before the implementation PR opens. This is more conservative than any prior precedent but is warranted because ADR-0026 was itself a freeze decision that explicitly required a superseding ADR for new tracks. A rejected ADR-0030 would make the entire implementation inadmissible; filing it early surfaces that risk while the cost of rework is zero.

### Q2 — CI port-over scope (CLAR-ADOPT-002)

**Finding:** The sister tracks (Stock-taking, Project Scaffolding) do not install CI files into downstream workspaces. The Design Track does not touch CI at all. None of the existing opt-in tracks crosses the boundary into installing `.github/workflows/` into a foreign repository.

The enrichment phase (Phase 3) should install the Specorator scaffold files — `AGENTS.md`, `CLAUDE.md`, `specs/`, `docs/steering/`, `templates/` — but should treat `.github/workflows/` as advisory rather than mandatory. Specifically: the agent should detect whether a `verify.yml` (or equivalent) is already present; if absent, it may install a *starter* version of the verify workflow but must present it for human review before the push phase. If the foreign repo already has CI, the agent must not overwrite it — instead, it should generate a diff-friendly comparison report and record the conflict in the adoption state.

This boundary is important for Constitution Article VI (agent may not invent what to install) and Article VII (irreversible shared-state action requires human authorisation). Installing a CI workflow that runs against a foreign repo's codebase is high-risk; a human must confirm it.

**Recommendation for Q2:** Include `verify.yml` installation as an opt-in enrichment step that is explicitly gated: the agent proposes the file content, the human approves or declines before the push phase. Foreign-repo CI conflicts are surfaced in the adoption state as unresolved items, not silently resolved.

### Q3 — Language-specific renderer breadth (CLAR-ADOPT-003)

**Finding:** The Specorator verify gate is currently TypeScript/npm-based (`npm run verify`). A Python adopter who receives `package.json` and `tsconfig.json` as part of the scaffold will get a verify gate that is meaningless for their project.

However, implementing full language-specific presets (Node, Python, Go, Java) multiplies the maintenance surface significantly and could delay v1.1 indefinitely. The minimum viable approach for v1.1 is:
- One mandatory generic preset (Markdown files, `specs/`, `docs/steering/`, `templates/`, `AGENTS.md`, `CLAUDE.md`) that is language-agnostic.
- One optional Node/TypeScript preset that installs `package.json`, `tsconfig.json`, and `verify.yml`.
- Detection logic that warns (and does not auto-install) the Node preset when a `package.json` already exists or when the repo appears to be Python-primary (heuristic: `.py` files outnumber `.ts`/`.js` files, or a `pyproject.toml`/`setup.py` is present).

Python-specific enrichment (e.g., a `Makefile`-based verify gate, `pyproject.toml` section, `pre-commit` config) is deferred to v1.2 and should not be designed out by v1.1 choices.

**Recommendation for Q3:** Ship v1.1 with one generic preset (always) and one Node/TypeScript optional preset (proposed but not auto-installed). Preset manifest format must be designed to allow adding new language presets without altering the Phase 3 logic.

### Q4 — Template-version pin strategy

**Finding:** No existing Specorator track records the template version in the adopted/scaffolded workspace. The Project Scaffolding Track does not embed version metadata in its starter-pack output. The editorconfig distribution pattern (a file installed and left in place) is the closest analogy in the broader ecosystem: the file records its origin but has no automated update mechanism.

Options evaluated:
- `.specorator-version` file at the foreign repo root: simple, explicit, easy to diff, machine-readable. Does not interfere with any known toolchain.
- Version comment block embedded in `AGENTS.md`: less visible, breaks the AGENTS.md immutability principle (AGENTS.md bodies are a source of truth; adding a version comment pollutes the canonical content).
- No version recording: blocks all future drift detection work, not viable.
- `adoptions/<slug>/adoption-manifest.json`: records version, date, preset, resolved conflicts. Stored in the template repo (not the foreign repo), therefore visible only to the adopter if they retain the worktree.

The most useful location is both: a `.specorator-version` file in the foreign repo root (visible to the foreign repo's CI and maintainers) and an `adoption-manifest.json` in the local adoption state (`adoptions/<slug>/`) that records fuller context (template commit SHA, preset used, Phase 1 conflicts resolved, Phase 3 enrichments applied).

**Recommendation for Q4:** Install a `.specorator-version` file containing the template's current git commit SHA and the date of adoption. Also record the same information (plus preset name and conflict summary) in `adoptions/<slug>/adoption-manifest.json`. The `.specorator-version` file becomes the idempotency marker (see Technical Considerations §b).

### Q5 — License of generated content

**Finding:** MIT is a maximally permissive license. It is compatible with GPL, LGPL, Apache 2.0, BSD, and proprietary licenses. The MIT License does not restrict redistribution of MIT-licensed content into a repository using a different license; the adopter may incorporate the files and the receiving repository's license governs the whole. (Source: OSI MIT definition; choosealicense.com; Wikipedia license compatibility matrix.)

The practical risk is not strict license incompatibility (MIT is compatible with everything) but rather:
1. The adopter misunderstands the license and incorrectly believes they must change the template files' attribution.
2. The foreign repo uses a GPL-incompatible proprietary license in a context where even MIT files introducing new attribution obligations is unwanted.

Neither scenario requires the adoption agent to gate; both are best addressed by: (a) a clear notice in the adoption PR description explaining the license of the installed files, and (b) a one-line warning in the Phase 1 review output when the foreign repo's license is not MIT-compatible.

**Recommendation for Q5:** The agent should emit a non-blocking warning in Phase 1 when the foreign repo's `LICENSE` file does not identify MIT, Apache 2.0, or BSD. The warning explains that the installed files carry an MIT-origin license and that the adopter is responsible for license compatibility under their repository's governance. This warning is recorded in `adoption-manifest.json` and included in the adoption PR description. No gate required.

### Q6 — Agent tool-list enforcement

**Finding:** `.claude/settings.json` contains explicit allow/deny rules that are evaluated as prefix matches against literal command strings. These rules govern the Claude Code agent session globally. When the adoption agent operates in a git worktree under `.worktrees/adopt-<slug>/` (which is a checkout of a foreign repository, not of the template repository), the `.claude/settings.json` rules still apply — they are session-scoped, not directory-scoped.

Critical gap: the deny rules in `.claude/settings.json` are templated for the template repo's own paths (`rm -rf specs`, `rm -rf docs`, etc.). None of those deny rules protect the foreign repo's paths. An agent operating in `.worktrees/adopt-<slug>/` could, without additional constraints, write or delete arbitrary files in the worktree — which would affect the foreign repo's working tree.

The current enforcement mechanism is therefore necessary but not sufficient for the adoption case. Additional mitigations needed:
- The adoption agent's tool list should restrict `Bash` to a pre-approved set of commands (`git status`, `git add`, `git commit`, `git push`, `gh pr create`) and prohibit destructive shell operations (`rm`, `mv` on non-staged files).
- The agent definition file (`.claude/agents/repo-adoption-agent.md`) should enforce path-scoped write access: Read/Write allowed only under the `adoptions/<slug>/` state directory and the cloned worktree; no writes to the template repo's canonical directories.
- This is an ADR-class decision (broadening or narrowing agent tool surface requires justification).

**Recommendation for Q6:** `.claude/settings.json` is insufficient on its own. The agent definition file must specify a restricted tool list with no destructive Bash operations. Document the path-scoping intent in the agent file. Flag for the architect that a mechanism to enforce path-scoped writes for agents operating in worktrees may be needed (this is a gap in the current enforcement model).

### Q7 — Phase-gate interface

**Finding:** Existing conductor skills (e.g., `issue-breakdown`) use `AskUserQuestion` to confirm before irreversible actions (opening PRs, editing issue bodies). The adoption track's four phases are substantially richer in human judgment than issue-breakdown: Phase 1 produces a conflict report that the human must read before proceeding to Phase 2; Phase 3 lets the human choose a preset; Phase 4 is the irreversible push.

The `AskUserQuestion` pattern is designed for binary confirm/abort gates. It handles a menu of options (Phase 3 preset selection) adequately. What it does not handle natively is the resumption scenario: if the adopter runs `/adopt:start`, passes Phase 1 review, then closes the session and returns later, the state must be persisted in `adoptions/<slug>/workflow-state.md` so that Phase 2 can resume from where Phase 1 ended without re-cloning.

**Recommendation for Q7:** Map Phase 1, 3, and 4 gates to `AskUserQuestion` callbacks. Phase 2 (parity) is fully automated and reports its output before the Phase 3 gate. The conductor skill must write phase-completion markers to `adoptions/<slug>/workflow-state.md` before each gate so that resumption is possible. This is consistent with how issue-breakdown handles idempotency (sentinel-bracketed re-edit zones and slice-tag checks). No new confirmation protocol is needed beyond the existing `AskUserQuestion` + persistent state pattern.

### Q8 — Conflict resolution ownership

**Finding:** Phase 1 (review) generates a conflict report: files in the template scaffold that collide with files already present in the foreign repo. The collision types are:
- File present in foreign repo and in template scaffold (e.g., foreign `CLAUDE.md` vs. template `CLAUDE.md`).
- Template scaffold installs a file that would overwrite a meaningful foreign-repo file.
- Foreign repo has a directory layout that conflicts with a template directory (e.g., foreign `specs/` used for a different purpose).

No existing sister track resolves conflicts through automated merge rules. The Project Scaffolding Track records conflicts in `extraction.md` as open questions for human resolution. The Stock-taking Track records hard constraints and leaves them for the PM (Stage 3).

The adoption agent must not silently resolve conflicts (Constitution Article VI — agents may escalate but not invent). Conflict resolution must be human-owned.

**Recommendation for Q8:** Phase 1 output is a conflict report only. The adoption state records each conflict with three fields: `file`, `conflict_type` (overwrite/directory-layout/ci-collision), and `resolution` (initially `TBD`). The Phase 2 gate does not open until all conflicts are either accepted (human marks `resolution: accept-template-version`), declined (human marks `resolution: skip-this-file`), or deferred (human marks `resolution: manual-merge-needed`). A `manual-merge-needed` resolution blocks the push phase until cleared. Resolution decisions are written to `adoptions/<slug>/adoption-manifest.json` for traceability.

### Q9 — Non-GitHub remotes

**Finding:** `gh pr create` and `gh repo clone` are GitHub-specific. GitLab, Bitbucket, and self-hosted Gitea/Forgejo instances have their own CLIs (`glab`, `bb`) with incompatible interfaces. The adoption track's v1.1 design constraints explicitly limit scope to GitHub.

When a user runs `/adopt:start <url>` and the URL is not a GitHub URL (`github.com` hostname), the adoption agent should fail loudly with a clear explanation:
- "This repository is hosted on [detected forge]. The Repo Adoption Track v1.1 supports GitHub only. To adopt the Specorator scaffold manually, see `docs/manual-adoption.md` (TBD — owner: pm)."

A partial path (creating a local branch and producing a patch file) was referenced in issue #257 as a fallback for repositories where the adopter lacks push access. This fallback is worth retaining for a different scenario: GitHub repos where the adopter has read access but not write access (they cannot push a branch). In that case, the adoption track should produce a patch file and instructions for creating a fork-based PR rather than failing entirely.

**Recommendation for Q9:** Fail loudly with a clear error message for non-GitHub remotes; do not attempt a partial path for non-GitHub forges. For GitHub repos where push access is unavailable, offer the patch-file fallback as Phase 4's secondary output (human-confirmed).

### Q10 — Relation to Project Scaffolding Track

**Finding:** The Scaffolding Track (ADR-0011) reads documents from `inputs/` or the local file system and produces starter-pack drafts. It does not clone a repository, install files, or open PRs. Its methodology is evidence-extraction; its output is draft content for human promotion. The Adoption Track clones a live repository, performs file installation, and opens a PR against a foreign remote. These are structurally different operations.

Potential shared concerns:
- **Source inventory**: both tracks enumerate what exists before writing anything. The scaffolding track produces `source-inventory.md`; the adoption track's Phase 1 produces a conflict/inventory report. The concepts are analogous but the implementation differs (file system crawl vs. git clone + diff).
- **Conflict detection**: the scaffolding track records ambiguities; the adoption track records conflicts. The scaffolding track never resolves a conflict; the adoption track must.

The two tracks are sufficiently different to remain independent. Extracting shared methodology into a "source-inventory utility" would be premature at this stage. If a third track with the same inventory need emerges, that would be the right trigger for shared extraction.

**Recommendation for Q10:** Treat the two tracks as fully independent for v1.1. Document the conceptual similarity in the Adoption Track methodology docs so future contributors can identify the potential for shared tooling.

---

## Market / ecosystem

### Template installation patterns

| Solution | Approach | Strengths | Weaknesses | Source |
|---|---|---|---|---|
| `npm create <template>` | Runs a scaffolding script from an npm package; prompts user; writes files to CWD | Wide JS/TS ecosystem adoption; interactive prompts; post-install hooks | Node.js dependency; no conflict detection for existing repos; installs into empty dirs by convention | [npm docs](https://docs.npmjs.com/) |
| `cookiecutter` | Python CLI; downloads a template repo; renders Jinja2 variables into a fresh directory | Language-agnostic templates; large template registry; variable substitution | Python dependency; designed for new-directory creation, not adoption into existing repos; no PR mechanics | [cookiecutter.readthedocs.io](https://cookiecutter.readthedocs.io/en/stable/) |
| `degit` (Rich Harris) | Downloads latest tarball of a GitHub/GitLab/Bitbucket repo without git history; extracts into CWD | No git history bloat; fast; works with subfolders | Unmaintained since 2020; no conflict detection; no interactive presets; designed for blank-canvas scaffolding | [github.com/Rich-Harris/degit](https://github.com/Rich-Harris/degit) |
| `giget` (UnJS) | `degit` successor; supports GitHub, GitLab, Bitbucket, custom registries; downloads tarball | Maintained; multi-forge; simpler API than degit | Same blank-canvas assumption; no conflict detection or PR mechanics | [pkgpulse.com/blog/giget-vs-degit-vs-tiged-git-template-downloading-nodejs-2026](https://www.pkgpulse.com/blog/giget-vs-degit-vs-tiged-git-template-downloading-nodejs-2026) |
| `dotnet new` | Installs NuGet template packages; scaffolds into CWD | Deep IDE integration; version-pinned templates via NuGet | .NET-specific; no git/PR mechanics; conflict model is delete-and-replace | [learn.microsoft.com/dotnet/core/tools/dotnet-new](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new) |
| GitHub template repositories | "Use this template" button creates a new repo from the template's HEAD | Zero-install; GitHub-native; generates a new repo with template files | Creates a new repo (not adoptable into an existing one); no conflict detection; no enrichment presets | [docs.github.com — creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) |
| `.editorconfig` style distribution | File installed by convention; hierarchical resolution; no toolchain required | Cross-language; self-describing; stable | No automation; no conflict detection; purely advisory | [editorconfig.org](https://editorconfig.org/) |

**Gap:** None of the above patterns combines conflict-aware adoption into an existing repository with an automated PR workflow. The Repo Adoption Track fills this gap specifically.

### Sister-track shape comparison

| Track | State home | Agent count | Entry command | Phases | Installs files in foreign repo? |
|---|---|---|---|---|---|
| Stock-taking | `stock-taking/<slug>/` | 1 (`legacy-auditor`) | `/stock-taking:start` | 3 + Handoff | No |
| Project Scaffolding | `scaffolding/<slug>/` | 1 (`project-scaffolder`) | `/scaffold:start` | 4 (Intake → Extract → Assemble → Handoff) | No (drafts only) |
| Design | `designs/<slug>/` | 1 lead + 3 consulted | `/design:start` | 4 (Frame → Sketch → Mock → Handoff) | No |
| Issue Breakdown | `specs/<slug>/issue-breakdown-log.md` | 1 (`issue-breakdown`) | `/issue:breakdown <n>` | 1 (single orchestrated run) | No (PRs only) |
| Repo Adoption (proposed) | `adoptions/<slug>/` | 1 (`repo-adoption-agent`) | `/adopt:start <url>` | 4 (Review → Parity → Enrich → Push) | Yes (foreign repo) |

The adoption track is the only proposed track that installs files in a foreign repository and opens a PR against a foreign remote. This is a meaningfully higher-risk and broader-scope operation than any existing track.

### `gh` CLI — auth model and cross-fork PR mechanics

`gh pr create` requires the user to be authenticated via `gh auth login` against the GitHub account that has write access (or fork-create access) on the target repository. Key mechanics:
- The `--repo` flag (`-R OWNER/REPO`) directs the PR to any repository the authenticated user has access to.
- If the user lacks push access to the base repo, `gh pr create` will offer to fork automatically and push to the fork.
- Cross-fork PRs are created with `--head owner:branch` syntax; the authenticated user must own the head repo.
- The `project` scope is needed only when adding the PR to a GitHub Project board; it is not needed for simple PR creation.
- Authentication is handled via the OS keychain or `GITHUB_TOKEN` environment variable; the CLI does not prompt for credentials during script execution if authentication is pre-established.

Limitation confirmed from issue tracker: `gh pr create -H user:branch` is limited to creating cross-repo PRs between an upstream and a user-owned fork; organisational forks using `orgname:branch` are not supported. (Source: [github.com/cli/cli/issues/10093](https://github.com/cli/cli/issues/10093))

---

## User needs

Since this is template-self work without primary user research, the following assumptions must hold and must be validated post-launch:

**A1 — Adopters own or have push access to the repos they want to adopt.**
Validation method: post-launch usage analytics (how many runs end in the patch-file fallback vs. direct push?). If the majority use the fallback, reconsider whether the direct-push primary path is correct.

**A2 — Adopters are authenticated with `gh` against the target GitHub remote before running `/adopt:start`.**
Validation method: add a pre-flight check in Phase 1 that runs `gh auth status` and fails clearly if not authenticated. Track pre-flight failure rate.

**A3 — Adopters are willing to work through a multi-gate pipeline (review, parity, enrich, push) rather than a one-button install.**
Validation method: measure Phase gate dropout rate. If Phase 1 → Phase 2 dropout is high, simplify the conflict report format. If Phase 3 → Phase 4 dropout is high, the preset choices are confusing.

**A4 — Adopters understand that the adoption PR is the only persistent change; the local working tree is disposable.**
Validation method: include this explicitly in the Phase 1 intro message. Track issues filed about "lost adoption state."

**A5 — Adopters are comfortable with the Specorator scaffold creating top-level directories (`specs/`, `docs/`, `templates/`) in their repositories.**
Validation method: track conflict rate for these directories in Phase 1 reports. If many repos already use `specs/` or `docs/` for incompatible purposes, reconsider whether the scaffold's directory layout should be namespaced.

**A6 — Downstream contributors of an adopted repository benefit from consistent scaffold conventions without having participated in the adoption.**
This is a secondary user need (from `idea.md`). It cannot be validated until adoption PRs have been merged into real repositories and downstream contributor experience is observed.

---

## Alternatives considered

### Alternative A — Agent-orchestrated four-phase skill (the superpowers-spec hypothesis)

**Description:** A conductor skill (`adopt-cycle`) orchestrates a specialist agent (`repo-adoption-agent` or `repo-adopter`) through four phases: Review → Parity → Enrich → Push. The conductor uses `AskUserQuestion` at each phase gate. Three TypeScript scripts back the mechanical operations: `parity-validator.ts` (Phase 2), `idempotency-check.ts` (cross-phase guard), and `manifest-module.ts` (preset loader). The adoption state lives under `adoptions/<slug>/`. The working tree is cloned into the same directory as the state (`adoptions/<slug>/repo/` per issue #257) or into `.worktrees/adopt-<slug>/` per the idea.md framing. The agent's tool list is explicitly narrow.

**Pros:**
- Consistent with the shape of all existing multi-phase tracks (conductor skill + specialist agent + phase artifacts).
- Agent judgment is available at Phase 3 (preset selection, conflict classification).
- Phase gate protocol (`AskUserQuestion`) is already implemented and understood.
- Constitution Articles VI and VII are satisfied: the agent escalates conflicts rather than resolving them silently, and the push gate is human-authorised.

**Cons:**
- Agent adds cognitive overhead for a workflow that is largely mechanical (clone, diff, copy, commit, push).
- The agent's judgment is most useful at Phase 1 (conflict classification) and Phase 3 (preset selection); it adds limited value at Phase 2 (parity check) and Phase 4 (push), which are deterministic.
- The worktree location conflict (`adoptions/<slug>/repo/` vs. `.worktrees/adopt-<slug>/`) must be resolved.

**Fit with Constitution:** Strong. Agent scope is narrow; human gates are explicit.

**Score:**

| Criterion | Score (1 = poor, 5 = excellent) | Notes |
|---|---|---|
| Install ergonomics | 4 | Guided; multi-step but clear |
| Gate ergonomics | 5 | Explicit `AskUserQuestion` at each phase |
| Agent surface | 4 | Single narrow agent |
| Reversibility | 5 | PR is the only persistent change |
| Foreign-repo blast radius | 3 | Agent operates in worktree; risk from path-scope gap in settings.json |
| Maintenance cost | 3 | 3 scripts + conductor skill + agent definition |
| Fit with Constitution | 5 | Articles VI, VII, IX respected |

### Alternative B — Pure-CLI scripted pipeline

**Description:** No agent. A single TypeScript binary (`adopt.ts` or `specorator-adopt`) handles all four phases with `--yes`/`--interactive` flags. The binary is invoked directly from the command line: `npx specorator-adopt <url>`. It clones, diffs, copies preset files, commits, and pushes. In `--interactive` mode it pauses at each gate and prompts via stdin. In `--yes` mode it auto-confirms all gates (dangerous but useful in CI).

**Pros:**
- No agent surface: no tool-list enforcement gap, no session-scope questions.
- Faster to execute (no LLM round-trips at mechanical phases).
- Portable: can run outside Claude Code if packaged as an npm CLI.
- Single binary = single version to maintain.

**Cons:**
- No judgment: the binary cannot classify novel conflict types, cannot reason about preset applicability, and cannot explain why a conflict exists in terms the adopter can act on. Every decision must be pre-encoded as a rule.
- Cross-platform path handling is the implementor's problem, not the agent's.
- No `AskUserQuestion`-style callbacks: the binary must implement its own interactive prompt loop (readline, enquirer, or similar).
- Breaks the agent-track pattern established by all 12 existing tracks. Adopters familiar with the Specorator will not recognise the shape.
- Packaging as an npm CLI adds a distribution step not currently present in the template's toolchain.

**Score:**

| Criterion | Score (1 = poor, 5 = excellent) | Notes |
|---|---|---|
| Install ergonomics | 3 | CLI flag learning curve; no guided narrative |
| Gate ergonomics | 2 | Custom prompt loop; no integration with Specorator's AskUserQuestion |
| Agent surface | 5 | No agent |
| Reversibility | 4 | `--yes` mode can accidentally push; recoverable via PR close |
| Foreign-repo blast radius | 4 | No agent path-scope ambiguity; but `--yes` bypasses all gates |
| Maintenance cost | 4 | One binary; no agent definition |
| Fit with Constitution | 2 | Article VII: human oversight not structurally enforced; `--yes` can bypass push gate |

### Alternative C — Phased-PR install (multi-PR per phase)

**Description:** Each phase opens a separate PR against the foreign repo: PR1 (scaffold skeleton), PR2 (parity fixes), PR3 (enrichment), PR4 (final cleanup). The adopter reviews and merges each PR before the next phase opens. This is the "multi-PR per phase" pattern explicitly deferred in `idea.md`'s out-of-scope section.

**Pros:**
- Each PR is small and reviewable independently.
- Reviewers on the foreign repo can approve the scaffold before enrichment is applied.
- Phase failures are isolated: if PR2 introduces a CI break, it can be reverted without touching PR1.

**Cons:**
- State management complexity: the adoption conductor must track which PRs are merged, must re-check the foreign repo state before opening each subsequent PR, and must handle the case where a prior PR was closed without merging.
- Merge conflicts between sequential PRs if the foreign repo has concurrent activity.
- Reviewers on the foreign repo must participate in four review cycles rather than one.
- `gh pr create` does not natively sequence PRs with dependencies; the conductor must poll for PR merge status.
- Rejected in `idea.md`'s out-of-scope section. The sister-track evidence does not contradict this rejection: no sister track uses a multi-PR per phase approach.

**Score:**

| Criterion | Score (1 = poor, 5 = excellent) | Notes |
|---|---|---|
| Install ergonomics | 2 | Four PRs = four review cycles for adopter's team |
| Gate ergonomics | 4 | Each PR is a natural gate |
| Agent surface | 3 | Agent must track remote PR state |
| Reversibility | 5 | Each phase is independently reversible |
| Foreign-repo blast radius | 5 | Smallest blast radius per PR |
| Maintenance cost | 2 | State machine for tracking 4 PRs is complex |
| Fit with Constitution | 4 | Article VII well-satisfied; Article II respected |

### Alternative D — GitHub template repository + post-use script

**Description:** Publish the Specorator scaffold as a GitHub template repository. When an adopter clicks "Use this template," GitHub creates a new repo. A post-use `adopt.sh` script is committed in the template and the adopter runs it in their existing repo to merge the scaffold files. This is a "pull then merge" pattern.

**Pros:**
- GitHub-native; no CLI installation required beyond standard git.
- Template repositories are already a supported GitHub feature.
- The adopter controls when to run the merge script.

**Cons:**
- GitHub template repositories create a new repository, not a merge into an existing one. The adopter must manually carry their existing repo's history forward or merge two repositories — a complex git operation.
- No conflict detection, no phase gates, no PR automation.
- Does not address the core problem (adopting the template into an existing repo with a live history).
- The template repository feature is designed for new-repo bootstrapping, not for adoption.

**Score:**

| Criterion | Score (1 = poor, 5 = excellent) | Notes |
|---|---|---|
| Install ergonomics | 1 | Manual merge of two repos is high friction |
| Gate ergonomics | 1 | No gates |
| Agent surface | 5 | No agent |
| Reversibility | 3 | Script outputs are reversible via git; two-repo merge is messy |
| Foreign-repo blast radius | 2 | Undetermined; manual merge step has high error risk |
| Maintenance cost | 5 | Template repo + one shell script |
| Fit with Constitution | 1 | No human oversight of specific changes; no traceability |

### Summary table

| Alternative | Install | Gates | Agent | Reversible | Blast radius | Maintenance | Constitution |
|---|---|---|---|---|---|---|---|
| A — Agent-orchestrated skill | 4 | 5 | 4 | 5 | 3 | 3 | 5 |
| B — Pure-CLI binary | 3 | 2 | 5 | 4 | 4 | 4 | 2 |
| C — Multi-PR per phase | 2 | 4 | 3 | 5 | 5 | 2 | 4 |
| D — GitHub template + script | 1 | 1 | 5 | 3 | 2 | 5 | 1 |

---

## Technical considerations

### a. `gh` auth model and cross-fork PR mechanics

`gh pr create` requires the user to have an active `gh auth login` session authenticated against a GitHub account with at minimum read access to the base repo (to create a PR from a fork). For a direct-push workflow (no fork), the account needs write access to the base repo. Key constraints:

- `gh auth status` can be used as a pre-flight check.
- The `--repo` flag allows targeting any accessible repo.
- Cross-fork PRs (`--head user:branch`) require the authenticated user to own the head repo. Organisation names cannot be used as the head owner (CLI limitation per [cli/cli#10093](https://github.com/cli/cli/issues/10093)).
- `GITHUB_TOKEN` as an env-var is the CI-compatible authentication method.
- There is no direct "gh pr create against a remote you have no fork of" shortcut — the conductor must fork first (or use the auto-fork prompt) if write access is unavailable.

### b. Working tree location: `adoptions/<slug>/repo/` vs. `.worktrees/adopt-<slug>/`

Issue #257 describes the adoption state as living in `adoptions/<slug>/` with the cloned foreign repo at `adoptions/<slug>/repo/`. The idea.md mentions `.worktrees/adopt-<slug>/`. These are two different approaches:

**Option 1 — `adoptions/<slug>/repo/` (state collocated with working tree):**
- Pro: Adoption state and foreign repo in one directory; easier to navigate.
- Pro: State directory is committed to the template repo (since `adoptions/` is a first-class directory).
- Con: The foreign repo clone at `adoptions/<slug>/repo/` must be gitignored from the template repo (otherwise all foreign-repo files pollute the template's git history).
- Con: The `adoptions/<slug>/repo/` directory is not a git worktree of the template repo; it is an independent clone. The `git worktree add` mechanics do not apply.
- Con: On Windows, path depths can become very long (template-repo path + `adoptions/slug/repo/path/to/file`), which may exceed the default 260-character MAX_PATH limit.

**Option 2 — `.worktrees/adopt-<slug>/` (worktree of the template repo):**
- Pro: Consistent with the template's existing worktree convention (`docs/worktrees.md`).
- Pro: `.worktrees/` is already gitignored (confirmed by convention; adopt-slug would follow the same pattern).
- Con: A git worktree must be a branch of the same repository. A foreign repo clone cannot be a worktree of the template repo. This is a fundamental git constraint — `git worktree add` does not support adding a different repo's clone as a worktree.
- Con: Using `.worktrees/` for a foreign-repo clone contradicts the worktree contract (worktrees share the template repo's object store; a foreign clone does not).

**Reconciliation:** The `.worktrees/adopt-<slug>/` framing in `idea.md` is incorrect. A foreign-repo clone is not a git worktree of the template repo. The correct location is `adoptions/<slug>/repo/` with the `repo/` subdirectory gitignored at the `adoptions/<slug>/` level (via a `.gitignore` inside `adoptions/<slug>/`). The adoption state files (`workflow-state.md`, `adoption-manifest.json`) are committed to the template repo under `adoptions/<slug>/`; the foreign repo clone at `adoptions/<slug>/repo/` is gitignored and disposable.

**Recommendation:** Use `adoptions/<slug>/repo/` for the foreign-repo working tree. Add `repo/` to a `.gitignore` inside each `adoptions/<slug>/` directory. The adoption state (`.md` files, `adoption-manifest.json`) lives at `adoptions/<slug>/` and is committed.

### c. Windows + POSIX path handling

The template repository runs on Windows (confirmed: `win32`, PowerShell, Windows 11 per env context). The adoption track's TypeScript scripts must handle:
- Path separator differences (`\` on Windows, `/` on POSIX). Use `path.join()` from Node's `path` module throughout; never concatenate raw strings with `/`.
- MAX_PATH limit (260 characters by default on Windows). The adoption slug should be bounded to prevent excessively deep path nesting. Recommend a maximum 32-character slug.
- Git itself is generally cross-platform; `gh` CLI is cross-platform.
- PowerShell is the primary shell; Bash is available but not assumed. Scripts must be PowerShell-compatible or invoked via Node.

### d. Idempotency marker placement

The `.specorator-version` file at the foreign repo root (recommended in Q4 above) also serves as the idempotency marker. Before running any Phase 2 operations, the `idempotency-check.ts` script checks whether `.specorator-version` already exists in the foreign repo. If it does, the adoption run is resuming (not starting fresh), and the Phase 1 conflict report from the prior run must be reloaded from `adoptions/<slug>/adoption-manifest.json`. A fresh run (no `.specorator-version` present) proceeds normally.

Risk: the foreign repo may already contain a file named `.specorator-version` that was placed there for an unrelated purpose (RISK-002 below).

### e. License-tagging mechanics for generated content (Q5)

The adoption PR description must include a standard license notice block:

> "Files installed by this PR were generated from the Specorator workflow template (https://github.com/Luis85/agentic-workflow), which is available under the MIT License. These files retain their MIT provenance. See the installed files for individual attribution."

This is a text block inserted by the conductor into the PR body template. No code changes are needed in the installed files themselves; the MIT license is already declared in the template repository's `LICENSE` file and the installed `AGENTS.md` references it.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | Push to wrong remote: the adoption agent's `git push` or `gh pr create` targets the template repo origin rather than the foreign repo remote. | high | low | Pre-flight check: before Phase 4, the conductor confirms the remote URL matches the URL passed to `/adopt:start`. The push command must explicitly specify the foreign remote (`git push <foreign-remote-name>` not `git push origin`). A deny rule in the agent definition prevents `git push origin` from the adoption working directory. |
| RISK-002 | Idempotency marker collision: the foreign repo already contains a `.specorator-version` file used for a different purpose (e.g., recording the version of another tool called "Specorator"). | med | low | Phase 1 review checks the existing `.specorator-version` content. If the content does not match the expected format (a git SHA and an ISO date), the agent reports the collision and blocks Phase 2 until the human resolves it. Alternative idempotency marker path (e.g., `.specorator/adoption.json`) should be the architect's decision in Stage 4. |
| RISK-003 | License incompatibility unhandled: the adoption agent installs MIT-licensed files into a GPL-2.0-only foreign repo; the adopter does not realise this creates an attribution obligation. | low | med | Phase 1 emits a non-blocking warning when the foreign repo's LICENSE file is detected as non-MIT/Apache/BSD. Warning text is included in the adoption PR description. No gate required (MIT is permissive). Document clearly in the methodology doc. |
| RISK-004 | Foreign repo CI conflict: Phase 3 installs `verify.yml` and it fails on the foreign repo's CI (wrong Node version, missing dependencies, incompatible OS). | med | med | `verify.yml` installation is opt-in and requires explicit human confirmation. The Phase 3 gate shows the file content before confirmation. The adoption PR description includes a note that the CI workflow may need manual adjustment. Flag as a "known needs tuning" item in the adoption PR body. |
| RISK-005 | ADR-0030 reservation race: ADR slots 0028 and 0029 are pre-claimed by uncommitted parallel work (multi-framework-adapters); ADR-0030 may also be claimed by parallel work before the adoption track's ADR is filed. | med | low | File ADR-0030 in a dedicated predecessor PR before implementation begins (see Q1 recommendation). Check the ADR README for claimed slots immediately before filing. If 0030 is claimed, use the next available slot. Include the actual ADR number as a variable in the implementation PR template so it can be updated at filing time. |
| RISK-006 | Branch state silently switched: when the `/adopt:start` skill is invoked, the conductor may operate on a branch other than `feat/repo-adoption-track`, contaminating the template repo's working tree with adoption artifacts or vice versa. This was the root cause of issue #258. | high | med | The conductor skill must assert the current branch at session start (`git branch --show-current`) and abort with an error if it is not the expected feature branch. The adoption working tree must be isolated in `adoptions/<slug>/` with gitignored clone state; no adoption artifacts should land in the template repo's root or tracked directories during an adoption run. Document this invariant in the skill's pre-flight checklist. |

---

## Recommendation

**Recommended alternative: Alternative A — Agent-orchestrated four-phase skill.**

**Rationale:**
1. Alternative A is the only alternative that satisfies all three critical constitutional requirements: agent escalation not invention (Article VI), explicit human authorisation of the push (Article VII), and reversibility as a structural property of the design (Article IX).
2. The shape (conductor skill + specialist agent + phase artifacts + state file) is consistent with all 12 existing tracks. Adopters and contributors already understand this shape.
3. The mechanical phases (Phase 2 parity, Phase 4 push) are deterministic and can be backed by TypeScript scripts; the agent's judgment is concentrated at Phase 1 (conflict classification) and Phase 3 (preset selection), where natural language reasoning genuinely adds value.
4. Alternative B (pure-CLI) has the weakest constitutional fit: the `--yes` flag bypasses the push gate entirely, which directly contradicts Article VII.
5. Alternative C (multi-PR) is structurally sound but multiplies review cycles for the adopter's team and introduces complex state management for inter-PR dependencies — cost exceeds the reviewability benefit for a v1.1 first release.
6. Alternative D (GitHub template + script) does not address the core problem (adoption into an existing repo).

**Worktree location correction:** The idea.md's `.worktrees/adopt-<slug>/` framing should be corrected to `adoptions/<slug>/repo/` in Stage 3 requirements. This is a naming clarification, not an architectural change.

**What still needs validating (Stage 3 inputs):**

1. **Agent definition scope**: The exact tool list for `repo-adoption-agent` must be specified. The current gap — `.claude/settings.json` enforcement does not protect the foreign repo's paths from the agent — must be addressed by the architect before implementation. (TBD — owner: architect)

2. **ADR-0030 content and filing**: Stage 3 cannot begin until ADR-0030 is accepted (or until the track is explicitly deferred to v1.1 with no open taxonomy question). The PM should flag this as a blocking dependency. (TBD — owner: pm, architect)

3. **`verify.yml` opt-in mechanics**: The specific UI of the opt-in at Phase 3 (how the human confirms or declines the CI workflow installation) must be specified as an acceptance criterion. (TBD — owner: pm)

4. **Idempotency marker naming**: The architect should decide between `.specorator-version` (root-level) and `.specorator/adoption.json` (namespaced) to reduce RISK-002 collision probability. (TBD — owner: architect)

5. **Preset manifest format**: The format of the preset manifest (how Phase 3 presets are defined, loaded, and versioned) must be specified before implementation. This format must support adding new language presets in v1.2 without requiring changes to Phase 3 logic. (TBD — owner: architect)

6. **Windows MAX_PATH constraint**: The maximum slug length and total path depth must be validated against the 260-character Windows limit before scripts are written. (TBD — owner: architect/dev)

7. **Patch-file fallback specification**: The Phase 4 fallback for GitHub repos where push access is unavailable needs a concrete specification: what is the patch file format, where is it written, and what instructions accompany it? (TBD — owner: pm/architect)

---

## Sources

- GitHub CLI `gh pr create` documentation — [cli.github.com/manual/gh_pr_create](https://cli.github.com/manual/gh_pr_create)
- GitHub CLI `gh pr create` cross-repo PR limitation (issue #10093) — [github.com/cli/cli/issues/10093](https://github.com/cli/cli/issues/10093)
- GitHub CLI `gh pr create` fork default issue — [github.com/cli/cli/issues/9654](https://github.com/cli/cli/issues/9654)
- Cookiecutter documentation — [cookiecutter.readthedocs.io](https://cookiecutter.readthedocs.io/en/stable/)
- degit (Rich Harris) — [github.com/Rich-Harris/degit](https://github.com/Rich-Harris/degit)
- giget vs degit vs tiged comparison (2026) — [pkgpulse.com/blog/giget-vs-degit-vs-tiged-git-template-downloading-nodejs-2026](https://www.pkgpulse.com/blog/giget-vs-degit-vs-tiged-git-template-downloading-nodejs-2026)
- GitHub template repositories — [docs.github.com — creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)
- EditorConfig — [editorconfig.org](https://editorconfig.org/)
- MIT License (OSI) — [opensource.org/license/mit](https://opensource.org/license/mit)
- License compatibility (Wikipedia) — [en.wikipedia.org/wiki/License_compatibility](https://en.wikipedia.org/wiki/License_compatibility)
- choosealicense.com — MIT — [choosealicense.com/licenses/mit](https://choosealicense.com/licenses/mit/)
- Git worktree documentation — [git-scm.com/docs/git-worktree](https://git-scm.com/docs/git-worktree)
- Git worktree vs clone comparison — [intertech.com/using-git-worktrees-instead-of-multiple-clones](https://www.intertech.com/using-git-worktrees-instead-of-multiple-clones/)
- ADR-0007 — bundled with implementation in PR #16 — [github.com/Luis85/agentic-workflow/pull/16](https://github.com/Luis85/agentic-workflow/pull/16)
- ADR-0011 — bundled with implementation in PR #40 — [github.com/Luis85/agentic-workflow/pull/40](https://github.com/Luis85/agentic-workflow/pull/40)
- ADR-0019 — bundled with implementation in PR #167 — [github.com/Luis85/agentic-workflow/pull/167](https://github.com/Luis85/agentic-workflow/pull/167)
- ADR-0022 — bundled with implementation in PR #184 (spec-only predecessor: PR #182) — [github.com/Luis85/agentic-workflow/pull/184](https://github.com/Luis85/agentic-workflow/pull/184), [github.com/Luis85/agentic-workflow/pull/182](https://github.com/Luis85/agentic-workflow/pull/182)
- Tracking issue #257 — [github.com/Luis85/agentic-workflow/issues/257](https://github.com/Luis85/agentic-workflow/issues/257)
- Process bug issue #258 — [github.com/Luis85/agentic-workflow/issues/258](https://github.com/Luis85/agentic-workflow/issues/258)
- Stefan Buck — Repository Templates Meets GitHub Actions — [stefanbuck.com/blog/repository-templates-meets-github-actions](https://stefanbuck.com/blog/repository-templates-meets-github-actions)

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] ≥ 2 alternatives explored (four alternatives covered).
- [x] User needs supported by evidence (or assumptions explicit).
- [x] Technical considerations noted.
- [x] Risks listed with severity.
- [x] Recommendation made.
