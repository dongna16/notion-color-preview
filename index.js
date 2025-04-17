import { createServer } from "http"

/**
 * 2자리 HEX 코드를 0~1 사이의 알파값으로 변환하는 함수
 * 예시: "FF" → "1.00", "80" → "0.50", "00" → "0.00"
 * @param {string} hex2 - 2자리 HEX 코드 (00~FF)
 * @returns {string} 0~1 사이의 알파값 (소수점 2자리)
 */
function hexToAlpha(hex2) {
  const decimal = parseInt(hex2, 16) // 16진수를 10진수로 변환
  return Math.min(Math.max(decimal / 255, 0), 1).toFixed(2) // 0~1 범위로 정규화
}

/**
 * 투명도를 시각화하기 위한 체커보드 패턴 SVG 생성 함수
 * - 8x8 픽셀 크기의 격자 패턴 생성
 * - 밝은 회색(255,255,255)과 어두운 회색(225,225,225)이 번갈아가며 배치
 * - 체커보드의 투명도는 원본 색상의 불투명도와 반비례
 * 
 * @param {number} width - SVG 전체 너비 (픽셀)
 * @param {number} height - SVG 전체 높이 (픽셀)
 * @param {number} checkerAlpha - 체커보드 패턴의 투명도 (0~1)
 * @returns {string} SVG rect 요소들의 문자열
 */
function generateCheckerPattern(width, height, checkerAlpha) {
  const pattern = []
  const gridSize = 8 // 격자 한 칸의 크기
  const startX = 24 // 체커보드 시작 X 좌표 (우측 절반만 표시)

  for (let y = 0; y < height; y += gridSize) {
    for (let x = startX; x < width; x += gridSize) {
      const isDark = (x + y) % 16 === 0 // 격자 위치에 따라 밝은/어두운 색상 결정
      const base = isDark ? "225,225,225" : "255,255,255"
      pattern.push(
        `<rect x="${x}" y="${y}" width="${gridSize}" height="${gridSize}" fill="rgba(${base}, ${checkerAlpha})" />`
      )
    }
  }
  return pattern.join("\n")
}

const server = createServer((req, res) => {
  const rawUrl = req.url?.split("?")[0] || "/" // URL에서 쿼리스트링 제거

  // 기본 경로 및 favicon 요청 처리
  if (rawUrl === "/" || rawUrl.includes("favicon")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" })
    return res.end("🎨 Notion Color Preview Server is live (SVG only)")
  }

  // URL 파싱 및 정규화
  const cleanedUrl = rawUrl.replace(/\.(svg|png)$/, "") // 파일 확장자 제거
  const path = cleanedUrl.replace(/^\/(flat\/)?/, "") // 시작 슬래시와 flat 경로 제거
  const [rawHex, alphaRaw] = path.split("/") // HEX 코드와 알파값 분리

  // HEX 코드 정규화 (영숫자만 허용)
  const cleanHex = (rawHex || "000000").replace(/[^a-fA-F0-9]/g, "")
  let hex = cleanHex.slice(0, 6)
  let alpha = 1.0

  // 알파값 처리: 
  // 1) 8자리 HEX 코드인 경우 (마지막 2자리가 알파값)
  // 2) URL 경로에 알파값이 있는 경우 (0~100 사이의 퍼센트값)
  if (cleanHex.length === 8) {
    const alphaHex = cleanHex.slice(6, 8)
    alpha = parseFloat(hexToAlpha(alphaHex))
  } else if (alphaRaw) {
    const alphaPct = Math.min(Math.max(parseInt(alphaRaw), 0), 100)
    alpha = (alphaPct / 100).toFixed(2)
  }

  // SVG 이미지 설정
  const width = 48
  const height = 48
  const checkerAlpha = (1 - alpha).toFixed(2) // 색상 투명도의 반대값

  // SVG를 HTML로 래핑하여 페이지 중앙 정렬
  const svg = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/gh/joungkyun/font-d2coding/d2coding.css" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: Pretendard, -apple-system, sans-serif;
        }
        .preview-text {
          margin-top: 1.5rem;
          font-size: 1.125rem;
          font-weight: 400;
          color: #191B24;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rgb-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rgb-container {
          display: flex;
          align-items: center;
          font-family: 'D2Coding';
          font-size: 16px;
          font-weight: 400;
          color:rgba(3, 7, 23, 0.6);
          padding: 2px 8px;
          border-radius: 6px;
          background-color: rgba(41, 59, 255, 0.06);
          border: 1px solid rgba(5, 12, 113, 0.12);
        }
        .copy-button {
          cursor: pointer;
          color: rgba(3, 7, 23, 0.6);
          transition: color 0.2s;
        }
        .copy-button:hover {
          color: rgba(3, 7, 23, 0.8);
        }
        .toast {
          position: fixed;
          left: 50%;
          bottom: -100px;
          transform: translateX(-50%);
          background: #191B24;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(.53, 1.7, .5, .82);
        }
        .toast.show {
          opacity: 1;
          visibility: visible;
          bottom: 48px;
        }
      </style>
    </head>
    <body>
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
        <rect width="${width}" height="${height}" fill="#${hex}" />
        ${generateCheckerPattern(width, height, checkerAlpha)}
      </svg>
      <div class="preview-text">
        #${hex.toLowerCase()} ${Math.round(alpha * 100)}%
        ${alpha < 1 ? `#${hex.toLowerCase()}${Math.round(alpha * 255).toString(16).padStart(2, '0').toLowerCase()}` : ''}
        <div class="rgb-wrapper">
          <div class="rgb-container">
            <span>${alpha < 1 ? `rgba(${parseInt(hex.slice(0,2), 16)}, ${parseInt(hex.slice(2,4), 16)}, ${parseInt(hex.slice(4,6), 16)}, ${alpha})` : `rgb(${parseInt(hex.slice(0,2), 16)}, ${parseInt(hex.slice(2,4), 16)}, ${parseInt(hex.slice(4,6), 16)})`}</span>
          </div>
          <i class="ri-file-copy-line copy-button" onclick="copyToClipboard(this.previousElementSibling.querySelector('span').textContent)"></i>
        </div>
      </div>
      <div class="toast" id="toast">값을 클립보드에 저장했어요</div>
      <script>
        function copyToClipboard(text) {
          navigator.clipboard.writeText(text);
          const toast = document.getElementById('toast');
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2000);
        }
      </script>
    </body>
  </html>
  `

  // 응답 헤더 설정 및 HTML 전송
  // - Content-Type: HTML 문서 지정
  // - Cache-Control: 1년간 캐시 허용
  // - Content-Length: 응답 크기 명시
  res.writeHead(200, {
    "Content-Type": "text/html",
    "Cache-Control": "public, max-age=31536000",
    "Content-Length": Buffer.byteLength(svg),
  })
  res.end(svg)
})

// 3000번 포트에서 서버 시작
server.listen(3000)