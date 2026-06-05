param(
    [string]$BaseUrl = 'http://localhost:8080/geoserver',
    [string]$Workspace = 'seaboundaries',
    [string]$FocusLayer = 'basepoint'
)

$ErrorActionPreference = 'Stop'

$results = New-Object System.Collections.Generic.List[object]
function Add-Result {
    param([string]$Scenario, [bool]$Ok, [string]$Detail)
    $results.Add([PSCustomObject]@{
        Scenario = $Scenario
        Status = if ($Ok) { 'PASS' } else { 'FAIL' }
        Detail = $Detail
    })
}

$layerName = "${Workspace}:$FocusLayer"

# 1) User opens map and layer renders (WMS GetMap)
try {
    $wmsMapUrl = "$BaseUrl/wms?service=WMS&version=1.1.1&request=GetMap&layers=$layerName&styles=&bbox=95,-11,141,6&width=512&height=512&srs=EPSG:4326&format=image/png"
    $mapResp = Invoke-WebRequest -Uri $wmsMapUrl -UseBasicParsing -TimeoutSec 20
    $ctype = [string]$mapResp.Headers['Content-Type']
    $ok = ($mapResp.StatusCode -eq 200 -and $ctype -like 'image/png*' -and $mapResp.RawContentLength -gt 0)
    Add-Result 'User opens map layer (WMS GetMap)' $ok "HTTP $($mapResp.StatusCode), $ctype, bytes=$($mapResp.RawContentLength)"
}
catch {
    Add-Result 'User opens map layer (WMS GetMap)' $false $_.Exception.Message
}

# 2) User opens attribute table (WFS GetFeature)
$firstFeature = $null
try {
    $tableUrl = "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=$layerName&outputFormat=application/json&count=20"
    $tableResp = Invoke-RestMethod -Uri $tableUrl -Method GET -TimeoutSec 20
    $tableCount = @($tableResp.features).Count
    if ($tableCount -gt 0) {
        $firstFeature = $tableResp.features[0]
    }
    Add-Result 'User opens attribute table (WFS list)' ($tableCount -gt 0) "rows=$tableCount"
}
catch {
    Add-Result 'User opens attribute table (WFS list)' $false $_.Exception.Message
}

# 3) User clicks map and sees feature info (WMS GetFeatureInfo)
try {
    if (-not $firstFeature) {
        throw 'No sample feature found to drive click simulation.'
    }

    if ($firstFeature.geometry.type -ne 'Point') {
        throw "Focus layer is not Point (got $($firstFeature.geometry.type)); click simulation expects Point."
    }

    $lon = [double]$firstFeature.geometry.coordinates[0]
    $lat = [double]$firstFeature.geometry.coordinates[1]
    $delta = 0.2
    $minx = [string]($lon - $delta)
    $miny = [string]($lat - $delta)
    $maxx = [string]($lon + $delta)
    $maxy = [string]($lat + $delta)

    $fiUrl = "$BaseUrl/wms?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=$layerName&query_layers=$layerName&styles=&bbox=$minx,$miny,$maxx,$maxy&width=512&height=512&srs=EPSG:4326&x=256&y=256&info_format=application/json&feature_count=5"
    $fiResp = Invoke-RestMethod -Uri $fiUrl -Method GET -TimeoutSec 20
    $fiCount = @($fiResp.features).Count
    Add-Result 'User click identify (WMS GetFeatureInfo)' ($fiCount -ge 1) "features=$fiCount"
}
catch {
    Add-Result 'User click identify (WMS GetFeatureInfo)' $false $_.Exception.Message
}

# 4) User applies map extent filter (WFS bbox)
try {
    if (-not $firstFeature) {
        throw 'No sample feature found to build bbox filter.'
    }

    $lon = [double]$firstFeature.geometry.coordinates[0]
    $lat = [double]$firstFeature.geometry.coordinates[1]
    $delta = 0.2
    $bbox = "{0},{1},{2},{3},EPSG:4326" -f ($lon - $delta), ($lat - $delta), ($lon + $delta), ($lat + $delta)
    $bboxUrl = "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=$layerName&outputFormat=application/json&count=50&bbox=$bbox"
    $bboxResp = Invoke-RestMethod -Uri $bboxUrl -Method GET -TimeoutSec 20
    $bboxCount = @($bboxResp.features).Count
    Add-Result 'User filters by map extent (WFS bbox)' ($bboxCount -ge 1) "rows=$bboxCount"
}
catch {
    Add-Result 'User filters by map extent (WFS bbox)' $false $_.Exception.Message
}

# 5) User applies attribute filter (WFS cql_filter)
try {
    if (-not $firstFeature) {
        throw 'No sample feature found to build attribute filter.'
    }

    $prop = $null
    $value = $null
    foreach ($p in $firstFeature.properties.PSObject.Properties) {
        $name = [string]$p.Name
        $val = $p.Value
        if ($null -eq $val) { continue }
        if ($name -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { continue }
        if ($val -is [string] -and $val.Trim().Length -gt 0) {
            $prop = $name
            $escaped = $val.Replace("'", "''")
            $value = "'$escaped'"
            break
        }
        if ($val -is [int] -or $val -is [long] -or $val -is [double] -or $val -is [decimal]) {
            $prop = $name
            $value = [string]$val
            break
        }
    }

    if (-not $prop) {
        throw 'No suitable scalar property found for cql_filter test.'
    }

    $cql = "$prop=$value"
    $cqlEncoded = [uri]::EscapeDataString($cql)
    $cqlUrl = "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=$layerName&outputFormat=application/json&count=20&cql_filter=$cqlEncoded"
    $cqlResp = Invoke-RestMethod -Uri $cqlUrl -Method GET -TimeoutSec 20
    $cqlCount = @($cqlResp.features).Count
    Add-Result 'User filters by attribute (WFS cql_filter)' ($cqlCount -ge 1) "filter=$cql, rows=$cqlCount"
}
catch {
    Add-Result 'User filters by attribute (WFS cql_filter)' $false $_.Exception.Message
}

# 6) User downloads data (GeoJSON export)
try {
    $downloadDir = 'd:/web/coba-gis/sea-boundaries/artifacts'
    if (-not (Test-Path $downloadDir)) {
        New-Item -Path $downloadDir -ItemType Directory | Out-Null
    }

    $downloadPath = Join-Path $downloadDir 'basepoint_sample.geojson'
    $downloadUrl = "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=$layerName&outputFormat=application/json&count=200"
    $dlResp = Invoke-WebRequest -Uri $downloadUrl -UseBasicParsing -TimeoutSec 25
    if ($dlResp.Content -is [byte[]]) {
        [IO.File]::WriteAllBytes($downloadPath, $dlResp.Content)
    }
    else {
        [IO.File]::WriteAllText($downloadPath, [string]$dlResp.Content, [Text.Encoding]::UTF8)
    }

    $bytes = (Get-Item $downloadPath).Length
    Add-Result 'User downloads GeoJSON (WFS export)' ($bytes -gt 0) "file=$downloadPath, bytes=$bytes"
}
catch {
    Add-Result 'User downloads GeoJSON (WFS export)' $false $_.Exception.Message
}

$results | Format-Table -AutoSize | Out-String -Width 220 | Write-Output
$fail = @($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Output "TOTAL=$($results.Count); FAIL=$fail"

if ($fail -gt 0) {
    exit 1
}
exit 0
