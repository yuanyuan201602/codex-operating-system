param(
  [string]$Dest = (Join-Path ([Environment]::GetFolderPath("Desktop")) "teaching-video-studio")
)

$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $PSCommandPath

if (Test-Path -LiteralPath $Dest) {
  throw "目标已存在，未覆盖: $Dest"
}

New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Get-ChildItem -LiteralPath $src -Force |
  Where-Object { $_.Name -notlike "install-to-desktop.*" -and $_.Name -ne "README-SEED.md" } |
  ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $Dest -Recurse -Force }

Set-Location -LiteralPath $Dest
git init -q -b main
npm install --no-audit --no-fund
npm run tvs -- check
git add -A
git commit -q -m "chore: import teaching-video-studio seed"
Write-Host "完成: $Dest"
Write-Host "下一步: 在 GitHub 创建 teaching-video-studio 仓库后执行"
Write-Host "  git remote add origin <仓库地址>; git push -u origin main"
