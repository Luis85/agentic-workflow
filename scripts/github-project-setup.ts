#!/usr/bin/env node
import {
  ProjectSetupProfile,
  applyGitHubProjectSetupPlan,
  buildGitHubProjectSetupPlan,
  renderGitHubProjectSetupPlan,
} from "./lib/github-project-setup.js";

type CliOptions = {
  repo?: string;
  projectName: string;
  profile: ProjectSetupProfile;
  includeP3: boolean;
  execute: boolean;
};

const options = parseArgs(process.argv.slice(2));
const plan = buildGitHubProjectSetupPlan({
  projectName: options.projectName,
  profile: options.profile,
  includeP3: options.includeP3,
});

if (!options.execute) {
  console.log(renderGitHubProjectSetupPlan(plan));
  console.log("Dry run only. Re-run with --execute --repo owner/name to create GitHub objects.");
  process.exit(0);
}

if (!options.repo) {
  console.error("github-project-setup: --repo owner/name is required with --execute");
  process.exit(1);
}

applyGitHubProjectSetupPlan(options.repo, plan);

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    projectName: "New Project",
    profile: "generic-product",
    includeP3: true,
    execute: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--repo") {
      options.repo = requireValue(args, ++index, arg);
      continue;
    }
    if (arg === "--project-name") {
      options.projectName = requireValue(args, ++index, arg);
      continue;
    }
    if (arg === "--profile") {
      const profile = requireValue(args, ++index, arg);
      if (profile !== "generic-product" && profile !== "obsidian-plugin") {
        console.error("github-project-setup: --profile must be generic-product or obsidian-plugin");
        process.exit(1);
      }
      options.profile = profile;
      continue;
    }
    if (arg === "--no-p3") {
      options.includeP3 = false;
      continue;
    }
    if (arg === "--execute") {
      options.execute = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.execute = false;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    console.error(`github-project-setup: unknown argument ${arg}`);
    printHelp();
    process.exit(1);
  }

  return options;
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    console.error(`github-project-setup: ${flag} requires a value`);
    process.exit(1);
  }
  return value;
}

function printHelp(): void {
  console.log(`Usage:
  npm run project:setup:github -- --project-name "Specorator" --profile obsidian-plugin --dry-run
  npm run project:setup:github -- --repo Luis85/specorator --project-name "Specorator" --profile obsidian-plugin --execute

Options:
  --repo owner/name            GitHub repository target. Required with --execute.
  --project-name name          Human-readable project/product name.
  --profile profile            generic-product or obsidian-plugin. Default: generic-product.
  --no-p3                      Skip P3.express initiation issues.
  --dry-run                    Print the plan without creating GitHub objects. Default.
  --execute                    Create labels, milestones, and issues with gh.
`);
}
