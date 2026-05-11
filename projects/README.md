# Projects Index

This folder is an index of business projects that should be available across devices.

Important: projects do not appear here automatically. Each business project needs its own GitHub repository, and this folder should record the repository URL, expected local paths, and handoff notes.

For each project, keep one Markdown file with:

- Repository URL.
- Recommended Mac path.
- Recommended Windows path.
- Project-owned files such as `AGENTS.md`, `project-memory/`, `packs/`, `docs/`, `templates/`, `data/`, and `content/`.
- Notes about what must stay local, such as `.env`, login state, browser cache, virtual environments, and generated dependencies.

When switching devices:

1. Pull this infrastructure repository.
2. Read the relevant file in `projects/`.
3. Clone or pull that business project's own repository.
4. Enter the business project and read its own `AGENTS.md`.
