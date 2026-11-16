$ErrorActionPreference = 'Stop'

try {
    # Watch process handles so forced terminal deletion also stops orphaned npm workers.
    $processes = @{}
    Get-CimInstance Win32_Process | ForEach-Object { $processes[[int]$_.ProcessId] = $_ }
    $ownerIds = [System.Collections.Generic.List[int]]::new()
    $ownerId = [int]$env:SOILSENSE_DEV_OWNER
    while ($ownerId -gt 0 -and $processes.ContainsKey($ownerId) -and $ownerIds.Count -lt 32) {
        $ownerIds.Add($ownerId)
        $owner = $processes[$ownerId]
        if ($owner.Name -in @('powershell.exe', 'pwsh.exe')) { break }
        $ownerId = [int]$owner.ParentProcessId
    }
    if ($ownerIds.Count -eq 0) { throw 'The dev launcher has already exited.' }

    Add-Type -Path @("$PSScriptRoot\windows-dev-native.cs", "$PSScriptRoot\windows-dev-job.cs")
    $command = [string[]](ConvertFrom-Json $env:SOILSENSE_DEV_COMMAND)
    exit [SoilSenseDevJob]::Run($command, $ownerIds.ToArray())
} catch {
    Write-Error $_
    exit 1
}
