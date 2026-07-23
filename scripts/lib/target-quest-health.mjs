import fs from "node:fs";
import path from "node:path";

const KINDS = ["skill", "equipment", "talent"];
const LEVELS = ["1", "2", "3"];
const SEVERITY_ORDER = { error: 0, warning: 1 };

export const DEFAULT_HEALTH_OPTIONS = Object.freeze({
  concentrationMinimumTargets: 10,
  concentrationMinimumShare: 0.05,
});

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function relativePath(rootDir, filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createKindMetrics() {
  return {
    targets: 0,
    quests: 0,
    fundamental: 0,
    dependent: 0,
    uniqueSources: 0,
  };
}

function sortFindings(findings) {
  return findings.sort((left, right) =>
    SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
      || left.ruleId.localeCompare(right.ruleId)
      || left.location.localeCompare(right.location)
      || left.message.localeCompare(right.message),
  );
}

function readJson(rootDir, filePath, addFinding) {
  const location = relativePath(rootDir, filePath);
  if (!fs.existsSync(filePath)) {
    addFinding("missing-file", "error", location, "Declared data file does not exist.");
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addFinding("invalid-json", "error", location, "Data file is not valid JSON.", {
      error: error.message,
    });
    return null;
  }
}

function extractCanonicalSkills(rootDir, addFinding) {
  const htmlPath = path.join(rootDir, "index.html");
  if (!fs.existsSync(htmlPath)) {
    addFinding("missing-file", "error", "index.html", "Canonical skill source does not exist.");
    return new Map();
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const start = html.indexOf("const jobs = [");
  const end = html.indexOf("    ];", start);
  if (start === -1 || end === -1) {
    addFinding("jobs-array-missing", "error", "index.html", "Could not locate the canonical jobs array.");
    return new Map();
  }

  const skillsById = new Map();
  const block = html.slice(start, end);
  for (const match of block.matchAll(/\["[^"]+",\s*"[^"]+",\s*"[^"]*",\s*"([^"]+)"/g)) {
    for (const skill of match[1].split(", ")) {
      const targetId = slugify(skill);
      const existing = skillsById.get(targetId);
      if (existing && existing !== skill) {
        addFinding(
          "canonical-skill-collision",
          "error",
          "index.html",
          `Multiple canonical skills resolve to target ID "${targetId}".`,
          { skills: [existing, skill].sort() },
        );
      } else {
        skillsById.set(targetId, skill);
      }
    }
  }

  return skillsById;
}

function loadCatalog(rootDir, fileName, collectionName, addFinding) {
  const filePath = path.join(rootDir, "data", fileName);
  const data = readJson(rootDir, filePath, addFinding);
  if (!data) return new Map();
  if (!Array.isArray(data[collectionName])) {
    addFinding(
      "catalog-shape",
      "error",
      relativePath(rootDir, filePath),
      `Expected "${collectionName}" to be an array.`,
    );
    return new Map();
  }
  return new Map(data[collectionName].map(item => [item.id, item]));
}

function validateCatalogDescription(kind, target, catalogItem, location, addFinding) {
  if (!catalogItem) {
    addFinding("unknown-target", "error", location, `Target ID "${target.targetId}" is missing from the ${kind} catalog.`);
    return;
  }

  for (const language of ["en", "id"]) {
    if (typeof catalogItem.description?.[language] !== "string" || !catalogItem.description[language].trim()) {
      addFinding(
        "missing-bilingual-description",
        "warning",
        location,
        `${catalogItem.name || target.targetId} is missing description.${language}.`,
        { language, targetId: target.targetId },
      );
    }
  }
}

function validateTargetIdentity({ kind, target, location, canonicalSkills, equipment, talents, addFinding }) {
  if (!isObject(target.source)) {
    addFinding("missing-target-source", "error", location, "Target source must be an object.");
  } else if (target.source.type !== kind) {
    addFinding(
      "source-type-mismatch",
      "error",
      location,
      `Target source.type must be "${kind}".`,
      { actual: target.source.type },
    );
  }

  if (kind === "skill") {
    const canonicalName = canonicalSkills.get(target.targetId);
    if (!canonicalName) {
      addFinding("unknown-target", "error", location, `Skill target ID "${target.targetId}" is not present in the jobs array.`);
      return;
    }
    if (target.targetName !== canonicalName) {
      addFinding(
        "target-name-drift",
        "error",
        location,
        `Skill targetName must exactly match "${canonicalName}".`,
        { actual: target.targetName, expected: canonicalName },
      );
    }
    const expectedProgressKey = `skill::${canonicalName}`;
    if (target.source?.progressKey !== expectedProgressKey) {
      addFinding(
        "progress-key-drift",
        "error",
        location,
        `Skill progressKey must exactly match "${expectedProgressKey}".`,
        { actual: target.source?.progressKey, expected: expectedProgressKey },
      );
    }
    return;
  }

  const catalog = kind === "equipment" ? equipment : talents;
  const catalogItem = catalog.get(target.targetId);
  validateCatalogDescription(kind, target, catalogItem, location, addFinding);
  if (catalogItem?.name && target.targetName !== catalogItem.name) {
    addFinding(
      "target-name-drift",
      "error",
      location,
      `${kind} targetName must exactly match "${catalogItem.name}".`,
      { actual: target.targetName, expected: catalogItem.name },
    );
  }
  const prefix = kind === "equipment" ? "equip" : "talent";
  const expectedProgressKey = `${prefix}::${target.targetId}`;
  if (target.source?.progressKey !== expectedProgressKey) {
    addFinding(
      "progress-key-drift",
      "error",
      location,
      `${kind} progressKey must exactly match "${expectedProgressKey}".`,
      { actual: target.source?.progressKey, expected: expectedProgressKey },
    );
  }
}

function analyzeQuest({ quest, location, kind, targetId, seenQuestIds, sourceUsage, metrics, addFinding }) {
  metrics.quests += 1;
  if (!isObject(quest)) {
    addFinding("quest-shape", "error", location, "Quest must be an object.");
    return;
  }

  if (typeof quest.id !== "string" || !quest.id.trim()) {
    addFinding("missing-quest-field", "error", location, "Quest is missing a non-empty id.", { field: "id" });
  } else if (seenQuestIds.has(quest.id)) {
    addFinding("duplicate-quest-id", "error", location, `Quest ID "${quest.id}" is duplicated.`, {
      firstSeenAt: seenQuestIds.get(quest.id),
    });
  } else {
    seenQuestIds.set(quest.id, location);
  }

  for (const field of ["title", "description"]) {
    if (typeof quest[field] !== "string" || !quest[field].trim()) {
      addFinding("missing-quest-field", "error", location, `Quest is missing a non-empty ${field}.`, { field });
    }
  }
  if (quest.summaryRequired !== true) {
    addFinding("summary-not-required", "error", location, "Quest summaryRequired must be true.");
  }
  if (!Array.isArray(quest.links) || quest.links.length === 0) {
    addFinding("missing-quest-links", "error", location, "Quest must include at least one learning link.");
    return;
  }

  quest.links.forEach((link, linkIndex) => {
    const linkLocation = `${location}.links[${linkIndex}]`;
    if (!isObject(link)) {
      addFinding("link-shape", "error", linkLocation, "Quest link must be an object.");
      return;
    }
    if (typeof link.label !== "string" || !link.label.trim()) {
      addFinding("missing-link-label", "error", linkLocation, "Quest link is missing a label.");
    }
    if (!isHttpUrl(link.url)) {
      addFinding("invalid-link-url", "error", linkLocation, "Quest link must use a valid HTTP or HTTPS URL.", {
        url: link.url,
      });
      return;
    }

    const usage = sourceUsage.get(link.url) || {
      kinds: new Set(),
      labels: new Set(),
      targets: new Set(),
      questCount: 0,
    };
    usage.kinds.add(kind);
    if (link.label) usage.labels.add(link.label);
    usage.targets.add(`${kind}:${targetId}`);
    usage.questCount += 1;
    sourceUsage.set(link.url, usage);
  });
}

function analyzeTarget({
  target,
  targetIndex,
  fileLocation,
  kind,
  canonicalSkills,
  equipment,
  talents,
  seenTargets,
  seenQuestIds,
  sourceUsage,
  metrics,
  addFinding,
}) {
  const location = `${fileLocation}:targets[${targetIndex}]`;
  metrics.targets += 1;
  if (!isObject(target)) {
    addFinding("target-shape", "error", location, "Target must be an object.");
    return;
  }

  if (target.kind !== kind) {
    addFinding("target-kind-mismatch", "error", location, `Target kind must be "${kind}".`, { actual: target.kind });
  }
  if (typeof target.targetId !== "string" || !target.targetId.trim()) {
    addFinding("missing-target-field", "error", location, "Target is missing targetId.", { field: "targetId" });
  } else {
    const targetKey = `${kind}:${target.targetId}`;
    if (seenTargets.has(targetKey)) {
      addFinding("duplicate-target", "error", location, `Target "${targetKey}" is duplicated.`);
    }
    seenTargets.add(targetKey);
  }
  if (typeof target.targetName !== "string" || !target.targetName.trim()) {
    addFinding("missing-target-field", "error", location, "Target is missing targetName.", { field: "targetName" });
  }

  if (typeof target.fundamental !== "boolean") {
    addFinding("missing-fundamental", "error", location, "Target fundamental must be true or false.");
  } else if (target.fundamental) {
    metrics.fundamental += 1;
  } else {
    metrics.dependent += 1;
  }

  const expectedStage = target.fundamental === true ? "fundamental" : target.fundamental === false ? "dependent" : null;
  if (expectedStage && target.learningStage !== expectedStage) {
    addFinding(
      "learning-stage-conflict",
      "warning",
      location,
      `learningStage should be "${expectedStage}" when fundamental is ${target.fundamental}.`,
      { actual: target.learningStage, expected: expectedStage },
    );
  }
  if (!Array.isArray(target.prerequisiteTargets)) {
    addFinding("prerequisite-targets-shape", "error", location, "prerequisiteTargets must be an array.");
  }
  if (target.fundamental === true && Array.isArray(target.prerequisiteTargets) && target.prerequisiteTargets.length > 0) {
    addFinding(
      "fundamental-has-prerequisites",
      "warning",
      location,
      "Fundamental target declares prerequisite targets.",
      { prerequisiteTargets: [...target.prerequisiteTargets].sort() },
    );
  }

  validateTargetIdentity({ kind, target, location, canonicalSkills, equipment, talents, addFinding });

  analyzeQuest({
    quest: target.intro,
    location: `${location}.intro`,
    kind,
    targetId: target.targetId,
    seenQuestIds,
    sourceUsage,
    metrics,
    addFinding,
  });

  if (!isObject(target.levels)) {
    addFinding("missing-levels", "error", location, "Target levels must be an object with levels 1, 2, and 3.");
    return;
  }
  for (const level of LEVELS) {
    const quests = target.levels[level];
    const levelLocation = `${location}.levels.${level}`;
    if (!Array.isArray(quests)) {
      addFinding("level-shape", "error", levelLocation, "Level must be an array containing exactly three quests.");
      continue;
    }
    if (quests.length !== 3) {
      addFinding("level-quest-count", "error", levelLocation, "Level must contain exactly three quests.", {
        actual: quests.length,
        expected: 3,
      });
    }
    quests.forEach((quest, questIndex) => analyzeQuest({
      quest,
      location: `${levelLocation}[${questIndex}]`,
      kind,
      targetId: target.targetId,
      seenQuestIds,
      sourceUsage,
      metrics,
      addFinding,
    }));
  }
}

function addSourceFindings({ sourceUsage, kinds, options, addFinding }) {
  const labels = new Map();
  for (const [url, usage] of sourceUsage) {
    if (usage.labels.size > 1) {
      addFinding(
        "url-label-conflict",
        "warning",
        "data/target-quests",
        `One source URL is used with multiple labels.`,
        {
          url,
          labels: [...usage.labels].sort(),
        },
      );
    }

    for (const label of usage.labels) {
      const urls = labels.get(label) || new Set();
      urls.add(url);
      labels.set(label, urls);
    }

    for (const kind of KINDS) {
      const targetCount = kinds[kind].targets;
      if (targetCount === 0) continue;
      const matchingTargets = [...usage.targets].filter(target => target.startsWith(`${kind}:`));
      const threshold = Math.max(
        options.concentrationMinimumTargets,
        Math.ceil(targetCount * options.concentrationMinimumShare),
      );
      if (matchingTargets.length >= threshold) {
        addFinding(
          "source-concentration",
          "warning",
          `data/target-quests/${kind}`,
          `One source URL is reused by ${matchingTargets.length} of ${targetCount} ${kind} targets.`,
          {
            labels: [...usage.labels].sort(),
            share: Number((matchingTargets.length / targetCount).toFixed(4)),
            targetCount: matchingTargets.length,
            url,
          },
        );
      }
    }
  }

  for (const [label, urls] of labels) {
    if (urls.size > 1) {
      addFinding(
        "source-label-conflict",
        "warning",
        "data/target-quests",
        `Source label "${label}" points to multiple URLs.`,
        { urls: [...urls].sort() },
      );
    }
  }
}

export function analyzeTargetQuestHealth(rootDir, overrides = {}) {
  const options = { ...DEFAULT_HEALTH_OPTIONS, ...overrides };
  const findings = [];
  const addFinding = (ruleId, severity, location, message, details = undefined) => {
    const finding = { ruleId, severity, location, message };
    if (details && Object.keys(details).length > 0) finding.details = details;
    findings.push(finding);
  };

  const canonicalSkills = extractCanonicalSkills(rootDir, addFinding);
  const equipment = loadCatalog(rootDir, "equipment.json", "equipment", addFinding);
  const talents = loadCatalog(rootDir, "talents.json", "talents", addFinding);
  const kinds = Object.fromEntries(KINDS.map(kind => [kind, createKindMetrics()]));
  const seenTargets = new Set();
  const seenQuestIds = new Map();
  const sourceUsage = new Map();
  const seenIndexKinds = new Set();
  const seenAvailableKinds = new Set();

  const indexPath = path.join(rootDir, "data", "target-quests", "index.json");
  const index = readJson(rootDir, indexPath, addFinding);
  if (index && !Array.isArray(index.questFiles)) {
    addFinding("index-shape", "error", "data/target-quests/index.json", "questFiles must be an array.");
  }

  for (const [entryIndex, entry] of (Array.isArray(index?.questFiles) ? index.questFiles : []).entries()) {
    const entryLocation = `data/target-quests/index.json:questFiles[${entryIndex}]`;
    if (!isObject(entry)) {
      addFinding("index-entry-shape", "error", entryLocation, "Quest file entry must be an object.");
      continue;
    }
    if (!KINDS.includes(entry.kind)) {
      addFinding("unknown-kind", "error", entryLocation, `Unknown target kind "${entry.kind}".`);
      continue;
    }
    if (seenIndexKinds.has(entry.kind)) {
      addFinding("duplicate-index-kind", "error", entryLocation, `Target kind "${entry.kind}" is declared more than once.`);
    }
    seenIndexKinds.add(entry.kind);
    if (entry.status !== "available" && entry.status !== "planned") {
      addFinding("invalid-index-status", "error", entryLocation, `Unknown target quest status "${entry.status}".`);
      continue;
    }
    if (entry.status !== "available") continue;
    if (seenAvailableKinds.has(entry.kind)) {
      continue;
    }
    seenAvailableKinds.add(entry.kind);
    if (typeof entry.file !== "string" || !entry.file.trim()) {
      addFinding("missing-index-field", "error", entryLocation, "Available quest file entry is missing file.");
      continue;
    }

    const filePath = path.join(rootDir, "data", "target-quests", entry.file);
    const fileLocation = relativePath(rootDir, filePath);
    const data = readJson(rootDir, filePath, addFinding);
    if (!data) continue;
    if (data.kind !== entry.kind) {
      addFinding("file-kind-mismatch", "error", fileLocation, `File kind must be "${entry.kind}".`, { actual: data.kind });
    }
    if (!Array.isArray(data.targets)) {
      addFinding("targets-shape", "error", fileLocation, "targets must be an array.");
      continue;
    }
    data.targets.forEach((target, targetIndex) => analyzeTarget({
      target,
      targetIndex,
      fileLocation,
      kind: entry.kind,
      canonicalSkills,
      equipment,
      talents,
      seenTargets,
      seenQuestIds,
      sourceUsage,
      metrics: kinds[entry.kind],
      addFinding,
    }));
  }

  for (const kind of KINDS) {
    if (!seenIndexKinds.has(kind)) {
      addFinding("missing-index-kind", "error", "data/target-quests/index.json", `Missing target quest entry for "${kind}".`);
    }
  }

  for (const kind of KINDS) {
    kinds[kind].uniqueSources = new Set(
      [...sourceUsage.entries()]
        .filter(([, usage]) => usage.kinds.has(kind))
        .map(([url]) => url),
    ).size;
  }
  addSourceFindings({ sourceUsage, kinds, options, addFinding });
  sortFindings(findings);

  const errorCount = findings.filter(finding => finding.severity === "error").length;
  const warningCount = findings.filter(finding => finding.severity === "warning").length;
  const summary = {
    targets: KINDS.reduce((total, kind) => total + kinds[kind].targets, 0),
    quests: KINDS.reduce((total, kind) => total + kinds[kind].quests, 0),
    fundamental: KINDS.reduce((total, kind) => total + kinds[kind].fundamental, 0),
    dependent: KINDS.reduce((total, kind) => total + kinds[kind].dependent, 0),
    uniqueSources: sourceUsage.size,
    errors: errorCount,
    warnings: warningCount,
  };

  return {
    version: 1,
    status: errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "healthy",
    summary,
    kinds,
    findings,
  };
}

function formatDetails(details) {
  if (!details) return "";
  return ` Details: ${JSON.stringify(details)}`;
}

export function formatHealthReport(report, format = "text") {
  if (format === "json") return `${JSON.stringify(report, null, 2)}\n`;

  const lines = [];
  if (format === "markdown") {
    lines.push("# Target Quest Health Report", "", `**Status:** ${report.status.toUpperCase()}`, "");
    lines.push("## Summary", "", "| Kind | Targets | Quests | Fundamental | Dependent | Unique sources |", "|---|---:|---:|---:|---:|---:|");
    for (const kind of KINDS) {
      const metrics = report.kinds[kind];
      lines.push(`| ${kind} | ${metrics.targets} | ${metrics.quests} | ${metrics.fundamental} | ${metrics.dependent} | ${metrics.uniqueSources} |`);
    }
    lines.push(`| **Total** | **${report.summary.targets}** | **${report.summary.quests}** | **${report.summary.fundamental}** | **${report.summary.dependent}** | **${report.summary.uniqueSources}** |`);
    lines.push("", `Errors: **${report.summary.errors}**  `, `Warnings: **${report.summary.warnings}**`, "", "## Findings", "");
    if (report.findings.length === 0) {
      lines.push("No findings.");
    } else {
      for (const severity of ["error", "warning"]) {
        const matching = report.findings.filter(finding => finding.severity === severity);
        if (matching.length === 0) continue;
        lines.push(`### ${severity === "error" ? "Errors" : "Warnings"}`, "");
        for (const finding of matching) {
          lines.push(`- **${finding.ruleId}** at \`${finding.location}\`: ${finding.message}${formatDetails(finding.details)}`);
        }
        lines.push("");
      }
    }
    lines.push("## Refresh", "", "```powershell", "node scripts/report-target-quest-health.mjs --format markdown --output docs/reports/target-quest-health.md", "```", "");
    return `${lines.join("\n").trimEnd()}\n`;
  }

  lines.push(`Target quest health: ${report.status.toUpperCase()}`);
  lines.push(`Targets: ${report.summary.targets} | Quests: ${report.summary.quests} | Sources: ${report.summary.uniqueSources}`);
  lines.push(`Fundamental: ${report.summary.fundamental} | Dependent: ${report.summary.dependent}`);
  lines.push(`Errors: ${report.summary.errors} | Warnings: ${report.summary.warnings}`);
  for (const finding of report.findings) {
    lines.push(`[${finding.severity.toUpperCase()}] ${finding.ruleId} ${finding.location}: ${finding.message}${formatDetails(finding.details)}`);
  }
  return `${lines.join("\n")}\n`;
}

export function shouldFailReport(report, threshold) {
  if (threshold === "none") return false;
  if (threshold === "warning") return report.summary.errors > 0 || report.summary.warnings > 0;
  return report.summary.errors > 0;
}
