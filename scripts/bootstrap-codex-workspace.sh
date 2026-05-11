#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$HOME/Codex}"
REPO_URL="${2:-https://github.com/yuanyuan201602/codex-operating-system.git}"

repo_name() {
  basename "$1" .git
}

sync_repo() {
  local url="$1"
  local path="$2"

  if [[ -d "$path/.git" ]]; then
    echo "Pull: $path"
    git -C "$path" pull --ff-only
    return
  fi

  if [[ -e "$path" ]]; then
    echo "Exists but is not a git repo, skipped: $path"
    return
  fi

  mkdir -p "$(dirname "$path")"
  echo "Clone: $url -> $path"
  git clone "$url" "$path"
}

infra_path="$ROOT/$(repo_name "$REPO_URL")"

echo "==> Prepare Codex root"
mkdir -p "$ROOT"
echo "Root: $ROOT"

echo ""
echo "==> Sync infrastructure repository"
sync_repo "$REPO_URL" "$infra_path"

echo ""
echo "==> Sync indexed business projects"
project_dir="$infra_path/projects"
if [[ -d "$project_dir" ]]; then
  while IFS= read -r file; do
    repo_url="$(grep -E '^Repository: `' "$file" | sed -E 's/^Repository: `([^`]+)`.*/\1/' || true)"
    [[ -z "$repo_url" ]] && continue
    local_path="$ROOT/projects/$(repo_name "$repo_url")"
    sync_repo "$repo_url" "$local_path"
  done < <(find "$project_dir" -maxdepth 1 -type f -name '*.md' ! -name 'README.md')
else
  echo "No project index directory found."
fi

echo ""
echo "Bootstrap complete. Open this folder in Codex:"
echo "$infra_path"
