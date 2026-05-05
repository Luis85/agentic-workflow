#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";
import path from "node:path";
import { findRepoRoot } from "./lib/repo.js";
import { checkTasks, fixTasks } from "./lib/tasks.js";

const VERSION = "0.5.1";

// Full command registry: tasks + top-level aggregate commands
const COMMANDS: Record<string, { description: string; script?: string; aggregate?: string }> = {
  verify: { description: "Run the full verify gate (typecheck → tests → all checks)" },
  "check:fast": { description: "Fast subset: typecheck, tests, automation registry, agents" },
  "check:content": { description: "Content checks: links, ADR index, commands, docs, product page" },
  "check:workflow": { description: "Domain checks: specs, roadmaps, traceability, agents" },
  "self-check": { description: "Quality self-review of the template", script: "scripts/self-check.ts" },
  doctor: { description: "Diagnose common repository setup issues", script: "scripts/doctor.ts" },
  "quality:metrics": { description: "Emit deterministic quality KPIs", script: "scripts/quality-metrics.ts" },
  "roadmap:digest": { description: "Produce a roadmap digest report", script: "scripts/roadmap-digest.ts" },
  "roadmap:evidence": { description: "Produce roadmap evidence links", script: "scripts/roadmap-evidence.ts" },
  fix: { description: "Run all deterministic generated-content fixers" },
  ...Object.fromEntries(
    fixTasks.map((t) => [t.name, { description: t.label, script: t.script }]),
  ),
  ...Object.fromEntries(
    checkTasks
      .filter((t) => t.script)
      .map((t) => [t.name, { description: t.label, script: t.script }]),
  ),
};

function printHelp(): void {
  console.log(`specorator v${VERSION} — Specorator workflow CLI\n`);
  console.log("Usage:");
  console.log("  specorator <subcommand> [options]");
  console.log("  specorator --help\n");
  console.log("Global flags:");
  console.log("  --cwd <path>    Treat <path> as the project root (overrides walk-up discovery)\n");
  console.log("Subcommands:");
  const maxLen = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  for (const [name, meta] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(maxLen + 2)}${meta.description}`);
  }
  console.log("\nRun `specorator <subcommand> --help` for subcommand-specific options.");
}

function main(): void {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  // Extract global --cwd flag
  let cwd: string | undefined;
  const filteredArgv: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--cwd" && i + 1 < argv.length) {
      cwd = argv[++i];
    } else {
      filteredArgv.push(argv[i]!);
    }
  }

  const subcommand = filteredArgv[0];
  const rest = filteredArgv.slice(1);

  if (!subcommand || !(subcommand in COMMANDS)) {
    if (subcommand) {
      console.error(`specorator: unknown subcommand '${subcommand}'\n`);
    }
    printHelp();
    process.exit(1);
  }

  // Resolve project root and inject as env var so all child scripts pick it up
  let repoRoot: string;
  try {
    repoRoot = findRepoRoot(cwd);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const env = { ...process.env, SPECORATOR_ROOT: repoRoot };

  // Aggregate commands delegate to npm run so they reuse the existing orchestration
  const aggregates: Record<string, string> = {
    verify: "verify",
    "check:fast": "check:fast",
    "check:content": "check:content",
    "check:workflow": "check:workflow",
    fix: "fix",
  };

  if (subcommand in aggregates) {
    const npmScript = aggregates[subcommand]!;
    const result = spawnSync("npm", ["run", npmScript, "--", ...rest], {
      stdio: "inherit",
      cwd: repoRoot,
      env,
      windowsHide: true,
    });
    process.exit(result.status ?? 1);
  }

  // Script-backed commands: spawn tsx directly
  const meta = COMMANDS[subcommand]!;
  if (!meta.script) {
    console.error(`specorator: subcommand '${subcommand}' has no script entry`);
    process.exit(1);
  }

  const scriptPath = path.join(repoRoot, meta.script);
  const result = spawnSync("tsx", [scriptPath, ...rest], {
    stdio: "inherit",
    cwd: repoRoot,
    env,
    windowsHide: true,
  });
  process.exit(result.status ?? 1);
}

main();
