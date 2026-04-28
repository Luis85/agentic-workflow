/**
 * Script task consumed by the shared Node task runner.
 *
 * @typedef {object} NodeTask
 * @property {string} name - npm script name used in reproduce output.
 * @property {string} label - Human-readable task label.
 * @property {string} [script] - Repository-relative TypeScript script path.
 * @property {string[]} [command] - Command and arguments to execute directly.
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
    name: "check:links",
    label: "Markdown links",
    script: "scripts/check-markdown-links.ts",
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
    name: "check:frontmatter",
    label: "Frontmatter conventions",
    script: "scripts/check-frontmatter.ts",
  },
  {
    name: "check:specs",
    label: "Spec workflow state",
    script: "scripts/check-spec-state.ts",
  },
  {
    name: "check:traceability",
    label: "Traceability IDs",
    script: "scripts/check-traceability.ts",
  },
];

/**
 * Deterministic repair tasks executed by `npm run fix`.
 *
 * @type {NodeTask[]}
 */
export const fixTasks = [
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
];
