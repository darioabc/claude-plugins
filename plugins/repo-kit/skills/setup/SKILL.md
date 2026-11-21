---
name: setup
description: Set up or audit a repo so Claude Code sessions in it work the same way as in the owner's other projects. CLAUDE.md in the house shape, the plugin turned on in .claude/settings.json, a dev server in .claude/launch.json, local-only files ignored, the plans convention and a secrets rule. Use for a new repo, a repo split out of another, or when asked to bring a repo in line with the others.
argument-hint: "[audit | all]"
---

# setup

Bring a repo to the house setup, adapted to its stack. Copy the shape, never
another project's content: commands, ports, names, rules and decisions come
from this repo and its owner. The templates are in `templates/` in this
skill's folder; the plans convention is the `plans` skill beside it
(`../plans/`).

## 1. Survey

Read, before proposing anything:

- `README.md`, `CLAUDE.md` or `AGENTS.md`, and anything they say to read first.
- The manifest (`package.json` or its equivalent): dev, build and test commands,
  the runtime version (`.nvmrc`, `engines`).
- `.github/workflows/`: what a push to `main` does (does merging publish?), what
  runs on a PR, which secrets the workflows name.
- `.gitignore`, `.claude/` (`settings.json`, `launch.json`), `docs/plans/`.
- Other open branches and PRs that touch the same files
  (`git diff --stat origin/main...<branch> -- CLAUDE.md README.md .github`), so
  your edits stay small where theirs are and both merge cleanly.

## 2. Compare with the house setup

| Piece | What it is |
| --- | --- |
| CLAUDE.md | `templates/CLAUDE.md`: what the repo is, Start here, Branches and deploys, Commands, What lives where, Decisions (do not undo), Plans and pull requests, Copy, Secrets, Commits. Every section says something true about this repo; drop a section that has nothing to say. |
| Plugin on | `templates/settings.json` merged into `.claude/settings.json`, so every session in the repo, local or cloud, gets these skills and hooks. |
| Dev server | `.claude/launch.json` with one entry per server the repo runs: a name, the command, a port. Pick a port no sibling checkout uses (grep `"port"` in `../*/.claude/launch.json`). When the repo pins a Node version, start it through nvm: `"runtimeExecutable": "bash"`, `"runtimeArgs": ["-c", ". \"$HOME/.nvm/nvm.sh\" && nvm use --silent && exec npm run dev -- --port <port>"]`. |
| Ignored | `templates/gitignore.txt` appended to `.gitignore`, plus the repo's local secrets files (`.env*`, `.dev.vars*`), keeping any committed template (`!.env.example`, `!.dev.vars.tpl`). |
| Plans | The `plans` skill's `install`: `docs/plans/`, `scripts/plans.mjs`, the PR check and template. |
| Secrets | The Secrets section: where each secret lives, sessions never run the password manager's CLI, worktrees copy the main checkout's file with mode 0600, nothing printed or committed. |
| Deploy rule | If merging publishes, Branches and deploys says so and says who decides when. |

## 3. Ask

List what the repo lacks, one line each, with a recommendation and why, and ask
which to apply (AskUserQuestion, multi-select). With `audit`, stop after the
list. With `all`, apply everything that fits without asking.

## 4. Apply

- Branch off a fresh `origin/main` (`git fetch` first); never on `main`.
- In an existing CLAUDE.md, add what is missing and leave the rest alone: never
  reword, reorder or drop a section, and never touch a decisions section. Put a
  new section where no open branch is editing, so the merge stays clean.
- A new CLAUDE.md starts from the template with every placeholder filled from
  the survey or the owner's answers. Leave out what you do not know rather
  than guess it; list it in the PR as open.
- Do not change deploy workflows or hosting config as part of setup.

## 5. Check and open the PR

- The repo's build passes; `node scripts/plans.mjs --check` passes; every JSON
  file you touched parses.
- Open a PR against `main` with a short summary of what was added and why, and
  `Plan: none, repo setup` (or the plan it belongs to). Say there that open PRs
  need a `Plan:` line once the check is on `main`, and that a session in the
  repo asks to install the plugin the first time it starts after the merge.
- Merge only when the owner says so.
