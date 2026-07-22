import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildLearningSourceLibrary } from "./lib/learning-source-library.mjs";

const DEFAULT_OUTPUT = path.join("data", "learning-sources.json");

function parseArgs(args) {
  const options = {
    rootDir: process.cwd(),
    output: DEFAULT_OUTPUT,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    const value = args[index + 1];
    if (argument === "--root" || argument === "--output") {
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      index += 1;
      if (argument === "--root") options.rootDir = path.resolve(value);
      if (argument === "--output") options.output = value;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

export function helpText() {
  return [
    "Usage: node scripts/build-learning-sources.mjs [options]",
    "",
    "Options:",
    "  --root <path>                  Source root for catalog generation (default: current working directory)",
    "  --output <path>                 Write catalog to the given path (default: data/learning-sources.json)",
    "  --help                          Show this help",
  ].join("\n");
}

export function run(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) {
    process.stdout.write(`${helpText()}\n`);
    return 0;
  }

  const catalog = buildLearningSourceLibrary(options.rootDir);
  const outputPath = path.resolve(options.rootDir, options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  );
  process.stdout.write(`Wrote ${path.relative(options.rootDir, outputPath).replaceAll("\\", "/")}\n`);
  return 0;
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

