const http = require("http");
const fs = require("fs");
const path = require("path");

// 절대 경로로 고정합니다. 상대 경로 그대로 두면 아래 경로 탈출 검사가
// Windows 구분자(\) 때문에 어긋나, 중첩 폴더를 루트로 주면 정상 요청까지 막혔습니다.
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

http
  .createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split("?")[0]);
    } catch {
      // 잘못 인코딩된 주소 하나에 서버가 통째로 죽지 않게 막습니다.
      // 한글 경로를 퍼센트 인코딩 없이 요청하면 실제로 발생했습니다.
      res.writeHead(400).end("bad request");
      return;
    }
    const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const filePath = path.resolve(root, rel);
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
