import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "data", "quests", "index.json");
const htmlPath = path.join(root, "index.html");

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getJobs() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const start = html.indexOf("const jobs = [");
  const end = html.indexOf("    ];", start);
  const block = html.slice(start, end);
  const jobs = new Map();
  for (const match of block.matchAll(/\["([^"]+)",\s*"([^"]+)",\s*"[^"]*",\s*"([^"]+)"/g)) {
    jobs.set(match[2], match[3].split(", "));
  }
  return jobs;
}

function validUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function validateQuestList({ file, job, skills, type, list, seenIds }) {
  if (!Array.isArray(list)) {
    fail(`${file}: ${type} must be an array`);
    return;
  }

  const localIds = new Set();
  list.forEach((quest, index) => {
    const prefix = `${file}: ${type}[${index}]`;
    if (!quest || typeof quest !== "object") {
      fail(`${prefix} must be an object`);
      return;
    }
    if (!quest.id) fail(`${prefix} missing id`);
    if (quest.id && seenIds.has(quest.id)) fail(`${prefix} duplicate global quest id ${quest.id}`);
    if (quest.id && localIds.has(quest.id)) fail(`${prefix} duplicate local quest id ${quest.id}`);
    if (quest.id) {
      seenIds.add(quest.id);
      localIds.add(quest.id);
    }
    if (!quest.title) fail(`${prefix} missing title`);
    if (!quest.description) fail(`${prefix} missing description`);
    if (quest.summaryRequired !== true) fail(`${prefix} summaryRequired must be true`);
    if (type === "daily" && quest.cooldown !== "daily") fail(`${prefix} daily quest cooldown must be daily`);
    if (type === "main" && index === 0 && quest.unlocksAfter !== null) {
      fail(`${prefix} first main quest unlocksAfter must be null`);
    }
    if (type === "main" && index > 0 && !quest.unlocksAfter) {
      fail(`${prefix} chained main quest missing unlocksAfter`);
    }
    if (!Array.isArray(quest.skillTargets) || quest.skillTargets.length === 0) {
      fail(`${prefix} must include skillTargets`);
    } else {
      quest.skillTargets.forEach((target, targetIndex) => {
        if (!skills.includes(target.skill)) {
          fail(`${prefix} skillTargets[${targetIndex}] invalid skill "${target.skill}" for ${job}`);
        }
        if (![1, 2, 3].includes(target.targetLevel)) {
          fail(`${prefix} skillTargets[${targetIndex}] targetLevel must be 1, 2, or 3`);
        }
      });
    }
    if (!Array.isArray(quest.links) || quest.links.length === 0) {
      fail(`${prefix} must include links`);
    } else {
      quest.links.forEach((link, linkIndex) => {
        if (!link.label) fail(`${prefix} links[${linkIndex}] missing label`);
        if (!validUrl(link.url)) fail(`${prefix} links[${linkIndex}] invalid url`);
      });
    }
  });
}

const jobs = getJobs();
const index = readJson(indexPath);
const seenIndexJobs = new Set();
const seenIds = new Set();

if (!Array.isArray(index.quests)) fail("data/quests/index.json: quests must be an array");

for (const entry of index.quests || []) {
  if (!jobs.has(entry.job)) {
    fail(`data/quests/index.json: unknown job "${entry.job}"`);
    continue;
  }
  if (seenIndexJobs.has(entry.job)) fail(`data/quests/index.json: duplicate job "${entry.job}"`);
  seenIndexJobs.add(entry.job);

  const questPath = path.join(root, "data", "quests", entry.file);
  if (!fs.existsSync(questPath)) {
    fail(`data/quests/index.json: missing file ${entry.file}`);
    continue;
  }

  const questFile = readJson(questPath);
  if (questFile.job !== entry.job) fail(`${entry.file}: job does not match index`);
  if (!questFile.slug) fail(`${entry.file}: missing slug`);
  if (!questFile.mainSource || !questFile.mainSource.type) fail(`${entry.file}: missing mainSource`);

  const skills = jobs.get(entry.job);
  validateQuestList({
    file: entry.file,
    job: entry.job,
    skills,
    type: "main",
    list: questFile.main,
    seenIds,
  });
  validateQuestList({
    file: entry.file,
    job: entry.job,
    skills,
    type: "daily",
    list: questFile.daily,
    seenIds,
  });

  if (entry.job === "IT Novice" && questFile.main.length !== 0) {
    fail("it-novice.json: main must stay empty because Perguruan Ulong owns IT Novice main quests");
  }
}

if (!process.exitCode) {
  console.log(`Quest validation passed for ${seenIndexJobs.size} job files and ${seenIds.size} quests.`);
}
