# Codex Operating System

Cross-device project memory, handoff rules, and reusable Skill Pack coordination for Codex workspaces.

This repository is the infrastructure layer. Business projects keep their own content, code, and project-specific skills.

It does not automatically sync every project from another computer. Each business project must either have its own GitHub repository or be added to `projects/` with enough information to clone it on the other device.

Local clones can live under `workspace/` for convenience, but that folder is intentionally ignored by Git.

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
