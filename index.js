const { createServer } = require("http");

function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16);
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2);
}

module.exports = createServer((req, res) => {
  const path = req.url?.split("?")[0]?.slice(1) || "";
  const [rawHex, alphaRaw] = path.split("/");

  const cleanHex = (rawHex || "000000").replace(/[^a-fA-F0-9]/g, "");
  let hex = cleanHex.slice(0, 6);
  let opacity = "1.0";

  if (cleanHex.length === 8) {
    hex = cleanHex.slice(0, 6);
    const alphaHex = cleanHex.slice(6, 8);
    opacity = hexToAlpha(alphaHex);
  } else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100);
    opacity = (alphaPct / 100).toFixed(2);
  }

  const width = 48;
  const height = 48;

  // ✅ 체커보드를 오른쪽 24px에만 그림 (x = 24~48)
  let checkerRects = "";
  for (let y = 0; y < height; y += 8) {
    for (let x = 24; x < width; x += 8) {
      const isDark = (x + y) % 16 === 0;
      const color = isDark ? "#e1e1e1" : "#fff";
      checkerRects += `<rect x="${x}" y="${y}" width="8" height="8" fill="${color}" />\n`;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
      <!-- 오른쪽 체커보드 (3칸 × 6행) -->
      ${checkerRects.trim()}
      <!-- 전체 색상 레이어 (불투명도 포함) -->
      <rect width="48" height="48" fill="#${hex}" fill-opacity="${opacity}" />
    </svg>
  `.trim();

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg)
  });
  res.end(svg);
});
