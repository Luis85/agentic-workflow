import test from "node:test";
import assert from "node:assert/strict";
import {
  linkedArtifactPathsFromStrategy,
  renderRoadmapEvidence,
  summarizeEvidenceArtifact,
  validateRoadmapStateData,
} from "../../scripts/lib/roadmaps.js";

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
`);

  assert.deepEqual(paths, ["projects/client/deliverables-map.md", "specs/auth/workflow-state.md"]);
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
