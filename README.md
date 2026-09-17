# 필드이슈 대시보드

SharePoint 리스트에 쌓이는 필드 불량 접수 데이터를 **로그인 한 번으로 바로 조회·분석**하는 사내용 대시보드입니다.
서버나 데이터베이스 없이 **HTML 파일 하나**로 동작하며, 데이터는 Microsoft Graph로 SharePoint에서 직접 읽어옵니다.

## 화면 구성

| 메뉴 | 하는 일 |
|---|---|
| **상세 데이터** | 접수 건 전체 표 조회 · 다중 필터 · 검색 · 항목 수정(권한자) |
| **현황 분석** | 선택 조건의 KPI·진행현황·불량유형·모델·에러코드 집계 |
| **연도별 분석** | 연도 + 발생기간(3·6·12개월이내 다중선택)별 집계와 월별 접수/완료 추이 |
| **주간 분석** | 최근 7주 중 한 주를 골라 그 주 신규 접수분만 집계 |
| **반복 불량** | 같은 모델·제품군·H/W 원인유형(Lv.2)이 되풀이되는 OPEN 건을 묶어 표시 |
| **모델별 에러코드** | 13개 모델 463건 에러코드 모음집 검색 |
| **Master Version** | OQC 릴리즈 PDF를 올리면 모델별 양산 버전이 자동 정리 (담당자만 업로드) |
| **품질 도구** | 편차·공차 판정, 불량률·시그마 수준, 공정능력(Cp/Cpk), 생산성(UPH/UPPH) |

## 기술 구성

- **단일 HTML 파일** — 빌드 과정 없음, 프레임워크 없음
- **MSAL Browser v3** — Azure AD(Microsoft Entra ID) 위임 로그인
- **Microsoft Graph** — SharePoint 리스트 조회·수정, 문서 라이브러리 저장
- **PDF.js** — 릴리즈 PDF 표 구조 인식 (필요할 때만 불러옴)
- 차트는 외부 라이브러리 없이 **SVG로 직접** 그립니다

## 실행 방법

로그인이 Azure에 등록된 주소에서만 동작하므로, 파일을 더블클릭해서 열면 안 되고 로컬 서버로 띄워야 합니다.

```bash
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 으로 접속하면 자동으로 Microsoft 로그인으로 넘어갑니다.
(`start-server.bat`을 더블클릭해도 같은 일이 됩니다.)

## 직접 쓰려면 바꿔야 하는 값

`index.html` 위쪽 설정 부분에 있습니다.

| 값 | 설명 |
|---|---|
| `msalConfig.auth.clientId` | Azure 앱 등록의 클라이언트 ID |
| `msalConfig.auth.authority` | 테넌트 주소 |
| `SHAREPOINT_HOSTNAME` · `SITE_PATH` | 데이터가 있는 SharePoint 사이트 |
| `LIST_NAME` | 조회할 리스트 이름 |
| `EDIT_ALLOWED_USERS` | 수정·업로드 권한을 가진 계정 |

Azure 앱 등록에는 **리디렉션 URI**(실행 주소)와 `Sites.ReadWrite.All` 권한이 필요합니다.

## 이어서 작업하려면

| 문서 | 내용 |
|---|---|
| [PRD.md](PRD.md) | 제품 요구사항 — 배경·목표·화면별 요구사항·성공 기준 |
| [CLAUDE.md](CLAUDE.md) | 작업 규칙 — 기술 스택 제약, 검증 방법, 비밀값 취급 |
| [docs/인수인계.md](docs/인수인계.md) | 현재 상태, 미검증 항목, 다음 할 일 |
| [docs/결정기록.md](docs/결정기록.md) | 왜 그렇게 만들었는지 |
| [tools/README.md](tools/README.md) | 로컬 미리보기·발표자료 생성 도구 |

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 대시보드 전체 (화면·스타일·동작 모두 포함) |
| `error_codes.json` | 모델별 에러코드 모음집 |
| `start-server.bat` | 로컬 서버 실행 |
| `icon-*.png` | 홈 화면 추가용 아이콘 |
