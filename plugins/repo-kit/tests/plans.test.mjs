import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../skills/plans/plans.mjs", import.meta.url));
const run = (...args) => spawnSync("node", [SCRIPT, ...args], { encoding: "utf8" });

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "plans-"));
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(root, "docs", "plans", name), text);
  return root;
}

const GOOD = `# Good plan

Status: in progress
Updated: 2026-01-31
Prefix: GP

## Tickets

- GP-1 (done) First.
- GP-2 (doing) Second.
- GP-3 (todo) Third.
`;

test("a good plan passes the check and prints on the board", () => {
  const root = repo({ "good.md": GOOD, "README.md": "# Plans\n" });
  assert.equal(run("--check", "--root", root).status, 0);
  const board = run("--root", root);
  assert.equal(board.status, 0);
  assert.match(board.stdout, /GP-2\s+doing\s+Second\./);
});

test("findings fail the check", () => {
  const root = repo({ "bad.md": "# Bad\n\nStatus: proposed\n\n## Tickets\n\n- BP-1 todo nope\n" });
  const r = run("--check", "--root", root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Status must be one of/);
  assert.match(r.stderr, /Prefix/);
  assert.match(r.stderr, /does not parse/);
});

test("the PR body needs a Plan: line that names real tickets", () => {
  const root = repo({ "good.md": GOOD });
  const body = (text) => {
    const f = join(root, "body.txt");
    writeFileSync(f, text);
    return run("--pr-body", f, "--root", root);
  };
  assert.equal(body("Plan: docs/plans/good.md GP-1 GP-2\n").status, 0);
  assert.equal(body("Plan: none, a typo.\n").status, 0);
  assert.equal(body("No plan line here\n").status, 1);
  assert.equal(body("Plan: none\n").status, 1);
  assert.equal(body("Plan: docs/plans/good.md GP-9\n").status, 1);
  assert.equal(body("Plan: docs/plans/missing.md\n").status, 1);
});

test("--brief shows open tickets only and never fails", () => {
  const root = repo({ "good.md": GOOD, "bad.md": "# Bad\n" });
  const r = run("--brief", "--root", root);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /GP-2 doing: Second\./);
  assert.doesNotMatch(r.stdout, /GP-1/);
  assert.match(r.stdout, /do not parse/);
});

test("--brief is silent in a repo with no plans", () => {
  const root = mkdtempSync(join(tmpdir(), "noplans-"));
  const r = run("--brief", "--root", root);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "");
});
