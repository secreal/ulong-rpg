import { analyzeTargetQuestHealth } from "./lib/target-quest-health.mjs";

const root = process.cwd();
const report = analyzeTargetQuestHealth(root);
const errors = report.findings.filter(finding => finding.severity === "error");

for (const finding of errors) {
  console.error(`${finding.location}: [${finding.ruleId}] ${finding.message}`);
}

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`Target quest validation passed for ${report.summary.targets} targets and ${report.summary.quests} quests.`);
}
