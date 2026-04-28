import { collectRoadmapDigest, renderRoadmapDigest } from "./lib/roadmaps.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const positional = args.filter((arg) => !arg.startsWith("--"));
const [slug, audience] = positional;

if (!slug || !audience) {
  console.error("usage: npm run roadmap:digest -- <roadmap-slug> <audience> [--json]");
  process.exit(1);
}

const report = collectRoadmapDigest(slug, audience);

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(renderRoadmapDigest(report));
}

if (report.warnings.includes(`roadmaps/${slug}/roadmap-strategy.md is missing`)) {
  process.exit(1);
}
