/**
 * Script task consumed by the shared Node task runner.
 *
 * @typedef {object} NodeTask
 * @property {string} name - npm script name used in reproduce output.
 * @property {string} label - Human-readable task label.
 * @property {string} [script] - Repository-relative TypeScript script path.
 * @property {string[]} [command] - Command and arguments to execute directly.
 * @property {boolean} [jsonDiagnostics] - Whether CI may request `--json` and emit GitHub Actions annotations.
 */

/**
 * Read-only checks executed by `npm run verify`.
 *
 * Keep this list in the order checks should fail during local iteration: cheap
 * generated-output checks first, broader consistency checks last.
 *
 * @type {NodeTask[]}
 */
export const checkTasks = [
  {
    name: "typecheck:scripts",
    label: "Script TypeScript types",
    command: ["npm", "run", "typecheck:scripts"],
  },
  {
    name: "test:scripts",
    label: "Script unit tests",
    command: ["npm", "run", "test:scripts"],
  },
  {
    name: "check:automation-registry",
    label: "Automation registry",
    script: "scripts/check-automation-registry.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:agents",
    label: "Agent artifacts",
    script: "scripts/check-agents.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:links",
    label: "Markdown links",
    script: "scripts/check-markdown-links.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:adr-index",
    label: "ADR index",
    script: "scripts/check-adr-index.ts",
  },
  {
    name: "check:commands",
    label: "Command inventories",
    script: "scripts/check-command-docs.ts",
  },
  {
    name: "check:script-docs",
    label: "Generated script docs",
    script: "scripts/check-script-docs.ts",
  },
  {
    name: "check:workflow-docs",
    label: "Workflow documentation contract",
    script: "scripts/check-workflow-docs.ts",
  },
  {
    name: "check:product-page",
    label: "Product page",
    script: "scripts/check-product-page.ts",
  },
  {
    name: "check:sites-tokens-mirror",
    label: "Sites tokens mirror",
    script: "scripts/check-sites-tokens-mirror.ts",
  },
  {
    name: "check:frontmatter",
    label: "Frontmatter conventions",
    script: "scripts/check-frontmatter.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:obsidian",
    label: "Obsidian Markdown compatibility",
    script: "scripts/check-obsidian.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:obsidian-assets",
    label: "Obsidian vault assets",
    script: "scripts/check-obsidian-assets.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:specs",
    label: "Spec workflow state",
    script: "scripts/check-spec-state.ts",
  },
  {
    name: "check:roadmaps",
    label: "Roadmap state",
    script: "scripts/check-roadmaps.ts",
    jsonDiagnostics: true,
  },
  {
    name: "check:traceability",
    label: "Traceability IDs",
    script: "scripts/check-traceability.ts",
  },
  {
    name: "check:token-budget",
    label: "Token budget caps",
    script: "scripts/check-token-budget.ts",
  },
];

/**
 * Fast local iteration gate for script and automation-contract changes.
 *
 * @type {NodeTask[]}
 */
export const fastCheckTasks = checkTasks.filter((task) =>
  ["typecheck:scripts", "test:scripts", "check:automation-registry", "check:agents"].includes(task.name),
);

/**
 * Content integrity checks for Markdown and generated documentation drift.
 *
 * @type {NodeTask[]}
 */
export const contentCheckTasks = checkTasks.filter((task) =>
  [
    "check:links",
    "check:adr-index",
    "check:commands",
    "check:script-docs",
    "check:workflow-docs",
    "check:product-page",
    "check:frontmatter",
    "check:obsidian",
    "check:obsidian-assets",
  ].includes(task.name),
);

/**
 * Workflow consistency checks for state, roadmap, traceability, and agent contracts.
 *
 * @type {NodeTask[]}
 */
export const workflowCheckTasks = checkTasks.filter((task) =>
  [
    "check:automation-registry",
    "check:agents",
    "check:workflow-docs",
    "check:specs",
    "check:roadmaps",
    "check:traceability",
  ].includes(task.name),
);

/**
 * Deterministic repair tasks executed by `npm run fix`.
 *
 * @type {NodeTask[]}
 */
export const fixTasks = [
  {
    name: "fix:obsidian",
    label: "Obsidian Markdown compatibility",
    script: "scripts/fix-obsidian.ts",
  },
  {
    name: "fix:adr-index",
    label: "ADR index",
    script: "scripts/fix-adr-index.ts",
  },
  {
    name: "fix:commands",
    label: "Command inventories",
    script: "scripts/fix-command-docs.ts",
  },
  {
    name: "fix:script-docs",
    label: "Generated script docs",
    script: "scripts/fix-script-docs.ts",
  },
  {
    name: "fix:sites-tokens",
    label: "Sites tokens mirror",
    script: "scripts/fix-sites-tokens.ts",
  },
];
