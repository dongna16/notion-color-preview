const { createServer } = require("http");

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
  const checkerAlpha = (1 - alpha).toFixed(2);

  let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 48 48" shape-rendering="crispEdges">
  <rect width="${width}" height="${height}" fill="#${hex}" />
`;

  for (let y = 0; y < height; y += 8) {
    for (let x = 24; x < width; x += 8) {
      const isDark = (x + y) % 16 === 0;
      const baseColor = isDark ? "225,225,225" : "255,255,255"; // #e1e1e1 or #fff
      svg += `<rect x="${x}" y="${y}" width="8" height="8" fill="rgba(${baseColor}, ${checkerAlpha})" />\n`;
    }
  }

  svg += `</svg>`;

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg),
  });
  res.end(svg);
});
