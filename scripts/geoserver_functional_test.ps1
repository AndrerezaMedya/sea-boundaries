param(
    [string]$BaseUrl = 'http://localhost:8080/geoserver',
    [string]$Workspace = 'seaboundaries',
    [string]$Username = 'admin',
    [string]$Password = 'geoserver'
)

$ErrorActionPreference = 'Stop'

$layers = @(
    'maritime_boundary_line',
    'extended_shelf_area',
    'baseline_segment',
    'basepoint',
    'agreement_point',
    'view_batas_laut_publik'
)

$token = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$Username`:$Password"))
$headers = @{ Authorization = "Basic $token"; Accept = 'application/json' }

$results = New-Object System.Collections.Generic.List[object]
function Add-Result {
    param([string]$Test, [bool]$Ok, [string]$Detail)
    $results.Add([PSCustomObject]@{
        Test = $Test
        Status = if ($Ok) { 'PASS' } else { 'FAIL' }
        Detail = $Detail
    })
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/web/" -UseBasicParsing -TimeoutSec 20
    Add-Result 'GeoServer Web Reachable' ($r.StatusCode -eq 200) "HTTP $($r.StatusCode)"
}
catch {
    Add-Result 'GeoServer Web Reachable' $false $_.Exception.Message
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/rest/about/version.json" -Headers $headers -UseBasicParsing -TimeoutSec 20
    Add-Result 'REST Auth' ($r.StatusCode -eq 200) "HTTP $($r.StatusCode)"
}
catch {
    Add-Result 'REST Auth' $false $_.Exception.Message
}

try {
    $ws = Invoke-RestMethod -Uri "$BaseUrl/rest/workspaces/$Workspace.json" -Headers $headers -Method GET -TimeoutSec 20
    Add-Result 'Workspace Exists' ($ws.workspace.name -eq $Workspace) $ws.workspace.name
}
catch {
    Add-Result 'Workspace Exists' $false $_.Exception.Message
}

try {
    $ds = Invoke-RestMethod -Uri "$BaseUrl/rest/workspaces/$Workspace/datastores.json" -Headers $headers -Method GET -TimeoutSec 20
    $names = @($ds.dataStores.dataStore | ForEach-Object { $_.name })
    $ok = ($names -contains 'seabandl_iho' -and $names -contains 'seabandl_public')
    Add-Result 'Datastores Exist' $ok ($names -join ', ')
}
catch {
    Add-Result 'Datastores Exist' $false $_.Exception.Message
}

foreach ($l in $layers) {
    $ns = "${Workspace}:$l"
    try {
        $null = Invoke-RestMethod -Uri "$BaseUrl/rest/layers/$ns.json" -Headers $headers -Method GET -TimeoutSec 20
        Add-Result "REST Layer $ns" $true 'Found in catalog'
    }
    catch {
        Add-Result "REST Layer $ns" $false $_.Exception.Message
    }
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/wms?service=WMS&version=1.1.1&request=GetCapabilities" -UseBasicParsing -TimeoutSec 20
    Add-Result 'WMS GetCapabilities' ($r.StatusCode -eq 200) "HTTP $($r.StatusCode)"
}
catch {
    Add-Result 'WMS GetCapabilities' $false $_.Exception.Message
}

foreach ($l in $layers) {
    $ns = "${Workspace}:$l"
    $url = "$BaseUrl/wms?service=WMS&version=1.1.1&request=GetMap&layers=$ns&styles=&bbox=95,-11,141,6&width=256&height=256&srs=EPSG:4326&format=image/png"
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 25
        $ctype = $r.Headers['Content-Type']
        $ok = ($r.StatusCode -eq 200 -and $ctype -like 'image/png*')
        Add-Result "WMS GetMap $ns" $ok "HTTP $($r.StatusCode), $ctype"
    }
    catch {
        Add-Result "WMS GetMap $ns" $false $_.Exception.Message
    }
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetCapabilities" -UseBasicParsing -TimeoutSec 20
    Add-Result 'WFS GetCapabilities' ($r.StatusCode -eq 200) "HTTP $($r.StatusCode)"
}
catch {
    Add-Result 'WFS GetCapabilities' $false $_.Exception.Message
}

foreach ($l in $layers) {
    $ns = "${Workspace}:$l"
    $url = "$BaseUrl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=$ns&outputFormat=application/json&count=1"
    try {
        $j = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 25
        $cnt = @($j.features).Count
        Add-Result "WFS GetFeature $ns" ($cnt -ge 0) "features=$cnt"
    }
    catch {
        Add-Result "WFS GetFeature $ns" $false $_.Exception.Message
    }
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/wps?service=WPS&request=GetCapabilities&version=1.0.0" -UseBasicParsing -TimeoutSec 20
    $wpsBody = if ($r.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($r.Content) } else { [string]$r.Content }
    $hasOffer = ($wpsBody -match 'ProcessOfferings')
    Add-Result 'WPS GetCapabilities' ($r.StatusCode -eq 200 -and $hasOffer) "HTTP $($r.StatusCode), ProcessOfferings=$hasOffer"
}
catch {
    Add-Result 'WPS GetCapabilities' $false $_.Exception.Message
}

try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/wps?service=WPS&version=1.0.0&request=DescribeProcess&identifier=gs:RectangularClip" -UseBasicParsing -TimeoutSec 20
    $body = if ($r.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($r.Content) } else { [string]$r.Content }
    $ok = ($r.StatusCode -eq 200 -and $body -match 'ProcessDescription' -and $body -match 'gs:RectangularClip' -and $body -match '<ows:Identifier>features</ows:Identifier>')
    Add-Result 'WPS DescribeProcess gs:RectangularClip' $ok "HTTP $($r.StatusCode)"
}
catch {
    Add-Result 'WPS DescribeProcess gs:RectangularClip' $false $_.Exception.Message
}

$invalidLayer = "${Workspace}:layer_tidak_ada"
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/wms?service=WMS&version=1.1.1&request=GetMap&layers=$invalidLayer&styles=&bbox=95,-11,141,6&width=256&height=256&srs=EPSG:4326&format=image/png" -UseBasicParsing -TimeoutSec 20
    $ctype = [string]$r.Headers['Content-Type']
    $body = if ($r.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($r.Content) } else { [string]$r.Content }
    $isServiceException = ($ctype -match 'vnd\.ogc\.se_xml' -or $body -match 'ServiceException|LayerNotDefined')
    Add-Result 'Negative Test Invalid Layer' $isServiceException "HTTP $($r.StatusCode), $ctype"
}
catch {
    $msg = $_.Exception.Message
    $ok = ($msg -match '400|LayerNotDefined|ServiceException')
    Add-Result 'Negative Test Invalid Layer' $ok $msg
}

$results | Format-Table -AutoSize | Out-String -Width 240 | Write-Output
$fail = @($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Output "TOTAL=$($results.Count); FAIL=$fail"

if ($fail -gt 0) {
    exit 1
}
exit 0
