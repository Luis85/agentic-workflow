import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  collectRoadmapDigest,
  linkedArtifactPathsFromStrategy,
  renderRoadmapDigest,
  renderRoadmapEvidence,
  summarizeEvidenceArtifact,
  validateRoadmapStateData,
} from "../../scripts/lib/roadmaps.js";
import { repoRoot } from "../../scripts/lib/repo.js";

test("roadmap state validation accepts ISO review dates and pending documents", () => {
  const diagnostics = validateRoadmapStateData(
    "roadmaps/product/roadmap-state.md",
    "product",
    validState(),
    ".",
  );

  assert.deepEqual(diagnostics, []);
});

test("roadmap state validation rejects cadence text in next_review", () => {
  const diagnostics = validateRoadmapStateData(
    "roadmaps/product/roadmap-state.md",
    "product",
    { ...validState(), next_review: "weekly Monday" },
    ".",
  );

  assert.equal(diagnostics.some((diagnostic) => diagnostic.code === "ROADMAP_STATE_DATE"), true);
});

test("roadmap state validation rejects blank scalar fields parsed as empty objects", () => {
  const diagnostics = validateRoadmapStateData(
    "roadmaps/product/roadmap-state.md",
    "product",
    { ...validState(), last_agent: {} },
    ".",
  );

  assert.equal(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "ROADMAP_STATE_KEY" && diagnostic.message === "missing frontmatter key: last_agent",
    ),
    true,
  );
});

test("roadmap state validation checks required document keys and statuses", () => {
  const diagnostics = validateRoadmapStateData(
    "roadmaps/product/roadmap-state.md",
    "product",
    {
      ...validState(),
      documents: {
        strategy: "done",
        board: "pending",
      },
    },
    ".",
  );

  assert.equal(diagnostics.some((diagnostic) => diagnostic.code === "ROADMAP_STATE_DOCUMENT_STATUS"), true);
  assert.equal(diagnostics.some((diagnostic) => diagnostic.message.includes("documents missing delivery_plan")), true);
});

test("roadmap evidence extracts linked artifact paths from strategy markdown", () => {
  const paths = linkedArtifactPathsFromStrategy(`
| Type | Path | Why |
|---|---|---|
| spec | \`specs/auth/workflow-state.md\` | state |
| project | \`projects/client/deliverables-map.md\` | delivery |
| ignored | \`templates/roadmap-state-template.md\` | template |
| duplicate | \`specs/auth/workflow-state.md\` | duplicate |
| traversal | \`specs/../../../../tmp/secret.md\` | unsafe |
`);

  assert.deepEqual(paths, ["projects/client/deliverables-map.md", "specs/auth/workflow-state.md"]);
});

test("roadmap evidence rejects path traversal before filesystem reads", () => {
  const artifact = summarizeEvidenceArtifact("specs/../../../../tmp/secret.md");

  assert.equal(artifact.exists, false);
  assert.equal(artifact.kind, "invalid-artifact");
  assert.equal(artifact.summary, "Rejected unsafe linked artifact path.");
});

test("roadmap evidence summarizes missing linked artifacts", () => {
  const artifact = summarizeEvidenceArtifact("specs/not-a-real-feature/workflow-state.md");

  assert.equal(artifact.exists, false);
  assert.equal(artifact.kind, "feature-state");
  assert.equal(artifact.summary, "Missing linked artifact.");
});

test("roadmap evidence renderer includes warnings", () => {
  const markdown = renderRoadmapEvidence({
    roadmap: "product",
    strategyPath: "roadmaps/product/roadmap-strategy.md",
    generatedAt: "2026-04-29T00:00:00.000Z",
    linkedArtifacts: ["specs/missing/workflow-state.md"],
    artifacts: [
      {
        path: "specs/missing/workflow-state.md",
        exists: false,
        kind: "feature-state",
        title: "workflow-state.md",
        summary: "Missing linked artifact.",
      },
    ],
    warnings: ["specs/missing/workflow-state.md is linked but missing"],
  });

  assert.match(markdown, /Roadmap evidence - product/);
  assert.match(markdown, /specs\/missing\/workflow-state\.md is linked but missing/);
});

test("roadmap digest generates an audience-specific draft from roadmap artifacts", () => {
  const slug = "test-digest-roadmap";
  const roadmapDir = path.join(repoRoot, "roadmaps", slug);
  fs.rmSync(roadmapDir, { recursive: true, force: true });
  fs.mkdirSync(roadmapDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(roadmapDir, "roadmap-strategy.md"),
      [
        "# Strategy",
        "",
        "## Outcomes",
        "",
        "- Reduce onboarding uncertainty for delivery teams.",
        "",
        "## Audiences",
        "",
        "- Leadership needs trade-off visibility.",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(roadmapDir, "roadmap-board.md"),
      [
        "# Board",
        "",
        "## Now",
        "",
        "| Item | Outcome |",
        "|---|---|",
        "| State checker | Roadmaps are verifiable. |",
        "",
        "## Next",
        "",
        "- Communication digest for stakeholder updates.",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(roadmapDir, "delivery-plan.md"),
      [
        "# Delivery",
        "",
        "## Risks",
        "",
        "- External updates must not imply commitments.",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(roadmapDir, "stakeholder-map.md"),
      [
        "# Stakeholders",
        "",
        "## Leadership",
        "",
        "- Needs decisions, risk, and investment signal.",
      ].join("\n"),
      "utf8",
    );

    const report = collectRoadmapDigest(slug, "leadership");
    const markdown = renderRoadmapDigest(report);

    assert.equal(report.audience, "leadership");
    assert.equal(report.strategyMissing, false);
    assert.equal(report.strategyPath, "roadmaps/test-digest-roadmap/roadmap-strategy.md");
    assert.deepEqual(report.warnings, []);
    assert.equal(report.emphasis.includes("trade-offs"), true);
    assert.equal(report.sections.some((section) => section.title === "Now"), true);
    assert.match(markdown, /Roadmap digest - test-digest-roadmap/);
    assert.match(markdown, /Needs decisions, risk, and investment signal/);
  } finally {
    fs.rmSync(roadmapDir, { recursive: true, force: true });
  }
});

test("roadmap digest rejects unsafe roadmap slugs before filesystem reads", () => {
  const report = collectRoadmapDigest("../test-digest-roadmap", "leadership");

  assert.equal(report.strategyMissing, true);
  assert.deepEqual(report.sources, []);
  assert.deepEqual(report.sections, []);
  assert.equal(
    report.warnings.includes("Invalid roadmap slug. Use a kebab-case folder name without path separators."),
    true,
  );
});

test("roadmap digest reports missing strategy through structured state", () => {
  const report = collectRoadmapDigest("missing-roadmap", "leadership");

  assert.equal(report.strategyMissing, true);
  assert.equal(report.strategyPath, "roadmaps/missing-roadmap/roadmap-strategy.md");
  assert.equal(report.warnings.includes("roadmaps/missing-roadmap/roadmap-strategy.md is missing"), true);
});

function validState(): Record<string, unknown> {
  return {
    roadmap: "product",
    status: "active",
    scope_type: "mixed",
    last_review: "2026-04-28",
    next_review: "2026-05-28",
    last_updated: "2026-04-28",
    last_agent: "roadmap-manager",
    documents: {
      strategy: "pending",
      board: "pending",
      delivery_plan: "pending",
      stakeholders: "pending",
      communication_log: "pending",
      decision_log: "pending",
    },
  };
}
