$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
  Write-Error "k6 no está en PATH. Instálalo desde https://k6.io/docs/get-started/installation/"
}

New-Item -ItemType Directory -Force -Path "results" | Out-Null

Write-Host "=== load-test.js ===" -ForegroundColor Cyan
k6 run --out "json=results/run-load-$(Get-Date -Format 'yyyyMMdd-HHmmss').json" "k6/load-test.js"

Write-Host "=== spike-test.js ===" -ForegroundColor Cyan
k6 run --out "json=results/run-spike-$(Get-Date -Format 'yyyyMMdd-HHmmss').json" "k6/spike-test.js"

Write-Host "=== stress-test.js ===" -ForegroundColor Cyan
k6 run --out "json=results/run-stress-$(Get-Date -Format 'yyyyMMdd-HHmmss').json" "k6/stress-test.js"

Write-Host "Listo. Revisa la carpeta results/" -ForegroundColor Green
