#!/usr/bin/env bash
# 把本快照落地为桌面上的独立项目：~/Desktop/teaching-video-studio
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-$HOME/Desktop/teaching-video-studio}"

if [[ -e "$DEST" ]]; then
  echo "目标已存在，未覆盖: $DEST" >&2
  exit 1
fi

mkdir -p "$DEST"
tar -C "$SRC" --exclude='install-to-desktop.*' --exclude='README-SEED.md' -cf - . | tar -C "$DEST" -xf -
cd "$DEST"
git init -q -b main
npm install --no-audit --no-fund
npm run tvs -- check
git add -A
git commit -q -m "chore: import teaching-video-studio seed"
echo "完成: $DEST"
echo "下一步: 在 GitHub 创建 teaching-video-studio 仓库后执行"
echo "  git remote add origin <仓库地址> && git push -u origin main"
