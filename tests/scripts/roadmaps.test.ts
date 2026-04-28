import test from "node:test";
import assert from "node:assert/strict";
import { validateRoadmapStateData } from "../../scripts/lib/roadmaps.js";

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
