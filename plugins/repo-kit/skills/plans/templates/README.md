# Plans

The record of work that spans sessions. A plan is a project: what was decided,
what is left, what a new session must not relitigate. Tickets live inside
their plan, never in separate files, because a ticket without its plan is
context lost. `node scripts/plans.mjs` prints the board and lints every file
here; `.github/workflows/plans.yml` runs the same lint on every pull request
and checks that the PR names a plan. With the repo-kit plugin on, every
session starts with the open plans and their open tickets in view.

## A plan file

`docs/plans/<slug>.md`, in this shape. The first lines are parsed.

```markdown
# Title

Status: in progress
Updated: 2026-01-31
Prefix: AB

## Goal
…

## Settled decisions
…

## Tickets

- AB-1 (done) What was done, in one line.
- AB-2 (doing) What is being done.
- AB-3 (todo) What is left.

## Log

- 2026-01-31: what moved.
```

- `Status` is one of `planned`, `in progress`, `paused`, `done`, `dropped`.
- `Updated` is the date the file last changed in substance. Bump it.
- `Prefix` is the ticket prefix, two to four capitals, unique across plans.
- A ticket is a list line `- <PREFIX>-<n> (<status>) text` under `## Tickets`.
  Status is one of `todo`, `doing`, `done`, `dropped`. Numbers are never
  reused; a dropped ticket stays in the list as dropped.
- Everything else is free prose. Settled decisions and a dated log are the
  sections that pay for themselves.

## A pull request

Every PR body carries one `Plan:` line:

```
Plan: docs/plans/<slug>.md AB-1 AB-2
```

or, for a one-off with no plan behind it,

```
Plan: none, a typo on the contact page.
```

The workflow fails the PR when the line is missing, when the plan file does
not exist, or when a named ticket is not in that plan. A PR that finishes a
ticket also flips it to `done` in the same diff, so the board and the history
agree.
