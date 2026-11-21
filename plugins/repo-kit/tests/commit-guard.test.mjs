import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { check } from "../hooks/commit-guard.mjs";

const HOOK = fileURLToPath(new URL("../hooks/commit-guard.mjs", import.meta.url));
const run = (input) => spawnSync("node", [HOOK], { input, encoding: "utf8" });

test("blocks a commit message through $(cat <<EOF)", () => {
  assert.ok(check(`git commit -m "$(cat <<'EOF'\nA fix\nEOF\n)"`));
  assert.ok(check(`git commit -m "$(cat <<EOF\nIt's a fix\nEOF\n)"`));
  assert.ok(check(`gh pr create --title x --body "$(cat <<'EOF'\nbody\nEOF\n)"`));
  assert.ok(check(`git -C repo commit -m "$( cat <<-EOF\nx\nEOF\n)"`));
});

test("lets the stdin forms and ordinary commands through", () => {
  assert.equal(check(`git commit -F - <<'EOF'\nIt's a fix\nEOF`), null);
  assert.equal(check(`gh pr create --title x --body-file - <<'EOF'\nbody\nEOF`), null);
  assert.equal(check(`git commit -m "A fix"`), null);
  assert.equal(check(`echo "$(date)"`), null);
  assert.equal(check(`grep -n '$(cat <<' CLAUDE.md`), null);
  assert.equal(check(undefined), null);
});

test("as a hook: exit 2 with a reason, exit 0 otherwise", () => {
  const blocked = run(JSON.stringify({ tool_name: "Bash", tool_input: { command: `git commit -m "$(cat <<'EOF'\nx\nEOF\n)"` } }));
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /git commit -F -/);

  const fine = run(JSON.stringify({ tool_name: "Bash", tool_input: { command: "git status" } }));
  assert.equal(fine.status, 0);

  assert.equal(run("not json").status, 0);
});
