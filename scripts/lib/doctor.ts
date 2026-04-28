import fs from "node:fs";
import path from "node:path";

export type CheckStatus = "pass" | "warn" | "fail";

export type CheckResult = {
  name: string;
  status: CheckStatus;
  detail: string;
  hint?: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

type WorkflowContract = {
  name: string;
  filePath: string;
  requiredMarkers: string[];
  hint: string;
};

const workflowContracts: WorkflowContract[] = [
  {
    name: "verify workflow",
    filePath: ".github/workflows/verify.yml",
    requiredMarkers: ["actions/checkout", "actions/setup-node", "cache: npm", "npm ci", "npm run verify"],
    hint: "restore the verify workflow contract so CI mirrors the local verify gate",
  },
  {
    name: "pages workflow",
    filePath: ".github/workflows/pages.yml",
    requiredMarkers: [
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
  if (missingMarkers.length > 0) {
    return {
      name: contract.name,
      status: "fail",
      detail: `${contract.filePath} missing ${missingMarkers.join(", ")}`,
      hint: contract.hint,
    };
  }

  return {
    name: contract.name,
    status: "pass",
    detail: `${contract.filePath} ready`,
  };
}
