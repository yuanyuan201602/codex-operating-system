# Codex Operating System

Cross-device project memory, handoff rules, and reusable Skill Pack coordination for Codex workspaces.

This repository is the infrastructure layer. Business projects keep their own content, code, and project-specific skills.

It does not automatically sync every project from another computer. Each business project must either have its own GitHub repository or be added to `projects/` with enough information to clone it on the other device.

Local clones can live under `workspace/` for convenience, but that folder is intentionally ignored by Git.

Codex-discoverable shared skills live in:

```text
.agents/skills/
```

Current shared skills:

- `codex-workspace-sync`: sync Codex projects, project memory, and repository-owned skills across computers through GitHub.
- `battle-map-video`: Chinese-language workflow for historical battle-map explainer videos (research, geographic anchors, frontline animation, narration sync, render checks). Case study: Smolensk 1941.

Project-specific skills should live in each business repository's own `.agents/skills/`.

## Daily Startup Sync

Windows:

```powershell
.\scripts\codex-sync.ps1
```

To sync this infrastructure repository to GitHub after reviewing changed files:

```powershell
.\scripts\codex-sync.ps1 -AutoCommit -Push -Message "chore: sync codex operating system"
```

See `project-memory/daily-startup-sync.md` for the full workflow.

If projects exist on disk but do not appear in the Codex sidebar:

```powershell
.\scripts\register-codex-workspaces.ps1
```

Restart Codex after running it if the sidebar does not refresh immediately.

## New Computer Bootstrap

Windows:

```powershell
git clone https://github.com/yuanyuan201602/codex-operating-system.git "$env:USERPROFILE\Codex\codex-operating-system"
& "$env:USERPROFILE\Codex\codex-operating-system\scripts\bootstrap-codex-workspace.ps1"
```

Mac:

```bash
git clone https://github.com/yuanyuan201602/codex-operating-system.git "$HOME/Codex/codex-operating-system"
bash "$HOME/Codex/codex-operating-system/scripts/bootstrap-codex-workspace.sh"
```
