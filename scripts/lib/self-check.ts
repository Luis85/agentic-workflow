import { spawnSync } from "node:child_process";
import path from "node:path";
import type { CheckResult, Diagnostic } from "./diagnostics.js";
import { formatDiagnostic } from "./diagnostics.js";
import { collectQualityMetrics, renderQualityMetrics, type QualityMetrics } from "./quality-metrics.js";
import { relativeToRoot, repoRoot, walkFiles } from "./repo.js";

export type SelfCheckToolResult = {
  name: string;
  command: string;
  status: "pass" | "fail";
  results?: CheckResult[];
  diagnostics: Diagnostic[];
};

export type SelfCheckLearningSignals = {
  retrospectiveCount: number;
  latestRetrospectives: string[];
  qualityReviewCount: number;
  adrCount: number;
};

export type SelfCheckReport = {
  generatedAt: string;
  status: "pass" | "warn" | "fail";
  summary: string;
  tools: SelfCheckToolResult[];
  metrics: QualityMetrics;
  learning: SelfCheckLearningSignals;
  recommendations: string[];
};

export type SelfCheckOptions = {
  feature?: string;
  runner?: (command: string, args: string[]) => { status: number | null; stdout: string; stderr: string };
};

const noMaturityGapsMessage = "No maturity gaps detected for this level.";

type VerifyJsonOutput = {
  check: string;
  status: "pass" | "fail";
  results: CheckResult[];
};

/**
 * Run a repository self-check that combines deterministic automation output
 * with workflow quality and learning signals.
 *
 * @param options - Optional feature scope and command runner injection.
 * @returns Structured self-check report for local tools, agents, or CI adapters.
 */
export function collectSelfCheckReport(options: SelfCheckOptions = {}): SelfCheckReport {
  const metrics = collectQualityMetrics({ feature: options.feature });
  const verify = runVerifyJson(options.runner || defaultRunner);
  const learning = collectLearningSignals();
  const recommendations = selfCheckRecommendations(verify, metrics, learning);
  const status = verify.status === "fail" ? "fail" : recommendations.length > 0 ? "warn" : "pass";

  return {
    generatedAt: new Date().toISOString(),
    status,
    summary: selfCheckSummary(status, verify, metrics, learning),
    tools: [verify],
    metrics,
    learning,
    recommendations,
  };
}

/**
 * Render a self-check report as Markdown for humans.
 *
 * @param report - Report returned by {@link collectSelfCheckReport}.
 * @returns Markdown quality review.
 */
export function renderSelfCheckReport(report: SelfCheckReport): string {
  const lines = [
    `# Self-check - ${report.metrics.scope}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    "",
    "## Summary",
    "",
    report.summary,
    "",
    "## Tool results",
    "",
    "| Tool | Status | Rerun |",
    "|---|---|---|",
    ...report.tools.map((tool) => `| ${tool.name} | ${tool.status} | \`${tool.command}\` |`),
    "",
  ];

  for (const tool of report.tools.filter((tool) => tool.diagnostics.length > 0)) {
    lines.push(`### ${tool.name} diagnostics`, "");
    for (const diagnostic of tool.diagnostics.slice(0, 10)) lines.push(`- ${formatDiagnostic(diagnostic)}`);
    if (tool.diagnostics.length > 10) lines.push(`- ...and ${tool.diagnostics.length - 10} more.`);
    lines.push("");
  }

  lines.push(
    "## Learning signals",
    "",
    `- Retrospectives: ${report.learning.retrospectiveCount}`,
    `- Quality reviews: ${report.learning.qualityReviewCount}`,
    `- ADRs: ${report.learning.adrCount}`,
    `- Latest retrospectives: ${report.learning.latestRetrospectives.join(", ") || "None."}`,
    "",
    "## Recommendations",
    "",
    ...renderList(report.recommendations),
    "",
    renderQualityMetrics(report.metrics).trimEnd(),
    "",
  );

  return `${lines.join("\n")}\n`;
}

function runVerifyJson(
  runner: NonNullable<SelfCheckOptions["runner"]>,
): SelfCheckToolResult {
  const command = "npm run verify:json";
  const result = runner("npm", ["run", "verify:json"]);
  const parsed = parseVerifyJson(result.stdout);

  if (parsed) {
    const diagnostics = parsed.results.flatMap((check) => check.errors.map((error) => ({ ...error, rerun: error.rerun || check.rerun })));
    return {
      name: parsed.check,
      command,
      status: parsed.status,
      results: parsed.results,
      diagnostics,
    };
  }

  const output = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
  return {
    name: "verify",
    command,
    status: "fail",
    diagnostics: [
      {
        code: "SELF_VERIFY_JSON",
        message: output.split(/\r?\n/).find((line) => line.trim()) || "verify:json did not emit parseable JSON",
        rerun: command,
      },
    ],
  };
}

function collectLearningSignals(): SelfCheckLearningSignals {
  const retrospectives = walkFiles("specs", (file) => path.basename(file) === "retrospective.md")
    .map(relativeToRoot)
    .sort();
  const qualityReviews = walkFiles("quality", (file) => path.basename(file) === "quality-state.md");
  const adrs = walkFiles("docs/adr", (file) => /^0\d{3}-.+\.md$/.test(path.basename(file)));

  return {
    retrospectiveCount: retrospectives.length,
    latestRetrospectives: retrospectives.slice(-5),
    qualityReviewCount: qualityReviews.length,
    adrCount: adrs.length,
  };
}

function selfCheckRecommendations(
  verify: SelfCheckToolResult,
  metrics: QualityMetrics,
  learning: SelfCheckLearningSignals,
): string[] {
  const recommendations: string[] = [];

  if (verify.status === "fail") {
    recommendations.push(`Fix the failing deterministic gate first: \`${verify.command}\`.`);
  }
  if (metrics.summary.workflowCount === 0) {
    recommendations.push("Create or import workflow-state evidence before using the template for delivery governance.");
  }
  if (metrics.summary.overallScore < 80 && metrics.summary.workflowCount > 0) {
    recommendations.push(`Improve workflow evidence; current overall workflow score is ${metrics.summary.overallScore.toFixed(1)}%.`);
  }
  for (const gap of actionableMaturityGaps(metrics.summary.maturity.gaps).slice(0, 3)) recommendations.push(gap);
  if (metrics.signals.activeBlockers.length > 0) {
    recommendations.push(`Resolve active workflow blockers: ${metrics.signals.activeBlockers.slice(0, 3).join(", ")}.`);
  }
  if (metrics.signals.openClarifications.length > 0) {
    recommendations.push(`Close or explicitly carry forward open clarifications: ${metrics.signals.openClarifications.slice(0, 3).join(", ")}.`);
  }
  if (learning.retrospectiveCount === 0) {
    recommendations.push("Run or import at least one retrospective so workflow learning is visible to future users and agents.");
  }

  return [...new Set(recommendations)];
}

function selfCheckSummary(
  status: SelfCheckReport["status"],
  verify: SelfCheckToolResult,
  metrics: QualityMetrics,
  learning: SelfCheckLearningSignals,
): string {
  return [
    `Self-check ${status}.`,
    `Deterministic gate: ${verify.status}.`,
    `Workflow score: ${metrics.summary.overallScore.toFixed(1)}%.`,
    `Maturity: L${metrics.summary.maturity.level} ${metrics.summary.maturity.name}.`,
    `Learning evidence: ${learning.retrospectiveCount} retrospective(s), ${learning.qualityReviewCount} quality review(s), ${learning.adrCount} ADR(s).`,
  ].join(" ");
}

/**
 * Return only maturity gaps that require follow-up action.
 *
 * @param gaps - Maturity gap messages returned by quality metrics.
 * @returns Actionable gap messages, excluding the healthy placeholder.
 */
export function actionableMaturityGaps(gaps: string[]): string[] {
  return gaps.filter((gap) => gap !== noMaturityGapsMessage);
}

function parseVerifyJson(raw: string): VerifyJsonOutput | null {
  const trimmed = raw.trim();
  const text = trimmed.startsWith("{") ? trimmed : trimmed.slice(Math.max(0, trimmed.indexOf("{")));
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as Partial<VerifyJsonOutput>;
    if (
      typeof parsed.check !== "string" ||
      (parsed.status !== "pass" && parsed.status !== "fail") ||
      !Array.isArray(parsed.results)
    ) {
      return null;
    }
    return parsed as VerifyJsonOutput;
  } catch {
    return null;
  }
}

function defaultRunner(command: string, args: string[]): { status: number | null; stdout: string; stderr: string } {
  const invocation =
    command === "npm" && process.env.npm_execpath
      ? { command: process.execPath, args: [process.env.npm_execpath, ...args] }
      : { command: command === "npm" && process.platform === "win32" ? "npm.cmd" : command, args };
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
  });
  return {
    status: result.status,
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || result.error?.message || ""),
  };
}

function renderList(values: string[]): string[] {
  return values.length === 0 ? ["- None."] : values.map((value) => `- ${value}`);
}
