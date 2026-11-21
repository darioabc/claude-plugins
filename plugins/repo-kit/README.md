# repo-kit

One project setup for every repo, so a Claude Code session behaves the same way
whichever project it opens in.

## Skills

- **`/repo-kit:setup [audit | all]`** surveys a repo and brings it to the house
  setup, adapted to its stack: CLAUDE.md in a fixed shape (Start here, Branches
  and deploys, Commands, What lives where, Decisions, Plans and pull requests,
  Copy, Secrets, Commits), the plugin turned on in `.claude/settings.json`, the
  dev server in `.claude/launch.json`, local-only files ignored, a secrets rule.
  It lists what is missing and asks before changing anything. In an existing
  CLAUDE.md it only adds; it never rewrites a decisions section.
- **`/repo-kit:plans [install | new <slug> | check]`** is the `docs/plans`
  convention: one file per piece of work that spans sessions, with a status, an
  update date, a ticket prefix and tickets; a `Plan:` line in every PR body; a
  lint (`plans.mjs`) and a workflow that fails a PR without the line. `install`
  copies the script, the workflow, the PR template and the README into a repo.

## Hooks

- **SessionStart**: prints the open plans and their open tickets, when the repo
  has `docs/plans/`. Silent otherwise.
- **PreToolUse on Bash**: blocks a heredoc inside `$(...)`, as in
  `git commit -m "$(cat <<'EOF' ... EOF)"`. macOS bash 3.2 does not run it
  reliably and an apostrophe in the message ends the quoting. The message
  points to `git commit -F - <<'EOF'` and `gh ... --body-file -`.

Both need `node` on the PATH.

## Not in it

Anything one project owns: its repo map, its design system, its content skills.
Those stay in that repo's `.claude/skills/`.
