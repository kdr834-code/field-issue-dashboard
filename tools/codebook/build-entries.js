/* 3단계: 뽑아 둔 글자와 OCR 결과를 합쳐 error_codes.json에 넣을 항목을 만듭니다.

   쓰는 법:
     node tools/codebook/build-entries.js <작업폴더> [--apply "모델명"]

   --apply 없이 돌리면 결과만 보여주고 파일은 건드리지 않습니다. 먼저 그렇게 확인하세요.

   ── 이 스크립트가 다루는 함정 ──────────────────────────────
   ① 슬라이드 머리글의 코드와 팝업 화면에 찍힌 코드가 다른 장이 있습니다.
      DENSITY에서는 5장이 어긋나 있었고, 그래서 N-103 같은 코드가 통째로 빠졌습니다.
      장비가 사용자에게 보여주는 것은 팝업 쪽이므로 양쪽 모두로 찾을 수 있게 합니다.
   ② 한 코드가 여러 슬라이드에 나뉘어 있습니다. (구형/신형, Main/HP/RF 등)
      그냥 이어 붙이면 어느 조건의 조치인지 알 수 없어, 조건 이름을 앞에 붙입니다.
   ③ 같은 이미지가 여러 슬라이드에 재사용됩니다.
      그래서 영문 메시지는 슬라이드가 아니라 그림 속 코드로 묶어야 합니다.
*/
const fs = require("fs");
const path = require("path");

const work = process.argv[2];
const applyIdx = process.argv.indexOf("--apply");
const applyModel = applyIdx > 0 ? process.argv[applyIdx + 1] : null;
if (!work || !fs.existsSync(work)) {
  console.error("작업 폴더를 찾지 못했습니다: " + work);
  process.exit(1);
}

const slides = JSON.parse(fs.readFileSync(path.join(work, "slides.json"), "utf8"));
const images = JSON.parse(fs.readFileSync(path.join(work, "slide-images.json"), "utf8"));
const ocrPath = path.join(work, "ocr.json");
const ocr = fs.existsSync(ocrPath)
  ? JSON.parse(fs.readFileSync(ocrPath, "utf8").replace(/^﻿/, ""))
  : {};
if (!Object.keys(ocr).length) console.warn("※ ocr.json이 없습니다. 팝업 그림 속 코드는 확인하지 못합니다.");

const CODE_RE = /[ENWP]-\d{1,3}/g;
const HEAD = "5. 메시지 상세 내역";      // 메시지 상세 구간을 알아보는 머리글

function clean(s) {
  return String(s || "")
    .replace(/[“”‘’＂"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\.\s*\./g, ".")
    .replace(/^[.\s]+/, "")
    .trim();
}
function dropTrailingNumbers(lines) {
  const out = lines.slice();
  // 슬라이드 끝에 붙는 한두 자리 숫자는 쪽번호 도형입니다
  while (out.length && /^\d{1,2}$/.test(out[out.length - 1])) out.pop();
  return out;
}

// ── 그림 속 코드와 영문 메시지 ─────────────────────────────
const imgCodeOf = {};                   // 파일명 → 코드
const enByCode = new Map();             // 코드 → 영문 메시지들
Object.entries(ocr).forEach(([file, raw]) => {
  const t = String(raw || "").replace(/\s+/g, " ").trim();
  const m = t.match(/^\[\s*([ENWPenwp])\s*-\s*([0-9Oo]{1,3})\s*\]/);
  if (!m) return;
  // OCR이 0을 O로 읽는 일이 잦아 대괄호 안에서만 되돌립니다
  const code = m[1].toUpperCase() + "-" + parseInt(m[2].replace(/[Oo]/g, "0"), 10);
  imgCodeOf[file] = code;
  const body = t.slice(m[0].length)
    .replace(/\bOK\b|\bCANCEL\b/g, " ")          // 버튼 글자는 메시지가 아닙니다
    .replace(/(^|\s)0(\s|$)/g, " ")               // 경고 아이콘이 0으로 읽힙니다
    .replace(/([a-z])O/g, "$1o")                  // shOt → shot
    .replace(/(?!^)\bOf\b/g, "of")
    .replace(/VV/g, "W")                          // LOVV → LOW
    .replace(/\s+/g, " ").trim();
  if (!body) return;
  if (!enByCode.has(code)) enByCode.set(code, []);
  const list = enByCode.get(code);
  if (!list.includes(body)) list.push(body);
});

/* '메시지 상세 내역' 구간에서 쓰인 그림만 코드북 대상으로 봅니다.
   설계서 앞쪽 동작 설명 화면에도 팝업 그림이 섞여 있는데, 거기까지 넣으면
   설명 없는 코드가 딸려 들어옵니다. 대신 그런 코드는 따로 알려 주기만 합니다. */
const msgSlides = Object.keys(slides).map(Number).filter((n) => (slides[n] || [])[0] === HEAD);
const msgImages = new Set(msgSlides.flatMap((n) => images[n] || []));
const allImageCodes = new Set(
  Object.entries(imgCodeOf).filter(([f]) => msgImages.has(f)).map(([, c]) => c)
);
const outsideCodes = [...new Set(
  Object.entries(imgCodeOf).filter(([f]) => !msgImages.has(f)).map(([, c]) => c)
)].filter((c) => !allImageCodes.has(c));

// ── 슬라이드 읽기 ─────────────────────────────────────────
const parsed = [];
Object.keys(slides).map(Number).sort((a, b) => a - b).forEach((n) => {
  const L = slides[n];
  if (!L || L[0] !== HEAD) return;
  const codeLine = L[2] || "";
  const headCodes = codeLine.match(CODE_RE) || [];
  const imgCodes = [...new Set((images[n] || []).map((f) => imgCodeOf[f]).filter(Boolean))];

  /* 머리글 코드가 이 슬라이드 팝업에 없고 다른 코드가 찍혀 있으면 둘 중 하나입니다.

     ① 머리글 코드가 설계서 전체에서 한 번도 팝업에 안 나온다
        → 문서에서만 쓰는 옛 표기로 보고, 두 코드에 같은 내용을 답니다.
          (E-201/N-201 처럼 과거 기록이 옛 표기를 쓸 수 있어 둘 다 찾혀야 합니다)
     ② 머리글 코드가 다른 슬라이드에서 제 팝업을 갖고 있다
        → 이 장의 머리글이 잘못 적힌 것입니다. 팝업 코드만 씁니다.
          (DENSITY 102번: 머리글 N-21인데 내용은 쿨링. N-21은 USB 코드라 맞지 않습니다) */
  let codes = headCodes;
  let fixed = false;
  if (imgCodes.length && headCodes.length && !headCodes.some((c) => imgCodes.includes(c))) {
    const headerIsRealElsewhere = headCodes.some((c) => allImageCodes.has(c));
    codes = headerIsRealElsewhere ? imgCodes : [...new Set([...headCodes, ...imgCodes])];
    fixed = true;
  }
  if (!codes.length) codes = imgCodes;
  if (!codes.length) return;

  const variant = codeLine.replace(CODE_RE, "").replace(/[, ]+/g, " ").trim();
  const sec = {};
  let cur = null;
  const loose = [];
  L.slice(4).forEach((l) => {
    // 대부분 '※ 발생 원인'이지만 '※ 원인'으로 적힌 장도 있습니다
    const m = l.match(/^※\s*(내용|발생\s*원인|원인|해결\s*방법)/);
    if (m) {
      const key = m[1].replace(/\s/g, "");
      cur = key === "원인" ? "발생원인" : key;
      const rest = l.replace(/^※\s*(내용|발생\s*원인|원인|해결\s*방법)\.?/, "").trim();
      sec[cur] = rest ? [rest] : [];
      return;
    }
    if (cur) (sec[cur] = sec[cur] || []).push(l);
    else loose.push(l);
  });

  parsed.push({
    n, codes, headCodes, imgCodes, variant, fixed,
    ko: clean(dropTrailingNumbers(sec["내용"] || []).join(" ")),
    cause: clean(dropTrailingNumbers(sec["발생원인"] || []).join(" ")),
    action: clean(dropTrailingNumbers(sec["해결방법"] || []).join(" ")),
    extra: clean(dropTrailingNumbers(loose).join(" ")),
  });
});

// ── 코드별로 모으기 ───────────────────────────────────────
const byCode = new Map();
parsed.forEach((s) => s.codes.forEach((c) => {
  if (!byCode.has(c)) byCode.set(c, []);
  byCode.get(c).push(s);
}));

function merge(list, key) {
  const seen = new Set(), parts = [];
  list.forEach((s) => {
    const v = s[key];
    if (!v) return;
    const label = s.variant ? "[" + s.variant + "] " : "";
    if (seen.has(label + v)) return;
    seen.add(label + v);
    parts.push({ label, v });
  });
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].label + parts[0].v;
  const labels = new Set(parts.map((p) => p.label));
  if (labels.size === 1 && labels.has("")) return parts.map((p) => p.v).join("\n");
  return parts.map((p) => p.label + p.v).join("\n");
}

/* 팝업에는 찍히는데 글자 설명이 붙은 슬라이드가 없는 코드가 있습니다.
   (DENSITY의 E-103이 그렇습니다 — 팝업 그림은 있는데 설명은 N-103 쪽에만 있음)
   빼 버리면 그 코드로 검색했을 때 아무것도 안 나오므로, 영문 메시지만이라도 남깁니다. */
allImageCodes.forEach((c) => { if (!byCode.has(c)) byCode.set(c, []); });

const PREFIX = { E: 0, W: 1, N: 2, P: 3 };
const entries = [...byCode.entries()].map(([code, list]) => {
  const notes = [];
  list.forEach((s) => {
    if (s.fixed && !s.headCodes.includes(code)) {
      notes.push("설계서 " + s.n + "번 슬라이드 머리글은 " + s.headCodes.join(",") + "이지만 팝업 화면에는 " + code + "로 표시됩니다.");
    }
  });
  const extra = merge(list, "extra");
  return {
    code,
    ko: merge(list, "ko"),
    // 실행할 때마다 순서가 바뀌면 파일이 공연히 들썩이므로 정렬해 고정합니다
    en: (enByCode.get(code) || []).slice().sort().join(" / "),
    cause: merge(list, "cause"),
    action: merge(list, "action"),
    detail: [extra, ...new Set(notes)].filter(Boolean).join("\n"),
  };
}).sort((a, b) => {
  const pa = PREFIX[a.code[0]] ?? 9, pb = PREFIX[b.code[0]] ?? 9;
  if (pa !== pb) return pa - pb;
  return parseInt(a.code.slice(2), 10) - parseInt(b.code.slice(2), 10);
});

fs.writeFileSync(path.join(work, "entries.json"), JSON.stringify(entries, null, 1), "utf8");

console.log("메시지 슬라이드 " + parsed.length + "장 → 코드 " + entries.length + "개");
console.log("영문 채워진 항목: " + entries.filter((e) => e.en).length + "개");
const fixedSlides = parsed.filter((s) => s.fixed);
console.log("\n[머리글과 팝업 코드가 다른 슬라이드] " + fixedSlides.length + "장");
fixedSlides.forEach((s) => console.log("  " + s.n + "번: 머리글 " + s.headCodes.join(",") + " / 팝업 " + s.imgCodes.join(",")));
if (outsideCodes.length) {
  console.log("\n[메시지 목록 밖에서 발견된 코드] " + outsideCodes.join(", "));
  console.log("  설계서 앞쪽 설명 화면에 찍힌 코드입니다. 넣을지는 사람이 판단하세요.");
  outsideCodes.forEach((c) => console.log("  " + c + ": " + (enByCode.get(c) || []).join(" / ")));
}
console.log("\n[내용 비어 있음] " + (entries.filter((e) => !e.ko).map((e) => e.code).join(", ") || "없음"));
console.log("[조치 비어 있음] " + (entries.filter((e) => !e.action).map((e) => e.code).join(", ") || "없음"));

if (!applyModel) {
  console.log("\n파일은 바꾸지 않았습니다. 반영하려면 --apply \"모델명\"을 붙이세요.");
  process.exit(0);
}

// ── error_codes.json 반영 ────────────────────────────────
const TARGET = path.join(__dirname, "..", "..", "error_codes.json");
const book = JSON.parse(fs.readFileSync(TARGET, "utf8"));
const mi = book.findIndex((m) => m.model === applyModel);
if (mi < 0) { console.error("\n모델을 찾지 못했습니다: " + applyModel); process.exit(1); }

const oldMap = new Map(book[mi].entries.map((e) => [e.code, e]));
const FIELDS = ["ko", "en", "cause", "action", "detail"];
const added = [], kept = [];
const merged = entries.map((n) => {
  const o = oldMap.get(n.code);
  if (!o) { added.push(n.code); return n; }
  const out = { code: n.code };
  FIELDS.forEach((f) => {
    // 설계서 쪽이 비어 있으면 기존 값을 지우지 않습니다 (그림으로만 있는 칸이 있습니다)
    if (!(n[f] || "").trim() && (o[f] || "").trim()) { out[f] = o[f]; kept.push(n.code + "." + f); }
    else out[f] = n[f] || "";
  });
  return out;
});
const freshCodes = new Set(entries.map((e) => e.code));
book[mi].entries.filter((e) => !freshCodes.has(e.code)).forEach((e) => merged.push(e));

const before = book[mi].entries.length;
book[mi].entries = merged;
fs.writeFileSync(TARGET, JSON.stringify(book, null, 1), "utf8");
console.log("\n" + applyModel + ": " + before + "개 → " + merged.length + "개 반영");
console.log("새로 추가: " + (added.join(", ") || "없음"));
if (kept.length) console.log("기존값 유지: " + kept.join(", "));
