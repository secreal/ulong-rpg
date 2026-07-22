import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import { createAgentBridge } from "./lib/ulong-agent-bridge.mjs";

function makeHarness() {
  const state = {
    progress: { "skill::Frontend Developer::Version Control": 1 },
    profile: { name: "Ulong" },
  };
  const commits = [];
  const events = [];
  const resources = Object.fromEntries(Object.keys(state).map(name => [name, {
    read: () => state[name],
    write: value => {
      state[name] = value;
      commits.push({ name, value: structuredClone(value) });
    },
  }]));
  const bridge = createAgentBridge({
    resources,
    contextProvider: ({ revision }) => ({ app: "ulong RPG", revision, activeJobs: ["Frontend Developer"] }),
    emit: (type, detail) => events.push({ type, detail }),
  });
  return { bridge, state, commits, events };
}

test("discovers six primitive capabilities and registered resources", () => {
  const { bridge } = makeHarness();
  const discovery = bridge.list_capabilities();

  assert.equal(discovery.version, 1);
  assert.equal(discovery.revision, 0);
  assert.deepEqual(discovery.capabilities.map(item => item.name), [
    "list_capabilities",
    "get_context",
    "read_resource",
    "set_value",
    "delete_value",
    "complete_task",
  ]);
  assert.deepEqual(discovery.resources, ["profile", "progress"]);
});

test("reads cloned snapshots and dynamic context", async () => {
  const { bridge, state } = makeHarness();
  const snapshot = bridge.read_resource({ resource: "profile" });
  snapshot.name = "Changed outside";

  assert.equal(state.profile.name, "Ulong");
  assert.deepEqual(await bridge.get_context(), {
    bridgeVersion: 1,
    revision: 0,
    capabilities: [
      "list_capabilities",
      "get_context",
      "read_resource",
      "set_value",
      "delete_value",
      "complete_task",
    ],
    resources: ["profile", "progress"],
    app: "ulong RPG",
    activeJobs: ["Frontend Developer"],
  });
});

test("creates, updates, and deletes nested values with one commit each", () => {
  const { bridge, state, commits, events } = makeHarness();

  const created = bridge.set_value({
    resource: "profile",
    path: ["links", "github"],
    value: "https://github.com/secreal",
    expectedRevision: 0,
  });
  const updated = bridge.set_value({
    resource: "profile",
    path: ["name"],
    value: "Anto",
    expectedRevision: 1,
  });
  const removed = bridge.delete_value({
    resource: "profile",
    path: ["links", "github"],
    expectedRevision: 2,
  });

  assert.equal(created.revision, 1);
  assert.equal(updated.revision, 2);
  assert.equal(removed.revision, 3);
  assert.deepEqual(state.profile, { name: "Anto", links: {} });
  assert.equal(commits.length, 3);
  assert.deepEqual(events.map(item => item.type), [
    "ulong:agent-state-change",
    "ulong:agent-state-change",
    "ulong:agent-state-change",
  ]);
  assert.deepEqual(events[0].detail, {
    operation: "set",
    resource: "profile",
    path: ["links", "github"],
    previousRevision: 0,
    revision: 1,
  });
});

test("supports array paths without creating sparse arrays", () => {
  const { bridge, state } = makeHarness();

  bridge.set_value({ resource: "profile", path: ["history"], value: [], expectedRevision: 0 });
  bridge.set_value({ resource: "profile", path: ["history", 0], value: { company: "Acme" }, expectedRevision: 1 });
  bridge.set_value({ resource: "profile", path: ["history", 0, "role"], value: "Developer", expectedRevision: 2 });
  bridge.delete_value({ resource: "profile", path: ["history", 0], expectedRevision: 3 });

  assert.deepEqual(state.profile.history, []);
  assert.throws(() => bridge.set_value({
    resource: "profile",
    path: ["history", 2],
    value: "gap",
    expectedRevision: 4,
  }), /sparse array/i);
});

test("rejects invalid or stale mutations before committing", () => {
  const { bridge, commits } = makeHarness();
  const cyclic = {};
  cyclic.self = cyclic;
  const cases = [
    () => bridge.set_value({ resource: "missing", path: ["x"], value: 1, expectedRevision: 0 }),
    () => bridge.set_value({ resource: "profile", path: [], value: 1, expectedRevision: 0 }),
    () => bridge.set_value({ resource: "profile", path: ["__proto__", "polluted"], value: true, expectedRevision: 0 }),
    () => bridge.set_value({ resource: "profile", path: ["x"], value: undefined, expectedRevision: 0 }),
    () => bridge.set_value({ resource: "profile", path: ["x"], value: cyclic, expectedRevision: 0 }),
    () => bridge.set_value({ resource: "profile", path: ["x"], value: 1, expectedRevision: 9 }),
    () => bridge.delete_value({ resource: "profile", path: ["missing"], expectedRevision: 0 }),
  ];

  for (const operation of cases) assert.throws(operation);
  assert.equal(commits.length, 0);
  assert.equal({}.polluted, undefined);
  assert.equal(bridge.list_capabilities().revision, 0);
});

test("adapter failures do not increment revision or emit success", () => {
  const events = [];
  const bridge = createAgentBridge({
    resources: {
      progress: {
        read: () => ({ value: 1 }),
        write: () => { throw new Error("storage unavailable"); },
      },
    },
    emit: (type, detail) => events.push({ type, detail }),
  });

  assert.throws(() => bridge.set_value({
    resource: "progress",
    path: ["value"],
    value: 2,
    expectedRevision: 0,
  }), /storage unavailable/);
  assert.equal(bridge.list_capabilities().revision, 0);
  assert.deepEqual(events, []);
});

test("event failures do not turn a persisted mutation into a failed write", () => {
  const state = { progress: { value: 1 } };
  const bridge = createAgentBridge({
    resources: {
      progress: {
        read: () => state.progress,
        write: value => { state.progress = value; },
      },
    },
    emit: () => { throw new Error("subscriber failed"); },
  });

  const result = bridge.set_value({
    resource: "progress",
    path: ["value"],
    value: 2,
    expectedRevision: 0,
  });

  assert.equal(state.progress.value, 2);
  assert.equal(bridge.list_capabilities().revision, 1);
  assert.deepEqual(result, {
    status: "applied",
    operation: "set",
    resource: "progress",
    path: ["value"],
    previousRevision: 0,
    revision: 1,
    notificationError: "subscriber failed",
  });
});

test("complete_task emits an explicit completion signal without changing revision", () => {
  const { bridge, events } = makeHarness();
  const result = bridge.complete_task({ summary: "Updated one skill and verified the card." });

  assert.deepEqual(result, { status: "complete", revision: 0, summary: "Updated one skill and verified the card." });
  assert.deepEqual(events.at(-1), {
    type: "ulong:agent-complete",
    detail: { revision: 0, summary: "Updated one skill and verified the card." },
  });
  assert.throws(() => bridge.complete_task({ summary: "  " }), /summary/i);
});

test("index registers all parity resources and AUTO prompt names every primitive", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const requiredResources = [
    "progress",
    "questProgress",
    "profile",
    "links",
    "auto",
    "language",
    "jobChange",
    "guild",
    "achievements",
    "ulongProgress",
  ];
  const capabilities = [
    "list_capabilities",
    "get_context",
    "read_resource",
    "set_value",
    "delete_value",
    "complete_task",
  ];

  for (const resource of requiredResources) {
    assert.match(html, new RegExp(`\\b${resource}:\\s*\\{`), `${resource} adapter must be registered`);
  }
  for (const capability of capabilities) {
    assert.match(html, new RegExp(`\\b${capability}\\b`), `${capability} must be documented in AUTO prompt`);
  }
  for (const catalogPath of [
    "data/equipment.json",
    "data/talents.json",
    "data/target-quests/index.json",
    "data/target-quests/skills.json",
    "data/target-quests/equipment.json",
    "data/target-quests/talents.json",
  ]) {
    assert.match(html, new RegExp(catalogPath.replaceAll("/", "\\/")), `${catalogPath} must be discoverable from agent context`);
  }
  assert.doesNotMatch(html, /choose_next_quest|level_up_everything/);
});

test("AUTO prompt builder preserves outcome language instead of a hardcoded quest workflow", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const start = html.indexOf("function buildAgentPrompt(");
  const end = html.indexOf("\n      copyBtn.addEventListener", start);
  assert.notEqual(start, -1, "buildAgentPrompt must exist in index.html");
  assert.notEqual(end, -1, "buildAgentPrompt must end before AUTO copy handler");
  const buildAgentPrompt = vm.runInNewContext(`(${html.slice(start, end).trim()})`);
  const prompt = buildAgentPrompt({
    bridgeVersion: 1,
    revision: 4,
    capabilities: ["read_resource", "set_value", "complete_task"],
    resources: ["progress", "questProgress"],
    app: "ulong RPG",
    progressSummary: { activeSkills: 3, completedQuests: 2 },
  });

  assert.match(prompt, /ulong RPG/);
  assert.match(prompt, /read_resource/);
  assert.match(prompt, /set_value/);
  assert.match(prompt, /complete_task/);
  assert.match(prompt, /"revision": 4/);
  assert.doesNotMatch(prompt, /the next relevant quest/i);
});
