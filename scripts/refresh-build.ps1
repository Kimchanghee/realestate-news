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
# OG cards embed the current rate; re-render if the shared Playwright is present (non-fatal).
if (Test-Path ..\_qa-tools\node_modules\playwright) { node scripts/og.mjs; if ($LASTEXITCODE -ne 0) { Write-Warning 'og render failed; keeping previous PNGs'; $global:LASTEXITCODE = 0 } }
Step 'build'   { pnpm build }
Step 'gate'    { pnpm gate }
Write-Host 'refresh-build OK'
exit 0
