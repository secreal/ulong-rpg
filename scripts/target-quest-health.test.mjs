import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import {
  analyzeTargetQuestHealth,
  formatHealthReport,
  shouldFailReport,
} from "./lib/target-quest-health.mjs";
import { parseArgs, run } from "./report-target-quest-health.mjs";

const fixtureRoots = new Set();

after(() => {
  for (const rootDir of fixtureRoots) fs.rmSync(rootDir, { recursive: true, force: true });
});

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function makeQuest(id, label, url) {
  return {
    id,
    title: `Quest ${id}`,
    description: `Complete ${id} and summarize the result.`,
    summaryRequired: true,
    links: [{ label, url }],
  };
}

function makeTarget(kind, targetId, targetName, progressKey, sourceUrl) {
  const quest = suffix => makeQuest(`${kind}-${targetId}-${suffix}`, `${targetName} Docs`, sourceUrl);
  return {
    kind,
    targetId,
    targetName,
    source: { type: kind, progressKey },
    intro: quest("intro"),
    levels: {
      "1": [quest("lv1-01"), quest("lv1-02"), quest("lv1-03")],
      "2": [quest("lv2-01"), quest("lv2-02"), quest("lv2-03")],
      "3": [quest("lv3-01"), quest("lv3-02"), quest("lv3-03")],
    },
    learningStage: "fundamental",
    prerequisiteTargets: [],
    fundamental: true,
  };
}

function createFixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "target-quest-health-"));
  fixtureRoots.add(rootDir);
  fs.writeFileSync(
    path.join(rootDir, "index.html"),
    'const jobs = [\n      ["group", "Job", "Description", "Version Control"]\n    ];\n',
    "utf8",
  );

  writeJson(path.join(rootDir, "data", "equipment.json"), {
    equipment: [{
      id: "git",
      name: "Git",
      description: { en: "Version control tool.", id: "Alat version control." },
    }],
  });
  writeJson(path.join(rootDir, "data", "talents.json"), {
    talents: [{
      id: "html-css",
      name: "HTML & CSS",
      description: { en: "Web foundations.", id: "Dasar web." },
    }],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "index.json"), {
    questFiles: [
      { kind: "skill", file: "skills.json", status: "available" },
      { kind: "equipment", file: "equipment.json", status: "available" },
      { kind: "talent", file: "talents.json", status: "available" },
    ],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "skills.json"), {
    kind: "skill",
    targets: [makeTarget(
      "skill",
      "version-control",
      "Version Control",
      "skill::Version Control",
      "https://example.com/version-control",
    )],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "equipment.json"), {
    kind: "equipment",
    targets: [makeTarget("equipment", "git", "Git", "equip::git", "https://example.com/git")],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "talents.json"), {
    kind: "talent",
    targets: [makeTarget("talent", "html-css", "HTML & CSS", "talent::html-css", "https://example.com/html-css")],
  });
  return rootDir;
}

test("healthy fixture reports deterministic catalog totals", () => {
  const rootDir = createFixture();
  const first = analyzeTargetQuestHealth(rootDir);
  const second = analyzeTargetQuestHealth(rootDir);

  assert.equal(first.status, "healthy");
  assert.deepEqual(first.summary, {
    targets: 3,
    quests: 30,
    fundamental: 3,
    dependent: 0,
    uniqueSources: 3,
    errors: 0,
    warnings: 0,
  });
  assert.equal(formatHealthReport(first, "json"), formatHealthReport(second, "json"));
  assert.match(formatHealthReport(first, "markdown"), /\| \*\*Total\*\* \| \*\*3\*\* \| \*\*30\*\*/);
  assert.match(formatHealthReport(first, "text"), /Targets: 3 \| Quests: 30/);
});

test("invalid fixture emits stable structural, identity, localization, and source findings", () => {
  const rootDir = createFixture();
  const skillPath = path.join(rootDir, "data", "target-quests", "skills.json");
  const equipmentPath = path.join(rootDir, "data", "target-quests", "equipment.json");
  const equipmentCatalogPath = path.join(rootDir, "data", "equipment.json");
  const skills = JSON.parse(fs.readFileSync(skillPath, "utf8"));
  const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"));
  const equipmentCatalog = JSON.parse(fs.readFileSync(equipmentCatalogPath, "utf8"));

  skills.targets[0].targetName = "version control";
  skills.targets[0].source.progressKey = "skill::version control";
  skills.targets[0].source.type = "equipment";
  delete skills.targets[0].fundamental;
  skills.targets[0].prerequisiteTargets = "invalid";
  skills.targets[0].levels["1"].pop();
  skills.targets[0].intro.links[0].url = "not-a-url";
  equipment.targets[0].intro.id = skills.targets[0].intro.id;
  equipment.targets[0].intro.links[0].url = "https://example.com/git";
  equipment.targets[0].intro.links[0].label = "Git Source";
  skills.targets[0].levels["1"][0].links[0].label = "Git Source";
  skills.targets[0].levels["2"][0].links[0].url = "https://example.com/git";
  equipmentCatalog.equipment[0].description.id = "";
  writeJson(skillPath, skills);
  writeJson(equipmentPath, equipment);
  writeJson(equipmentCatalogPath, equipmentCatalog);

  const report = analyzeTargetQuestHealth(rootDir, {
    concentrationMinimumTargets: 1,
    concentrationMinimumShare: 0.5,
  });
  const ruleIds = new Set(report.findings.map(finding => finding.ruleId));

  for (const expected of [
    "target-name-drift",
    "progress-key-drift",
    "source-type-mismatch",
    "missing-fundamental",
    "prerequisite-targets-shape",
    "level-quest-count",
    "invalid-link-url",
    "duplicate-quest-id",
    "missing-bilingual-description",
    "source-concentration",
    "source-label-conflict",
    "url-label-conflict",
  ]) {
    assert.ok(ruleIds.has(expected), `missing rule ${expected}`);
  }
  assert.equal(report.status, "error");
  assert.match(formatHealthReport(report, "text"), /https:\/\/example\.com\/git/);
  assert.equal(shouldFailReport(report, "error"), true);
  assert.equal(shouldFailReport(report, "warning"), true);
  assert.equal(shouldFailReport(report, "none"), false);
});

test("missing and malformed declared files become findings", () => {
  const rootDir = createFixture();
  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.questFiles[0].file = "missing.json";
  writeJson(indexPath, index);
  fs.writeFileSync(path.join(rootDir, "data", "target-quests", "equipment.json"), "{", "utf8");

  const report = analyzeTargetQuestHealth(rootDir);
  const ruleIds = report.findings.map(finding => finding.ruleId);
  assert.ok(ruleIds.includes("missing-file"));
  assert.ok(ruleIds.includes("invalid-json"));
});

test("CLI validates arguments and writes requested output", () => {
  const rootDir = createFixture();
  assert.deepEqual(parseArgs(["--format", "json", "--fail-on", "none", "--root", rootDir]).format, "json");
  assert.throws(() => parseArgs(["--format", "xml"]), /Unsupported format/);
  assert.throws(() => parseArgs(["--wat"]), /Unknown argument/);

  const exitCode = run([
    "--root",
    rootDir,
    "--format",
    "markdown",
    "--output",
    "health.md",
    "--fail-on",
    "error",
  ]);
  assert.equal(exitCode, 0);
  assert.match(fs.readFileSync(path.join(rootDir, "health.md"), "utf8"), /Target Quest Health Report/);
});
