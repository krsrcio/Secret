param(
    [Parameter(Mandatory=$false)]
    [string]$Target = "."
)

$ErrorActionPreference = "Stop"

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetPath = (Resolve-Path $Target).Path

Write-Host "Installing Codex + Claude agentic starter into:"
Write-Host "  $targetPath"

$items = @("AGENTS.md", "CLAUDE.md", "PROMPTS.md", ".codex", ".claude")

foreach ($item in $items) {
    $src = Join-Path $source $item
    $dst = Join-Path $targetPath $item

    if (Test-Path $dst) {
        Write-Warning "$item already exists. Skipping to avoid overwriting your project."
        continue
    }

    Copy-Item -Path $src -Destination $dst -Recurse
    Write-Host "Added $item"
}

Write-Host ""
Write-Host "Done."
Write-Host "Next: edit the Project-Specific Rules section in AGENTS.md."
