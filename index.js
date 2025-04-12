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

  let checkerRects = "";
  for (let y = 0; y < 40; y += 8) {
    for (let x = 20; x < 40; x += 8) {
      const isDark = (x + y) % 16 === 0;
      const color = isDark ? "#bbb" : "#ddd";
      checkerRects += `<rect x="${x}" y="${y}" width="8" height="8" fill="${color}" />\n`;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <!-- 오른쪽: 체커보드 배경 -->
      ${checkerRects.trim()}
      <!-- 왼쪽: 색상 블록 (투명도 포함) -->
      <rect x="0" y="0" width="20" height="40" fill="#${hex}" fill-opacity="${opacity}" />
    </svg>
  `.trim();

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg)
  });
  res.end(svg);
});
