param(
  [switch]$Push,
  [switch]$AutoCommit,
  [string]$Message = "chore: sync codex workspace notes",
  [switch]$SkipPull
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

function Test-GitRepo {
  param([string]$Path)
  return (Test-Path (Join-Path $Path ".git"))
}

function Get-ChangedFiles {
  param([string]$Path)
  $files = @()
  $files += git -C $Path diff --name-only
  $files += git -C $Path diff --cached --name-only
  $files += git -C $Path ls-files --others --exclude-standard
  return $files | Sort-Object -Unique
}

function Test-SensitiveContent {
  param(
    [string]$RepoPath,
    [string[]]$Files
  )

  $blockedNames = @(
    ".env",
    ".env.",
    "id_rsa",
    "token",
    "cookie",
    "session",
    "secret",
    "credentials"
  )

  $secretPatterns = @(
    "api[_-]?key\s*[:=]",
    "secret\s*[:=]",
    "token\s*[:=]",
    "password\s*[:=]",
    "BEGIN (RSA|OPENSSH|PRIVATE) KEY",
    "ghp_[A-Za-z0-9_]{20,}",
    "sk-[A-Za-z0-9_-]{20,}"
  )

  $findings = New-Object System.Collections.Generic.List[string]

  foreach ($file in $Files) {
    $lower = $file.ToLowerInvariant()
    foreach ($name in $blockedNames) {
      if ($lower.Contains($name)) {
        $findings.Add("name: $file")
        break
      }
    }

    $fullPath = Join-Path $RepoPath $file
    if (-not (Test-Path -LiteralPath $fullPath)) {
      continue
    }

    $item = Get-Item -LiteralPath $fullPath -ErrorAction SilentlyContinue
    if ($null -eq $item -or $item.PSIsContainer -or $item.Length -gt 1048576) {
      continue
    }

    $text = Get-Content -LiteralPath $fullPath -Raw -ErrorAction SilentlyContinue
    foreach ($pattern in $secretPatterns) {
      if ($text -match $pattern) {
        $findings.Add("content: $file matches /$pattern/")
      }
    }
  }

  return $findings
}

function Invoke-RepoSync {
  param(
    [string]$Name,
    [string]$Path,
    [bool]$AllowCommitAndPush
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    Write-Host "[$Name] missing: $Path"
    return
  }

  if (-not (Test-GitRepo $Path)) {
    Write-Host "[$Name] not a git repo: $Path"
    return
  }

  Write-Step "$Name"
  Write-Host "Path: $Path"

  if (-not $SkipPull) {
    $remotes = git -C $Path remote
    if ($remotes -contains "origin") {
      $statusBeforePull = git -C $Path status --short
      if ([string]::IsNullOrWhiteSpace(($statusBeforePull -join "`n"))) {
        git -C $Path pull --ff-only
      } else {
        Write-Host "Skip pull because working tree has local changes."
      }
    } else {
      Write-Host "No origin remote. Pull/push skipped."
    }
  }

  $changed = @(Get-ChangedFiles $Path)
  if ($changed.Count -eq 0) {
    Write-Host "Clean."
    return
  }

  Write-Host "Changed files:"
  $changed | ForEach-Object { Write-Host "  $_" }

  $sensitive = @(Test-SensitiveContent -RepoPath $Path -Files $changed)
  if ($sensitive.Count -gt 0) {
    Write-Host "Sensitive-risk findings. Commit/push blocked:"
    $sensitive | ForEach-Object { Write-Host "  $_" }
    return
  }

  if ($AutoCommit -and $AllowCommitAndPush) {
    git -C $Path add -- $changed
    git -C $Path commit -m $Message
  }

  if ($Push -and $AllowCommitAndPush) {
    git -C $Path push
  } elseif ($Push -and -not $AllowCommitAndPush) {
    Write-Host "Push requested, but this repo is review-only in this workflow."
  }
}

function Get-IndexedProjectPaths {
  param([string]$RepoRoot)

  $paths = New-Object System.Collections.Generic.List[string]
  $projectFiles = Get-ChildItem -Path (Join-Path $RepoRoot "projects") -Filter "*.md" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "README.md" }

  foreach ($file in $projectFiles) {
    $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

    $windowsMatches = [regex]::Matches($text, 'Recommended Windows path:\s*```text\s*(?<path>.*?)\s*```', "Singleline")
    foreach ($match in $windowsMatches) {
      $value = $match.Groups["path"].Value.Trim()
      if ($value.Length -gt 0) {
        $paths.Add($value)
      }
    }

    $workspaceMatches = [regex]::Matches($text, 'Optional local workspace path.*?```text\s*(?<path>.*?)\s*```', "Singleline")
    foreach ($match in $workspaceMatches) {
      $value = $match.Groups["path"].Value.Trim()
      if ($value.Length -gt 0) {
        $paths.Add((Join-Path $RepoRoot $value))
      }
    }
  }

  return $paths | Sort-Object -Unique
}

$repoRoot = Get-RepoRoot

Write-Step "Codex operating system repository"
Invoke-RepoSync -Name "codex-operating-system" -Path $repoRoot -AllowCommitAndPush $true

Write-Step "Indexed business projects"
$projectPaths = @(Get-IndexedProjectPaths $repoRoot)
if ($projectPaths.Count -eq 0) {
  Write-Host "No indexed projects found."
} else {
  foreach ($projectPath in $projectPaths) {
    Invoke-RepoSync -Name (Split-Path -Leaf $projectPath) -Path $projectPath -AllowCommitAndPush $false
  }
}

Write-Step "User-level Codex skills"
$skillsPath = Join-Path $env:USERPROFILE ".codex\skills"
if (Test-Path -LiteralPath $skillsPath) {
  Write-Host "Found: $skillsPath"
  Write-Host "User-level Codex skills are inspected but not copied to Git."
  Get-ChildItem -Path $skillsPath -Directory -Force |
    Where-Object { $_.Name -notin @(".system", "codex-primary-runtime") } |
    ForEach-Object { Write-Host "  candidate custom skill: $($_.FullName)" }
} else {
  Write-Host "No user-level skills directory found."
}

Write-Host ""
Write-Host "Done."
