const { createServer } = require("http");

// 🔢 hex의 마지막 두 자리 (알파) → 0.00 ~ 1.00
function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16);
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2);
}

module.exports = createServer((req, res) => {
  const url = req.url?.split("?")[0] || "/";
  if (url === "/" || url.includes("favicon")) {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  return res.end("🎨 Notion Color Preview Server is live");
}

  const path = url.replace(/^\/(flat\/)?/, "");
  const [rawHex, alphaRaw] = path.split("/");
  const cleanHex = (rawHex || "000000").replace(/[^a-fA-F0-9]/g, "");
  let hex = cleanHex.slice(0, 6);
  let alpha = 1.0;

  // 🎯 alpha는 0.00 ~ 1.00 사이의 string (소수점 2자리)
  if (cleanHex.length === 8) {
    hex = cleanHex.slice(0, 6);
    const alphaHex = cleanHex.slice(6, 8);
    alpha = parseFloat(hexToAlpha(alphaHex));
  } else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100);
    alpha = (alphaPct / 100).toFixed(2);
  }

  const width = 48;
  const height = 48;
  const checkerOpacity = (1 - alpha).toFixed(2); // 체커보드 투명도

  // 🎨 1. 배경: 전체 색상 블록 (불투명)
  let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#${hex}" />
`;

  // 🔲 2. 오른쪽 반쪽 위에만 체커보드를 그린다
  for (let y = 0; y < height; y += 8) {
    for (let x = 24; x < width; x += 8) {
      const isDark = (x + y) % 16 === 0;
      const color = isDark ? "#e1e1e1" : "#ffffff"; // ✔️ 체커 색상 (어두운/밝은)
      svg += `<rect x="${x}" y="${y}" width="8" height="8" fill="${color}" fill-opacity="${checkerOpacity}" />\n`;
    }
  }

  // ✅ 마무리
  svg += `</svg>`;

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg),
  });
  res.end(svg);
});
