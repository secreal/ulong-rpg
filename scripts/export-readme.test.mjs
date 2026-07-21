import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

function extractFunction(name, endMarker) {
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist in index.html`);

  const end = html.indexOf(endMarker, start);
  assert.notEqual(end, -1, `${name} must end before ${endMarker.trim()}`);

  return vm.runInNewContext(`(${html.slice(start, end).trim()})`);
}

test("generateShowcaseREADME uses the profile GitHub username", () => {
  const generateShowcaseREADME = extractFunction(
    "generateShowcaseREADME",
    "\n    function triggerDownload",
  );

  const readme = generateShowcaseREADME({
    name: "Budi",
    nick: "@budi",
    github: "budi-dev",
  });

  assert.match(readme, /^# Budi - ulong RPG Showcase$/m);
  assert.match(
    readme,
    /\[budi-dev\.github\.io\/ulong\]\(https:\/\/budi-dev\.github\.io\/ulong\/\)/,
  );
  assert.doesNotMatch(readme, /secreal/i);
});

test("generateShowcaseREADME falls back to a single-line username title", () => {
  const generateShowcaseREADME = extractFunction(
    "generateShowcaseREADME",
    "\n    function triggerDownload",
  );

  const fallback = generateShowcaseREADME({ github: "rani" });
  const normalized = generateShowcaseREADME({
    name: "Rani\nDeveloper",
    github: "rani",
  });

  assert.match(fallback, /^# rani - ulong RPG Showcase$/m);
  assert.match(normalized, /^# Rani Developer - ulong RPG Showcase$/m);
});

test("makeStep renders a filename-bearing README download action", () => {
  const makeStep = extractFunction(
    "makeStep",
    '\n    document.getElementById("btn-do-export")',
  );

  const step = makeStep(
    3,
    "Tambahkan README.md",
    "Upload ke root repo",
    "Download README.md",
    "data:text/markdown,test",
    "",
    false,
    false,
    "README.md",
  );

  assert.match(step, /download="README\.md"/);
  assert.doesNotMatch(step, /target="_blank"/);
});

test("all repository guide states include the README download", () => {
  const flowStart = html.indexOf(
    'document.getElementById("btn-do-export").addEventListener',
  );
  const flowEnd = html.indexOf("// HTML GENERATOR", flowStart);
  const exportFlow = html.slice(flowStart, flowEnd);

  assert.notEqual(flowStart, -1);
  assert.notEqual(flowEnd, -1);
  assert.equal(
    [...exportFlow.matchAll(/readmeDownloadUrl/g)].length,
    4,
    "one declaration and one README action per repository-state branch",
  );
  assert.equal(
    [...exportFlow.matchAll(/"README\.md"/g)].length,
    3,
    "new, empty, and existing repositories must download README.md",
  );
});
