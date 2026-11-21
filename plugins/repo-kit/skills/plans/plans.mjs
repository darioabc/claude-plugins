#!/usr/bin/env node
/**
 * The plans board and its lint. Convention: docs/plans/README.md.
 *
 *   node scripts/plans.mjs                 print every plan with its tickets, then lint
 *   node scripts/plans.mjs --check         lint only, exit 1 on any finding
 *   node scripts/plans.mjs --pr-body <f>   also check a PR body for its Plan: line
 *   node scripts/plans.mjs --brief         open plans and their open tickets only, never
 *                                          fails (the repo-kit session-start hook)
 *   --root <dir>                           the repo to read (default: the current folder)
 *
 * Node builtins only, so a workflow needs no install step. The source of truth is the
 * repo-kit plugin (skills/plans/plans.mjs); a repo carries a copy at scripts/plans.mjs
 * so CI can run it.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const PLAN_STATUS = ["planned", "in progress", "paused", "done", "dropped"];
const TICKET_STATUS = ["todo", "doing", "done", "dropped"];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const checkOnly = flag("--check");
const brief = flag("--brief");
const bodyFile = value("--pr-body");
const ROOT = resolve(value("--root") ?? process.cwd());
const DIR = join(ROOT, "docs", "plans");

if (!existsSync(DIR)) {
  if (brief) process.exit(0);
  console.error(`plans: no docs/plans/ under ${ROOT}`);
  process.exit(1);
}

const findings = [];
const plans = [];

for (const name of readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
  const path = `docs/plans/${name}`;
  const text = readFileSync(join(DIR, name), "utf8");
  const lines = text.split("\n");
  const plan = { path, title: "", status: "", updated: "", prefix: "", tickets: [] };

  plan.title = (lines[0].match(/^# (.+)$/) ?? [])[1] ?? "";
  if (!plan.title) findings.push(`${path}: first line must be "# Title"`);

  const head = lines.slice(0, 8).join("\n");
  plan.status = (head.match(/^Status: (.+)$/m) ?? [])[1]?.trim() ?? "";
  plan.updated = (head.match(/^Updated: (\d{4}-\d{2}-\d{2})$/m) ?? [])[1] ?? "";
  plan.prefix = (head.match(/^Prefix: ([A-Z]{2,4})$/m) ?? [])[1] ?? "";

  if (!PLAN_STATUS.includes(plan.status))
    findings.push(`${path}: Status must be one of ${PLAN_STATUS.join(", ")} (got "${plan.status}")`);
  if (!plan.updated) findings.push(`${path}: Updated: YYYY-MM-DD missing from the head`);
  if (!plan.prefix) findings.push(`${path}: Prefix: two to four capitals missing from the head`);

  const section = text.split(/^## Tickets\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  if (!section.trim()) findings.push(`${path}: no "## Tickets" section`);
  for (const raw of section.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const m = line.match(/^- ([A-Z]{2,4})-(\d+) \(([a-z]+)\) (.+)$/);
    if (!m) {
      findings.push(`${path}: ticket line does not parse: "${line}"`);
      continue;
    }
    const [, prefix, n, status, textLine] = m;
    const id = `${prefix}-${n}`;
    if (prefix !== plan.prefix) findings.push(`${path}: ${id} uses a prefix other than ${plan.prefix}`);
    if (!TICKET_STATUS.includes(status))
      findings.push(`${path}: ${id} status must be one of ${TICKET_STATUS.join(", ")} (got "${status}")`);
    if (plan.tickets.some((t) => t.id === id)) findings.push(`${path}: ${id} appears twice`);
    plan.tickets.push({ id, status, text: textLine });
  }
  plans.push(plan);
}

const prefixes = new Map();
for (const p of plans) {
  if (!p.prefix) continue;
  if (prefixes.has(p.prefix)) findings.push(`${p.path}: prefix ${p.prefix} is also used by ${prefixes.get(p.prefix)}`);
  prefixes.set(p.prefix, p.path);
}

if (bodyFile) {
  const body = existsSync(bodyFile) ? readFileSync(bodyFile, "utf8") : "";
  const line = (body.match(/^Plan: (.+)$/m) ?? [])[1]?.trim();
  if (!line) {
    findings.push(`PR body: no "Plan:" line. Name a plan (Plan: docs/plans/<slug>.md AB-1) or say "Plan: none, <reason>".`);
  } else if (/^none\b/i.test(line)) {
    if (!/^none,\s*\S/.test(line)) findings.push(`PR body: "Plan: none" needs a reason after a comma.`);
  } else {
    const [ref, ...ids] = line.split(/\s+/);
    const plan = plans.find((p) => p.path === ref);
    if (!plan) findings.push(`PR body: plan "${ref}" is not a file under docs/plans/.`);
    else {
      for (const id of ids) {
        if (!plan.tickets.some((t) => t.id === id)) findings.push(`PR body: ticket ${id} is not in ${ref}.`);
      }
    }
  }
}

if (brief) {
  const open = plans.filter((p) => !["done", "dropped"].includes(p.status));
  if (open.length) {
    console.log("Plans board (docs/plans, repo-kit). Open plans and their open tickets:");
    for (const p of open) {
      console.log(`- ${p.title} [${p.status}, updated ${p.updated}] ${p.path}`);
      for (const t of p.tickets.filter((t) => t.status === "doing" || t.status === "todo"))
        console.log(`  ${t.id} ${t.status}: ${t.text}`);
    }
    console.log('A PR body names its plan and tickets ("Plan: docs/plans/<slug>.md AB-1") or says "Plan: none, <reason>".');
  }
  if (findings.length) console.log("Plan files that do not parse:\n" + findings.map((f) => `  - ${f}`).join("\n"));
  process.exit(0);
}

if (!checkOnly && !bodyFile) {
  for (const p of plans) {
    const counts = TICKET_STATUS.map((s) => `${p.tickets.filter((t) => t.status === s).length} ${s}`).join(", ");
    console.log(`\n${p.title}  [${p.status}, updated ${p.updated}]  ${p.path}`);
    console.log(`  ${counts}`);
    for (const t of p.tickets) console.log(`  ${t.id.padEnd(7)} ${t.status.padEnd(8)} ${t.text}`);
  }
  console.log("");
}

if (findings.length) {
  console.error("plans: findings\n" + findings.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
} else if (checkOnly || bodyFile) {
  console.log(`plans: ${plans.length} plan(s) ok${bodyFile ? ", PR body ok" : ""}`);
}
