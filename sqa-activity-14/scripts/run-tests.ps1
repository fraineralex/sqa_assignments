param(
  [string]$BaseUrl = "http://localhost:8080/api",
  [string]$ApiUsername = "integration.tester",
  [string]$ApiPassword = "StrongPass!123",
  [string]$ExistingUserId = "hot-user-001",
  [string]$OutputDir = "results",
  [switch]$StartMockBackend
)

$ErrorActionPreference = "Continue"

$projectRoot = Split-Path -Parent $PSScriptRoot
$k6Exe = "C:\Program Files\k6\k6.exe"
$newmanCmd = "bunx newman"
$apiScript = Join-Path $projectRoot "api/server.js"
$apiProcess = $null

$resolvedOutputDir = Join-Path $projectRoot $OutputDir
New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$newmanLog = Join-Path $resolvedOutputDir "newman-$timestamp.log"
$k6IntegrationLog = Join-Path $resolvedOutputDir "k6-integration-$timestamp.log"
$k6LoadLog = Join-Path $resolvedOutputDir "k6-load-$timestamp.log"
$summaryFile = Join-Path $resolvedOutputDir "summary-$timestamp.txt"
$apiLog = Join-Path $resolvedOutputDir "api-$timestamp.log"

$newmanCommand = "$newmanCmd run postman/XYZ-Integration-Tests.postman_collection.json --env-var `"baseUrl=$BaseUrl`""
$k6IntegrationCommand = "& `"$k6Exe`" run k6/integration-test.js -e BASE_URL=$BaseUrl -e API_USERNAME=$ApiUsername -e API_PASSWORD=$ApiPassword"
$k6LoadCommand = "& `"$k6Exe`" run k6/load-test.js -e BASE_URL=$BaseUrl -e API_USERNAME=$ApiUsername -e API_PASSWORD=$ApiPassword -e EXISTING_USER_ID=$ExistingUserId"

Push-Location $projectRoot

try {
  if ($StartMockBackend -or $BaseUrl -like "http://localhost:8080/*") {
    if (Test-Path $apiScript) {
      Write-Host "Starting local API..."
      $apiProcess = Start-Process -FilePath "bun" -ArgumentList $apiScript -PassThru -WindowStyle Hidden -RedirectStandardOutput $apiLog -RedirectStandardError $apiLog
      Start-Sleep -Seconds 2
    }
  }

  Write-Host "Running Newman collection..."
  Invoke-Expression "$newmanCommand *>&1 | Tee-Object -FilePath `"$newmanLog`""
  $newmanExit = $LASTEXITCODE

  Write-Host "Running k6 integration test..."
  Invoke-Expression "$k6IntegrationCommand *>&1 | Tee-Object -FilePath `"$k6IntegrationLog`""
  $k6IntegrationExit = $LASTEXITCODE

  Write-Host "Running k6 load test..."
  Invoke-Expression "$k6LoadCommand *>&1 | Tee-Object -FilePath `"$k6LoadLog`""
  $k6LoadExit = $LASTEXITCODE

  $summary = @(
    "Execution summary",
    "Timestamp: $timestamp",
    "BaseUrl: $BaseUrl",
    "Newman exit code: $newmanExit",
    "k6 integration exit code: $k6IntegrationExit",
    "k6 load exit code: $k6LoadExit",
    "Newman log: $newmanLog",
    "k6 integration log: $k6IntegrationLog",
    "k6 load log: $k6LoadLog",
    "api log: $apiLog"
  )

  $summary | Set-Content -Path $summaryFile -Encoding UTF8
  $summary | ForEach-Object { Write-Host $_ }
  Write-Host "Summary file: $summaryFile"

  if ($newmanExit -ne 0 -or $k6IntegrationExit -ne 0 -or $k6LoadExit -ne 0) {
    exit 1
  }

  exit 0
}
finally {
  if ($apiProcess -and !$apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force
  }
  Pop-Location
}
