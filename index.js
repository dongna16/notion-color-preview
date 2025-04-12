const { createServer } = require("http");

module.exports = createServer((req, res) => {
  const url = req.url?.slice(1); // Remove leading slash
  const [hexRaw, alphaRaw] = url.split("/");

  const hex = (hexRaw || "000000").replace(/[^a-fA-F0-9]/g, "").slice(0, 6);
  const alpha = Math.max(0, Math.min(parseInt(alphaRaw || "100", 10), 100));
  const opacity = (alpha / 100).toFixed(2);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="#${hex}" fill-opacity="${opacity}" />
    </svg>
  `.trim();

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/svg+xml");
  res.end(svg);
});
