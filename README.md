# claude-plugins

A Claude Code plugin marketplace with one plugin so far.

| Plugin | What it does |
| --- | --- |
| [repo-kit](plugins/repo-kit) | One project setup for every repo: CLAUDE.md in a fixed shape, the plans convention with a `Plan:` line on every PR, the plans board at session start, and a guard against heredocs inside `$(...)`. |

## Turn it on in a repo

Commit this as `.claude/settings.json` in the repo (or merge it into the one
there). Every session in the repo, local or cloud, then offers to install the
plugin the first time it starts.

```json
{
  "extraKnownMarketplaces": {
    "darioabc": {
      "source": { "source": "github", "repo": "darioabc/claude-plugins" }
    }
  },
  "enabledPlugins": { "repo-kit@darioabc": true }
}
```

Then run `/repo-kit:setup` in the repo to bring the rest in line.

## Or install it for yourself

```
/plugin marketplace add darioabc/claude-plugins
/plugin install repo-kit@darioabc
```

## Develop

```bash
node --test plugins/*/tests/*.test.mjs
claude plugin validate .
claude --plugin-dir plugins/repo-kit    # a session with the working copy loaded
```

Bump `version` in both `plugins/<name>/.claude-plugin/plugin.json` and
`.claude-plugin/marketplace.json` when a change should reach installed copies.
