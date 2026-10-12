/* 모델별 화면설계서(.pptx)에서 에러코드 메시지를 뽑아냅니다.
   1단계: 슬라이드 글자와 이미지 목록을 뽑습니다. (OCR은 ocr-images.ps1이 이어서 합니다)

   쓰는 법:
     node tools/codebook/extract-pptx.js "<설계서.pptx>" <작업폴더>

   왜 두 단계인가:
   설계서의 팝업 화면은 그림으로 들어 있어 글자를 그냥 읽을 수 없습니다.
   그래서 글자와 그림을 따로 뽑아 두고, 그림은 OCR로 따로 읽습니다. */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const src = process.argv[2];
const work = process.argv[3] || "codebook-work";
if (!src || !fs.existsSync(src)) {
  console.error("설계서 파일을 찾지 못했습니다: " + src);
  process.exit(1);
}

const unpacked = path.join(work, "unpacked");
fs.mkdirSync(unpacked, { recursive: true });
/* _rels 는 따로 적어 줘야 합니다. 'ppt/slides/*' 만으로는 하위 폴더가 안 잡혀
   슬라이드-이미지 연결 정보를 통째로 놓칩니다. */
execFileSync("unzip", ["-qq", "-o", src,
  "ppt/slides/*.xml", "ppt/slides/_rels/*", "ppt/media/*", "-d", unpacked], { stdio: "inherit" });

const slideDir = path.join(unpacked, "ppt", "slides");
const files = fs.readdirSync(slideDir)
  .filter((f) => /^slide\d+\.xml$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));

/* 문단(<a:p>) 단위로 끊어야 줄 구분이 살아납니다.
   글자 조각(<a:t>)만 이어 붙이면 모든 줄이 한 덩어리가 됩니다. */
function paragraphs(file) {
  const x = fs.readFileSync(path.join(slideDir, file), "utf8");
  return [...x.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)]
    .map((p) =>
      [...p[1].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]).join("")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    )
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const slides = {};
const images = {};
files.forEach((f) => {
  const n = parseInt(f.match(/\d+/), 10);
  slides[n] = paragraphs(f);
  const rel = path.join(slideDir, "_rels", f + ".rels");
  if (fs.existsSync(rel)) {
    const r = fs.readFileSync(rel, "utf8");
    const imgs = [...r.matchAll(/Target="\.\.\/media\/([^"]+)"/g)].map((m) => m[1]);
    if (imgs.length) images[n] = imgs;
  }
});

fs.writeFileSync(path.join(work, "slides.json"), JSON.stringify(slides, null, 1), "utf8");
fs.writeFileSync(path.join(work, "slide-images.json"), JSON.stringify(images, null, 1), "utf8");

const uniq = new Set();
Object.values(images).forEach((v) => v.forEach((f) => uniq.add(f)));
console.log("슬라이드 " + files.length + "장, 이미지 " + uniq.size + "개");
console.log("다음: powershell -File tools/codebook/ocr-images.ps1 " + work);
