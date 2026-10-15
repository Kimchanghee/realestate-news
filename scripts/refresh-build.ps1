#requires -Version 7
# refresh → test → build → gate. Exits non-zero on failure. The parent schedules this and deploys dist/.
# A failed data fetch is NOT fatal: the last good snapshot (with its real asOf) is kept and the build continues.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

function Step($name, [scriptblock]$cmd) {
  Write-Host "==> $name"
  & $cmd
  if ($LASTEXITCODE -ne 0) { Write-Error "$name failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
}

if (-not (Test-Path node_modules)) { Step 'pnpm install' { pnpm install --frozen-lockfile } }
Step 'refresh' { pnpm refresh }
Step 'test'    { pnpm test }
Step 'build'   { pnpm build }
Step 'gate'    { pnpm gate }
Write-Host 'refresh-build OK'
exit 0
