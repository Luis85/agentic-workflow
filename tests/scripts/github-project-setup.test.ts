import test from "node:test";
import assert from "node:assert/strict";
import { buildGitHubProjectSetupPlan, renderGitHubProjectSetupPlan } from "../../scripts/lib/github-project-setup.js";

test("generic product setup plan includes product and P3 baselines", () => {
  const plan = buildGitHubProjectSetupPlan({
    projectName: "Example Product",
    profile: "generic-product",
    includeP3: true,
  });

  assert.equal(plan.milestones.some((milestone) => milestone.title === "v1 repo setup"), true);
  assert.equal(plan.milestones.some((milestone) => milestone.title === "v1 product setup"), true);
  assert.equal(plan.milestones.some((milestone) => milestone.title === "P3 project initiation"), true);
  assert.equal(plan.milestones.some((milestone) => milestone.title === "v1 plugin shell"), false);
  assert.equal(plan.labels.some((label) => label.name === "traceability"), true);
  assert.equal(plan.issues.some((issue) => issue.title.startsWith("P3 A01:")), true);
  assert.equal(plan.issues.some((issue) => issue.title === "Create PRODUCT_VISION.md"), true);
});

test("obsidian plugin setup plan adds plugin-shell work", () => {
  const plan = buildGitHubProjectSetupPlan({
    projectName: "Specorator",
    profile: "obsidian-plugin",
    includeP3: true,
  });

  assert.equal(plan.milestones.some((milestone) => milestone.title === "v1 plugin shell"), true);
  assert.equal(plan.labels.some((label) => label.name === "plugin-shell"), true);
  assert.equal(plan.issues.some((issue) => issue.milestone === "v1 plugin shell"), true);
  assert.equal(plan.issues.some((issue) => issue.body.includes("Specorator")), true);
});

test("setup plan can omit P3 initiation", () => {
  const plan = buildGitHubProjectSetupPlan({
    projectName: "Example Product",
    profile: "generic-product",
    includeP3: false,
  });

  assert.equal(plan.milestones.some((milestone) => milestone.title === "P3 project initiation"), false);
  assert.equal(plan.labels.some((label) => label.name === "p3-express"), false);
  assert.equal(plan.issues.some((issue) => issue.title.startsWith("P3 A")), false);
  assert.equal(plan.labels.some((label) => label.name === "project-management"), true);
});

test("setup plan renderer includes labels, milestones, and issues", () => {
  const plan = buildGitHubProjectSetupPlan({
    projectName: "Example Product",
    profile: "generic-product",
    includeP3: true,
  });
  const text = renderGitHubProjectSetupPlan(plan);

  assert.match(text, /## Labels/);
  assert.match(text, /## Milestones/);
  assert.match(text, /## Issues/);
  assert.match(text, /PRODUCT_VISION/);
});

test("setup plan issues reference declared labels and milestones", () => {
  for (const plan of [
    buildGitHubProjectSetupPlan({ projectName: "Generic", profile: "generic-product", includeP3: false }),
    buildGitHubProjectSetupPlan({ projectName: "Plugin", profile: "obsidian-plugin", includeP3: true }),
  ]) {
    const labels = new Set(plan.labels.map((label) => label.name));
    const milestones = new Set(plan.milestones.map((milestone) => milestone.title));

    for (const issue of plan.issues) {
      assert.equal(milestones.has(issue.milestone), true, `${issue.title} references missing milestone ${issue.milestone}`);
      for (const label of issue.labels) {
        assert.equal(labels.has(label), true, `${issue.title} references missing label ${label}`);
      }
    }
  }
});

test("setup plan issue titles are unique within each milestone", () => {
  const plan = buildGitHubProjectSetupPlan({
    projectName: "Plugin",
    profile: "obsidian-plugin",
    includeP3: true,
  });
  const keys = new Set<string>();

  for (const issue of plan.issues) {
    const key = `${issue.milestone}\t${issue.title}`;
    assert.equal(keys.has(key), false, `duplicate planned issue ${key}`);
    keys.add(key);
  }
});
