import { Resvg } from '@resvg/resvg-js'

export default async function handler(req, res) {
  const { color = '' } = req.query
  const [hexRaw, alphaRaw] = color.split('/')
  const hex = hexRaw?.toLowerCase() || ''
  const alpha = Math.max(0, Math.min(parseInt(alphaRaw || '100'), 100))
  const opacity = alpha / 100

  // HEX 유효성 검사
  const isValidHex = /^[0-9a-f]{6}$/.test(hex)
  if (!isValidHex) {
    res.status(400).send('Invalid HEX code')
    return
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
      <defs>
        <pattern id="checker" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#fff"/>
          <rect width="4" height="4" fill="#e1e1e1"/>
          <rect x="4" y="4" width="4" height="4" fill="#e1e1e1"/>
        </pattern>
      </defs>
      <rect width="48" height="48" fill="#${hex}" />
      <rect x="24" width="24" height="48" fill="url(#checker)" fill-opacity="${opacity}" />
    </svg>
  `

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 48 } })
  const png = resvg.render().asPng()

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=31536000')
  res.status(200).send(png)
}
