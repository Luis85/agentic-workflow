import fs from "node:fs";
import path from "node:path";

export type CheckStatus = "pass" | "warn" | "fail";

export type CheckResult = {
  name: string;
  status: CheckStatus;
  detail: string;
  hint?: string;
};

export type BranchReadinessInput = {
  branchName: string;
  upstreamName: string;
  ahead: number;
  behind: number;
};

export type WorktreeHygieneInput = {
  registeredWorktrees: string[];
  worktreeDirectories: string[];
  mergedBranches: string[];
  currentBranch: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

type WorkflowPattern = {
  description: string;
  pattern: RegExp;
};

type WorkflowContract = {
  name: string;
  filePath: string;
  requiredMarkers: string[];
  requiredPatterns?: WorkflowPattern[];
  hint: string;
};

const workflowContracts: WorkflowContract[] = [
  {
    name: "verify workflow",
    filePath: ".github/workflows/verify.yml",
    requiredMarkers: [
      "pull_request:",
      "push:",
      "actions/checkout",
      "actions/setup-node",
      "cache: npm",
      "npm ci",
      "npm run verify",
    ],
    requiredPatterns: [
      {
        description: "push trigger covers main branch",
        pattern: /push:\s*[\s\S]*?branches:[\s\S]*?-\s*main\b/,
      },
      { description: "actions/checkout SHA-pinned", pattern: /actions\/checkout@[0-9a-f]{40}\b/ },
      { description: "actions/setup-node SHA-pinned", pattern: /actions\/setup-node@[0-9a-f]{40}\b/ },
    ],
    hint: "restore the verify workflow contract so CI mirrors the local verify gate (see docs/pr-ci-gate.md)",
  },
  {
    name: "pages workflow",
    filePath: ".github/workflows/pages.yml",
    requiredMarkers: [
      "actions/checkout",
      "actions/configure-pages",
      "actions/upload-pages-artifact",
      "actions/deploy-pages",
      "path: sites",
    ],
    hint: "restore the Pages workflow so the product page can deploy from sites/",
  },
];

/**
 * Check whether local dependencies are installed consistently with package metadata.
 *
 * @param {string} root - Repository root to inspect.
 * @returns {CheckResult} Dependency readiness result.
 */
export function dependencyReadinessCheck(root: string): CheckResult {
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(packagePath)) {
    return {
      name: "dependencies",
      status: "fail",
      detail: "package.json missing",
      hint: "restore package.json before running repository scripts",
    };
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as PackageJson;
  const dependencyCount = ["dependencies", "devDependencies", "optionalDependencies"]
    .flatMap((key) => Object.keys(packageJson[key as keyof PackageJson] || {}))
    .length;
  if (dependencyCount === 0) return { name: "dependencies", status: "pass", detail: "no external packages" };

  const hasNodeModules = fs.existsSync(path.join(root, "node_modules"));
  const hasLockfile = fs.existsSync(path.join(root, "package-lock.json"));

  if (!hasLockfile) {
    return {
      name: "dependencies",
      status: "warn",
      detail: "package-lock.json missing",
      hint: "run npm install to recreate the lockfile, then review the diff",
    };
  }

  if (!hasNodeModules) {
    return {
      name: "dependencies",
      status: "warn",
      detail: "node_modules missing; package-lock.json present",
      hint: "run npm ci",
    };
  }

  return { name: "dependencies", status: "pass", detail: "node_modules and package-lock.json present" };
}

/**
 * Check whether repository GitHub workflows expose the expected automation contract.
 *
 * @param {string} root - Repository root to inspect.
 * @returns {CheckResult[]} Workflow readiness results.
 */
export function workflowReadinessChecks(root: string): CheckResult[] {
  return workflowContracts.map((contract) => workflowReadinessCheck(root, contract));
}

/**
 * Check whether the current branch is fresh enough to start or resume work.
 *
 * @param input - Current branch, upstream, and ahead/behind counts.
 * @returns Branch readiness result.
 */
export function branchReadinessCheck(input: BranchReadinessInput): CheckResult {
  const { branchName, upstreamName, ahead, behind } = input;
  const detail = `${branchName} -> ${upstreamName}`;
  const integrationBranch = branchName === "main" || branchName === "develop";

  if (integrationBranch && ahead > 0) {
    return {
      name: "branch",
      status: "fail",
      detail: `${detail}; ahead ${ahead}`,
      hint: `preserve any work on a topic branch, then reset ${branchName} only after confirming it is safe`,
    };
  }

  if (behind > 0) {
    return {
      name: "branch",
      status: "warn",
      detail: `${detail}; behind ${behind}`,
      hint: integrationBranch ? `run git pull --ff-only` : `merge or recreate from ${upstreamName} before depending on latest changes`,
    };
  }

  if (ahead > 0) {
    return {
      name: "branch",
      status: "warn",
      detail: `${detail}; ahead ${ahead}`,
      hint: "push or review local commits before handing off the branch",
    };
  }

  return { name: "branch", status: "pass", detail };
}

/**
 * Check whether .worktrees/ matches git's registered worktree state.
 *
 * @param input - Registered worktrees, filesystem directories, and merged local branches.
 * @returns Worktree hygiene result.
 */
export function worktreeHygieneCheck(input: WorktreeHygieneInput): CheckResult {
  const registeredNames = new Set(input.registeredWorktrees.map((entry) => normalizeWorktreeName(entry)).filter(Boolean));
  const unregisteredDirectories = input.worktreeDirectories.filter((directory) => !registeredNames.has(directory));
  const staleBranches = input.mergedBranches.filter(
    (branch) => branch !== input.currentBranch && branch !== "main" && branch !== "develop",
  );

  const warnings = [
    ...unregisteredDirectories.map((directory) => `.worktrees/${directory} is not registered`),
    ...staleBranches.map((branch) => `${branch} is already merged into origin/main`),
  ];

  if (warnings.length > 0) {
    return {
      name: "worktrees",
      status: "warn",
      detail: `${input.registeredWorktrees.length} registered; ${warnings.length} hygiene warning(s)`,
      hint: `${warnings.join("; ")}. After merged PRs are confirmed, remove stale worktrees/branches with the cleanup workflow.`,
    };
  }

  return { name: "worktrees", status: "pass", detail: `${input.registeredWorktrees.length} registered` };
}

function workflowReadinessCheck(root: string, contract: WorkflowContract): CheckResult {
  const absolutePath = path.join(root, contract.filePath);
  if (!fs.existsSync(absolutePath)) {
    return {
      name: contract.name,
      status: "fail",
      detail: `${contract.filePath} missing`,
      hint: contract.hint,
    };
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const missingMarkers = contract.requiredMarkers.filter((marker) => !text.includes(marker));
  const missingPatterns = (contract.requiredPatterns ?? []).filter((entry) => !entry.pattern.test(text));
  const missing = [...missingMarkers, ...missingPatterns.map((entry) => entry.description)];
  if (missing.length > 0) {
    return {
      name: contract.name,
      status: "fail",
      detail: `${contract.filePath} missing ${missing.join(", ")}`,
      hint: contract.hint,
    };
  }

  return {
    name: contract.name,
    status: "pass",
    detail: `${contract.filePath} ready`,
  };
}

function normalizeWorktreeName(worktreePath: string): string {
  return path.basename(worktreePath.replace(/[/\\]$/, ""));
}
