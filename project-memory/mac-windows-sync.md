# Mac / Windows Codex Sync Checklist

Updated: 2026-05-10

## Goal

Make Mac and Windows Codex workspaces share project knowledge without copying local Codex internals.

## What Syncs Through GitHub

- `AGENTS.md`
- `project-memory/`
- `packs/`
- `docs/`
- `templates/`
- `data/`
- `content/`
- project scripts and project-level config

## What Must Not Be Synced

- `~/.codex`
- Codex plugin cache
- login state
- browser session cache
- Conda or virtual environment folders
- Playwright/local automation logs
- `.env` and secrets

## Before Switching Devices

1. Run `git status --short`.
2. Review changed files.
3. Commit the intended files.
4. Push to GitHub.

Login may be required if GitHub credentials are not configured.

## On the Other Device

1. Clone or pull the repository.
2. Read that repository's `AGENTS.md`.
3. Read relevant `project-memory/` files.
4. Run a local-only workflow before browser or account automation.

## When Login Is Needed

- GitHub: clone, pull, push, or PR creation when credentials are missing.
- ChatGPT/GPT browser testing: after the user confirms browser-assisted testing.
- X or other external accounts: after the user confirms draft preparation or account operations.

No login is needed just to read project files, update local Markdown/CSV files, or prepare drafts.
