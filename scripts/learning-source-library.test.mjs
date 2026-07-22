import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import { buildLearningSourceLibrary, collectSourceUsage } from "./lib/learning-source-library.mjs";

const fixtures = new Set();

after(() => {
  for (const fixture of fixtures) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildFixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-source-library-"));
  fixtures.add(rootDir);
  writeJson(path.join(rootDir, "index.html"), {
    ignored: true,
  });
  writeJson(path.join(rootDir, "data", "equipment.json"), {
    equipment: [{ id: "git", name: "Git", description: { en: "desc", id: "desc" } }],
  });
  writeJson(path.join(rootDir, "data", "talents.json"), {
    talents: [{ id: "debugging", name: "Debugging", description: { en: "desc", id: "desc" } }],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "index.json"), {
    questFiles: [
      { kind: "skill", file: "skills.json", status: "available" },
      { kind: "equipment", file: "equipment.json", status: "available" },
      { kind: "talent", file: "talents.json", status: "planned" },
    ],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "skills.json"), {
    kind: "skill",
    targets: [{
      kind: "skill",
      targetId: "version-control",
      targetName: "Version Control",
      intro: { id: "skill-version-control-intro", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
      levels: {
        "1": [
          { id: "skill-version-control-lv1-01", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
          { id: "skill-version-control-lv1-02", links: [{ label: "Git Basics", url: "https://git-scm.com/doc" }] },
          { id: "skill-version-control-lv1-03", links: [{ label: "Git Basics", url: "https://git-scm.com/book/en/v2" }] },
        ],
        "2": [
          { id: "skill-version-control-lv2-01", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
          { id: "skill-version-control-lv2-02", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
          { id: "skill-version-control-lv2-03", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
        ],
        "3": [
          { id: "skill-version-control-lv3-01", links: [{ label: "Git Guide", url: "https://git-scm.com/book/en/v2" }] },
          { id: "skill-version-control-lv3-02", links: [{ label: "Git Guide", url: "https://git-scm.com/book/en/v2" }] },
          { id: "skill-version-control-lv3-03", links: [{ label: "Not URL", url: "notaurl" }] },
        ],
      },
    }],
  });
  writeJson(path.join(rootDir, "data", "target-quests", "equipment.json"), {
    kind: "equipment",
    targets: [{
      kind: "equipment",
      targetId: "git",
      targetName: "Git",
      intro: { id: "equip-git-intro", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
      levels: {
        "1": [
          { id: "equip-git-lv1-01", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
          { id: "equip-git-lv1-02", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
          { id: "equip-git-lv1-03", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
        ],
        "2": [
          { id: "equip-git-lv2-01", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
          { id: "equip-git-lv2-02", links: [{ label: "Git Book", url: "https://git-scm.com/book/en/v2" }] },
          { id: "equip-git-lv2-03", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
        ],
        "3": [
          { id: "equip-git-lv3-01", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
          { id: "equip-git-lv3-02", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
          { id: "equip-git-lv3-03", links: [{ label: "Git Docs", url: "https://git-scm.com/doc" }] },
        ],
      },
    }],
  });
  return rootDir;
}

test("collects deterministic source entries and conflict buckets", () => {
  const rootDir = buildFixture();
  const report = buildLearningSourceLibrary(rootDir);

  assert.equal(report.version, 1);
  assert.equal(report.sources.length, 2);
  assert.equal(report.sources[0].id, "source-0001");
  assert.equal(report.sources[0].url, "https://git-scm.com/book/en/v2");
  assert.equal(report.sources[0].usageCount, 9);
  assert.equal(report.sources[0].labels.length, 3);
  assert.equal(report.sources[1].id, "source-0002");
  assert.equal(report.sources[1].url, "https://git-scm.com/doc");
  assert.equal(report.sources[1].labels.length, 2);
  assert.equal(report.sources[1].targets.length, 2);
  assert.equal(report.summary.links.invalid, 1);
  const urlLabelConflict = new Map(report.conflicts.urlLabelConflict.map(item => [item.url, item.labels]));
  assert.equal(urlLabelConflict.get("https://git-scm.com/book/en/v2").length, 3);
  assert.equal(urlLabelConflict.get("https://git-scm.com/doc").length, 2);
  const labelConflict = report.conflicts.labelUrlConflict.find(item => item.label === "Git Basics");
  assert.ok(labelConflict);
  assert.equal(labelConflict.urls.length, 2);
});

test("collectSourceUsage reports invalid json files and tracks declared files", () => {
  const rootDir = buildFixture();
  const missingFiles = [];
  const filePath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = JSON.parse(fs.readFileSync(filePath, "utf8"));
  index.questFiles.push({ kind: "skill", file: "missing.json", status: "available" });
  writeJson(filePath, index);

  const report = collectSourceUsage({
    rootDir,
    addProblem: (type, message) => {
      missingFiles.push({ type, message });
    },
  });

  assert.equal(report.stats.filesMissing, 1);
  assert.ok(missingFiles.some(item => item.type === "missing-quest-file"));
});
