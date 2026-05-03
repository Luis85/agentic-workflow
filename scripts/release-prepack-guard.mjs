// Prepack guard — refuses `npm pack` / `npm publish` of
// `@luis85/agentic-workflow` from the repo root.
//
// Background: top-level `.npmignore` cannot remove paths that
// `package.json#files` explicitly includes, so bare `npm pack` from the repo
// root would ship numbered ADRs in violation of ADR-0021 / SPEC-V05-010.
// `npm run build:release-archive` writes a `.release-staging-marker` file at
// the root of the produced staging directory; this guard checks the cwd for
// that marker before allowing the pack to proceed.
//
// Plain ESM (.mjs) so the script runs under bare `node` without `tsx` —
// `npm pack ./.release-staging` runs prepack from the staged dir which has no
// `node_modules`.
//
// The guard is a no-op for any other package name so a downstream consumer
// who copies this template into a renamed package does not inherit the
// upstream-only constraint.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PACKAGE_NAME = "@luis85/agentic-workflow";
const STAGING_MARKER_FILE = ".release-staging-marker";

const cwd = process.cwd();

let pkgName;
try {
  const pkg = JSON.parse(readFileSync(path.join(cwd, "package.json"), "utf8"));
  pkgName = pkg.name;
} catch {
  // No package.json in cwd is unusual for a prepack invocation; treat as
  // "not the upstream package" and let npm decide.
  process.exit(0);
}

if (pkgName !== PACKAGE_NAME) process.exit(0);
if (existsSync(path.join(cwd, STAGING_MARKER_FILE))) process.exit(0);

console.error(
  [
    `release-prepack-guard: refusing to pack ${PACKAGE_NAME} from \`${cwd}\``,
    `— the repo root is not a publishable package surface.`,
    ``,
    `The release archive ships the build-time transform (T-V05-013):`,
    `numbered ADRs filtered, every \`docs/**/*.md\` page replaced with the stub form.`,
    ``,
    `Pack from the staged tree instead:`,
    `  npm run build:release-archive`,
    `  npm pack ./.release-staging`,
  ].join("\n"),
);
process.exit(1);
