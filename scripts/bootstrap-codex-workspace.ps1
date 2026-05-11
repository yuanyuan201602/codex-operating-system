param(
  [string]$Root = (Join-Path $env:USERPROFILE "Codex"),
  [string]$RepoUrl = "https://github.com/yuanyuan201602/codex-operating-system.git"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "==> $Text"
}

function Get-RepoName {
  param([string]$Url)
  $name = Split-Path -Leaf $Url
  return $name -replace "\.git$", ""
}

function Sync-Repo {
  param(
    [string]$Url,
    [string]$Path
  )

  if (Test-Path -LiteralPath $Path) {
    if (Test-Path (Join-Path $Path ".git")) {
      Write-Host "Pull: $Path"
      git -C $Path pull --ff-only
    } else {
      Write-Host "Exists but is not a git repo, skipped: $Path"
    }
    return
  }

  $parent = Split-Path -Parent $Path
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  Write-Host "Clone: $Url -> $Path"
  git clone $Url $Path
}

function Get-ProjectEntries {
  param([string]$InfraPath)

  $entries = New-Object System.Collections.Generic.List[object]
  $projectDir = Join-Path $InfraPath "projects"
  if (-not (Test-Path -LiteralPath $projectDir)) {
    return $entries
  }

  $files = Get-ChildItem -Path $projectDir -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" }
  foreach ($file in $files) {
    $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $repoMatch = [regex]::Match($text, 'Repository:\s*`(?<url>[^`]+)`')
    if (-not $repoMatch.Success) {
      continue
    }

    $pathMatch = [regex]::Match($text, 'Recommended Windows path:\s*```text\s*(?<path>.*?)\s*```', "Singleline")
    $localPath = ""
    if ($pathMatch.Success) {
      $localPath = $pathMatch.Groups["path"].Value.Trim()
    }

    if ([string]::IsNullOrWhiteSpace($localPath)) {
      $repoName = Get-RepoName $repoMatch.Groups["url"].Value.Trim()
      $localPath = Join-Path (Join-Path $Root "projects") $repoName
    }

    $entries.Add([pscustomobject]@{
      Url = $repoMatch.Groups["url"].Value.Trim()
      Path = $localPath
    })
  }

  return $entries
}

Write-Step "Prepare Codex root"
New-Item -ItemType Directory -Force -Path $Root | Out-Null
Write-Host "Root: $Root"

$infraPath = Join-Path $Root (Get-RepoName $RepoUrl)

Write-Step "Sync infrastructure repository"
Sync-Repo -Url $RepoUrl -Path $infraPath

Write-Step "Sync indexed business projects"
$entries = @(Get-ProjectEntries -InfraPath $infraPath)
if ($entries.Count -eq 0) {
  Write-Host "No indexed projects found."
} else {
  foreach ($entry in $entries) {
    Sync-Repo -Url $entry.Url -Path $entry.Path
  }
}

Write-Step "Run startup sync check"
& (Join-Path $infraPath "scripts\codex-sync.ps1")

Write-Host ""
Write-Host "Bootstrap complete. Open this folder in Codex:"
Write-Host $infraPath
