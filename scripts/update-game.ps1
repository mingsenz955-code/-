param(
    [string]$GameDirectory,
    [switch]$Launch,
    [string]$LocalManifest
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = 'mingsenz955-code/-'
$rawRoot = "https://raw.githubusercontent.com/$repo/"
$manifestUrl = $rawRoot + 'master/updates/latest.json'
$headers = @{ 'User-Agent' = 'YulongRanch-Updater/1' }

function Safe-Path([string]$base, [string]$relative) {
    if ([string]::IsNullOrWhiteSpace($relative) -or [IO.Path]::IsPathRooted($relative) -or $relative.Contains('\') -or $relative.Contains(':') -or $relative -match '[\x00-\x1f*?"<>|]') { throw "更新路径无效：$relative" }
    foreach ($part in $relative.Split('/')) { if ($part -in @('', '.', '..')) { throw "更新路径越界：$relative" } }
    $base = [IO.Path]::GetFullPath($base).TrimEnd('\')
    $full = [IO.Path]::GetFullPath((Join-Path $base $relative))
    if (-not $full.StartsWith($base + '\', [StringComparison]::OrdinalIgnoreCase)) { throw '更新路径超出游戏目录。' }
    $cursor = $full
    while ($cursor.Length -gt $base.Length) {
        if (Test-Path -LiteralPath $cursor) {
            if (((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "更新路径包含链接：$cursor" }
        }
        $cursor = [IO.Path]::GetDirectoryName($cursor)
    }
    return $full
}
function File-Hash([string]$file) {
    $stream=[IO.File]::OpenRead($file);$algorithm=[Security.Cryptography.SHA256]::Create()
    try{return ([BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-','').ToLowerInvariant()}finally{$stream.Dispose();$algorithm.Dispose()}
}
function Matches([string]$file, $entry) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { return $false }
    $item = Get-Item -LiteralPath $file
    if ($item.Length -eq [long]$entry.bytes -and (File-Hash $file) -eq $entry.sha256) { return $true }
    if ($entry.text -eq $true -and $item.Length -le 50000000) {
        $bytes = [Text.Encoding]::UTF8.GetBytes([IO.File]::ReadAllText($file).Replace("`r`n","`n"))
        if ($bytes.Length -eq [long]$entry.bytes) { return ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes))).Replace('-','').ToLowerInvariant() -eq $entry.sha256 }
    }
    return $false
}
function Download([string]$url, [string]$file) {
    for ($attempt=1; $attempt -le 3; $attempt++) {
        try { Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $file -Headers $headers -TimeoutSec 120; return }
        catch { if ($attempt -eq 3) { throw }; Start-Sleep -Seconds 2 }
    }
}
try {
    if (-not $GameDirectory -and (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'updater-settings.json'))) {
        $settings=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'updater-settings.json') -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($settings.gameDirectory -and (Test-Path -LiteralPath $settings.gameDirectory)) { $GameDirectory=$settings.gameDirectory }
    }
    if (-not $GameDirectory) {
        $beside = Split-Path -Parent $PSScriptRoot
        if (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'dist')) { $GameDirectory = $PSScriptRoot }
        elseif (Test-Path -LiteralPath (Join-Path $beside 'dist')) { $GameDirectory = $beside }
        else {
            Add-Type -AssemblyName System.Windows.Forms
            $picker = New-Object System.Windows.Forms.FolderBrowserDialog
            $picker.Description = '选择原来的御龙高手文件夹（里面有启动游戏.exe和dist），不要选择存档文件夹。'
            if ($picker.ShowDialog() -ne 'OK') { exit 2 }
            $GameDirectory = $picker.SelectedPath
        }
    }
    $GameDirectory = (Resolve-Path -LiteralPath $GameDirectory).Path.TrimEnd('\')
    if (((Get-Item -LiteralPath $GameDirectory).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw '游戏根目录不能是链接。' }
    $dist = Safe-Path $GameDirectory 'dist'
    if (-not (Test-Path -LiteralPath $dist -PathType Container)) { throw '未找到dist，请选择原游戏的总文件夹。' }
    $mutexName = 'Local\YulongUpdate-' + ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($GameDirectory.ToLowerInvariant())))).Replace('-','').Substring(0,24)
    $mutex = New-Object Threading.Mutex($false, $mutexName)
    if (-not $mutex.WaitOne(0)) { throw '这个游戏的另一个更新窗口正在运行。' }
    $cache = Safe-Path $GameDirectory '.update-cache'
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    if ($LocalManifest) {
        # Fixture input for repeatable offline installer tests; not used by the shortcut.
        $manifest = Get-Content -LiteralPath $LocalManifest -Raw -Encoding UTF8 | ConvertFrom-Json
    } else {
        Write-Host '正在从GitHub检查更新……'
        $downloadedManifest = Join-Path $cache 'latest.download.json'
        Download $manifestUrl $downloadedManifest
        $manifest = Get-Content -LiteralPath $downloadedManifest -Raw -Encoding UTF8 | ConvertFrom-Json
    }
    if ($manifest.schema -ne 1 -or $manifest.version -notmatch '^\d+\.\d+\.\d+$' -or $manifest.commit -notmatch '^[a-f0-9]{40}$' -or @($manifest.files).Count -lt 1 -or @($manifest.files).Count -gt 20000) { throw '更新清单格式无效。' }
    $version = [version]$manifest.version
    $releaseName = '御龙高手-v' + $manifest.version + '-win32-x64'
    $release = Safe-Path $dist $releaseName
    $old = @(Get-ChildItem -LiteralPath $dist -Directory | Where-Object { $_.Name -match '^御龙高手-v\d+\.\d+\.\d+-win32-x64$' } | Sort-Object { [version]($_.Name -replace '^御龙高手-v|\-win32-x64$','') } -Descending)
    if ($old.Count -eq 0) { throw '此更新器用于已安装游戏的玩家，请先安装完整游戏。' }
    if ([version]($old[0].Name -replace '^御龙高手-v|\-win32-x64$','') -gt $version) { throw '本地版本比发布版本新，已阻止降级。' }
    $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
    foreach ($f in $manifest.files) {
        $null = Safe-Path $release $f.path
        if (-not $seen.Add($f.path) -or $f.sha256 -notmatch '^[a-f0-9]{64}$' -or $f.bytes -lt 0 -or $f.bytes -gt 1000000000) { throw '更新文件记录无效或重复。' }
        if ($f.kind -eq 'app') {
            if ($f.path -notmatch '^resources/app/(src/|desktop/|assets/|index\.html$|package\.json$)') { throw '清单试图写入非程序目录。' }
            $expected = $rawRoot + $manifest.commit + '/' + $f.path.Substring(14)
            if ($f.url -cne $expected) { throw '程序下载地址不属于本次固定GitHub提交。' }
        } elseif ($f.kind -ne 'runtime' -or $f.path.Contains('/') -and $f.path -notmatch '^(locales/|resources/)') { throw '运行时文件记录无效。' }
    }
    if ($LocalManifest) { $localPayload = Join-Path (Split-Path -Parent $LocalManifest) 'payload' }
    $allCurrent = Test-Path -LiteralPath $release -PathType Container
    if ($allCurrent) { foreach ($f in $manifest.files) { if (-not (Matches (Safe-Path $release $f.path) $f)) { $allCurrent=$false; break } } }
    if ($allCurrent) {
        Write-Host "已经是最新版 v$version，程序文件校验一致，不下载任何游戏内容。" -ForegroundColor Green
        if ($Launch) { Start-Process -FilePath (Join-Path $GameDirectory '启动游戏.exe') }
        exit 0
    }
    foreach ($p in @([Diagnostics.Process]::GetProcessesByName('御龙高手')) + @([Diagnostics.Process]::GetProcessesByName('electron'))) {
        $runningPath=$null;try{$runningPath=$p.MainModule.FileName}catch{throw '无法确认正在运行的游戏路径，请退出游戏后重试。'}
        if ($runningPath -and $runningPath.StartsWith($GameDirectory+'\',[StringComparison]::OrdinalIgnoreCase)) { throw '游戏正在运行，请先正常退出游戏再更新，确保最新进度已保存。' }
    }
    if (Test-Path -LiteralPath $release) { throw '同版本目录存在但文件不完整，请先将该目录改名后重试；现有版本和存档未覆盖。' }
    $stageName = '.update-v' + $manifest.version + '-' + [guid]::NewGuid().ToString('N')
    $stage = Safe-Path $dist $stageName
    New-Item -ItemType Directory -Path $stage | Out-Null
    $downloadCount=0; $reuseCount=0; $downloadBytes=[long]0; $runtimeRoot=$null
    $index=0
    foreach ($f in $manifest.files) {
        $index++
        Write-Progress -Activity "更新到 v$version：校验并复用已有文件" -Status "$index / $(@($manifest.files).Count)" -PercentComplete ($index*100/@($manifest.files).Count)
        $destination = Safe-Path $stage $f.path
        $source = $null
        foreach ($candidate in $old) { $check = Safe-Path $candidate.FullName $f.path; if (Matches $check $f) { $source=$check; break } }
        if (-not $source -and $f.kind -eq 'app') { $check = Safe-Path $GameDirectory $f.path.Substring(14); if (Matches $check $f) { $source=$check } }
        if ($source) { $reuseCount++ }
        else {
            $blob = Safe-Path $cache $f.sha256
            if (Matches $blob $f) { $source=$blob; $reuseCount++ }
            elseif ($LocalManifest) { $source=Safe-Path $localPayload $f.path; if (-not (Matches $source $f)) { throw '本地测试载荷损坏。' };$downloadCount++;$downloadBytes+=$f.bytes }
            elseif ($f.kind -eq 'app') {
                Write-Host ('下载变化文件：'+$f.path)
                Download $f.url $blob
                if (-not (Matches $blob $f)) { throw ('下载文件校验失败：'+$f.path) }
                $source=$blob;$downloadCount++;$downloadBytes+=$f.bytes
            } else {
                if (-not $runtimeRoot) {
                    $r=$manifest.runtime
                    if ($r.url -cne "https://github.com/$repo/releases/download/v$version/runtime-win32-x64.zip" -or $r.sha256 -notmatch '^[a-f0-9]{64}$') { throw '运行时修复地址无效。' }
                    $archive=Safe-Path $cache ($r.sha256+'.zip')
                    if (-not (Matches $archive $r)) { Write-Host '本地缺少正确的运行时文件，正在下载运行时修复包……';Download $r.url $archive;if(-not (Matches $archive $r)){throw '运行时修复包校验失败。'};$downloadCount++;$downloadBytes+=$r.bytes }
                    $runtimeRoot=Safe-Path $cache ('runtime-'+[guid]::NewGuid().ToString('N'))
                    Add-Type -AssemblyName System.IO.Compression.FileSystem
                    $zip=[IO.Compression.ZipFile]::OpenRead($archive)
                    try { foreach($entry in $zip.Entries){$null=Safe-Path $runtimeRoot $entry.FullName.TrimEnd('/')} } finally { $zip.Dispose() }
                    [IO.Compression.ZipFile]::ExtractToDirectory($archive,$runtimeRoot)
                }
                $source=Safe-Path $runtimeRoot $f.path;if(-not (Matches $source $f)){throw '修复后的运行时文件校验失败。'}
            }
        }
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        if($f.text -eq $true){[IO.File]::WriteAllText($destination,[IO.File]::ReadAllText($source).Replace("`r`n","`n"),(New-Object Text.UTF8Encoding($false)))}else{Copy-Item -LiteralPath $source -Destination $destination}
    }
    Write-Progress -Activity '校验更新' -Completed
    foreach($f in $manifest.files){if(-not(Matches (Safe-Path $stage $f.path) $f)){throw ('安装完整性校验失败：'+$f.path)}}
    $package=Get-Content -LiteralPath (Safe-Path $stage 'resources/app/package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if($package.version -ne $manifest.version){throw '程序版本与清单不一致。'}
    $save=Safe-Path $GameDirectory 'player-data/saves/ranch-v1.json'
    $backup=$null
    if(Test-Path -LiteralPath $save){
        $saved=Get-Content -LiteralPath $save -Raw -Encoding UTF8 | ConvertFrom-Json
        if(-not $saved.version -or $saved.version -gt 12){throw '存档版本无法由此游戏版本读取，已阻止更新。'}
        $backup=Safe-Path $GameDirectory ('player-data/recovery/before-update-v'+$version+'-'+[DateTimeOffset]::Now.ToUnixTimeMilliseconds()+'.json')
        New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
        Copy-Item -LiteralPath $save -Destination $backup
        if((File-Hash $save) -ne (File-Hash $backup)){throw '存档备份校验失败。'}
    }
    # Atomic activation. Both paths were resolved under this exact dist directory.
    if((Split-Path -Parent $stage) -ne $dist -or (Split-Path -Parent $release) -ne $dist){throw '发行目录越界。'}
    Move-Item -LiteralPath $stage -Destination $release
    $report=[ordered]@{version=$manifest.version;downloadedFiles=$downloadCount;downloadedBytes=$downloadBytes;reusedFiles=$reuseCount;backup=$backup;release=$release;at=[DateTimeOffset]::Now.ToString('o')}
    [IO.File]::WriteAllText((Join-Path $cache 'last-update.json'),($report | ConvertTo-Json),(New-Object Text.UTF8Encoding($false)))
    if(-not $LocalManifest){@{gameDirectory=$GameDirectory}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'updater-settings.json') -Encoding UTF8}
    Write-Host "更新完成 v$version，复用 $reuseCount 个文件，下载 $downloadCount 项（$downloadBytes 字节）。" -ForegroundColor Green
    Write-Host '玩家存档已备份并原位保留。以后双击同一更新入口即可检查新版。'
    if($Launch){Start-Process -FilePath (Join-Path $GameDirectory '启动游戏.exe')}
} catch {
    Write-Host ('更新未完成：'+$_.Exception.Message) -ForegroundColor Red
    Write-Host '现有发行版本和玩家存档未被替换；下载缓存保留，下次可继续。'
    exit 1
} finally { if($mutex){try{$mutex.ReleaseMutex()}catch{};$mutex.Dispose()} }
