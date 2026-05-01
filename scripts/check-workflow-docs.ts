import path from "node:path";
import { failIfErrors, readText, repoRoot } from "./lib/repo.js";

type RequiredMention = {
  file: string;
  text: string;
  label: string;
};

const requiredMentions: RequiredMention[] = [
  {
    file: "AGENTS.md",
    text: ".codex/README.md",
    label: "Codex workflow pointer",
  },
  {
    file: ".codex/instructions.md",
    text: ".worktrees/<slug>/",
    label: "Codex worktree convention",
  },
  {
    file: ".codex/workflows/pr-delivery.md",
    text: "npm run verify",
    label: "PR delivery verify command",
  },
  {
    file: "docs/branching.md",
    text: ".codex/workflows/pr-delivery.md",
    label: "branching to Codex PR workflow link",
  },
  {
    file: "docs/verify-gate.md",
    text: "npm run verify",
    label: "template verify command",
  },
  {
    file: ".github/PULL_REQUEST_TEMPLATE.md",
    text: "`npm run verify`",
    label: "PR checklist verify item",
  },
];

const requiredPackageScripts = [
  "doctor",
  "verify",
  "verify:json",
  "verify:changed",
  "typecheck:scripts",
  "test:scripts",
  "check:fast",
  "check:content",
  "check:workflow",
  "check:automation-registry",
  "check:agents",
  "check:links",
  "check:roadmaps",
  "check:workflow-docs",
  "fix",
];

const errors: string[] = [];

for (const mention of requiredMentions) {
  const text = readText(path.join(repoRoot, mention.file));
  if (!text.includes(mention.text)) {
    errors.push(`${mention.file}:1 missing ${mention.label}: ${mention.text}`);
  }
}

const packageJson = JSON.parse(readText(path.join(repoRoot, "package.json"))) as {
  scripts?: Record<string, string>;
};

for (const script of requiredPackageScripts) {
  if (!packageJson.scripts?.[script]) {
    errors.push(`package.json:1 missing npm script: ${script}`);
  }
}

failIfErrors(errors, "check:workflow-docs");
