import { collectQualityMetrics, renderQualityMetrics } from "./lib/quality-metrics.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const feature = valueAfter("--feature");

const metrics = collectQualityMetrics({ feature });

if (json) {
  console.log(JSON.stringify(metrics, null, 2));
} else {
  console.log(renderQualityMetrics(metrics));
}

function valueAfter(flag: string): string | undefined {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}
