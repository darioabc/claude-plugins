#!/usr/bin/env node
/**
 * PreToolUse hook on Bash. Blocks a heredoc inside command substitution,
 * the `git commit -m "$(cat <<'EOF' ... EOF)"` form: macOS bash 3.2 does not
 * run it reliably and an apostrophe in the message ends the quoting, so
 * nothing gets committed. The message goes on stdin instead.
 *
 * Exit 2 with a reason on stderr blocks the call and tells Claude why.
 * Anything unexpected (no input, bad JSON) lets the call through.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function check(command) {
  if (typeof command !== "string") return null;
  // Text inside single quotes is literal (a grep for the pattern, say), so it
  // does not count. Then: $( , an optional `cat`, and << or <<-.
  const live = command.replace(/'[^']*'/g, "''");
  if (!/\$\(\s*(?:cat\s*)?<<-?/.test(live)) return null;
  return [
    "repo-kit: a heredoc inside $(...) breaks in macOS bash 3.2, and an apostrophe in it ends the quoting.",
    "Pass the text on stdin and end the command at EOF:",
    "  git commit -F - <<'EOF'",
    "  ...message...",
    "  EOF",
    "For gh, use --body-file - the same way (gh pr create --title \"...\" --body-file - <<'EOF').",
  ].join("\n");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    process.exit(0);
  }
  const reason = check(input?.tool_input?.command);
  if (reason) {
    process.stderr.write(reason + "\n");
    process.exit(2);
  }
  process.exit(0);
}
