import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Diagnostic } from "./diagnostics.js";
import {
  checkReleasePackageContents,
  type ReleasePackageReport,
} from "./release-package-contract.js";

/**
 * Diagnostic codes emitted by {@link checkReleaseReadiness}.
 *
 * Layer 1 codes use the `RELEASE_READINESS_*` namespace, one code per assertion
 * field. Layer 2 codes (fresh-surface contract) are passed through unchanged
 * from `RELEASE_PACKAGE_DIAGNOSTIC_CODES` in `release-package-contract.ts` so
 * downstream T-V05-006 can rely on a single stable namespace per assertion.
 */
export const RELEASE_READINESS_DIAGNOSTIC_CODES = {
  Version: "RELEASE_READINESS_VERSION_MISMATCH",
  TagMissing: "RELEASE_READINESS_TAG_MISSING",
  TagNotAtMain: "RELEASE_READINESS_TAG_NOT_AT_MAIN",
  ChangelogMissing: "RELEASE_READINESS_CHANGELOG_MISSING",
  ReleaseNotesMissing: "RELEASE_READINESS_RELEASE_YML_MISSING",
  ReleaseNotesShape: "RELEASE_READINESS_RELEASE_YML_SHAPE",
  PkgName: "RELEASE_READINESS_PKG_NAME",
  PkgRegistry: "RELEASE_READINESS_PKG_REGISTRY",
  PkgRepository: "RELEASE_READINESS_PKG_REPOSITORY",
  PkgFiles: "RELEASE_READINESS_PKG_FILES",
  PackageJsonMissing: "RELEASE_READINESS_PACKAGE_JSON_MISSING",
  WorkflowMissing: "RELEASE_READINESS_WORKFLOW_MISSING",
  WorkflowPermissions: "RELEASE_READINESS_WORKFLOW_PERMISSIONS",
  Quality: "RELEASE_READINESS_QUALITY",
} as const;

/**
 * Expected `package.json#name` per `specs/version-0-5-plan/package-contract.md` §2.
 */
export const EXPECTED_PACKAGE_NAME = "@luis85/agentic-workflow";

/**
 * Expected `package.json#publishConfig.registry` per package contract §2.
 */
export const EXPECTED_PACKAGE_REGISTRY = "https://npm.pkg.github.com";

/**
 * Expected `package.json#repository` URL per package contract §2.
 */
export const EXPECTED_PACKAGE_REPOSITORY = "https://github.com/Luis85/agentic-workflow";

/**
 * Least-privilege workflow permissions allowed on the manual release workflow
 * per ADR-0020 / SPEC-V05-002 / NFR-V05-001.
 *
 * The set is exhaustive — any other key (for example `actions: write`,
 * `id-token: write`, `pull-requests: write`) is a violation, and any value
 * other than the one below for a permitted key is a violation. The check
 * applies to both the workflow-level `permissions:` block and any
 * `jobs.<job>.permissions` block so a compliant top-level cannot be widened
 * by a job override (Codex round-3 P1 on PR #158).
 */
export const REQUIRED_WORKFLOW_PERMISSIONS: Readonly<Record<string, string>> = {
  contents: "write",
  packages: "write",
};

/**
 * Default `package.json#files` include list derived from
 * `specs/version-0-5-plan/package-contract.md` §3.
 *
 * Each entry must appear in `package.json#files` for readiness to pass. The
 * list is the conservative, contract-aligned shape; OQ-V05-002 may refine the
 * exact glob form as v0.5 settles. Callers (tests, alternative consumers) can
 * override via `expectedPackageFiles` in {@link ReleaseReadinessOptions}.
 */
export const EXPECTED_PACKAGE_FILES: readonly string[] = [
  ".claude/",
  ".codex/",
  ".github/",
  "agents/",
  "docs/",
  "examples/",
  "memory/",
  "scripts/",
  "sites/",
  "templates/",
  "tests/",
  "AGENTS.md",
  "CHANGELOG.md",
  "CLAUDE.md",
];

/**
 * Minimum maturity level required by SPEC-V05-008 before publish.
 */
export const MIN_QUALITY_MATURITY_LEVEL = 3;

/**
 * Diagnostic codes emitted as **warnings** (informational, do not fail
 * closed). Kept separate from {@link RELEASE_READINESS_DIAGNOSTIC_CODES}
 * because the existing JSON output contract guarantees that any entry in
 * `diagnostics` is a hard failure — operators (and the dispatch workflow)
 * rely on that for the "fail closed" gate. Warnings surface through the
 * CLI as `::notice::` annotations and do not block dispatch.
 */
export const RELEASE_READINESS_WARNING_CODES = {
  ImmutableRepo: "RELEASE_READINESS_IMMUTABLE_REPO",
  ImmutableProbeDenied: "RELEASE_READINESS_IMMUTABLE_PROBE_DENIED",
} as const;

/**
 * Result of probing the "Immutable releases" repo setting.
 *
 * Discriminated four-state instead of `boolean | null` so the warning
 * surface can distinguish "setting confirmed on" from "probe could not
 * verify" (Codex P2 round 4 on PR #242). Round 3 coerced 401/403 -> true
 * to surface a warning, but that produced an indistinguishable false
 * positive against repos where the workflow token simply cannot read the
 * endpoint — operators saw "ENABLED" every dispatch even when the setting
 * was off.
 *
 * - `enabled` — endpoint returned HTTP 200 with `enabled=true` (or org-level
 *   enforcement).
 * - `disabled` — endpoint returned HTTP 404, the documented disabled state.
 * - `denied` — endpoint returned 401 / 403 / "Bad credentials" /
 *   "Resource not accessible". The probe could not verify the setting;
 *   surface a distinct warning so the operator checks manually.
 * - `unknown` — network blip, parse error, or another unrecognized response.
 *   Fail quiet — a transient signal must not block dispatch.
 */
export type ImmutableSettingProbe = "enabled" | "disabled" | "denied" | "unknown";

/**
 * Minimal GitHub API facade for repository-state probes that the git CLI
 * cannot answer. {@link checkRepoImmutableSetting} uses this to read the
 * "Immutable releases" repo setting directly via
 * `GET /repos/{owner}/{repo}/immutable-releases` (Codex round 2 on
 * PR #242 — the dedicated REST endpoint is documented and live, so the
 * earlier most-recent-Release heuristic is unnecessary).
 */
export interface GitHubInterface {
  immutableReleasesSetting(): ImmutableSettingProbe;
}

/**
 * A non-blocking informational signal about release readiness.
 * Distinct from {@link Diagnostic} to preserve the existing contract that
 * any entry in `report.diagnostics` is a hard failure.
 */
export interface ReadinessWarning {
  code: string;
  message: string;
}

/**
 * Probe the "Immutable releases" repo setting (#233 prevention E).
 *
 * Reads the setting directly via
 * `GET /repos/{owner}/{repo}/immutable-releases`. When the endpoint
 * returns `enabled: true` (or the org enforces the setting) every new
 * Release on the repo is auto-flagged immutable; a failed asset upload
 * or operator deletion then permanently burns the tag — exactly the
 * v0.5.0 incident pattern.
 *
 * Emits at most one warning, distinguishing the verified-on case from
 * the probe-denied case (Codex P2 round 4 on PR #242):
 *
 * - `enabled` -> `ImmutableRepo` ("setting is ON").
 * - `denied`  -> `ImmutableProbeDenied` ("probe could not verify;
 *   check manually"). Distinct code so operators do not misread an
 *   auth failure as a confirmed-on setting.
 * - `disabled` / `unknown` -> no warning.
 *
 * Never returns a hard `Diagnostic` — the v0.5.0 retrospective showed
 * the setting is not always operator-controlled (org-level defaults
 * can propagate), so failing closed here could block legitimate
 * dispatches against repos the operator does not own.
 */
export function checkRepoImmutableSetting(github: GitHubInterface): ReadinessWarning[] {
  const state = github.immutableReleasesSetting();
  if (state === "enabled") {
    return [
      {
        code: RELEASE_READINESS_WARNING_CODES.ImmutableRepo,
        message:
          "Repo Setting \"Immutable releases\" is ENABLED on this repository " +
          "(GET /repos/{owner}/{repo}/immutable-releases returned enabled=true). " +
          "Every new Release will be auto-flagged immutable; a failed asset " +
          "upload or operator deletion permanently burns the tag (#233). " +
          "Verify the setting in Repo Settings -> General -> Releases, " +
          "disable it before dispatching, or accept the failure mode knowingly.",
      },
    ];
  }
  if (state === "denied") {
    return [
      {
        code: RELEASE_READINESS_WARNING_CODES.ImmutableProbeDenied,
        message:
          "Could not verify Repo Setting \"Immutable releases\" — " +
          "GET /repos/{owner}/{repo}/immutable-releases returned 401/403 " +
          "(workflow token lacks the scope, or repo access is restricted). " +
          "The setting may or may not be on; this is NOT a confirmation. " +
          "Verify manually in Repo Settings -> General -> Releases before " +
          "dispatching, or grant the workflow token sufficient scope so the " +
          "probe can run cleanly on the next dispatch.",
      },
    ];
  }
  return [];
}

/**
 * Minimal git facade for tag-readiness assertions.
 *
 * `resolveRef` must return a **commit SHA** for the supplied ref,
 * dereferencing (peeling) annotated tags so an annotated `vX.Y.Z` and
 * `refs/heads/main` are comparable. Real callers wire this with
 * `git rev-parse <ref>^{commit}` so annotated and lightweight tags resolve
 * the same way (Codex round-3 P1 on PR #158). Tests inject a stub mapping
 * directly to commit SHAs.
 *
 * `firstParentChain` returns `main`'s first-parent ancestry as a list of
 * commit SHAs starting at `main` HEAD and walking back through merge-commit
 * left parents. Tag readiness uses this to assert the release tag sits on
 * `main`'s first-parent history (ADR-0020 §Compliance), not strictly at
 * `main` HEAD. The strict-HEAD reading made the v0.5.0 / v0.5.1 publish
 * dispatches trip whenever an unrelated PR merged into `main` between the
 * tag cut and the dispatch (#233 prevention F). Returns `null` when the
 * chain cannot be resolved (ref missing, git error).
 */
export interface GitInterface {
  resolveRef(ref: string): string | null;
  firstParentChain(ref: string): readonly string[] | null;
}

/**
 * v0.4 quality signals consumed by the readiness check (SPEC-V05-008).
 *
 * Three repo-derived signals (`openBlockers`, `openClarifications`,
 * `maturityLevel`) come from `lib/quality-metrics.ts`. The two operator-set
 * signals (`ciStatus`, `validationStatus`) come from the release operator via
 * CLI flags. Either every signal is green, or `waiver` records an explicit
 * operator override.
 */
export interface QualitySignals {
  ciStatus?: string;
  validationStatus?: string;
  openBlockers: number;
  openClarifications: number;
  maturityLevel: number;
  waiver?: string;
}

export interface ReleaseReadinessOptions {
  version: string;
  repoRoot: string;
  archive?: string;
  releaseWorkflowPath?: string;
  releaseNotesConfigPath?: string;
  changelogPath?: string;
  packageJsonPath?: string;
  expectedPackageName?: string;
  expectedPackageRegistry?: string;
  expectedPackageRepository?: string;
  expectedPackageFiles?: readonly string[];
  git?: GitInterface;
  qualitySignals?: QualitySignals;
}

export interface ReleaseReadinessReport {
  version: string;
  diagnostics: Diagnostic[];
  freshSurface?: ReleasePackageReport;
}

export type ParsedReleaseReadinessArgs =
  | {
      kind: "args";
      version?: string;
      versionSource?: "argv" | "env";
      archive?: string;
      archiveSource?: "argv" | "env";
    }
  | { kind: "argv-empty"; rawFlag: string };

/**
 * Parse CLI arguments for the release readiness check.
 *
 * Recognises `--version <X.Y.Z>` / `--version=<X.Y.Z>` and
 * `--archive <dir>` / `--archive=<dir>`. Falls back to the environment
 * variables `RELEASE_VERSION` and `RELEASE_PACKAGE_ARCHIVE` when no flag is
 * present. Empty flag values short-circuit with `argv-empty` so release
 * automation cannot silently bypass the check by passing a shell-expanded
 * empty string (Codex P1 regression carried from T-V05-012).
 *
 * @param argv Arguments after `process.argv.slice(2)`.
 * @param env Optional environment object (defaults to `process.env`).
 */
export function parseReleaseReadinessArgs(
  argv: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): ParsedReleaseReadinessArgs {
  const out: ParsedReleaseReadinessArgs = { kind: "args" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--version") {
      const value = argv[i + 1];
      if (value === undefined || value === "" || value.startsWith("--")) {
        return { kind: "argv-empty", rawFlag: "--version" };
      }
      out.version = value;
      out.versionSource = "argv";
      i += 1;
      continue;
    }
    if (arg.startsWith("--version=")) {
      const value = arg.slice("--version=".length);
      if (value === "") return { kind: "argv-empty", rawFlag: "--version=" };
      out.version = value;
      out.versionSource = "argv";
      continue;
    }
    if (arg === "--archive") {
      const value = argv[i + 1];
      if (value === undefined || value === "" || value.startsWith("--")) {
        return { kind: "argv-empty", rawFlag: "--archive" };
      }
      out.archive = value;
      out.archiveSource = "argv";
      i += 1;
      continue;
    }
    if (arg.startsWith("--archive=")) {
      const value = arg.slice("--archive=".length);
      if (value === "") return { kind: "argv-empty", rawFlag: "--archive=" };
      out.archive = value;
      out.archiveSource = "argv";
      continue;
    }
  }
  if (!out.version && env.RELEASE_VERSION) {
    out.version = env.RELEASE_VERSION;
    out.versionSource = "env";
  }
  if (!out.archive && env.RELEASE_PACKAGE_ARCHIVE) {
    out.archive = env.RELEASE_PACKAGE_ARCHIVE;
    out.archiveSource = "env";
  }
  return out;
}

/**
 * Validate a release candidate against the v0.5 readiness contract.
 *
 * Runs Layer 1 (release metadata correctness) in fixed order:
 *
 * 1. Version alignment — `package.json#version` matches the release version.
 * 2. Tag readiness — release tag is on `main`'s first-parent history per
 *    ADR-0020 §Compliance ("the tag commit is reachable from `main`"). The
 *    earlier strict reading (tag SHA == `main` HEAD SHA) was relaxed in
 *    #233 prevention F.
 * 3. CHANGELOG entry — `CHANGELOG.md` has a `## [vX.Y.Z]` heading.
 * 4. Lifecycle release notes — `.github/release.yml` shape per T-V05-003.
 * 5. Package metadata — name, registry, repository, files per package contract.
 * 6. Workflow permissions — manual release workflow is least-privilege.
 * 7. v0.4 quality signals — green or explicit operator waiver (SPEC-V05-008).
 *
 * Then runs Layer 2 (fresh-surface composition from T-V05-012) when
 * `archive` is provided. Layer 2 diagnostics are surfaced unchanged so the
 * `RELEASE_PKG_*` codes downstream consumers rely on stay stable.
 *
 * Layer 2 is skipped only when no archive is provided — Layer 1 still runs
 * because the manual release workflow (T-V05-006) sometimes invokes readiness
 * before the candidate archive is materialised.
 */
export function checkReleaseReadiness(opts: ReleaseReadinessOptions): ReleaseReadinessReport {
  const diagnostics: Diagnostic[] = [];
  const expectedName = opts.expectedPackageName ?? EXPECTED_PACKAGE_NAME;
  const expectedRegistry = opts.expectedPackageRegistry ?? EXPECTED_PACKAGE_REGISTRY;
  const expectedRepository = opts.expectedPackageRepository ?? EXPECTED_PACKAGE_REPOSITORY;
  const releaseWorkflowPath = opts.releaseWorkflowPath ?? ".github/workflows/release.yml";
  const releaseNotesPath = opts.releaseNotesConfigPath ?? ".github/release.yml";
  const changelogPath = opts.changelogPath ?? "CHANGELOG.md";
  const packageJsonPath = opts.packageJsonPath ?? "package.json";

  const pkg = readPackageJson(opts.repoRoot, packageJsonPath);

  diagnostics.push(...checkVersionAlignment(pkg, opts.version, packageJsonPath));
  if (opts.git) diagnostics.push(...checkTagOnMainHistory(opts.git, opts.version));
  diagnostics.push(...checkChangelog(opts.repoRoot, changelogPath, opts.version));
  diagnostics.push(...checkReleaseNotesConfig(opts.repoRoot, releaseNotesPath));
  diagnostics.push(
    ...checkPackageMetadata(pkg, packageJsonPath, {
      name: expectedName,
      registry: expectedRegistry,
      repository: expectedRepository,
      files: opts.expectedPackageFiles ?? EXPECTED_PACKAGE_FILES,
    }),
  );
  diagnostics.push(...checkWorkflowPermissions(opts.repoRoot, releaseWorkflowPath));
  diagnostics.push(...checkQualitySignals(opts.qualitySignals));

  let freshSurface: ReleasePackageReport | undefined;
  if (opts.archive) {
    freshSurface = checkReleasePackageContents(opts.archive);
    diagnostics.push(...freshSurface.diagnostics);
  }

  return { version: opts.version, diagnostics, freshSurface };
}

interface PackageJsonRead {
  data: Record<string, unknown> | null;
  missing: boolean;
  parseError?: string;
}

function readPackageJson(repoRoot: string, relPath: string): PackageJsonRead {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) return { data: null, missing: true };
  try {
    return { data: JSON.parse(fs.readFileSync(full, "utf8")), missing: false };
  } catch (err) {
    return { data: null, missing: false, parseError: (err as Error).message };
  }
}

function checkVersionAlignment(
  pkg: PackageJsonRead,
  version: string,
  packageJsonPath: string,
): Diagnostic[] {
  if (pkg.missing) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.PackageJsonMissing,
        path: packageJsonPath,
        message: `\`${packageJsonPath}\` does not exist; cannot validate release version`,
      },
    ];
  }
  if (pkg.parseError || !pkg.data) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.PackageJsonMissing,
        path: packageJsonPath,
        message: `failed to parse \`${packageJsonPath}\`: ${pkg.parseError ?? "unknown error"}`,
      },
    ];
  }
  const actual = pkg.data.version;
  if (actual !== version) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.Version,
        path: packageJsonPath,
        message: `\`package.json#version\` is \`${String(actual)}\` but release version is \`${version}\` — must equal the tag without a leading \`v\` (package-contract.md §5)`,
      },
    ];
  }
  return [];
}

function checkTagOnMainHistory(git: GitInterface, version: string): Diagnostic[] {
  const tagRef = `v${version}`;
  const tagSha = git.resolveRef(tagRef);
  if (!tagSha) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.TagMissing,
        message: `release tag \`${tagRef}\` does not exist (ADR-0020 — tag is cut from \`main\` after the release branch merges)`,
      },
    ];
  }
  const mainSha = git.resolveRef("refs/heads/main") ?? git.resolveRef("main");
  if (!mainSha) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.TagNotAtMain,
        message: "could not resolve `refs/heads/main`; tag readiness cannot be verified",
      },
    ];
  }
  // Walk `main`'s first-parent chain. The tag may legitimately sit at any
  // first-parent ancestor of HEAD — the strict-HEAD reading tripped twice
  // during the v0.5.1 recovery dispatch when unrelated PRs merged between
  // the tag cut and the dispatch (#233 prevention F). First-parent (not
  // full reachability) keeps the rule "tag is on main proper" — a tag on
  // a feature-branch tip merged via a PR is reachable but lives on the
  // second-parent edge, which we still reject.
  const chain = git.firstParentChain("refs/heads/main") ?? git.firstParentChain("main");
  if (!chain) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.TagNotAtMain,
        message: "could not resolve `main` first-parent chain; tag readiness cannot be verified",
      },
    ];
  }
  if (!chain.includes(tagSha)) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.TagNotAtMain,
        message: `tag \`${tagRef}\` (${tagSha.slice(0, 7)}) is not on \`main\` first-parent history (HEAD ${mainSha.slice(0, 7)}) — ADR-0020 requires tags cut from \`main\``,
      },
    ];
  }
  return [];
}

function checkChangelog(repoRoot: string, relPath: string, version: string): Diagnostic[] {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ChangelogMissing,
        path: relPath,
        message: `\`${relPath}\` does not exist; cannot validate CHANGELOG entry for v${version}`,
      },
    ];
  }
  const text = fs.readFileSync(full, "utf8");
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^##\\s+\\[v${escaped}\\]`, "m");
  if (!heading.test(text)) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ChangelogMissing,
        path: relPath,
        message: `no \`## [v${version}]\` heading in \`${relPath}\` — release readiness requires a CHANGELOG entry for the candidate version`,
      },
    ];
  }
  return [];
}

function checkReleaseNotesConfig(repoRoot: string, relPath: string): Diagnostic[] {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesMissing,
        path: relPath,
        message: `\`${relPath}\` does not exist — required by SPEC-V05-003 / T-V05-003`,
      },
    ];
  }
  let parsed: unknown;
  try {
    parsed = YAML.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
        path: relPath,
        message: `failed to parse \`${relPath}\` as YAML: ${(err as Error).message}`,
      },
    ];
  }
  const out: Diagnostic[] = [];
  const root = parsed as Record<string, unknown> | null;
  const changelog = root && typeof root === "object" ? (root.changelog as Record<string, unknown> | undefined) : undefined;
  if (!changelog || typeof changelog !== "object") {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
      path: relPath,
      message: `\`${relPath}\` missing top-level \`changelog\` block — T-V05-003 shape`,
    });
    return out;
  }
  const categories = changelog.categories;
  if (!Array.isArray(categories) || categories.length === 0) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
      path: relPath,
      message: `\`changelog.categories\` must be a non-empty array (T-V05-003 shape)`,
    });
  }
  const exclude = changelog.exclude as Record<string, unknown> | undefined;
  if (!exclude || typeof exclude !== "object") {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
      path: relPath,
      message: `\`changelog.exclude\` block missing — T-V05-003 requires label and author exclusions`,
    });
  } else {
    // Codex round-3 P2 on PR #158: an `exclude: {}` block previously passed
    // readiness because only the block's existence was checked. T-V05-003
    // requires both `labels` and `authors` arrays to filter maintenance and
    // bot entries from generated release notes.
    if (!Array.isArray(exclude.labels)) {
      out.push({
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
        path: relPath,
        message: `\`changelog.exclude.labels\` must be an array — T-V05-003 requires label exclusions`,
      });
    }
    if (!Array.isArray(exclude.authors)) {
      out.push({
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
        path: relPath,
        message: `\`changelog.exclude.authors\` must be an array — T-V05-003 requires bot author exclusions`,
      });
    }
  }
  return out;
}

interface ExpectedPackage {
  name: string;
  registry: string;
  repository: string;
  files?: readonly string[];
}

function checkPackageMetadata(
  pkg: PackageJsonRead,
  packageJsonPath: string,
  expected: ExpectedPackage,
): Diagnostic[] {
  if (!pkg.data) return []; // already reported by checkVersionAlignment
  const out: Diagnostic[] = [];
  const data = pkg.data;
  if (data.name !== expected.name) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.PkgName,
      path: packageJsonPath,
      message: `\`package.json#name\` is \`${String(data.name)}\` but package contract §2 requires \`${expected.name}\``,
    });
  }
  const publishConfig = data.publishConfig as Record<string, unknown> | undefined;
  const registry = publishConfig?.registry;
  if (registry !== expected.registry) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.PkgRegistry,
      path: packageJsonPath,
      message: `\`package.json#publishConfig.registry\` is \`${String(registry)}\` but package contract §2 requires \`${expected.registry}\``,
    });
  }
  const repository = data.repository;
  const repoUrl =
    typeof repository === "string"
      ? repository
      : (repository as Record<string, unknown> | undefined)?.url;
  if (repoUrl !== expected.repository) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.PkgRepository,
      path: packageJsonPath,
      message: `\`package.json#repository\` is \`${String(repoUrl)}\` but package contract §2 requires \`${expected.repository}\``,
    });
  }
  const files = data.files;
  if (!Array.isArray(files) || files.length === 0) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.PkgFiles,
      path: packageJsonPath,
      message: `\`package.json#files\` must be a non-empty array — package contract §3 / OQ-V05-002 requires the include list to match the contract`,
    });
  } else if (expected.files && expected.files.length > 0) {
    const set = new Set(files as string[]);
    const missing = expected.files.filter((entry) => !set.has(entry));
    if (missing.length > 0) {
      out.push({
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.PkgFiles,
        path: packageJsonPath,
        message: `\`package.json#files\` missing required entries (${missing.join(", ")}) — package contract §3`,
      });
    }
  }
  return out;
}

function checkWorkflowPermissions(repoRoot: string, relPath: string): Diagnostic[] {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowMissing,
        path: relPath,
        message: `manual release workflow \`${relPath}\` does not exist — REQ-V05-002 / SPEC-V05-002 / T-V05-006`,
      },
    ];
  }
  let parsed: Record<string, unknown> | null;
  try {
    parsed = YAML.parse(fs.readFileSync(full, "utf8")) as Record<string, unknown> | null;
  } catch (err) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `failed to parse \`${relPath}\` as YAML: ${(err as Error).message}`,
      },
    ];
  }
  if (!parsed || typeof parsed !== "object") {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `\`${relPath}\` did not parse to a YAML object`,
      },
    ];
  }
  const out: Diagnostic[] = [];
  // Top-level `permissions:` must be present and least-privilege.
  out.push(...diagnosticsForPermissions(parsed.permissions, relPath, "permissions", true));
  // Codex round-3 P1 on PR #158: scan `jobs.<job>.permissions` too.
  // GitHub Actions applies job-level permissions after workflow-level, so a
  // compliant top-level can be widened by a job override (e.g. `actions:
  // write` in a publish job). Each job-level block — if present — must also
  // be a subset of the least-privilege set.
  const jobs = parsed.jobs as Record<string, unknown> | undefined;
  if (jobs && typeof jobs === "object") {
    for (const jobId of Object.keys(jobs).sort()) {
      const job = jobs[jobId];
      if (!job || typeof job !== "object") continue;
      const jobPerms = (job as Record<string, unknown>).permissions;
      if (jobPerms === undefined) continue; // job inherits top-level — already validated
      out.push(
        ...diagnosticsForPermissions(jobPerms, relPath, `jobs.${jobId}.permissions`, false),
      );
    }
  }
  return out;
}

function diagnosticsForPermissions(
  permissions: unknown,
  relPath: string,
  location: string,
  requirePresence: boolean,
): Diagnostic[] {
  if (permissions === undefined || permissions === null) {
    if (!requirePresence) return [];
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `${location === "permissions" ? "top-level " : ""}\`${location}:\` block missing — must declare exactly { contents: write, packages: write } (REQ-V05-002 / NFR-V05-001)`,
      },
    ];
  }
  if (typeof permissions === "string") {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `\`${location}: ${permissions}\` is broader than least-privilege — must be { contents: write, packages: write } (REQ-V05-002 / NFR-V05-001)`,
      },
    ];
  }
  if (typeof permissions !== "object") {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `\`${location}\` must be a mapping; got ${typeof permissions}`,
      },
    ];
  }
  const out: Diagnostic[] = [];
  const map = permissions as Record<string, unknown>;
  const allowedKeys = new Set(Object.keys(REQUIRED_WORKFLOW_PERMISSIONS));
  for (const key of Object.keys(map)) {
    if (!allowedKeys.has(key)) {
      out.push({
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `\`${location}.${key}\` not allowed — release workflow must grant only ${Object.keys(REQUIRED_WORKFLOW_PERMISSIONS).map((k) => `\`${k}\``).join(" + ")}`,
      });
    }
  }
  // Top-level must explicitly declare each required permission. Job-level
  // blocks may legitimately scope down (e.g. only `contents: read`) but if a
  // required key is present its value must match exactly.
  for (const [key, expected] of Object.entries(REQUIRED_WORKFLOW_PERMISSIONS)) {
    if (!(key in map)) {
      if (requirePresence) {
        out.push({
          code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
          path: relPath,
          message: `\`${location}.${key}\` missing — must be \`${expected}\``,
        });
      }
      continue;
    }
    const actual = map[key];
    if (actual !== expected) {
      out.push({
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
        path: relPath,
        message: `\`${location}.${key}\` is \`${String(actual)}\` but must be \`${expected}\``,
      });
    }
  }
  return out;
}

function checkQualitySignals(signals: QualitySignals | undefined): Diagnostic[] {
  if (!signals) {
    return [
      {
        code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
        message: `v0.4 quality signals not provided — pass \`--quality-waiver\` or supply ci/validation status (SPEC-V05-008)`,
      },
    ];
  }
  if (signals.waiver) return [];
  const out: Diagnostic[] = [];
  if (signals.ciStatus !== "green") {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
      message: `CI status not green: \`${String(signals.ciStatus)}\` (SPEC-V05-008)`,
    });
  }
  if (signals.validationStatus !== "green") {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
      message: `validation status not green: \`${String(signals.validationStatus)}\` (SPEC-V05-008)`,
    });
  }
  if (signals.openBlockers > 0) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
      message: `${signals.openBlockers} open blocker(s) across active features — must be 0 (SPEC-V05-008)`,
    });
  }
  if (signals.openClarifications > 0) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
      message: `${signals.openClarifications} open clarification(s) across active features — must be 0 (SPEC-V05-008)`,
    });
  }
  if (signals.maturityLevel < MIN_QUALITY_MATURITY_LEVEL) {
    out.push({
      code: RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
      message: `maturity level ${signals.maturityLevel} below minimum ${MIN_QUALITY_MATURITY_LEVEL} (SPEC-V05-008)`,
    });
  }
  return out;
}
