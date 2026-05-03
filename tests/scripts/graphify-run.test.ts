import test from "node:test";
import assert from "node:assert/strict";
import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";
import {
  MISSING_GRAPHIFY_MESSAGE,
  USAGE,
  graphifyArgs,
  runGraphifyWrapper,
} from "../../scripts/graphify-run.js";

type Call = {
  command: string;
  args: readonly string[];
  options: SpawnSyncOptions;
};

function ok(): SpawnSyncReturns<Buffer> {
  return {
    pid: 1,
    output: [],
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    status: 0,
    signal: null,
  };
}

function failed(status = 1): SpawnSyncReturns<Buffer> {
  return {
    pid: 1,
    output: [],
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    status,
    signal: null,
  };
}

function withError(code: string): SpawnSyncReturns<Buffer> {
  return {
    ...failed(1),
    error: Object.assign(new Error(code), { code }),
  };
}

function spawnSequence(results: SpawnSyncReturns<Buffer>[]) {
  const calls: Call[] = [];
  const spawn = (command: string, args: readonly string[], options: SpawnSyncOptions) => {
    calls.push({ command, args, options });
    return results.shift() ?? ok();
  };
  return { calls, spawn };
}

test("TEST-GRAPH-001: --help is rejected by the wrapper", () => {
  const { calls, spawn } = spawnSequence([ok()]);
  const result = runGraphifyWrapper(["--help"], spawn, "linux");

  assert.equal(result.code, 3);
  assert.equal(result.stderr, USAGE);
  assert.deepEqual(calls, []);
});

test("TEST-GRAPH-002: full graph run dispatches graphify update with force into graph/", () => {
  const { calls, spawn } = spawnSequence([ok(), ok()]);
  const result = runGraphifyWrapper([], spawn, "linux", {});

  assert.equal(result.code, 0);
  assert.equal(calls[0].command, "graphify");
  assert.deepEqual(calls[0].args, ["--help"]);
  assert.equal(calls[0].options.stdio, "ignore");
  assert.equal(calls[1].command, "graphify");
  assert.deepEqual(calls[1].args, ["update", ".", "--force"]);
  assert.equal(calls[1].options.stdio, "inherit");
  assert.equal((calls[1].options.env as NodeJS.ProcessEnv).GRAPHIFY_OUT, "graph");
});

test("TEST-GRAPH-003: incremental graph run dispatches graphify update without force", () => {
  const { calls, spawn } = spawnSequence([ok(), ok()]);
  const result = runGraphifyWrapper(["--update"], spawn, "linux", {});

  assert.equal(result.code, 0);
  assert.deepEqual(calls[1].args, ["update", "."]);
});

test("TEST-GRAPH-004: missing graphify exits 1 with the documented message", () => {
  const { spawn } = spawnSequence([withError("ENOENT")]);
  const result = runGraphifyWrapper([], spawn, "linux");

  assert.equal(result.code, 1);
  assert.equal(result.stderr, MISSING_GRAPHIFY_MESSAGE);
});

test("TEST-GRAPH-005: unsupported arguments are rejected", () => {
  const { calls, spawn } = spawnSequence([ok()]);
  const result = runGraphifyWrapper(["--bad-arg"], spawn, "linux");

  assert.equal(result.code, 3);
  assert.equal(result.stderr, USAGE);
  assert.deepEqual(calls, []);
});

test("TEST-GRAPH-006: non-zero graphify availability check exits 1", () => {
  const { spawn } = spawnSequence([failed(1)]);
  const result = runGraphifyWrapper([], spawn, "linux");

  assert.equal(result.code, 1);
  assert.equal(result.stderr, MISSING_GRAPHIFY_MESSAGE);
});

test("TEST-GRAPH-012: graphify failure after availability exits 2", () => {
  const { spawn } = spawnSequence([ok(), failed(7)]);
  const result = runGraphifyWrapper([], spawn, "linux");

  assert.equal(result.code, 2);
});

test("EC-GRAPH-003: Windows runs graphify through the shell for command shims", () => {
  const { calls, spawn } = spawnSequence([ok(), ok()]);
  const result = runGraphifyWrapper([], spawn, "win32");

  assert.equal(result.code, 0);
  assert.equal(calls[0].options.shell, true);
  assert.equal(calls[1].options.shell, true);
});

test("graphifyArgs documents full and incremental argv", () => {
  assert.deepEqual(graphifyArgs(false), ["update", ".", "--force"]);
  assert.deepEqual(graphifyArgs(true), ["update", "."]);
});
