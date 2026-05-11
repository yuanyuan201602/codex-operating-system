# Mac / Windows Codex Sync Checklist

Updated: 2026-05-10

## Goal

Make Mac and Windows Codex workspaces share project knowledge without copying local Codex internals.

## What Syncs Through GitHub

This infrastructure repository only syncs cross-project rules and indexes.
Business project files sync through each business project's own GitHub repository.

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

1. Clone or pull this infrastructure repository.
2. Read `AGENTS.md`.
3. Read relevant `project-memory/` files.
4. Open the relevant file in `projects/`.
5. Clone or pull the business project's own repository.
6. Enter the business project and read that repository's `AGENTS.md`.
7. Run a local-only workflow before browser or account automation.

## If A Project Is Missing

If a project from another computer does not show up here, check this in order:

1. Was the project pushed to its own GitHub repository?
2. Was a project index file added under `projects/` in this repository?
3. Was this infrastructure repository committed and pushed after adding the index?
4. Did the other device run `git pull origin main` in both repositories?

## When Login Is Needed

- GitHub: clone, pull, push, or PR creation when credentials are missing.
- ChatGPT/GPT browser testing: after the user confirms browser-assisted testing.
- X or other external accounts: after the user confirms draft preparation or account operations.

No login is needed just to read project files, update local Markdown/CSV files, or prepare drafts.
