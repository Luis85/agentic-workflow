import { collectSelfCheckReport, renderSelfCheckReport } from "./lib/self-check.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const feature = valueAfter("--feature");

const report = collectSelfCheckReport({ feature });

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(renderSelfCheckReport(report));
}

if (report.status === "fail") process.exit(1);

function valueAfter(flag: string): string | undefined {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}
