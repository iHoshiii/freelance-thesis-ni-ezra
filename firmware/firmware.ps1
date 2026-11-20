param(
  [ValidateSet('build', 'configure', 'ports', 'upload', 'monitor', 'preview')]
  [string]$Action = 'build',
  [string]$Port
)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  if ($Action -eq 'preview') {
    $previewCandidates = @(
      $platformPython = Join-Path $env:USERPROFILE '.platformio/penv/Scripts/python.exe'
      if (Test-Path -LiteralPath $platformPython) { $platformPython }
      Get-Command python, python3, py -CommandType Application -All -ErrorAction SilentlyContinue |
        Where-Object { $_.Source -notmatch '\\Microsoft\\WindowsApps\\' } |
        ForEach-Object { $_.Source }
    )
    foreach ($previewPython in ($previewCandidates | Select-Object -Unique)) {
      try {
        & $previewPython -c 'import tkinter; tkinter.Tcl()' 2>$null
        if ($LASTEXITCODE -ne 0) { continue }
      } catch { continue }
      & $previewPython 'preview/preview.py'
      exit $LASTEXITCODE
    }
    throw 'The desktop preview needs Python with Tcl/Tk (Tkinter). Install or repair a Python installation with Tcl/Tk enabled, then try again.'
  }
  if ($Action -eq 'configure') {
    $destination = Join-Path $PSScriptRoot 'include/secrets.h'
    if (-not (Test-Path -LiteralPath $destination)) {
      Copy-Item -LiteralPath 'include/secrets.example.h' -Destination $destination
    }
    if (-not (Select-String -LiteralPath $destination -Pattern '^\s*#define\s+SOIL_SMS_RECIPIENT\b' -Quiet)) {
      Add-Content -LiteralPath $destination -Value '#define SOIL_SMS_RECIPIENT ""'
    }
    Write-Host "Set SOIL_SMS_RECIPIENT in $destination to enable SMS. Keep your existing device ID."
    exit 0
  }
  $pioCommand = Get-Command pio -ErrorAction SilentlyContinue
  if ($pioCommand) { $pioPath = $pioCommand.Source }
  else { $pioPath = Join-Path $env:USERPROFILE '.platformio/penv/Scripts/platformio.exe' }
  if (-not (Test-Path -LiteralPath $pioPath)) {
    throw 'Install PlatformIO Core or open the PlatformIO IDE extension in VS Code, then retry.'
  }
  $pioArguments = switch ($Action) {
    'build' { @('run', '-e', 'esp32dev') }
    'ports' { @('device', 'list') }
    'upload' {
      if (-not $Port) { throw 'Specify the board port: ./firmware.ps1 upload -Port COM5' }
      @('run', '-e', 'esp32dev', '-t', 'upload', '--upload-port', $Port)
    }
    'monitor' {
      if (-not $Port) { throw 'Specify the board port: ./firmware.ps1 monitor -Port COM5' }
      @('device', 'monitor', '--baud', '115200', '--port', $Port, '--filter', 'send_on_enter')
    }
  }
  & $pioPath @pioArguments
  exit $LASTEXITCODE
} finally { Pop-Location }
