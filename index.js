const { createServer } = require("http");

function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16);
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2);
}

module.exports = createServer((req, res) => {
  const path = req.url?.split("?")[0]?.slice(1) || "";
  const [rawHex, alphaRaw] = path.split("/");

  const cleanHex = (rawHex || "000000").replace(/[^a-fA-F0-9]/g, "");

  let hex = cleanHex.slice(0, 6);         // RRGGBB
  let opacity = "1.0";                    // 기본값: 불투명

  // 🎯 case 1: 8자리 HEX (RRGGBBAA)
  if (cleanHex.length === 8) {
    hex = cleanHex.slice(0, 6);
    const alphaHex = cleanHex.slice(6, 8);
    opacity = hexToAlpha(alphaHex);
  }

  // 🎯 case 2: URL에 투명도 퍼센트 전달
  else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100);
    opacity = (alphaPct / 100).toFixed(2);
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
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
