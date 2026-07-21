import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

function extractFunction(name, endMarker) {
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist in index.html`);
  const asyncStart = html.lastIndexOf("async ", start);
  const declarationStart = asyncStart === start - 6 ? asyncStart : start;

  const end = html.indexOf(endMarker, start);
  assert.notEqual(end, -1, `${name} must end before ${endMarker.trim()}`);

  return vm.runInNewContext(`(${html.slice(declarationStart, end).trim()})`);
}

function response(status, body = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test("generateShowcaseREADME uses the profile GitHub username", () => {
  const generateShowcaseREADME = extractFunction(
    "generateShowcaseREADME",
    "\n    async function getRepositoryReadmeState",
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
    "\n    async function getRepositoryReadmeState",
  );

  const fallback = generateShowcaseREADME({ github: "rani" });
  const normalized = generateShowcaseREADME({
    name: "Rani\nDeveloper",
    github: "rani",
  });

  assert.match(fallback, /^# rani - ulong RPG Showcase$/m);
  assert.match(normalized, /^# Rani Developer - ulong RPG Showcase$/m);
});

test("repository API retains a custom README path for the edit action", async () => {
  const getRepositoryReadmeState = extractFunction(
    "getRepositoryReadmeState",
    "\n    function getReadmeAction",
  );
  const getReadmeAction = extractFunction(
    "getReadmeAction",
    "\n    function createReadmeActionHandler",
  );
  const responses = [
    response(200, { size: 10, default_branch: "feature/readme" }),
    response(200, { path: "docs/Read Me#.md" }),
  ];

  const state = await getRepositoryReadmeState("budi-dev", async () => responses.shift());

  assert.deepEqual(
    { ...state },
    {
      repository: "existing",
      branch: "feature/readme",
      readmePath: "docs/Read Me#.md",
    },
  );
  assert.deepEqual(
    { ...getReadmeAction("budi-dev", state.branch, state.readmePath) },
    {
      label: "Copy README & Edit",
      url: "https://github.com/budi-dev/ulong/edit/feature%2Freadme/docs/Read%20Me%23.md",
    },
  );
});

test("repository API uses create actions for missing, empty, and new repositories", async () => {
  const getRepositoryReadmeState = extractFunction(
    "getRepositoryReadmeState",
    "\n    function getReadmeAction",
  );
  const getReadmeAction = extractFunction(
    "getReadmeAction",
    "\n    function createReadmeActionHandler",
  );
  const cases = [
    {
      name: "missing README",
      responses: [response(200, { size: 10, default_branch: "develop" }), response(404)],
      expected: { repository: "existing", branch: "develop", readmePath: null },
    },
    {
      name: "empty repository",
      responses: [response(200, { size: 0, default_branch: "trunk" })],
      expected: { repository: "empty", branch: "trunk", readmePath: null },
    },
    {
      name: "new repository",
      responses: [response(404)],
      expected: { repository: "new", branch: "main", readmePath: null },
    },
  ];

  for (const scenario of cases) {
    const state = await getRepositoryReadmeState(
      "budi-dev",
      async () => scenario.responses.shift(),
    );
    assert.deepEqual({ ...state }, scenario.expected, scenario.name);
    assert.deepEqual(
      { ...getReadmeAction("budi-dev", state.branch, state.readmePath) },
      {
        label: "Copy README & Create",
        url: `https://github.com/budi-dev/ulong/new/${state.branch}`,
      },
      scenario.name,
    );
  }
});

test("transient API failures preserve unknown repository and conservative README states", async () => {
  const getRepositoryReadmeState = extractFunction(
    "getRepositoryReadmeState",
    "\n    function getReadmeAction",
  );
  const getReadmeAction = extractFunction(
    "getReadmeAction",
    "\n    function createReadmeActionHandler",
  );
  const unknownRepository = await getRepositoryReadmeState(
    "budi-dev",
    async () => response(503),
  );
  assert.deepEqual(
    { ...unknownRepository },
    { repository: "unknown", branch: "main", readmePath: "README.md" },
  );

  const responses = [
    response(200, { size: 10, default_branch: "develop" }),
    response(503),
  ];
  const unknownReadme = await getRepositoryReadmeState(
    "budi-dev",
    async () => responses.shift(),
  );
  assert.deepEqual(
    { ...unknownReadme },
    { repository: "existing", branch: "develop", readmePath: "README.md" },
  );
  assert.deepEqual(
    { ...getReadmeAction("budi-dev", unknownReadme.branch, unknownReadme.readmePath) },
    {
      label: "Copy README & Edit",
      url: "https://github.com/budi-dev/ulong/edit/develop/README.md",
    },
  );
});

test("README action copies successfully without downloading a fallback", async () => {
  const createReadmeActionHandler = extractFunction(
    "createReadmeActionHandler",
    "\n    function triggerContentDownload",
  );
  const writes = [];
  const downloads = [];
  const button = { textContent: "Copy README & Edit" };
  const handler = createReadmeActionHandler(
    "# Showcase\n",
    button,
    { writeText: async value => writes.push(value) },
    (...args) => downloads.push(args),
  );

  assert.equal(await handler(), true);
  assert.deepEqual(writes, ["# Showcase\n"]);
  assert.deepEqual(downloads, []);
  assert.equal(button.textContent, "✓ README Copied");
});

test("README action downloads one Markdown fallback while a failed copy is pending", async () => {
  const createReadmeActionHandler = extractFunction(
    "createReadmeActionHandler",
    "\n    function triggerContentDownload",
  );
  const downloads = [];
  let rejectCopy;
  let writeCount = 0;
  const clipboard = {
    writeText: () => {
      writeCount += 1;
      return new Promise((resolve, reject) => { rejectCopy = reject; });
    },
  };
  const handler = createReadmeActionHandler(
    "# Showcase\n",
    { textContent: "Copy README & Edit" },
    clipboard,
    (...args) => downloads.push(args),
  );

  const firstClick = handler();
  assert.equal(await handler(), false, "a repeated pending click must skip copy and download");
  rejectCopy(new Error("clipboard denied"));
  assert.equal(await firstClick, false);
  assert.equal(writeCount, 1);
  assert.deepEqual(downloads, [["# Showcase\n", "README.md", "text/markdown"]]);
});

test("makeStep renders the README action as an ordinary GitHub link", () => {
  const makeStep = extractFunction(
    "makeStep",
    '\n    document.getElementById("btn-do-export")',
  );

  const step = makeStep(
    3,
    "Tambahkan README.md",
    "Upload ke root repo",
    "Copy README & Edit",
    "https://github.com/budi-dev/ulong/edit/main/README.md",
    "export-readme-action",
    false,
    false,
  );

  assert.match(step, /class="export-step-btn export-readme-action"/);
  assert.match(step, /href="https:\/\/github\.com\/budi-dev\/ulong\/edit\/main\/README\.md"/);
  assert.match(step, /target="_blank"/);
  assert.doesNotMatch(step, /download=/);
});

test("all repository guide states include README copy and edit behavior", () => {
  const flowStart = html.indexOf(
    'document.getElementById("btn-do-export").addEventListener',
  );
  const flowEnd = html.indexOf("// HTML GENERATOR", flowStart);
  const exportFlow = html.slice(flowStart, flowEnd);

  assert.notEqual(flowStart, -1);
  assert.notEqual(flowEnd, -1);
  assert.equal(
    [...exportFlow.matchAll(/readmeAction\.url/g)].length,
    3,
    "one README action per repository-state guide branch",
  );
  assert.equal(
    [...exportFlow.matchAll(/export-readme-action/g)].length,
    4,
    "new, empty, and existing repositories must expose the README action",
  );
  assert.match(html, /\/ulong\/readme`\)/, "README existence must be checked");
  assert.match(exportFlow, /createReadmeActionHandler\(/);
  assert.match(exportFlow, /repositoryState\.repository === "unknown"/);
  assert.match(exportFlow, /Status repository GitHub tidak bisa diperiksa/);
  assert.doesNotMatch(exportFlow, /Add a README file/);
  assert.doesNotMatch(exportFlow, /readmeDownloadUrl/);

  const bindingStart = exportFlow.indexOf("const readmeButton");
  const bindingEnd = exportFlow.indexOf("fallbackWrap.style.display", bindingStart);
  const readmeBinding = exportFlow.slice(bindingStart, bindingEnd);
  assert.doesNotMatch(readmeBinding, /preventDefault/);
  assert.doesNotMatch(readmeBinding, /window\.open/);
});
