import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targetQuestDir = path.join(root, "data", "target-quests");
const indexPath = path.join(targetQuestDir, "index.json");
const htmlPath = path.join(root, "index.html");
const equipmentPath = path.join(root, "data", "equipment.json");
const talentsPath = path.join(root, "data", "talents.json");
const validKinds = new Set(["skill", "equipment", "talent"]);
const expectedLevels = ["1", "2", "3"];

let failures = 0;

function fail(message) {
  console.error(message);
  failures += 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSkillNames() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const start = html.indexOf("const jobs = [");
  const end = html.indexOf("    ];", start);
  if (start === -1 || end === -1) {
    fail("index.html: could not find jobs array");
    return new Set();
  }
  const block = html.slice(start, end);
  const skills = new Set();
  for (const match of block.matchAll(/\["[^"]+",\s*"[^"]+",\s*"[^"]*",\s*"([^"]+)"/g)) {
    match[1].split(", ").forEach(skill => skills.add(skill));
  }
  return skills;
}

function getCatalogIds(filePath, collectionName) {
  const data = readJson(filePath);
  if (!Array.isArray(data[collectionName])) {
    fail(`${path.relative(root, filePath)}: ${collectionName} must be an array`);
    return new Set();
  }
  return new Set(data[collectionName].map(item => item.id));
}

function validateQuest(file, target, quest, questPath, seenQuestIds) {
  const prefix = `${file}: ${target.targetId}: ${questPath}`;
  if (!quest || typeof quest !== "object") {
    fail(`${prefix} must be an object`);
    return;
  }
  if (!quest.id) fail(`${prefix} missing id`);
  if (quest.id && seenQuestIds.has(quest.id)) fail(`${prefix} duplicate global quest id ${quest.id}`);
  if (quest.id) seenQuestIds.add(quest.id);
  if (!quest.title) fail(`${prefix} missing title`);
  if (!quest.description) fail(`${prefix} missing description`);
  if (quest.summaryRequired !== true) fail(`${prefix} summaryRequired must be true`);
  if (!Array.isArray(quest.links) || quest.links.length === 0) {
    fail(`${prefix} must include links`);
  } else {
    quest.links.forEach((link, linkIndex) => {
      if (!link.label) fail(`${prefix} links[${linkIndex}] missing label`);
      if (!validUrl(link.url)) fail(`${prefix} links[${linkIndex}] invalid url`);
    });
  }
}

function validateTargetFile({ file, kind, skillNames, equipmentIds, talentIds, seenTargets, seenQuestIds }) {
  const fullPath = path.join(targetQuestDir, file);
  if (!fs.existsSync(fullPath)) {
    fail(`data/target-quests/index.json: missing file ${file}`);
    return 0;
  }

  const data = readJson(fullPath);
  if (data.kind !== kind) fail(`${file}: kind must be ${kind}`);
  if (!Array.isArray(data.targets)) {
    fail(`${file}: targets must be an array`);
    return 0;
  }

  data.targets.forEach((target, index) => {
    const prefix = `${file}: targets[${index}]`;
    if (!target || typeof target !== "object") {
      fail(`${prefix} must be an object`);
      return;
    }
    if (target.kind !== kind) fail(`${prefix} kind must be ${kind}`);
    if (!target.targetId) fail(`${prefix} missing targetId`);
    if (!target.targetName) fail(`${prefix} missing targetName`);
    if (target.targetId) {
      const targetKey = `${kind}:${target.targetId}`;
      if (seenTargets.has(targetKey)) fail(`${prefix} duplicate target ${targetKey}`);
      seenTargets.add(targetKey);
    }

    if (kind === "skill") {
      if (!skillNames.has(target.targetName)) fail(`${prefix} unknown skill targetName "${target.targetName}"`);
      const expectedId = slugify(target.targetName);
      if (target.targetId !== expectedId) fail(`${prefix} targetId should be "${expectedId}" for skill "${target.targetName}"`);
    }
    if (kind === "equipment" && !equipmentIds.has(target.targetId)) {
      fail(`${prefix} unknown equipment targetId "${target.targetId}"`);
    }
    if (kind === "talent" && !talentIds.has(target.targetId)) {
      fail(`${prefix} unknown talent targetId "${target.targetId}"`);
    }

    validateQuest(file, target, target.intro, "intro", seenQuestIds);

    if (!target.levels || typeof target.levels !== "object") {
      fail(`${prefix} missing levels`);
      return;
    }
    expectedLevels.forEach(level => {
      const quests = target.levels[level];
      if (!Array.isArray(quests)) {
        fail(`${prefix} levels.${level} must be an array`);
        return;
      }
      if (quests.length !== 3) {
        fail(`${prefix} levels.${level} must contain exactly 3 quests`);
      }
      quests.forEach((quest, questIndex) => {
        validateQuest(file, target, quest, `levels.${level}[${questIndex}]`, seenQuestIds);
      });
    });
  });

  return data.targets.length;
}

const index = readJson(indexPath);
const skillNames = getSkillNames();
const equipmentIds = getCatalogIds(equipmentPath, "equipment");
const talentIds = getCatalogIds(talentsPath, "talents");
const seenKinds = new Set();
const seenTargets = new Set();
const seenQuestIds = new Set();
let targetCount = 0;

if (!Array.isArray(index.questFiles)) {
  fail("data/target-quests/index.json: questFiles must be an array");
} else {
  index.questFiles.forEach((entry, indexPosition) => {
    const prefix = `data/target-quests/index.json: questFiles[${indexPosition}]`;
    if (!validKinds.has(entry.kind)) fail(`${prefix} invalid kind "${entry.kind}"`);
    if (!entry.file) fail(`${prefix} missing file`);
    if (seenKinds.has(entry.kind)) fail(`${prefix} duplicate kind "${entry.kind}"`);
    seenKinds.add(entry.kind);
    if (entry.status !== "available" && entry.status !== "planned") {
      fail(`${prefix} status must be available or planned`);
    }
    if (validKinds.has(entry.kind) && entry.file) {
      targetCount += validateTargetFile({
        file: entry.file,
        kind: entry.kind,
        skillNames,
        equipmentIds,
        talentIds,
        seenTargets,
        seenQuestIds,
      });
    }
  });
}

validKinds.forEach(kind => {
  if (!seenKinds.has(kind)) fail(`data/target-quests/index.json: missing ${kind} quest file entry`);
});

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`Target quest validation passed for ${targetCount} targets and ${seenQuestIds.size} quests.`);
}
