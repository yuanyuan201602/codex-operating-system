param(
  [switch]$SetActive
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "==> $Text"
}

function Get-RepoRoot {
  $scriptDir = Split-Path -Parent $PSCommandPath
  return (Resolve-Path (Join-Path $scriptDir "..")).Path
}

function Expand-SyncPath {
  param([string]$Path)

  $expanded = [Environment]::ExpandEnvironmentVariables($Path)
  if ($expanded.StartsWith("~")) {
    $expanded = Join-Path $env:USERPROFILE $expanded.Substring(1).TrimStart("\", "/")
  }

  return $expanded
}

function Get-WorkspaceRoots {
  param([string]$RepoRoot)

  $roots = New-Object System.Collections.Generic.List[string]
  $roots.Add($RepoRoot)

  $projectFiles = Get-ChildItem -Path (Join-Path $RepoRoot "projects") -Filter "*.md" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "README.md" }

  foreach ($file in $projectFiles) {
    $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

    $workspaceMatches = [regex]::Matches($text, 'Optional local workspace path.*?```text\s*(?<path>.*?)\s*```', "Singleline")
    foreach ($match in $workspaceMatches) {
      $value = $match.Groups["path"].Value.Trim()
      if ($value.Length -gt 0) {
        $candidate = Join-Path $RepoRoot $value
        if (Test-Path -LiteralPath $candidate) {
          $roots.Add((Resolve-Path -LiteralPath $candidate).Path)
        }
      }
    }

    $windowsMatches = [regex]::Matches($text, 'Recommended Windows path:\s*```text\s*(?<path>.*?)\s*```', "Singleline")
    foreach ($match in $windowsMatches) {
      $value = $match.Groups["path"].Value.Trim()
      if ($value.Length -gt 0) {
        $candidate = Expand-SyncPath $value
        if (Test-Path -LiteralPath $candidate) {
          $roots.Add((Resolve-Path -LiteralPath $candidate).Path)
        }
      }
    }
  }

  return $roots | Sort-Object -Unique
}

$repoRoot = Get-RepoRoot
$statePath = Join-Path $env:USERPROFILE ".codex\.codex-global-state.json"

if (-not (Test-Path -LiteralPath $statePath)) {
  throw "Codex global state file not found: $statePath"
}

$roots = @(Get-WorkspaceRoots -RepoRoot $repoRoot)
if ($roots.Count -eq 0) {
  throw "No workspace roots found."
}

Write-Step "Workspace roots to register"
$roots | ForEach-Object { Write-Host "  $_" }

$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
  throw "Node.js is required to update Codex state safely because this state file may contain characters that Windows PowerShell JSON parsing cannot handle."
}

$backup = "$statePath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $statePath -Destination $backup
Write-Host "Backup: $backup"

$payload = @{
  statePath = $statePath
  roots = $roots
  setActive = [bool]$SetActive
} | ConvertTo-Json -Compress

$encodedPayload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload))

node -e @"
const fs = require('fs');
const payload = JSON.parse(Buffer.from(process.argv[1], 'base64').toString('utf8'));
const data = JSON.parse(fs.readFileSync(payload.statePath, 'utf8'));

function normalize(p) {
  return p.replace(/[\\/]+$/g, '');
}

function merge(existing, additions) {
  const seen = new Set();
  const out = [];
  for (const value of [...(existing || []), ...additions]) {
    const key = normalize(value).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

data['electron-saved-workspace-roots'] = merge(data['electron-saved-workspace-roots'], payload.roots);
data['project-order'] = merge(data['project-order'], payload.roots);
if (payload.setActive) {
  data['active-workspace-roots'] = payload.roots;
}

fs.writeFileSync(payload.statePath, JSON.stringify(data), 'utf8');
"@ $encodedPayload

Write-Host "Registered. Restart Codex if the sidebar does not refresh immediately."
