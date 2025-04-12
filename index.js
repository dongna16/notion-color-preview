const { createServer } = require("http");

module.exports = createServer((req, res) => {
  const path = req.url?.split("?")[0]?.slice(1) || "";
  const [hexRaw, alphaRaw] = path.split("/");

  // HEX 클렌징: 6자리 알파벳+숫자만 남기기
  const hex = (hexRaw || "000000").replace(/[^a-fA-F0-9]/g, "").slice(0, 6);
  const alpha = Math.max(0, Math.min(parseInt(alphaRaw || "100", 10), 100));
  const opacity = (alpha / 100).toFixed(2);

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
