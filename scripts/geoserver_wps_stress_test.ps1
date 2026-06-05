param(
    [string]$BaseUrl = 'http://localhost:8080/geoserver',
    [string]$Workspace = 'seaboundaries',
    [string]$Layer = 'basepoint',
    [int]$Iterations = 30,
    [int]$Concurrency = 5,
    [int]$TimeoutSec = 45
)

$ErrorActionPreference = 'Stop'

if ($Iterations -lt 1) { throw 'Iterations must be >= 1' }
if ($Concurrency -lt 1) { throw 'Concurrency must be >= 1' }

$layerName = "${Workspace}:$Layer"
$wfsRef = "$BaseUrl/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=$layerName&maxFeatures=50"
$wpsUrl = "$BaseUrl/wps"

$executeBody = @"
<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute service="WPS" version="1.0.0"
    xmlns:wps="http://www.opengis.net/wps/1.0.0"
    xmlns:ows="http://www.opengis.net/ows/1.1"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:RectangularClip</ows:Identifier>
    <wps:DataInputs>
        <wps:Input>
            <ows:Identifier>features</ows:Identifier>
            <wps:Reference xlink:href="$wfsRef" method="GET" mimeType="text/xml; subtype=wfs-collection/1.0" />
        </wps:Input>
        <wps:Input>
            <ows:Identifier>clip</ows:Identifier>
            <wps:Data>
                <wps:BoundingBoxData crs="EPSG:4326">
                    <ows:LowerCorner>95 -11</ows:LowerCorner>
                    <ows:UpperCorner>141 6</ows:UpperCorner>
                </wps:BoundingBoxData>
            </wps:Data>
        </wps:Input>
    </wps:DataInputs>
    <wps:ResponseForm>
        <wps:RawDataOutput mimeType="application/json">
            <ows:Identifier>result</ows:Identifier>
        </wps:RawDataOutput>
    </wps:ResponseForm>
</wps:Execute>
"@

# Warm-up call to validate request shape before stress loop
$warm = Invoke-WebRequest -Uri $wpsUrl -Method Post -Body $executeBody -ContentType 'text/xml' -UseBasicParsing -TimeoutSec $TimeoutSec
if ($warm.StatusCode -ne 200) {
    throw "Warm-up WPS Execute failed with HTTP $($warm.StatusCode)"
}

$jobBlock = {
    param($Url, $Body, $Timeout)

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = Invoke-WebRequest -Uri $Url -Method Post -Body $Body -ContentType 'text/xml' -UseBasicParsing -TimeoutSec $Timeout
        $sw.Stop()

        $contentType = [string]$resp.Headers['Content-Type']
        $text = if ($resp.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($resp.Content) } else { [string]$resp.Content }
        $looksLikeData = ($text -match 'FeatureCollection|"features"|\{"type"\s*:\s*"FeatureCollection"')
        $ok = ($resp.StatusCode -eq 200 -and ($looksLikeData -or $contentType -match 'application/json|text/xml|application/xml'))

        [PSCustomObject]@{
            Success = $ok
            HttpStatus = $resp.StatusCode
            ElapsedMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            Bytes = if ($resp.RawContentLength) { [int]$resp.RawContentLength } else { [int]$text.Length }
            ContentType = $contentType
            Error = ''
        }
    }
    catch {
        $sw.Stop()
        [PSCustomObject]@{
            Success = $false
            HttpStatus = 0
            ElapsedMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            Bytes = 0
            ContentType = ''
            Error = $_.Exception.Message
        }
    }
}

$jobs = @()
$all = New-Object System.Collections.Generic.List[object]
$submitted = 0
$startedAt = Get-Date

# Submit jobs with throttle by desired concurrency
for ($i = 1; $i -le $Iterations; $i++) {
    while (@($jobs | Where-Object { $_.State -in @('Running', 'NotStarted') }).Count -ge $Concurrency) {
        $null = Wait-Job -Job $jobs -Any -Timeout 5
        $done = @($jobs | Where-Object { $_.State -in @('Completed', 'Failed', 'Stopped') })
        foreach ($j in $done) {
            $out = Receive-Job -Job $j -ErrorAction SilentlyContinue
            foreach ($item in @($out)) {
                if ($item) { $all.Add($item) }
            }
            Remove-Job -Job $j -Force -ErrorAction SilentlyContinue
            $jobs = @($jobs | Where-Object { $_.Id -ne $j.Id })
        }
    }

    $jobs += Start-Job -ScriptBlock $jobBlock -ArgumentList $wpsUrl, $executeBody, $TimeoutSec
    $submitted++
}

# Drain remaining jobs
if ($jobs.Count -gt 0) {
    Wait-Job -Job $jobs | Out-Null
}

foreach ($j in @($jobs)) {
    $out = Receive-Job -Job $j -ErrorAction SilentlyContinue
    foreach ($item in @($out)) {
        if ($item) { $all.Add($item) }
    }
    Remove-Job -Job $j -Force -ErrorAction SilentlyContinue
}

$jobs = @()

$endedAt = Get-Date
$totalSec = [math]::Max(0.001, ($endedAt - $startedAt).TotalSeconds)
$items = @($all.ToArray())
$okItems = @($items | Where-Object { $_.Success })
$failItems = @($items | Where-Object { -not $_.Success })

$latencies = @($items | ForEach-Object { [double]$_.ElapsedMs } | Sort-Object)
$avg = if ($latencies.Count -gt 0) { [math]::Round((($latencies | Measure-Object -Average).Average), 2) } else { 0 }
$min = if ($latencies.Count -gt 0) { $latencies[0] } else { 0 }
$max = if ($latencies.Count -gt 0) { $latencies[$latencies.Count - 1] } else { 0 }
$p95 = if ($latencies.Count -gt 0) {
    $idx = [math]::Ceiling($latencies.Count * 0.95) - 1
    if ($idx -lt 0) { $idx = 0 }
    if ($idx -ge $latencies.Count) { $idx = $latencies.Count - 1 }
    $latencies[$idx]
} else { 0 }

$throughput = [math]::Round(($items.Count / $totalSec), 2)
$successRate = if ($items.Count -gt 0) { [math]::Round(($okItems.Count * 100.0 / $items.Count), 2) } else { 0 }

$summary = [PSCustomObject]@{
    Iterations = $Iterations
    Concurrency = $Concurrency
    TotalExecuted = $items.Count
    MissingResults = ($Iterations - $items.Count)
    Success = $okItems.Count
    Fail = $failItems.Count
    SuccessRatePct = $successRate
    TotalSeconds = [math]::Round($totalSec, 2)
    ThroughputReqPerSec = $throughput
    LatencyMsMin = $min
    LatencyMsAvg = $avg
    LatencyMsP95 = $p95
    LatencyMsMax = $max
}

Write-Output '=== WPS Stress Test Summary ==='
$summary | Format-List | Out-String | Write-Output

if ($items.Count -ne $Iterations) {
    Write-Output "WARNING: Expected $Iterations executions but collected $($items.Count) results."
    exit 1
}

if ($failItems.Count -gt 0) {
    Write-Output '=== Sample Failures (max 5) ==='
    $failItems | Select-Object -First 5 ElapsedMs, Error, ContentType | Format-Table -AutoSize | Out-String -Width 220 | Write-Output
    exit 1
}

exit 0
