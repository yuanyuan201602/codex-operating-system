# Codex App Setup

This directory stores repository-owned Codex app notes. It intentionally does not contain user login state, sessions, cache, or machine-specific secrets.

## Common Actions

Use this command as the daily startup sync check:

```powershell
.\scripts\codex-sync.ps1
```

Use this command only after reviewing the changed files:

```powershell
.\scripts\codex-sync.ps1 -AutoCommit -Push -Message "chore: sync codex operating system"
```

## Expected Codex Startup Order

1. Open this repository in Codex.
2. Run the daily startup sync check.
3. Read `AGENTS.md`.
4. Read `project-memory/daily-startup-sync.md`.
5. Pull or inspect indexed business projects.
