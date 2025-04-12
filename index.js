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

  // 🎯 8자리 HEX (RRGGBBAA)
  if (cleanHex.length === 8) {
    hex = cleanHex.slice(0, 6);
    const alphaHex = cleanHex.slice(6, 8);
    opacity = hexToAlpha(alphaHex);
  }

  // 🎯 /[alpha] (%)
  else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100);
    opacity = (alphaPct / 100).toFixed(2);
  }

  // 🧱 체커보드 + 색상 사각형 SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <defs>
        <pattern id="checker" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#ddd"/>
          <rect width="4" height="4" fill="#bbb"/>
          <rect x="4" y="4" width="4" height="4" fill="#bbb"/>
        </pattern>
      </defs>
      <!-- 🔲 배경: 체크 패턴 -->
      <rect width="40" height="40" fill="url(#checker)" />
      <!-- 🎨 위에 색상 레이어 -->
      <rect width="40" height="40" fill="#${hex}" fill-opacity="${opacity}" />
    </svg>
  `.trim();

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg)
  });
  res.end(svg);
});
