import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  checkReleaseReadiness,
  checkRepoImmutableSetting,
  parseReleaseReadinessArgs,
  type GitHubInterface,
  type GitInterface,
  type ImmutableSettingProbe,
  type QualitySignals,
} from "./lib/release-readiness.js";
import { collectQualityMetrics } from "./lib/quality-metrics.js";
import { failIfErrors, repoRoot } from "./lib/repo.js";

/**
 * CLI for the v0.5 release readiness check (T-V05-004).
 *
 * Validates a release candidate against the readiness contract documented in
 * SPEC-V05-005, SPEC-V05-008, and SPEC-V05-010. Layer 1 (release metadata)
 * always runs; Layer 2 (fresh-surface composition from T-V05-012) runs only
 * when `--archive` is provided so the readiness check can be invoked before a
 * candidate archive is materialised (T-V05-006 / SPEC-V05-009 dry runs).
 *
 * Usage:
 *
 * ```bash
 * # full readiness — pass version + candidate archive
 * npm run check:release-readiness -- --version 0.5.0 --archive <dir>
 *
 * # metadata-only readiness (Layer 1) — no archive yet
 * npm run check:release-readiness -- --version 0.5.0
 *
 * # JSON diagnostics for CI / agent consumption
 * npm run check:release-readiness -- --version 0.5.0 --json
 * ```
 *
 * The check exits 0 with a `skipped` notice when no `--version` argument and
 * no `RELEASE_VERSION` environment variable are provided so `npm run verify`
 * can host this script the same way it hosts `check:release-package-contents`.
 */

const heading = "check:release-readiness";
const argv = process.argv.slice(2);
const parsed = parseReleaseReadinessArgs(argv);

if (parsed.kind === "argv-empty") {
  failIfErrors(
    [
      {
        code: "RELEASE_READINESS_ARG",
        message: `\`${parsed.rawFlag}\` requires a non-empty value. Refusing to fall through to the skip path so release automation cannot silently bypass the readiness assertions.`,
      },
    ],
    heading,
  );
  process.exit(1); // unreachable: failIfErrors exits on non-empty diagnostics; kept for control-flow narrowing.
}

if (!parsed.version) {
  // Codex P1 (PR #158): an `--archive` (or `RELEASE_PACKAGE_ARCHIVE`) without a
  // matching version must NOT silently skip — that would let release automation
  // pass the readiness gate even though a candidate archive was supplied. The
  // explicit `else` below makes the bare-skip branch reachable only when both
  // version and archive are absent so the control flow is unambiguous to
  // automated reviewers.
  if (parsed.archive) {
    failIfErrors(
      [
        {
          code: "RELEASE_READINESS_ARG",
          message: `\`--archive\` provided without \`--version\` (or \`RELEASE_VERSION\`). Refusing to skip — supplying an archive implies a release context, so readiness must run end-to-end.`,
        },
      ],
      heading,
    );
    process.exit(1); // unreachable: failIfErrors exits on non-empty diagnostics; kept for control-flow narrowing.
  } else {
    console.log(
      `${heading}: skipped (no release version provided; pass --version <X.Y.Z> or set RELEASE_VERSION)`,
    );
    process.exit(0);
  }
}

const version = parsed.version;

let archive: string | undefined;
if (parsed.archive) {
  // Codex P2 (PR #158): match `check-release-package-contents` — resolve
  // relative archive paths against `repoRoot` so behaviour is invariant across
  // caller working directories.
  const resolved = path.isAbsolute(parsed.archive)
    ? parsed.archive
    : path.resolve(repoRoot, parsed.archive);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    failIfErrors(
      [
        {
          code: "RELEASE_READINESS_ARG",
          path: parsed.archive,
          message: `candidate archive does not exist or is not a directory (resolved: ${resolved})`,
        },
      ],
      heading,
    );
    process.exit(1); // unreachable: failIfErrors exits on non-empty diagnostics; kept for control-flow narrowing.
  }
  archive = resolved;
}

const ciStatus = readFlagOrEnv(argv, "--ci-status", "RELEASE_CI_STATUS");
const validationStatus = readFlagOrEnv(argv, "--validation-status", "RELEASE_VALIDATION_STATUS");
const waiver = readFlagOrEnv(argv, "--quality-waiver", "RELEASE_QUALITY_WAIVER");

const metrics = collectQualityMetrics();
const qualitySignals: QualitySignals = {
  ciStatus,
  validationStatus,
  openBlockers: metrics.signals.activeBlockers.length,
  openClarifications: metrics.signals.openClarifications.length,
  maturityLevel: metrics.summary.maturity.level,
  waiver,
};

const report = checkReleaseReadiness({
  version,
  repoRoot,
  archive,
  git: realGit(),
  qualitySignals,
});

// Prevention E from #233 — emit a non-blocking warning when the most
// recent Release is immutable (heuristic: Repo Setting "Immutable
// releases" is on). Surface as a GitHub Actions `::warning::` annotation
// to stderr so dispatch operators see it inline. The probe never adds to
// `report.diagnostics` so it cannot fail the gate (the v0.5.0 incident
// showed the setting is not always operator-controlled — failing closed
// could block legitimate dispatches).
//
// Runs unconditionally — including under `--json`. The dispatch workflow
// invokes this script as `npm run check:release-readiness -- --json`, so
// gating the probe on `!--json` would have made it dead code in exactly
// the path the prevention is meant for (Codex P1 on PR #242). The JSON
// contract on `report.diagnostics` and `process.exit` is unchanged —
// warnings only land on stderr as `::warning::` annotations.
const warnings = checkRepoImmutableSetting(realGitHub());
for (const warning of warnings) {
  console.error(`::warning::${warning.code}: ${warning.message}`);
}

failIfErrors(report.diagnostics, heading);

function realGit(): GitInterface {
  return {
    resolveRef(ref: string): string | null {
      // Codex P1 (PR #158, round 3): peel annotated tags via `^{commit}` so
      // the readiness check compares the commit SHA on both sides. Without
      // peeling, `git rev-parse` returns the tag-object SHA for annotated
      // tags (e.g. `git tag -a vX.Y.Z`) while `main` returns a commit SHA,
      // and the comparison would falsely report TAG_NOT_AT_MAIN. The
      // `^{commit}` suffix is a no-op for refs that already point at a
      // commit (lightweight tags, branches, raw SHAs).
      try {
        const out = execFileSync(
          "git",
          ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`],
          {
            cwd: repoRoot,
            encoding: "utf8",
            windowsHide: true,
            stdio: ["ignore", "pipe", "ignore"],
          },
        );
        const sha = out.trim();
        return sha === "" ? null : sha;
      } catch {
        return null;
      }
    },
    firstParentChain(ref: string): readonly string[] | null {
      // `git rev-list --first-parent <ref>` walks merge commits via their
      // left parent only — exactly the chain a release tag may sit on per
      // ADR-0020 §Compliance. Output is one SHA per line, newest first.
      // Used by `checkTagOnMainHistory` to relax the strict-HEAD reading
      // that tripped during the v0.5.1 recovery dispatch (#233 prevention F).
      try {
        const out = execFileSync(
          "git",
          ["rev-list", "--first-parent", ref],
          {
            cwd: repoRoot,
            encoding: "utf8",
            windowsHide: true,
            stdio: ["ignore", "pipe", "ignore"],
          },
        );
        return out.split(/\r?\n/).map((s) => s.trim()).filter((s) => s !== "");
      } catch {
        return null;
      }
    },
  };
}

function realGitHub(): GitHubInterface {
  return {
    immutableReleasesSetting(): ImmutableSettingProbe {
      // Per the GitHub REST contract, `gh api
      // repos/{owner}/{repo}/immutable-releases` returns HTTP 404 when the
      // setting is disabled (the safe state). HTTP 200 returns
      // `{enabled: bool, enforced_by_owner: bool}` for the enabled state; the
      // org-level enforcement flag counts even when the repo's own toggle is
      // off.
      //
      // Failure handling returns four distinct states (Codex P2 round 4
      // on PR #242 — round 3 coerced 401/403 -> true, which produced an
      // indistinguishable false positive against repos where the
      // workflow token cannot read the endpoint):
      //
      //   - 401/403/Bad credentials/Resource not accessible -> "denied"
      //     so checkRepoImmutableSetting emits ImmutableProbeDenied
      //     ("could not verify; check manually") instead of pretending
      //     the setting is confirmed on.
      //   - 404 -> "disabled", because the REST endpoint uses Not Found as
      //     the documented disabled-state response.
      //   - Anything else (network blip, parse error) -> "unknown",
      //     fail quiet. Transient errors should not pollute the warning.
      //
      // GITHUB_REPOSITORY is set on every workflow run; locally, gh's
      // default repo (configured via `gh repo set-default` or the current
      // git remote) is used implicitly.
      let out: string;
      try {
        out = execFileSync(
          "gh",
          [
            "api",
            "repos/{owner}/{repo}/immutable-releases",
            "--jq",
            ".enabled or (.enforced_by_owner // false)",
          ],
          {
            cwd: repoRoot,
            encoding: "utf8",
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
      } catch (err) {
        const stderr = String((err as { stderr?: Buffer | string }).stderr ?? "");
        if (/HTTP 401|HTTP 403|Bad credentials|Resource not accessible/i.test(stderr)) {
          return "denied";
        }
        if (/HTTP 404|Not Found/i.test(stderr)) {
          return "disabled";
        }
        return "unknown";
      }
      const trimmed = out.trim();
      if (trimmed === "true") return "enabled";
      return "unknown";
    },
  };
}

function readFlagOrEnv(args: readonly string[], flag: string, envName: string): string | undefined {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === flag) {
      const value = args[i + 1];
      if (value === undefined || value.startsWith("--")) return undefined;
      return value;
    }
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1) || undefined;
    }
  }
  return process.env[envName] || undefined;
}
