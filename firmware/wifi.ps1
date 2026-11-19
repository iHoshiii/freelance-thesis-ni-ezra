param(
  [Parameter(Mandatory = $true)]
  [string]$Port
)

$ErrorActionPreference = 'Stop'

if ($Port -notin [System.IO.Ports.SerialPort]::GetPortNames()) {
  throw "Windows cannot see port $Port. Plug in the ESP32 with a USB data cable and run firmware.ps1 ports."
}

function ConvertTo-ReaderHex([byte[]]$Bytes) {
  [BitConverter]::ToString($Bytes).Replace('-', '')
}

function Read-ReaderReply($Serial, [string]$Prefix, [int]$TimeoutMs) {
  $elapsed = [System.Diagnostics.Stopwatch]::StartNew()
  while ($elapsed.ElapsedMilliseconds -lt $TimeoutMs) {
    try { $line = $Serial.ReadLine().Trim() }
    catch {
      if ($_.Exception.GetBaseException() -isnot [System.TimeoutException]) { throw }
      continue
    }
    if ($line.StartsWith($Prefix, [StringComparison]::Ordinal)) {
      return $line.Substring($Prefix.Length)
    }
  }
}

$serial = [System.IO.Ports.SerialPort]::new($Port, 115200)
$serial.ReadTimeout = 900
$serial.WriteTimeout = 1500
try {
  $serial.Open()
  $status = $null
  for ($attempt = 0; $attempt -lt 5 -and $null -eq $status; $attempt++) {
    $serial.WriteLine('wifi-status')
    $status = Read-ReaderReply $serial 'Wi-Fi status: ' 1800
  }
  if ($null -eq $status) { throw 'No reply from the ESP32. Check the port and upload the Wi-Fi firmware first.' }

  Write-Host "ESP32 Wi-Fi: $status"
  $name = Read-Host '2.4 GHz Wi-Fi name'
  $nameBytes = [Text.Encoding]::UTF8.GetBytes($name)
  if ($nameBytes.Length -lt 1 -or $nameBytes.Length -gt 32) { throw 'Enter a Wi-Fi name between 1 and 32 bytes.' }

  $secret = Read-Host 'Wi-Fi password (press Enter for an open network)' -AsSecureString
  $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
  try {
    $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
    $nameToken = ConvertTo-ReaderHex $nameBytes
    $passwordBytes = [Text.Encoding]::UTF8.GetBytes($passwordText)
    if ($passwordBytes.Length -gt 64) { throw 'The Wi-Fi password is too long.' }
    $passwordToken = if ($passwordBytes.Length) { ConvertTo-ReaderHex $passwordBytes } else { '-' }
    $serial.WriteLine("wifi-join $nameToken $passwordToken")
  } finally {
    if ($passwordBytes) { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length) }
    $passwordText = $null
    $passwordToken = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
    $secret.Dispose()
  }

  Write-Host 'Connecting...'
  $result = Read-ReaderReply $serial 'Wi-Fi setup: ' 30000
  if ($null -eq $result) { throw 'No connection result from the ESP32. Check the OLED Wi-Fi page.' }
  if ($result -ne 'Connected and saved.') { throw $result }
  Write-Host $result
} finally {
  $serial.Dispose()
}
