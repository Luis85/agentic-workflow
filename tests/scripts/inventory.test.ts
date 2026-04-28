import test from "node:test";
import assert from "node:assert/strict";
import { normalizeStatus } from "../../scripts/lib/adr.js";
import { renderCommandInventory } from "../../scripts/lib/commands.js";
import { artifactStatuses, workflowStages, workflowStatuses } from "../../scripts/lib/workflow-schema.js";

test("normalizeStatus produces stable title case for ADR index rows", () => {
  assert.equal(normalizeStatus("accepted"), "Accepted");
  assert.equal(normalizeStatus("SUPERSEDED by ADR-0002"), "Superseded By Adr-0002");
});

test("renderCommandInventory includes fenced output when requested", () => {
  const inventory = renderCommandInventory({ fenced: true });
  assert.equal(inventory.startsWith("```\n"), true);
  assert.equal(inventory.endsWith("\n```"), true);
  assert.match(inventory, /\/spec:idea/);
});

test("workflow schema exposes canonical lifecycle values", () => {
  assert.equal(workflowStages.has("requirements"), true);
  assert.equal(workflowStatuses.has("blocked"), true);
  assert.equal(artifactStatuses.has("in-progress"), true);
});
