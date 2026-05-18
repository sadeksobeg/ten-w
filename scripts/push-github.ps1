# Push code to GitHub only — no SSH to VPS required.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$branch = "main"
if ($args.Count -gt 0) { $branch = $args[0] }

Write-Host "==> git status" -ForegroundColor Cyan
git status -sb

$dirty = git status --porcelain
if ($dirty) {
  Write-Host ""
  Write-Host "Uncommitted changes detected. Commit first, for example:" -ForegroundColor Yellow
  Write-Host '  git add -A && git commit -m "update"' -ForegroundColor Gray
  Write-Host ""
  $ans = Read-Host "Commit all now? (y/N)"
  if ($ans -eq "y" -or $ans -eq "Y") {
    git add -A
    git commit -m "chore: deploy update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  } else {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "==> git push ten-w $branch" -ForegroundColor Cyan
git push ten-w $branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "Push failed. Try: git push -u ten-w $branch" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Done. Code is on GitHub." -ForegroundColor Green
Write-Host ""
Write-Host "On the server (Hostinger browser terminal), run:" -ForegroundColor Cyan
Write-Host "  cd /var/www/tenegta && bash scripts/server-update.sh" -ForegroundColor White
Write-Host ""
