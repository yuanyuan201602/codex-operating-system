# Codex Operating System

Cross-device project memory, handoff rules, and reusable Skill Pack coordination for Codex workspaces.

This repository is the infrastructure layer. Business projects keep their own content, code, and project-specific skills.

It does not automatically sync every project from another computer. Each business project must either have its own GitHub repository or be added to `projects/` with enough information to clone it on the other device.

Local clones can live under `workspace/` for convenience, but that folder is intentionally ignored by Git.
