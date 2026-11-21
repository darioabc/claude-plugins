---
name: plans
description: The docs/plans convention for work that spans sessions. Use when starting or picking up multi-session work (write or update its plan), when a change finishes a ticket (flip it to done in the same diff), when opening a pull request (its body needs a "Plan:" line), when a plan file fails the lint, or to add the convention to a repo that lacks it.
argument-hint: "[install | new <slug> | check]"
---

# plans

A plan is `docs/plans/<slug>.md`: a status, an update date, a ticket prefix,
tickets inside it, and free prose (goal, settled decisions, a dated log).
The full format is `templates/README.md` in this skill's folder, which is
also the `docs/plans/README.md` a repo carries. The lint is `plans.mjs` here;
a repo runs its copy at `scripts/plans.mjs`.

With the repo-kit plugin on, a session starts with the open plans and their
open tickets printed into context, so read that before proposing work.

## In a repo that has the convention

- **Before work that will outlive this session**, find its plan or write one
  from `templates/plan.md`: a unique prefix (two to four capitals, check the
  others), `Status: planned` or `in progress`, today's date in `Updated`,
  one ticket per step that can land alone.
- **Settled decisions** go in the plan with who decided and when. A new
  session reads them and does not reopen them.
- **A PR that finishes a ticket** flips it to `(done)` in the same diff and
  bumps `Updated`. A ticket's number is never reused; a dropped one stays,
  marked `(dropped)`.
- **Every PR body** carries one line: `Plan: docs/plans/<slug>.md AB-1 AB-2`,
  or `Plan: none, <reason>` for a one-off. The workflow fails without it. Edit
  the body (`gh pr edit --body-file -`), not the code, to fix that failure.
- **Check before pushing**: `node scripts/plans.mjs --check`.

## `install`: add the convention to a repo

Work on a branch off a fresh `origin/main`. Then:

1. Copy `plans.mjs` to `scripts/plans.mjs`, and `templates/README.md` to
   `docs/plans/README.md`.
2. If the repo has a `package.json`, add `"plans": "node scripts/plans.mjs"`
   and `"plans:check": "node scripts/plans.mjs --check"` to its scripts.
3. Copy `templates/plans.yml` to `.github/workflows/plans.yml`. If the default
   branch is not `main`, change `branches:`.
4. Copy `templates/pull_request_template.md` to
   `.github/pull_request_template.md`, unless the repo has one: then add the
   `Plan:` line at its top.
5. Bring existing plan documents into the format without rewriting them: put
   the three head lines under the title (replacing an old free-text status
   line), and add `## Tickets` with one ticket per step or open item, marked
   by what the repo and its history show. Mark only what you can verify;
   leave the rest `(todo)` and say so in the PR.
6. Add a short "Plans and pull requests" section to `CLAUDE.md` pointing at
   `docs/plans/README.md`.
7. Run `node scripts/plans.mjs` (the board) and `--check`. Both must pass.

Once this lands, every open PR needs a `Plan:` line in its body on its next
run. Say so in the PR that adds the workflow.

## `new <slug>`

Write `docs/plans/<slug>.md` from `templates/plan.md` with a prefix no other
plan uses, then run the check.

## `check`

Run `node scripts/plans.mjs --check` (or this skill's `plans.mjs --check
--root <repo>` where the repo has no copy) and fix what it reports.
