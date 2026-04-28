/**
 * Script task consumed by the shared Node task runner.
 *
 * @typedef {object} NodeTask
 * @property {string} name - npm script name used in reproduce output.
 * @property {string} label - Human-readable task label.
 * @property {string} script - Repository-relative Node script path.
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
    name: "check:links",
    label: "Markdown links",
    script: "scripts/check-markdown-links.js",
  },
  {
    name: "check:adr-index",
    label: "ADR index",
    script: "scripts/check-adr-index.js",
  },
  {
    name: "check:commands",
    label: "Command inventories",
    script: "scripts/check-command-docs.js",
  },
  {
    name: "check:script-docs",
    label: "Generated script docs",
    script: "scripts/check-script-docs.js",
  },
  {
    name: "check:frontmatter",
    label: "Frontmatter conventions",
    script: "scripts/check-frontmatter.js",
  },
  {
    name: "check:specs",
    label: "Spec workflow state",
    script: "scripts/check-spec-state.js",
  },
  {
    name: "check:traceability",
    label: "Traceability IDs",
    script: "scripts/check-traceability.js",
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
    script: "scripts/fix-adr-index.js",
  },
  {
    name: "fix:commands",
    label: "Command inventories",
    script: "scripts/fix-command-docs.js",
  },
  {
    name: "fix:script-docs",
    label: "Generated script docs",
    script: "scripts/fix-script-docs.js",
  },
];
