# Deploy T.E.N.E.G.T.A to VPS from your PC — no manual edits on the server.
# Prerequisites: OpenSSH (scp/ssh), Node 20+, git
#
# First time: npm run setup:vps   (generates all secrets + config automatically)
# Deploy:     npm run deploy:vps
# Or both:    npm run vps

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$configPath = Join-Path $Root "scripts\deploy-vps.config.json"
$envLocal = Join-Path $Root "site\.env.vps.local"

if (-not (Test-Path $configPath) -or -not (Test-Path $envLocal)) {
  Write-Host "Running setup:vps (auto-generate config)..." -ForegroundColor Cyan
  node (Join-Path $Root "scripts\setup-vps.mjs")
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$cfg = Get-Content $configPath -Raw | ConvertFrom-Json
$hostName = $cfg.host
$user = $cfg.user
$port = if ($cfg.port) { $cfg.port } else { 22 }
$remotePath = $cfg.remotePath.TrimEnd("/")
$branch = if ($cfg.branch) { $cfg.branch } else { "main" }
$pm2 = if ($cfg.pm2Name) { $cfg.pm2Name } else { "tenegta" }
$gitRemote = if ($cfg.gitRemote) { $cfg.gitRemote } else { "origin" }

$target = "${user}@${hostName}"
$sshArgs = @("-p", $port)
$scpArgs = @("-P", $port)

Write-Host "`n==> Push to GitHub (ten-w)..." -ForegroundColor Cyan
git push ten-w $branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "git push failed (continuing if server can pull from origin)..." -ForegroundColor Yellow
}

Write-Host "`n==> Upload .env to server..." -ForegroundColor Cyan
& scp @scpArgs $envLocal "${target}:${remotePath}/site/.env"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

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

Write-Host "`n==> Remote build & restart..." -ForegroundColor Cyan
$remoteCmd | & ssh @sshArgs $target "bash -s"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nDone. Check: https://tenegta.com" -ForegroundColor Green
