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
    name: "check:frontmatter",
    label: "Frontmatter conventions",
    script: "scripts/check-frontmatter.js",
  },
  {
    name: "check:specs",
    label: "Spec workflow state",
    script: "scripts/check-spec-state.js",
  },
];

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
];
