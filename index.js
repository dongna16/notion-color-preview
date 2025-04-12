import { createServer } from "http"

function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16)
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2)
}

const server = createServer((req, res) => {
  const rawUrl = req.url?.split("?")[0] || "/"

  if (rawUrl === "/" || rawUrl.includes("favicon")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" })
    return res.end("🎨 Notion Color Preview Server is live (SVG only)")
  }

  // .svg/.png 확장자 제거
  const cleanedUrl = rawUrl.replace(/\.(svg|png)$/, "")
  const path = cleanedUrl.replace(/^\/(flat\/)?/, "")
  const [rawHex, alphaRaw] = path.split("/")

  const cleanHex = (rawHex || "000000").replace(/[^a-fA-F0-9]/g, "")
  let hex = cleanHex.slice(0, 6)
  let alpha = 1.0

  if (cleanHex.length === 8) {
    hex = cleanHex.slice(0, 6)
    const alphaHex = cleanHex.slice(6, 8)
    alpha = parseFloat(hexToAlpha(alphaHex))
  } else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100)
    alpha = (alphaPct / 100).toFixed(2)
  }

  const width = 48
  const height = 48
  const checkerAlpha = (1 - alpha).toFixed(2)

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
    <g transform="translate(0,0)">
      <rect width="${width}" height="${height}" fill="#${hex}" />
      ${(() => {
        let pattern = ""
        for (let y = 0; y < height; y += 8) {
          for (let x = 24; x < width; x += 8) {
            const isDark = (x + y) % 16 === 0
            const base = isDark ? "225,225,225" : "255,255,255"
            pattern += `<rect x="${x}" y="${y}" width="8" height="8" fill="rgba(${base}, ${checkerAlpha})" />\n`
          }
        }
        return pattern
      })()}
    </g>
  </svg>
  `

  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg),
  })
  res.end(svg)
})

server.listen(3000)
