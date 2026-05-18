# Deploy T.E.N.E.G.T.A to VPS from your PC
# First time: npm run setup:vps -- --host YOUR_SERVER_IP
# Deploy:     npm run deploy:vps  |  npm run vps

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$configPath = Join-Path $Root "scripts\deploy-vps.config.json"
$envLocal = Join-Path $Root "site\.env.vps.local"

if (-not (Test-Path $configPath) -or -not (Test-Path $envLocal)) {
  Write-Host "Running setup:vps (auto-generate config)..." -ForegroundColor Cyan
  $setupArgs = @()
  if ($env:DEPLOY_HOST) { $setupArgs += "--host", $env:DEPLOY_HOST }
  node (Join-Path $Root "scripts\setup-vps.mjs") @setupArgs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$cfg = Get-Content $configPath -Raw | ConvertFrom-Json
$hostName = $cfg.host
if ([string]::IsNullOrWhiteSpace($hostName)) {
  Write-Host ""
  Write-Host "SSH host is missing in scripts/deploy-vps.config.json" -ForegroundColor Red
  Write-Host ""
  Write-Host "  srv1640110 is a panel label, not an SSH address. Use the server IP from Hostinger:" -ForegroundColor Yellow
  Write-Host "    npm run setup:vps -- --host 123.45.67.89" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Or set once:  `$env:DEPLOY_HOST='123.45.67.89'; npm run setup:vps" -ForegroundColor Cyan
  Write-Host ""
  exit 1
}

$user = $cfg.user
$port = if ($cfg.port) { $cfg.port } else { 22 }
$remotePath = $cfg.remotePath.TrimEnd("/")
$branch = if ($cfg.branch) { $cfg.branch } else { "main" }
$pm2 = if ($cfg.pm2Name) { $cfg.pm2Name } else { "tenegta" }
$gitRemote = if ($cfg.gitRemote) { $cfg.gitRemote } else { "origin" }

$target = "${user}@${hostName}"
$sshArgs = @("-p", $port, "-o", "ConnectTimeout=20", "-o", "StrictHostKeyChecking=accept-new")
$scpArgs = @("-P", $port, "-o", "ConnectTimeout=20", "-o", "StrictHostKeyChecking=accept-new")

if ($cfg.identityFile -and (Test-Path $cfg.identityFile)) {
  $sshArgs += @("-i", $cfg.identityFile)
  $scpArgs += @("-i", $cfg.identityFile)
}

function Show-SshHelp {
  Write-Host ""
  Write-Host "SSH failed (Permission denied or connection refused)." -ForegroundColor Red
  Write-Host ""
  Write-Host "1) Use the server PUBLIC IP (hPanel -> VPS -> IP), not srv1640110:" -ForegroundColor Yellow
  Write-Host "     npm run setup:vps -- --host YOUR_IP" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "2) Test login manually (will prompt for password if no key):" -ForegroundColor Yellow
  Write-Host "     ssh -p $port ${user}@$hostName" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "3) Optional - passwordless deploy (recommended):" -ForegroundColor Yellow
  Write-Host "     ssh-keygen -t ed25519" -ForegroundColor Gray
  Write-Host '     Then copy your .pub key to the server authorized_keys file' -ForegroundColor Gray
  Write-Host ""
  Write-Host "4) Add key path to scripts/deploy-vps.config.json:" -ForegroundColor Yellow
  Write-Host '     identityFile: C:\Users\YOU\.ssh\id_ed25519' -ForegroundColor Gray
  Write-Host ""
}

Write-Host "`n==> Testing SSH to $target ..." -ForegroundColor Cyan
& ssh @sshArgs $target "echo SSH_OK"
if ($LASTEXITCODE -ne 0) {
  Show-SshHelp
  exit 1
}
Write-Host "SSH OK" -ForegroundColor Green

Write-Host "`n==> Push to GitHub (ten-w)..." -ForegroundColor Cyan
git push ten-w $branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "git push failed (continuing if server can pull from origin)..." -ForegroundColor Yellow
}

Write-Host "`n==> Upload .env to server..." -ForegroundColor Cyan
& scp @scpArgs $envLocal "${target}:${remotePath}/site/.env"
if ($LASTEXITCODE -ne 0) {
  Show-SshHelp
  exit $LASTEXITCODE
}

$remoteCmd = @"
set -e
cd $remotePath
git fetch $gitRemote
git checkout $branch
git pull $gitRemote $branch
cd site
npm ci
npm run check:env
npx prisma migrate deploy
npm run build
if pm2 describe $pm2 >/dev/null 2>&1; then
  pm2 restart $pm2
else
  pm2 start npm --name $pm2 -- start
  pm2 save
fi
echo Deploy OK
"@

Write-Host ""
Write-Host "==> Remote build and restart..." -ForegroundColor Cyan
$remoteCmd | & ssh @sshArgs $target "bash -s"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nDone. Check: https://tenegta.com" -ForegroundColor Green
