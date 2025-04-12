import { createServer } from "http"
import { Resvg } from "@resvg/resvg-js"

function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16)
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2)
}

const server = createServer(async (req, res) => {
  const rawUrl = req.url?.split("?")[0] || "/"

  if (rawUrl === "/" || rawUrl.includes("favicon")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" })
    return res.end("🎨 Notion Color Preview Server is live")
  }

  // 🔄 .png 확장자 제거
  const cleanedUrl = rawUrl.replace(/\.png$/, "")
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
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
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
</svg>
`

  try {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    const png = resvg.render().asPng()

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
      "Content-Length": png.length,
    })
    res.end(png)
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" })
    res.end("⚠️ SVG to PNG rendering error:\n" + e.message)
  }
})

server.listen(3000)
