// 디자인 확인용 사본 생성: 로그인(MSAL)을 건너뛰고 가짜 데이터로 화면을 그리게 만듭니다.
const fs = require("fs");

const src = process.argv[2];
const out = process.argv[3];
let html = fs.readFileSync(src, "utf8");

// 1) MSAL 실제 호출을 막기 위한 스텁으로 교체
html = html.replace(
  'const msalInstance = new msal.PublicClientApplication(msalConfig);',
  `const msalInstance = {
    initialize: async () => {},
    handleRedirectPromise: async () => null,
    getAllAccounts: () => [{ name: "테스트 사용자", username: "kdr@jeisys.com" }],
    setActiveAccount: () => {},
    ssoSilent: async () => ({ account: { name: "테스트", username: "kdr@jeisys.com" } }),
    loginRedirect: () => {},
    logoutRedirect: () => {},
    acquireTokenSilent: async () => ({ accessToken: "fake" })
  };`
);

// 2) 실제 Graph 호출 대신 가짜 데이터를 돌려주도록 loadDashboard 전체를 교체
const mockBootstrap = `
/* ====== 디자인 확인용 가짜 데이터 (운영 파일에는 없는 코드) ====== */
const MOCK_COLS = [
  { name: "f_product",  displayName: "제품명" },
  { name: "f_group",    displayName: "제품군", choice: { choices: ["Device","H/P","TIP","CTG","Etc"] } },
  { name: "f_country",  displayName: "국가" },
  { name: "f_date",     displayName: "접수 일자" },
  { name: "f_occur",    displayName: "발생기간(자동)" },
  { name: "f_hospital", displayName: "병원명/대리점" },
  { name: "f_symptom",  displayName: "불량 증상" },
  { name: "f_defect",   displayName: "불량유형(Lv.1)", choice: { choices: ["원자재","조립","설계","기타(원인불명)"] } },
  { name: "f_cause2",   displayName: "H/W 원인유형(Lv.2)", choice: { choices: ["PCB/보드","케이블/커넥터","냉각계통","전원부","핸드피스","센서","기구/구조물"] } },
  { name: "f_grade",    displayName: "조건 등급", choice: { choices: ["S1","S2","S3","S4","S5"] } },
  { name: "f_status",   displayName: "진행현황", choice: { choices: ["OPEN","CLOSE","Hold"] } },
  { name: "f_owner",    displayName: "접수자" },
  { name: "f_result",   displayName: "분석 처리결과" },
  { name: "f_loc",      displayName: "고품 현 위치", choice: { choices: ["OQC팀","품질개선팀","CTS센터","IQC팀","회수중","회수 예정 없음","출고완료","재작업","폐기"] } },
  { name: "f_done",     displayName: "완료 일자" }
];
const MOCK_SEED = [
  ["LINEARZ","Device","한국","2026-06-13","3개월이내","김송이의원","시술 중 E-209 발생","원자재","S2","CLOSE"],
  ["DENSITY","Device","미국","2026-06-03","3개월이내","General Aesthetics","장비 체크 시 E102 RF=02 발생","원자재","S2","OPEN"],
  ["AQUAcel","H/P","한국","2026-05-12","6개월이내","케이비엠메디칼","온도 안 떨어짐","조립","S3","OPEN"],
  ["POTENZA","TIP","일본","2026-04-25","3개월이내","리베리의원","CP-25 팁 약물 흘러내림","기타(원인불명)","S5","CLOSE"],
  ["ULTRAcel Q+","CTG","대만","2026-03-18","12개월이내","유앤아이의원","부팅 시 E-100, N-103 에러발생","설계","S4","Hold"],
  ["TRI-BEAM","Device","베트남","2026-02-08","6개월이내","Hanoi Clinic","W-205 경고 후 전원 자동 꺼짐","원자재","S3","CLOSE"],
  ["Cellec V","H/P","싱가포르","2026-01-22","15개월이상","SG Aesthetic","E-102(RF:2) 발생","조립","S4","OPEN"],
  ["Smoothcool","Etc","인도","2025-11-30","12개월이내","Delhi Center","냉각 성능 저하","원자재","S5","CLOSE"]
];
/* 주간 분석 화면을 확인하려면 최근 몇 주에 걸친 접수일자가 필요합니다.
   앞쪽 절반은 최근 8주 안으로 날짜를 다시 뿌려 줍니다. */
const ymdLocal = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
function recentDate(i, k) {
  const d = new Date();
  d.setDate(d.getDate() - ((i * 6 + k) % 52));   // 오늘부터 최근 7주 정도에 흩뿌립니다
  return ymdLocal(d);
}
let allItemsMock = [];
MOCK_SEED.forEach((row, i) => {
  for (let k = 0; k < 6; k++) {
    const useRecent = (i * 6 + k) % 2 === 0;     // 절반만 최근 날짜로 바꿉니다
    allItemsMock.push({
      id: String(i * 6 + k + 1),
      eTag: "x",
      fields: {
        f_product: row[0], f_group: row[1], f_country: row[2],
        f_date: useRecent ? recentDate(i, k) : row[3],
        f_occur: row[4], f_hospital: row[5],
        f_symptom: row[6], f_defect: row[7], f_grade: row[8], f_status: row[9],
        /* H/W 원인유형(Lv.2).
           같은 모델에서 같은 원인이 되풀이되는 상황을 만들려고 모델(i) 기준으로 값을 정하고,
           뒤쪽 몇 건만 다른 원인으로 바꿔 둡니다.
           실제 데이터에도 빈 칸이 많은 항목이라 6건 중 1건은 일부러 비워
           '미입력 제외' 동작까지 확인할 수 있게 합니다. */
        f_cause2: k === 5 ? "" : ["PCB/보드","케이블/커넥터","냉각계통","전원부","핸드피스","센서"][(i + (k >= 3 ? 1 : 0)) % 6],
        f_owner: "김동률 (Dongryul Kim)", f_result: k % 3 === 0 ? "폐기요청" : "",
        f_loc: ["OQC팀","품질개선팀","CTS센터","회수중","회수 예정 없음","폐기"][k % 6],
        // CLOSE 건만 완료 일자를 가집니다. 접수 후 0~2개월 뒤 완료된 것으로 둡니다.
        f_done: row[9] === "CLOSE" ? (() => {
          const d = new Date(row[3]); d.setMonth(d.getMonth() + (k % 3));
          return d.toISOString().slice(0, 10);
        })() : null,
        Attachments: k % 3 === 0,
        _CommentCount: k % 4 === 0 ? 2 : 0   // 메모 아이콘 확인용
      }
    });
  }
});

async function loadDashboard() {
  allColumns = MOCK_COLS;
  visibleColumns = MOCK_COLS.slice();
  // 실제 화면과 동일하게 '접수 에러코드' 가상 열을 불량 증상 뒤에 끼워 넣습니다.
  const si = visibleColumns.findIndex(c => c.displayName === "불량 증상");
  visibleColumns.splice(si + 1, 0, { name: ERROR_CODE_FIELD, displayName: "접수 에러코드", isErrorCode: true });
  FIELD.status = "f_status"; FIELD.receivedDate = "f_date"; FIELD.occurrence = "f_occur";
  FIELD.completedDate = "f_done";
  FIELD.product = "f_product"; FIELD.productGroup = "f_group"; FIELD.country = "f_country";
  FIELD.defectType1 = "f_defect"; FIELD.defectType2 = "f_cause2"; FIELD.hospital = "f_hospital";
  FIELD.symptom = "f_symptom"; FIELD.sapId = "f_product"; FIELD.serial1 = "f_product";
  allItems = allItemsMock.slice().sort((a,b) => String(b.fields.f_date).localeCompare(String(a.fields.f_date)));
  // 실제 화면과 동일하게 불량 증상에서 에러코드를 뽑아둡니다.
  allItems.forEach(it => { it.fields[ERROR_CODE_FIELD] = extractErrorCodes(it.fields.f_symptom, it.fields.f_product); });
  buildPeopleDirectory(allItems);
  populateFilterOptions("detail", allItems, renderDetailFiltered);
  populateFilterOptions("analysis", allItems, renderAnalysisFiltered);
  renderDetailFiltered();
  renderAnalysisFiltered();
  buildYearTabs(allItems);
  buildYearlyOccPick();
  renderYearlyCharts();
  buildWeekTabs();
  renderWeeklyView();
  renderRepeatView();
  // 상단 '자동 최신화' 표시도 실제 화면과 같게 갱신합니다.
  lastLoadedAt = Date.now();
  updateLiveChip();
  el.liveChip.classList.add("visible");
  clearMessage();
}
`;

/* 원래 loadDashboard 정의를 통째로 교체합니다.
   끝 지점을 뒤따르는 주석으로 찾으면 그 주석만 고쳐도 깨지므로,
   중괄호 짝을 세어 함수가 실제로 끝나는 자리를 찾습니다. */
const startMarker = "async function loadDashboard() {";
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error("loadDashboard 정의를 찾지 못했습니다. 함수 이름이 바뀌었을 수 있습니다.");
  process.exit(1);
}
let depth = 0, endIdx = -1;
for (let i = startIdx + startMarker.length - 1; i < html.length; i++) {
  const c = html[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) { endIdx = i + 1; break; }
  }
}
if (endIdx === -1) {
  console.error("loadDashboard의 끝 중괄호를 찾지 못했습니다.");
  process.exit(1);
}
html = html.slice(0, startIdx) + mockBootstrap.trim() + html.slice(endIdx);

/* 2-2) Master Version - SharePoint 저장/불러오기는 로그인이 필요하므로
   미리보기에서는 브라우저 메모리에만 담아 파싱·표시 경로만 확인합니다. */
html = html.replace(
  "async function mvSave(payload, pdfBuffer) {",
  `async function mvSave(payload, pdfBuffer) {
    window.__mvSaved = payload; return;   // 미리보기용 - 실제로는 SharePoint에 올립니다
  }
  async function mvSaveReal(payload, pdfBuffer) {`
);
html = html.replace(
  "async function mvLoad() {",
  `async function mvLoad() {
    return window.__mvSaved || null;      // 미리보기용
  }
  async function mvLoadReal() {`
);
html = html.replace(
  "async function mvPdfLink() {",
  `async function mvPdfLink() { return null; }
  async function mvPdfLinkReal() {`
);

// 3) 이 화면이 가짜 데이터라는 것을 화면 맨 위에 크게 표시
const banner = `
<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#b04b4a;color:#fff;
  padding:8px 16px;font-size:13px;font-weight:700;text-align:center;font-family:system-ui,sans-serif;">
  디자인 확인용 미리보기 · 여기 보이는 48건은 가짜 데이터입니다 (실제 데이터 650건 아님)
</div>
<div style="height:34px;"></div>`;
html = html.replace("<body>", "<body>" + banner);

/* 출력 폴더가 없으면 만들고, 화면에 필요한 파일도 함께 복사합니다.
   (에러코드 모음집이 없으면 코드 설명이 안 뜨고, 아이콘이 없으면 404가 납니다) */
const path = require("path");
const outDir = path.dirname(out);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html, "utf8");

const srcDir = path.dirname(src);
["error_codes.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"].forEach((f) => {
  const from = path.join(srcDir, f);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(outDir, f));
});

console.log("생성 완료:", out);
