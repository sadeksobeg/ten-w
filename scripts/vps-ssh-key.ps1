# Generate SSH key for VPS deploy and print Hostinger setup steps.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$keyDir = Join-Path $env:USERPROFILE ".ssh"
$keyPath = Join-Path $keyDir "tenegta_vps_ed25519"
$pubPath = "$keyPath.pub"
$configPath = Join-Path $Root "scripts\deploy-vps.config.json"

if (-not (Test-Path $keyDir)) {
  New-Item -ItemType Directory -Path $keyDir -Force | Out-Null
}

if (-not (Test-Path $keyPath)) {
  Write-Host "Creating SSH key: $keyPath" -ForegroundColor Cyan
  ssh-keygen -t ed25519 -f $keyPath -N '""' -C "tenegta-deploy"
} else {
  Write-Host "Key already exists: $keyPath" -ForegroundColor Yellow
}

$pub = Get-Content $pubPath -Raw

Write-Host ""
Write-Host "========== COPY THIS PUBLIC KEY ==========" -ForegroundColor Green
Write-Host $pub.Trim()
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Hostinger (hPanel):" -ForegroundColor Cyan
Write-Host "  VPS -> your server -> Settings -> SSH keys -> Add key"
Write-Host "  Paste the line above -> Save"
Write-Host ""
Write-Host "Or reset root password:" -ForegroundColor Cyan
Write-Host "  VPS -> Settings -> Reset root password"
Write-Host "  Then test: ssh root@72.62.155.198"
Write-Host ""

if (Test-Path $configPath) {
  $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
  $cfg | Add-Member -NotePropertyName identityFile -NotePropertyValue $keyPath -Force
  $cfg | ConvertTo-Json | Set-Content $configPath -Encoding utf8
  Write-Host "Updated scripts/deploy-vps.config.json with identityFile" -ForegroundColor Green
} else {
  Write-Host "Run npm run setup:vps first, then run this script again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "After adding the key in hPanel (wait 1-2 min), test:" -ForegroundColor Cyan
Write-Host "  ssh -i `"$keyPath`" root@72.62.155.198"
Write-Host ""
Write-Host "Then deploy: npm run deploy:vps" -ForegroundColor Cyan
