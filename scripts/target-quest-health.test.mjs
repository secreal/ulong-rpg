import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import {
  analyzeTargetQuestHealth,
  formatHealthReport,
  shouldFailReport,
} from "./lib/target-quest-health.mjs";
import { parseArgs, run } from "./report-target-quest-health.mjs";

const fixtureRoots = new Set();
const validatorPath = fileURLToPath(new URL("./validate-target-quests.mjs", import.meta.url));

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
    'const jobs = [\n      ["group", "Frontend Developer", "Description", "Version Control"]\n    ];\n',
    "utf8",
  );

  writeJson(path.join(rootDir, "data", "equipment.json"), {
    equipment: [{
      id: "git",
      name: "Git",
      description: { en: "Version control tool.", id: "Alat version control." },
      tags: ["Frontend Developer"],
    }],
  });
  writeJson(path.join(rootDir, "data", "talents.json"), {
    talents: [{
      id: "html-css",
      name: "HTML & CSS",
      description: { en: "Web foundations.", id: "Dasar web." },
      tags: ["Frontend Developer"],
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

function assertDependencyAnalysisIncomplete(report, primaryRule) {
  const ruleIds = report.findings.map(finding => finding.ruleId);
  assert.ok(ruleIds.includes(primaryRule), `missing primary rule ${primaryRule}`);
  assert.equal(ruleIds.filter(ruleId => ruleId === "dependency-analysis-incomplete").length, 1);
  assert.deepEqual(report.dependencies, {
    edges: null,
    maxDepth: null,
    withoutPrerequisites: null,
  });
  for (const derivativeRule of [
    "prerequisite-cycle",
    "unresolved-prerequisite",
    "unrooted-dependent",
  ]) {
    assert.equal(ruleIds.includes(derivativeRule), false, derivativeRule);
  }
}

function runValidator(rootDir) {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: rootDir,
    encoding: "utf8",
  });
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
  assert.deepEqual(first.dependencies, {
    edges: 0,
    maxDepth: 0,
    withoutPrerequisites: [],
  });
  assert.equal(first.version, 2);
  assert.equal(formatHealthReport(first, "json"), formatHealthReport(second, "json"));
  assert.match(formatHealthReport(first, "markdown"), /\| \*\*Total\*\* \| \*\*3\*\* \| \*\*30\*\*/);
  assert.match(formatHealthReport(first, "text"), /Targets: 3 \| Quests: 30/);
});

test("cross-kind dependencies appear consistently in every report format", () => {
  const rootDir = createFixture();
  const equipmentPath = path.join(rootDir, "data", "target-quests", "equipment.json");
  const talentPath = path.join(rootDir, "data", "target-quests", "talents.json");
  const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"));
  const talents = JSON.parse(fs.readFileSync(talentPath, "utf8"));

  equipment.targets[0].fundamental = false;
  equipment.targets[0].learningStage = "dependent";
  equipment.targets[0].prerequisiteTargets = ["skill:version-control"];
  talents.targets[0].fundamental = false;
  talents.targets[0].learningStage = "dependent";
  talents.targets[0].prerequisiteTargets = ["equipment:git"];
  writeJson(equipmentPath, equipment);
  writeJson(talentPath, talents);

  const report = analyzeTargetQuestHealth(rootDir);

  assert.deepEqual(report.dependencies, {
    edges: 2,
    maxDepth: 2,
    withoutPrerequisites: [],
  });
  assert.match(formatHealthReport(report, "text"), /Dependencies: 2 edges \| Max depth: 2 \| Missing: 0/);
  const markdown = formatHealthReport(report, "markdown");
  assert.ok(markdown.split("\n").includes("| 2 | 2 | 0 |"));
  const json = JSON.parse(formatHealthReport(report, "json"));
  assert.deepEqual(json.dependencies, report.dependencies);
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
  equipment.targets[0].intro.links[0].label = skills.targets[0].levels["2"][0].links[0].label;
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
  ]) {
    assert.ok(ruleIds.has(expected), `missing rule ${expected}`);
  }
  assert.equal(report.status, "error");
  assert.match(formatHealthReport(report, "text"), /https:\/\/example\.com\/git/);
  assert.equal(shouldFailReport(report, "error"), true);
  assert.equal(shouldFailReport(report, "warning"), true);
  assert.equal(shouldFailReport(report, "none"), false);
});

test("a missing available catalog makes dependency analysis incomplete", () => {
  const rootDir = createFixture();
  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.questFiles[0].file = "missing.json";
  writeJson(indexPath, index);

  assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), "missing-file");
});

test("malformed JSON makes dependency analysis incomplete", () => {
  const rootDir = createFixture();
  fs.writeFileSync(path.join(rootDir, "data", "target-quests", "equipment.json"), "{", "utf8");

  assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), "invalid-json");
});

test("invalid targets shape makes dependency analysis incomplete", () => {
  const rootDir = createFixture();
  writeJson(path.join(rootDir, "data", "target-quests", "talents.json"), {
    kind: "talent",
    targets: {},
  });

  assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), "targets-shape");
});

test("invalid index shape makes dependency analysis incomplete", () => {
  const rootDir = createFixture();
  writeJson(path.join(rootDir, "data", "target-quests", "index.json"), {
    questFiles: {},
  });

  assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), "index-shape");
});

test("partial index makes dependency analysis incomplete", () => {
  const rootDir = createFixture();
  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.questFiles.pop();
  writeJson(indexPath, index);

  assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), "missing-index-kind");
});

test("malformed index entries make dependency analysis incomplete", async t => {
  const cases = [
    ["non-object entry", index => { index.questFiles[0] = null; }, "index-entry-shape"],
    ["unknown kind", index => { index.questFiles[0].kind = "unknown"; }, "unknown-kind"],
    ["duplicate kind", index => { index.questFiles[2].kind = "equipment"; }, "duplicate-index-kind"],
    ["invalid status", index => { index.questFiles[0].status = "draft"; }, "invalid-index-status"],
    ["missing file field", index => { delete index.questFiles[0].file; }, "missing-index-field"],
  ];

  for (const [name, mutate, primaryRule] of cases) {
    await t.test(name, () => {
      const rootDir = createFixture();
      const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
      const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      mutate(index);
      writeJson(indexPath, index);
      assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), primaryRule);
    });
  }
});

test("graph-relevant missing target fields make dependency analysis incomplete", async t => {
  const cases = [
    ["targetId", target => { delete target.targetId; }, "missing-target-field"],
    ["fundamental", target => { delete target.fundamental; }, "missing-fundamental"],
    ["prerequisiteTargets", target => { delete target.prerequisiteTargets; }, "prerequisite-targets-shape"],
  ];

  for (const [name, mutate, primaryRule] of cases) {
    await t.test(name, () => {
      const rootDir = createFixture();
      const skillPath = path.join(rootDir, "data", "target-quests", "skills.json");
      const skills = JSON.parse(fs.readFileSync(skillPath, "utf8"));
      mutate(skills.targets[0]);
      writeJson(skillPath, skills);
      assertDependencyAnalysisIncomplete(analyzeTargetQuestHealth(rootDir), primaryRule);
    });
  }
});

test("health reports one duplicate-target finding when graph results are merged", () => {
  const rootDir = createFixture();
  const skillPath = path.join(rootDir, "data", "target-quests", "skills.json");
  const skills = JSON.parse(fs.readFileSync(skillPath, "utf8"));
  skills.targets.push(structuredClone(skills.targets[0]));
  writeJson(skillPath, skills);

  const duplicateFindings = analyzeTargetQuestHealth(rootDir).findings
    .filter(finding => finding.ruleId === "duplicate-target");
  assert.equal(duplicateFindings.length, 1);
});

test("planned catalogs are validated only when requested and never counted as active", () => {
  const rootDir = createFixture();
  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.questFiles[2].status = "planned";
  writeJson(indexPath, index);

  const ordinary = analyzeTargetQuestHealth(rootDir);
  const hardValidation = analyzeTargetQuestHealth(rootDir, { validatePlanned: true });

  assert.equal(ordinary.summary.targets, 2);
  assert.equal(hardValidation.summary.targets, 2);
  assert.deepEqual(hardValidation.dependencies, ordinary.dependencies);
  assert.equal(hardValidation.summary.errors, 0);
});

test("hard validator exits zero for valid catalogs", () => {
  const result = runValidator(createFixture());

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Target quest validation passed for 3 targets and 30 quests\./);
  assert.equal(result.stderr, "");
});

test("hard validator exits one with deterministic graph rule details", () => {
  const rootDir = createFixture();
  const skillPath = path.join(rootDir, "data", "target-quests", "skills.json");
  const equipmentPath = path.join(rootDir, "data", "target-quests", "equipment.json");
  const skills = JSON.parse(fs.readFileSync(skillPath, "utf8"));
  const equipment = JSON.parse(fs.readFileSync(equipmentPath, "utf8"));
  skills.targets[0].fundamental = false;
  skills.targets[0].learningStage = "dependent";
  skills.targets[0].prerequisiteTargets = ["equipment:git"];
  equipment.targets[0].fundamental = false;
  equipment.targets[0].learningStage = "dependent";
  equipment.targets[0].prerequisiteTargets = ["skill:version-control"];
  writeJson(skillPath, skills);
  writeJson(equipmentPath, equipment);

  const result = runValidator(rootDir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[prerequisite-cycle\]/);
  assert.match(
    result.stderr,
    /Details: \{"targets":\["equipment:git","skill:version-control"\]\}/,
  );
});

test("hard validator fails when a planned catalog is missing", () => {
  const rootDir = createFixture();
  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.questFiles[2] = {
    kind: "talent",
    file: "missing-planned.json",
    status: "planned",
  };
  writeJson(indexPath, index);

  const ordinary = analyzeTargetQuestHealth(rootDir);
  const result = runValidator(rootDir);

  assert.equal(ordinary.summary.errors, 0);
  assert.equal(ordinary.summary.targets, 2);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing-planned\.json: \[missing-file\]/);
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
