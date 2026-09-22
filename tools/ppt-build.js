/* 필드이슈 대시보드 소개 발표자료 생성기
   - 대상: 상급자·경영진 보고 (5~10분)
   - 색은 대시보드가 실제로 쓰는 값을 그대로 씁니다 (발표자료와 실물이 이어져 보이도록) */
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const SHOT = path.join(__dirname, "shots");

// ── 색 ────────────────────────────────────────────────────────────────
const NAVY = "1E3A6E";      // 주색 (전체의 60~70%)
const DEEP = "12213F";      // 어두운 배경 (표지·성과·마무리)
const TINT = "EEF2F9";      // 연한 네이비 - 카드 바탕
const INK = "1A2333";
const SOFT = "64708A";
const LINE = "E6E9F0";
const AMBER = "B45309";     // 포인트 (딱 필요한 곳에만)
const GREEN = "157A45";
const WHITE = "FFFFFF";

// ── 글꼴 ──────────────────────────────────────────────────────────────
const F = "맑은 고딕";       // 윈도우 기본 탑재 - 한글 폭이 정확히 나옵니다
const FS = "Georgia";        // 워드마크 전용 (대시보드 로고와 같은 서체)

const W = 13.33, H = 7.5;
const M = 0.62;                       // 좌우 여백
const CW = W - M * 2;                 // 본문 폭 12.09

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "품질개선팀 김동률";
pres.company = "Jeisys Medical";
pres.title = "필드이슈 대시보드";

// ── 공통 조각 ─────────────────────────────────────────────────────────
const shadow = () => ({ type: "outer", blur: 10, offset: 2, angle: 90, color: "8494B0", opacity: 0.22 });

/* 밝은 슬라이드의 제목. 밑줄·색 띠는 쓰지 않고 여백과 크기로만 구분합니다. */
function head(s, kicker, title) {
  s.addText(kicker, {
    x: M, y: 0.42, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1.6,
  });
  s.addText(title, {
    x: M, y: 0.74, w: CW, h: 0.72, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 34, bold: true, color: INK,
  });
}

/* 번호 칩 — 이 덱 전체에서 반복되는 유일한 장식 요소입니다. */
function chip(s, x, y, label, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w: 0.42, h: 0.42, rectRadius: 0.1,
    fill: { color: fill || NAVY }, line: { color: fill || NAVY },
  });
  s.addText(label, {
    x, y, w: 0.42, h: 0.42, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: WHITE,
    align: "center", valign: "middle",
  });
}

/* 연한 바탕 카드 */
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: fill || TINT }, line: { color: fill ? fill : LINE, width: 1 },
  });
}

/* 화면 캡처를 넣습니다.
   Master Version 캡처처럼 저장소에 올리지 않는 이미지가 있어서,
   파일이 없으면 슬라이드를 깨뜨리지 않고 자리만 표시합니다. */
function shot(s, file, o) {
  const p = path.join(SHOT, file);
  if (fs.existsSync(p)) {
    s.addImage({ path: p, x: o.x, y: o.y, w: o.w, h: o.h, shadow: shadow() });
    return;
  }
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.04,
    fill: { color: "F5F6F9" }, line: { color: LINE, width: 1 },
  });
  s.addText("화면 캡처 없음 · " + file, {
    x: o.x, y: o.y, w: o.w, h: o.h, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, color: SOFT, align: "center", valign: "middle",
  });
}

function foot(s, text) {
  s.addText(text, {
    x: M, y: H - 0.52, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 9.5, color: "9AA6BC", align: "right",
  });
}

// ══════════════════════════════════════════════════════════════════════
// 1. 표지
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DEEP };

  s.addText("Jeisys", {
    x: M, y: 1.28, w: 5, h: 0.9, isTextBox: true, margin: 0,
    fontFace: FS, fontSize: 40, bold: true, italic: true, color: "CBD8F0",
  });
  s.addText("FIELD ISSUE DASHBOARD", {
    x: M + 0.05, y: 2.12, w: 6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, bold: true, color: "7E93BE", charSpacing: 2.6,
  });

  s.addText("필드이슈 대시보드", {
    x: M, y: 2.62, w: 7.2, h: 1.0, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 46, bold: true, color: WHITE,
  });
  s.addText("팀즈에 쌓이던 필드 불량 데이터를,\n링크 하나로 열리는 실시간 분석 화면으로", {
    x: M, y: 3.72, w: 6.6, h: 1.0, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 16, color: "AFC0DD", lineSpacing: 26,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 5.0, w: 2.55, h: 0.44, rectRadius: 0.22,
    fill: { color: "20366A" }, line: { color: "3D5992", width: 1 },
  });
  s.addText("품질개선팀 · 2026.09", {
    x: M, y: 5.0, w: 2.55, h: 0.44, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11.5, bold: true, color: "C6D4EE",
    align: "center", valign: "middle",
  });

  // 오른쪽 - 실제 화면 한 장으로 "무엇을 만들었는지" 바로 보여줍니다
  s.addImage({
    path: path.join(SHOT, "c-analysis.png"),
    x: 6.95, y: 1.55, w: 5.9, h: 3.69, rounding: false, shadow: shadow(),
  });
  s.addText("현황 분석 화면 · 테스트 데이터", {
    x: 6.95, y: 5.34, w: 5.9, h: 0.26, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10, color: "8296BE", align: "center",
  });

  s.addText("관리자 · 품질개선팀 김동률", {
    x: M, y: H - 0.85, w: 6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, color: "7E93BE",
  });
  s.addText("© Jeisys Medical", {
    x: W - M - 3, y: H - 0.85, w: 3, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10, color: "586B92", align: "right",
  });
  s.addNotes("필드 불량 데이터를 다루는 방식을 바꾼 사내 도구입니다. 오늘은 왜 만들었고, 무엇이 달라졌고, 무엇을 더 할 수 있는지 다섯 가지로 말씀드리겠습니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 2. 문제 정의
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "문제 정의", "데이터는 쌓이는데, 읽어낼 수가 없었습니다");

  s.addText("DS팀·GS팀이 팀즈(SharePoint)에 매일 입력합니다. 항목은 충분합니다.\n문제는 그 데이터로 아무것도 알아낼 수 없다는 점이었습니다.", {
    x: M, y: 1.62, w: 9.4, h: 0.72, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, color: SOFT, lineSpacing: 24,
  });

  const items = [
    ["1", "집계가 없다", "모델별 건수도, 많은 원인도 눈으로 세어야 했습니다."],
    ["2", "검색이 안 된다", "병원명·증상·에러코드로 찾을 방법이 없었습니다."],
    ["3", "반복을 놓친다", "같은 원인이 되풀이돼도 숫자로 드러나지 않았습니다."],
  ];
  const cw = 3.82, gap = 0.44;
  items.forEach((it, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.62, cw, 2.72);
    chip(s, x + 0.34, 3.02, it[0]);
    s.addText(it[1], {
      x: x + 0.34, y: 3.6, w: cw - 0.68, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 17, bold: true, color: NAVY,
    });
    s.addText(it[2], {
      x: x + 0.34, y: 4.08, w: cw - 0.68, h: 1.1, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12, color: SOFT, lineSpacing: 21,
    });
  });

  s.addText("결과 — 불량이 쌓이고 있다는 사실은 알지만, 무엇부터 손대야 하는지는 알 수 없었습니다.", {
    x: M, y: 5.72, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13.5, bold: true, color: INK,
  });
  foot(s, "필드이슈 대시보드 · 품질개선팀");
  s.addNotes("데이터가 없어서 생긴 문제가 아닙니다. 입력은 잘 되고 있었고, 그것을 읽어낼 도구가 없었던 것이 문제였습니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 3. 기존 방식의 한계 — 비교
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "기존 방식의 한계", "무엇이 달라졌는가");

  const rows = [
    ["조회", "리스트를 눈으로 훑기", "조건을 고르면 즉시 집계"],
    ["검색", "지원되지 않음", "병원·모델·증상·SAP ID 통합 검색"],
    ["분석", "그래프·자동 집계 없음", "현황·연도·주간·반복 4가지 분석"],
    ["접근", "팀즈를 거쳐야 함", "링크만 열면 PC·모바일 어디서든"],
    ["판단", "사람이 기억에 의존", "반복 불량을 숫자로 자동 감지"],
  ];

  const colX = [M, M + 1.5, M + 6.0];
  const bw = 4.3, aw = 5.9;

  // 머리줄
  s.addText("기존 · 팀즈 대시보드(SharePoint)", {
    x: colX[1] + 0.22, y: 1.66, w: bw, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: SOFT,
  });
  s.addText("신규 · 웹 대시보드", {
    x: colX[2] + 0.28, y: 1.66, w: aw, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: NAVY,
  });

  const rowH = 0.78, gapY = 0.14;
  rows.forEach((r, i) => {
    const y = 2.12 + i * (rowH + gapY);
    s.addText(r[0], {
      x: colX[0], y, w: 1.4, h: rowH, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: INK, valign: "middle",
    });
    card(s, colX[1], y, bw, rowH, "F5F6F9");
    s.addText(r[1], {
      x: colX[1] + 0.22, y, w: bw - 0.44, h: rowH, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12.5, color: SOFT, valign: "middle",
    });
    card(s, colX[2], y, aw, rowH, TINT);
    s.addText(r[2], {
      x: colX[2] + 0.28, y, w: aw - 0.56, h: rowH, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: NAVY, valign: "middle",
    });
  });

  foot(s, "필드이슈 대시보드 · 품질개선팀");
  s.addNotes("데이터 원본은 그대로 팀즈에 둡니다. 바뀐 것은 읽는 방법입니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 4. 해결책
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "해결책", "원본은 그대로 두고, 읽는 창을 새로 만들었습니다");

  shot(s, "c-detail.png", { x: 4.62, y: 1.72, w: 8.16, h: 5.1 });

  const pts = [
    ["실시간 연동", "팀즈에 입력하면 5분마다 저절로 반영됩니다. 새로고침도 필요 없습니다."],
    ["설치 없음", "프로그램을 깔지 않습니다. 회사 계정으로 링크만 열면 됩니다."],
    ["원본 보존", "모든 행에서 팀즈 원본으로 바로 갑니다. 메모도 그대로 봅니다."],
  ];
  pts.forEach((p, i) => {
    const y = 1.84 + i * 1.62;
    chip(s, M, y, String(i + 1));
    s.addText(p[0], {
      x: M + 0.6, y: y + 0.02, w: 3.3, h: 0.36, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 16, bold: true, color: NAVY,
    });
    s.addText(p[1], {
      x: M, y: y + 0.5, w: 3.9, h: 1.05, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: SOFT, lineSpacing: 20,
    });
  });

  foot(s, "화면은 테스트 데이터 기준");
  s.addNotes("가장 중요한 원칙은 원본을 건드리지 않는다는 것입니다. 팀즈가 계속 정본이고, 이 화면은 읽기 위한 창입니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 5. 핵심 기능 — 8개 화면
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "핵심 기능", "하나의 화면에서 여덟 가지로 들여다봅니다");

  const menus = [
    ["상세 데이터", "전체 조회 · 다중 필터 · 통합 검색", NAVY],
    ["현황 분석", "조건별 KPI · 진행현황 · 불량유형", NAVY],
    ["연도별 분석", "연도 + 발생기간별 집계와 추이", NAVY],
    ["주간 분석", "최근 7주 중 한 주만 따로", NAVY],
    ["반복 불량", "같은 모델·원인 반복을 자동 감지", AMBER],
    ["모델별 에러코드", "13개 모델 463건 코드 모음", NAVY],
    ["Master Version", "릴리즈 PDF로 양산 버전 정리", AMBER],
    ["품질 도구", "공차 · 시그마 · 공정능력 판정", AMBER],
  ];

  const cw = 2.87, ch = 1.9, gx = 0.21, gy = 0.24;
  menus.forEach((m, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + col * (cw + gx), y = 1.82 + row * (ch + gy);
    card(s, x, y, cw, ch);
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.28, y: y + 0.28, w: 0.3, h: 0.3, rectRadius: 0.08,
      fill: { color: m[2] }, line: { color: m[2] },
    });
    s.addText(m[0], {
      x: x + 0.28, y: y + 0.72, w: cw - 0.56, h: 0.34, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14.5, bold: true, color: INK,
    });
    s.addText(m[1], {
      x: x + 0.28, y: y + 1.08, w: cw - 0.56, h: 0.66, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11, color: SOFT, lineSpacing: 17,
    });
  });

  s.addText("주황색 표시 세 가지는 조회를 넘어, 사람이 놓치던 것을 찾아내는 기능입니다.", {
    x: M, y: 6.1, w: CW, h: 0.34, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, color: AMBER, bold: true,
  });
  foot(s, "필드이슈 대시보드 · 품질개선팀");
  s.addNotes("앞의 다섯 가지는 보기 위한 화면이고, 뒤의 세 가지는 찾아내기 위한 화면입니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 6. 반복 불량 감지
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "한 걸음 더", "쌓인 일감이 아니라, 지금 봐야 할 신호만");

  shot(s, "c-repeat.png", { x: M, y: 1.74, w: 8.0, h: 3.6 });

  card(s, 8.86, 1.74, 3.85, 3.6);
  s.addText("감지 조건", {
    x: 9.16, y: 2.0, w: 3.25, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: NAVY,
  });
  const conds = [
    "진행중(OPEN)인 건만",
    "발생기간 3·6개월이내만",
    "같은 모델 · 같은 제품군",
    "같은 H/W 원인유형(Lv.2)",
    "2건 이상 겹칠 때",
  ];
  conds.forEach((c, i) => {
    s.addText("·", {
      x: 9.16, y: 2.46 + i * 0.44, w: 0.2, h: 0.3, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: AMBER,
    });
    s.addText(c, {
      x: 9.38, y: 2.46 + i * 0.44, w: 3.05, h: 0.34, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12.5, color: INK,
    });
  });
  s.addText("끝난 건과 오래된 건을 일부러 빼서,\n건수가 아니라 신호가 보이게 했습니다.", {
    x: 9.16, y: 4.66, w: 3.25, h: 0.6, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, color: SOFT, lineSpacing: 18,
  });

  s.addText("원인유형이 비어 있어 판정하지 못한 건수도 함께 보여줍니다. '반복이 없다'와 '아직 안 적었다'는 다른 이야기이기 때문입니다.", {
    x: M, y: 5.62, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, color: SOFT,
  });
  foot(s, "화면은 테스트 데이터 기준");
  s.addNotes("품질개선팀에게 반복 불량은 밀린 일이 아니라, 지금 들여다봐야 한다는 신호입니다. 그 용도에 맞춰 조건을 좁혔습니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 7. 품질 도구
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "한 걸음 더", "계산기가 아니라 판정기입니다");

  shot(s, "c-tools.png", { x: 4.72, y: 1.74, w: 8.0, h: 5.0 });

  const tools = [
    ["편차 · 공차", "규격 안에 드는지, 한계에 얼마나 가까운지"],
    ["공정능력", "Cp · Cpk — 산포 문제인지 치우침인지"],
    ["불량률 · 시그마", "PPM과 시그마 수준, 이 숫자를 믿어도 되는지"],
    ["생산성 UPH", "개선 전후 비교 — 진짜 효율 개선인지"],
  ];
  tools.forEach((t, i) => {
    const y = 1.86 + i * 1.14;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: y + 0.04, w: 0.28, h: 0.28, rectRadius: 0.07,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(t[0], {
      x: M + 0.46, y, w: 3.5, h: 0.34, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK,
    });
    s.addText(t[1], {
      x: M + 0.46, y: y + 0.38, w: 3.42, h: 0.6, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: SOFT, lineSpacing: 18,
    });
  });

  card(s, M, 6.34, 3.88, 0.62, TINT);
  s.addText("값을 넣으면 합격 · 불합격을 말해 줍니다", {
    x: M + 0.24, y: 6.34, w: 3.4, h: 0.62, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: NAVY, valign: "middle",
  });

  foot(s, "화면은 예시 값 기준");
  s.addNotes("숫자만 내주는 계산기는 이미 많습니다. 이 도구는 기준에 맞는지까지 판정해 주고, 한계에 얼마나 가까운지도 함께 보여줍니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 8. Master Version (양산)
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "한 걸음 더", "PDF 한 장이면 전 모델 버전이 정리됩니다");

  shot(s, "c-master.png", { x: M, y: 1.72, w: 7.62, h: 4.76 });

  card(s, 8.46, 1.72, 4.25, 4.76);

  s.addText("올리면 끝나는 과정", {
    x: 8.78, y: 1.98, w: 3.6, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13.5, bold: true, color: NAVY,
  });

  const steps = [
    ["OQC가 배포한 릴리즈 PDF를 그대로 올립니다"],
    ["모델 · 향지 · 버전을 자동으로 읽어 표로 정리합니다"],
    ["SharePoint에 저장돼 모두가 같은 최신본을 봅니다"],
  ];
  steps.forEach((t, i) => {
    const y = 2.52 + i * 1.02;
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.78, y, w: 0.32, h: 0.32, rectRadius: 0.08,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(String(i + 1), {
      x: 8.78, y, w: 0.32, h: 0.32, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12, bold: true, color: WHITE,
      align: "center", valign: "middle",
    });
    s.addText(t[0], {
      x: 9.24, y: y - 0.04, w: 3.16, h: 0.86, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12, color: INK, lineSpacing: 19,
    });
  });

  s.addText("올리는 사람은 담당자 한 명입니다. 여러 명이 올리면 어느 것이 최신인지 알 수 없게 되기 때문입니다.", {
    x: 8.78, y: 5.6, w: 3.62, h: 0.76, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 11, color: SOFT, lineSpacing: 18,
  });

  s.addText("메일에서 PDF를 찾아 열던 일을, 모델명·향지 검색 한 번으로 바꿨습니다. 인식 정확도는 98.3%입니다.", {
    x: M, y: 6.66, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, color: SOFT,
  });

  foot(s, "화면은 실제 릴리즈 PDF 기준");
  s.addNotes("OQC가 메일로 배포하는 릴리즈 PDF를 그대로 올리면 모델별 양산 버전이 정리됩니다. 사람이 옮겨 적지 않습니다. 담당자가 한 번 올리면 팀 전체가 같은 최신본을 봅니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 9. 신뢰 · 보안 원칙
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "신뢰 · 보안 원칙", "권한을 새로 만들지 않았습니다");

  const rules = [
    ["회사 계정만", "@jeisys.com 계정으로만 열립니다. 외부 계정은 안 됩니다.", NAVY],
    ["기존 권한 그대로", "SharePoint에서 볼 수 있는 범위만 보입니다. 새 권한을 주지 않습니다.", NAVY],
    ["수정은 지정된 칸만", "품질개선팀 담당 항목만, 지정된 담당자만 고칩니다.", AMBER],
    ["원본은 팀즈가 정본", "이 화면은 읽는 창입니다. 기준은 언제나 SharePoint 원본입니다.", NAVY],
  ];

  const cw = 2.87, gx = 0.21;
  rules.forEach((r, i) => {
    const x = M + i * (cw + gx);
    card(s, x, 1.9, cw, 3.42);
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.32, y: 2.24, w: 0.36, h: 0.36, rectRadius: 0.09,
      fill: { color: r[2] }, line: { color: r[2] },
    });
    s.addText(r[0], {
      x: x + 0.26, y: 2.8, w: cw - 0.52, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 16, bold: true, color: INK,
    });
    s.addText(r[1], {
      x: x + 0.26, y: 3.3, w: cw - 0.52, h: 1.8, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: SOFT, lineSpacing: 20,
    });
  });

  s.addText("새 데이터베이스도, 새 서버도 만들지 않았습니다. 데이터는 지금 있는 자리에 그대로 있습니다.", {
    x: M, y: 5.72, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13.5, bold: true, color: NAVY,
  });
  foot(s, "필드이슈 대시보드 · 품질개선팀");
  s.addNotes("보안 검토에서 가장 먼저 나오는 질문이 권한입니다. 별도 권한을 만들지 않고 기존 SharePoint 권한을 그대로 따라갑니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 10. 성공 기준 — 큰 숫자
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DEEP };

  s.addText("성공 기준", {
    x: M, y: 0.68, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: "E0A96D", charSpacing: 1.6,
  });
  s.addText("지금 확인된 것", {
    x: M, y: 1.0, w: CW, h: 0.7, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 34, bold: true, color: WHITE,
  });

  const stats = [
    ["8", "개", "분석 화면", "조회부터 판정까지 한 화면에서"],
    ["463", "건", "에러코드 자동 대조", "13개 모델 · 증상에서 자동 추출"],
    ["98.3", "%", "릴리즈 PDF 인식", "OQC 배포본 그대로 자동 정리"],
    ["0", "개", "설치 프로그램", "링크만 열면 어디서든"],
  ];

  const cw = 2.87, gx = 0.21;
  stats.forEach((t, i) => {
    const x = M + i * (cw + gx);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.24, w: cw, h: 3.16, rectRadius: 0.06,
      fill: { color: "1B2E56" }, line: { color: "2D4677", width: 1 },
    });
    s.addText(
      [
        { text: t[0], options: { fontSize: 54, bold: true, color: WHITE, fontFace: F } },
        { text: " " + t[1], options: { fontSize: 18, bold: true, color: "8FA7D4", fontFace: F } },
      ],
      { x: x + 0.3, y: 2.62, w: cw - 0.6, h: 1.0, isTextBox: true, margin: 0 }
    );
    s.addText(t[2], {
      x: x + 0.3, y: 3.76, w: cw - 0.6, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: "DCE6F8",
    });
    s.addText(t[3], {
      x: x + 0.3, y: 4.24, w: cw - 0.6, h: 0.9, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: "8FA7D4", lineSpacing: 18,
    });
  });

  s.addText("팀즈 원본과 실시간으로 이어져 있어, 입력한 내용이 몇 분 안에 그대로 반영됩니다.", {
    x: M, y: 5.78, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13, color: "AFC0DD",
  });
  s.addNotes("숫자는 모두 지금 동작하는 기능 기준입니다. 98.3퍼센트는 OQC 릴리즈 PDF를 실제로 읽혀 원본과 대조한 결과입니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 11. 기술 스택
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  head(s, "기술 구성", "가볍게 만들어, 유지비를 만들지 않았습니다");

  const stack = [
    ["HTML 파일 하나", "빌드 과정도 프레임워크도 없습니다"],
    ["Microsoft 로그인 (MSAL)", "회사 계정 그대로, 별도 계정 없음"],
    ["Microsoft Graph", "SharePoint를 직접 읽고 씁니다"],
    ["PDF.js", "릴리즈 PDF의 표 구조를 읽습니다"],
    ["정적 호스팅", "서버 없이 파일만 올려둡니다"],
  ];

  stack.forEach((t, i) => {
    const y = 1.82 + i * 0.92;
    card(s, M, y, 7.5, 0.76);
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 0.26, y: y + 0.22, w: 0.32, h: 0.32, rectRadius: 0.08,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(t[0], {
      x: M + 0.76, y, w: 2.7, h: 0.76, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13.5, bold: true, color: INK, valign: "middle",
    });
    s.addText(t[1], {
      x: M + 3.5, y, w: 3.82, h: 0.76, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: SOFT, valign: "middle",
    });
  });

  card(s, 8.5, 1.82, 4.21, 4.56, TINT);
  s.addText("이 구성이 의미하는 것", {
    x: 8.82, y: 2.16, w: 3.6, h: 0.34, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 14, bold: true, color: NAVY,
  });
  const meaning = [
    ["서버 운영 없음", "장애 대응·패치 부담이 생기지 않습니다."],
    ["데이터 이중화 없음", "원본을 복사해 두지 않아 어긋날 일이 없습니다."],
    ["인수인계 가능", "파일 하나라 열어보면 전체가 보입니다."],
  ];
  meaning.forEach((m, i) => {
    const y = 2.72 + i * 1.18;
    s.addText(m[0], {
      x: 8.82, y, w: 3.6, h: 0.32, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 13, bold: true, color: INK,
    });
    s.addText(m[1], {
      x: 8.82, y: y + 0.34, w: 3.6, h: 0.66, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 11.5, color: SOFT, lineSpacing: 18,
    });
  });

  foot(s, "필드이슈 대시보드 · 품질개선팀");
  s.addNotes("가볍게 만든 것은 취향이 아니라 유지보수 때문입니다. 담당자가 바뀌어도 파일 하나만 열면 전체를 볼 수 있습니다.");
}

// ══════════════════════════════════════════════════════════════════════
// 12. 마무리
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: DEEP };

  s.addText("정리하면", {
    x: M, y: 0.86, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: "E0A96D", charSpacing: 1.6,
  });
  s.addText("보는 도구를 넘어, 찾아내는 도구로", {
    x: M, y: 1.18, w: 9.5, h: 0.78, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 36, bold: true, color: WHITE,
  });

  const lines = [
    "팀즈에 쌓이던 데이터를 링크 하나로 열리는 분석 화면으로 옮겼습니다",
    "권한과 원본은 그대로 두고, 읽는 방법만 바꿨습니다",
    "반복 불량과 품질 판정까지, 사람이 놓치던 것을 숫자로 드러냅니다",
    "설치도 서버도 없어, 유지비 대신 기능만 남겼습니다",
  ];
  lines.forEach((t, i) => {
    const y = 2.48 + i * 0.78;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: y + 0.04, w: 0.3, h: 0.3, rectRadius: 0.08,
      fill: { color: GREEN }, line: { color: GREEN },
    });
    s.addText("✓", {
      x: M, y: y + 0.04, w: 0.3, h: 0.3, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 12, bold: true, color: WHITE,
      align: "center", valign: "middle",
    });
    s.addText(t, {
      x: M + 0.52, y, w: 11.2, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F, fontSize: 15.5, color: "DCE6F8", valign: "middle",
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 5.92, w: 6.4, h: 0.62, rectRadius: 0.1,
    fill: { color: "1B2E56" }, line: { color: "2D4677", width: 1 },
  });
  s.addText("계속 쓰면서 필요한 기능을 더해 나가겠습니다", {
    x: M + 0.3, y: 5.92, w: 5.9, h: 0.62, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: "C6D4EE", valign: "middle",
  });

  s.addText("문의 · 품질개선팀 김동률", {
    x: W - M - 5, y: 6.02, w: 5, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 12.5, color: "AFC0DD", align: "right",
  });
  s.addText("© Jeisys Medical", {
    x: W - M - 5, y: 6.34, w: 5, h: 0.28, isTextBox: true, margin: 0,
    fontFace: F, fontSize: 10, color: "586B92", align: "right",
  });
  s.addNotes("질문 받겠습니다.");
}

const out = process.argv[2] || "필드이슈 대시보드_소개.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("생성 완료:", out));
