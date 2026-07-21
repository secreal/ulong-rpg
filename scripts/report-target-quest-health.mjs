import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  analyzeTargetQuestHealth,
  formatHealthReport,
  shouldFailReport,
} from "./lib/target-quest-health.mjs";

const FORMATS = new Set(["text", "json", "markdown"]);
const THRESHOLDS = new Set(["error", "warning", "none"]);

export function parseArgs(args) {
  const options = {
    format: "text",
    failOn: "error",
    output: null,
    rootDir: process.cwd(),
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    const value = args[index + 1];
    if (["--format", "--fail-on", "--output", "--root"].includes(argument)) {
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      index += 1;
      if (argument === "--format") options.format = value;
      if (argument === "--fail-on") options.failOn = value;
      if (argument === "--output") options.output = value;
      if (argument === "--root") options.rootDir = path.resolve(value);
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!FORMATS.has(options.format)) throw new Error(`Unsupported format: ${options.format}`);
  if (!THRESHOLDS.has(options.failOn)) throw new Error(`Unsupported fail threshold: ${options.failOn}`);
  return options;
}

export function helpText() {
  return [
    "Usage: node scripts/report-target-quest-health.mjs [options]",
    "",
    "Options:",
    "  --format text|json|markdown   Output format (default: text)",
    "  --fail-on error|warning|none  Nonzero exit threshold (default: error)",
    "  --output <path>                Write output to a file instead of stdout",
    "  --root <path>                  Analyze another repository root",
    "  --help                         Show this help",
    "",
  ].join("\n");
}

export function run(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) {
    process.stdout.write(helpText());
    return 0;
  }

  const report = analyzeTargetQuestHealth(options.rootDir);
  const output = formatHealthReport(report, options.format);
  if (options.output) {
    const outputPath = path.resolve(options.rootDir, options.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output, "utf8");
  } else {
    process.stdout.write(output);
  }
  return shouldFailReport(report, options.failOn) ? 1 : 0;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  try {
    process.exitCode = run();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
