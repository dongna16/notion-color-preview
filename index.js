const express = require("express");
const app = express();

app.get("/:hex/:alpha?", (req, res) => {
  const hex = req.params.hex?.toLowerCase() || "000000";
  const alpha = Math.min(Math.max(parseInt(req.params.alpha || "100"), 0), 100);
  const opacity = alpha / 100;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="#${hex}" fill-opacity="${opacity.toFixed(2)}" />
    </svg>
  `.trim();

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

module.exports = app;