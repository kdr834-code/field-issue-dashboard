# 설계서의 팝업 화면은 그림으로만 들어 있어, 코드와 영문 메시지를 읽으려면 OCR이 필요합니다.
# 별도 설치 없이 윈도우에 들어 있는 OCR(Windows.Media.Ocr)을 씁니다.
#
# 쓰는 법:
#   powershell -ExecutionPolicy Bypass -File tools\codebook\ocr-images.ps1 <작업폴더>
#
# 주의할 점 두 가지:
#  1) 이 파일은 반드시 BOM이 붙은 UTF-8이어야 합니다.
#     PowerShell 5.1은 BOM이 없으면 ANSI로 읽어 한글 주석에서 구문 오류가 납니다.
#  2) 설계서 그림은 90도 돌아간 채 저장돼 있습니다.
#     그대로 읽으면 글자가 하나도 안 잡히므로 돌려 세운 뒤 읽습니다.

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing

$work = $args[0]
if (-not $work) { Write-Error "작업 폴더를 지정해 주세요."; exit 1 }
$work = (Resolve-Path $work).Path

# WinRT 비동기 호출을 동기로 기다리기 위한 준비
$m = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
}
$asTaskGeneric = $m[0]
function Await($op, $type) {
  $t = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
  $t.Wait(-1) | Out-Null
  $t.Result
}

$media = Join-Path $work "unpacked\ppt\media"
$tmp   = Join-Path $work "rotated"
if (-not (Test-Path $tmp)) { New-Item -ItemType Directory $tmp | Out-Null }

$engine = [Windows.Media.Ocr.OcrEngine,Windows.Media,ContentType=WindowsRuntime]::TryCreateFromLanguage(
  [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]::new("ko"))
if (-not $engine) { Write-Error "한국어 OCR을 쓸 수 없습니다. 설정 > 시간 및 언어에서 한국어 기능을 확인하세요."; exit 1 }

function OcrFile($p) {
  $f = Await ([Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]::GetFileFromPathAsync($p)) ([Windows.Storage.StorageFile])
  $s = Await ($f.OpenAsync(0)) ([Windows.Storage.Streams.IRandomAccessStream])
  $d = Await ([Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics,ContentType=WindowsRuntime]::CreateAsync($s)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $b = Await ($d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $r = Await ($engine.RecognizeAsync($b)) ([Windows.Media.Ocr.OcrResult])
  $s.Dispose()
  return $r.Text
}

$map = Get-Content (Join-Path $work "slide-images.json") -Raw | ConvertFrom-Json
$names = @()
foreach ($p in $map.PSObject.Properties) { foreach ($n in $p.Value) { if ($names -notcontains $n) { $names += $n } } }
Write-Output ("읽을 이미지: " + $names.Count + "개")

$result = @{}
$i = 0
foreach ($name in $names) {
  $i++
  $src = Join-Path $media $name
  if (-not (Test-Path $src)) { continue }
  $best = ""
  # 돌려 세운 쪽과 원본 중 글자가 더 많이 읽힌 쪽을 씁니다
  foreach ($rot in @("Rotate270FlipNone", "RotateNoneFlipNone")) {
    try {
      $img = [System.Drawing.Image]::FromFile($src)
      $img.RotateFlip([System.Drawing.RotateFlipType]::$rot)
      $out = Join-Path $tmp ("r_" + $name)
      $img.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
      $img.Dispose()
      $txt = OcrFile $out
      if ($txt.Length -gt $best.Length) { $best = $txt }
    } catch { }
  }
  $result[$name] = $best
  if ($i % 20 -eq 0) { Write-Output ("  " + $i + "개 완료") }
}

$result | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $work "ocr.json") -Encoding utf8
Write-Output ("완료: " + $result.Count + "개 → ocr.json")
