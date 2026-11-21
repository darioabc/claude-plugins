# CLAUDE.md, <repo>

<One paragraph: what this is, who it is for, the stack, where it is published.
Then the file to read first, if there is one: "Read README.md first.">

## Start here

<What a new session must know before changing anything: the doc that maps the
repo, anything generated at build time, the rules that are load bearing.>

For symbols, references and call sites in a large repo, use the jcodemunch
index (`resolve_repo` on the repo root, then `search_symbols` or
`get_ranked_context`); in a small one, Grep and Read are as cheap.

## Branches and deploys

- `main` is the deploy branch: <what a push to main does>. <If a push to main
  publishes:> Merging a PR is publishing: merge only when <owner> says so.
- Work on a branch off a fresh `origin/main` (fetch first) and open a PR
  against `main`. <Previews: where they appear and who can see them.>
- <Secrets the workflows need, by name only.>

## Commands

```bash
<install, dev server and its port, build (must pass before a PR), tests>
```

<The `.claude/launch.json` entry that starts the dev server, and its port.>

## What lives where

- `<path>`: <what it holds, and the rule that goes with it>.

## Decisions (do not undo)

- <Decision, who agreed it, date. Sessions do not reopen these; a change needs
  the person who agreed it.>

## Plans and pull requests

Work that spans sessions has a plan in `docs/plans/<slug>.md`, with a status,
an update date and tickets inside it (`docs/plans/README.md`). Every PR body
carries a `Plan:` line naming the plan and tickets it moves, or
`Plan: none, <reason>` for a one-off; a workflow fails the PR without it.

## Copy

<Language, case, tone.> No em dashes anywhere a reader sees them.

## Secrets

- <Where each secret lives: the password manager item, the host's settings,
  the local file (for example `.dev.vars` or `.env.local`), which must agree.>
- Sessions and worktrees never run the password manager's CLI and never ask
  for its values. A worktree copies the main checkout's local secrets file
  with mode 0600. If it is missing or stale, stop and ask <owner> to refresh it.
- Never print, attach or commit a secrets file or its values.

## Commits

Pass a commit message on stdin: `git commit -F - <<'EOF'` … `EOF`. A heredoc
inside `$(...)` breaks in macOS bash 3.2, and an apostrophe in it ends the
quoting, so nothing gets committed (the repo-kit plugin blocks that form).
