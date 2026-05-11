---
name: codex-workspace-sync
description: Use when synchronizing Codex projects, project memory, AGENTS.md files, and repository-owned skills across multiple computers through GitHub.
---

# Codex Workspace Sync

## Purpose

Keep multiple Codex computers on the same project and capability state without syncing local Codex internals.

## Source Of Truth

GitHub is the only sync layer.

Do sync:

- Repository `AGENTS.md`
- `project-memory/`
- `.agents/skills/`
- Project-owned `.codex/` notes and action definitions
- Business project repositories listed under `projects/`

Do not sync:

- `~/.codex`
- Codex plugin cache
- Login/session/browser state
- `.env`, API keys, tokens, cookies, private keys
- `node_modules`, `.venv`, Conda environments, generated caches

## Startup Workflow

When Codex starts on a synced computer:

1. Run the repository sync check:

   ```powershell
   .\scripts\codex-sync.ps1
   ```

2. Read `AGENTS.md`.
3. Read `project-memory/daily-startup-sync.md`.
4. Pull each indexed business project.
5. Enter the active business project and read its own `AGENTS.md`.
6. Use that project's `.agents/skills/` for project-specific workflows.

## Publishing Rule

Automatic checks and pulls are allowed.

Commits and pushes are allowed only after:

1. Reviewing `git status --short`.
2. Confirming changed files belong to the current repository.
3. Running the basic sensitive-content scan in `scripts/codex-sync.ps1`.

## Skill Placement

Cross-project skills live here:

```text
codex-operating-system/.agents/skills/<skill-name>/SKILL.md
```

Project-specific skills live in the project repository:

```text
<project>/.agents/skills/<project-skill>/SKILL.md
```

`packs/` may be used as an archive or source-pack area, but `.agents/skills/` is the Codex-discoverable location.
