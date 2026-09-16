# 작업용 도구

운영 화면에는 포함되지 않습니다. 개발·검증할 때만 씁니다.

## 로컬 미리보기 (가장 자주 씁니다)

`index.html`을 그냥 열면 Microsoft 로그인이 필요해 화면을 볼 수 없습니다.
로그인을 건너뛰고 가짜 데이터 48건으로 화면만 그리는 사본을 만듭니다.

```bash
node tools/makeqa.js index.html qa/index.html
node tools/serve.js qa 8093
```

`http://localhost:8093` 으로 확인합니다. 화면 위쪽에 "가짜 데이터" 안내 띠가 뜹니다.

`makeqa.js`가 하는 일:

- MSAL 로그인 호출을 가짜 객체로 바꿉니다
- `loadDashboard()`를 통째로 교체해 가짜 데이터를 넣습니다
- Master Version의 SharePoint 저장/불러오기는 브라우저 메모리로 대체합니다

**`index.html`의 `loadDashboard` 구조가 바뀌면 `makeqa.js`도 같이 고쳐야 합니다.**
교체 지점을 문자열로 찾기 때문입니다. 실패하면 "loadDashboard 블록을 찾지 못했습니다"가 뜹니다.

## 발표자료 생성

```bash
cd tools && npm install pptxgenjs
node tools/ppt-build.js "필드이슈 대시보드_소개.pptx"
```

`tools/shots/` 의 화면 캡처를 슬라이드에 넣습니다.

**`c-master.png`은 저장소에 없습니다.** Master Version 화면 캡처는 실제 양산 버전 번호가
그대로 보여서 공개 저장소에 올리지 않습니다. 없으면 그 슬라이드의 이미지 자리만 비워 생성되며,
필요하면 대시보드에서 직접 캡처해 `tools/shots/c-master.png`로 두면 됩니다.
캡처를 새로 뜨려면 미리보기를 띄운 상태에서 헤드리스 크롬으로 찍습니다.

```bash
chrome --headless=new --hide-scrollbars --force-prefers-reduced-motion \
  --window-size=1600,1000 --virtual-time-budget=9000 \
  --screenshot=shots/c-analysis.png http://localhost:8095/c-analysis.html
```

`--force-prefers-reduced-motion`이 중요합니다. 없으면 KPI 숫자가
0부터 올라가는 애니메이션 중간에 찍혀 엉뚱한 값이 남습니다.

## 검증 결과 확인

만든 `.pptx`를 실제 PowerPoint로 열어 PNG로 뽑으면 글자 폭이 정확히 나옵니다.

```powershell
$app = New-Object -ComObject PowerPoint.Application
$pres = $app.Presentations.Open($src, $true, $false, $false)
$pres.Export($dst, "PNG", 1600, 900)
$pres.Close(); $app.Quit()
```
