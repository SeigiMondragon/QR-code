import { toSVGString, toDataURL } from '@kroszborg/rune'

/**
 * Triggers a browser download for a blob or data URL
 */
function triggerDownload(href, filename) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download QR Code as SVG vector file
 */
export async function downloadSVG(options, filename = 'qr-code.svg') {
  const svg = toSVGString(options)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Download QR Code as PNG raster image with custom scale factor
 */
export async function downloadPNG(options, scale = 4, filename = 'qr-code.png') {
  const dataUrl = await toDataURL(options, {
    format: 'png',
    scale,
  })
  triggerDownload(dataUrl, filename)
}

/**
 * Copy raw SVG string to system clipboard
 */
export async function copySVGToClipboard(options) {
  const svg = toSVGString(options)
  await navigator.clipboard.writeText(svg)
}

/**
 * Copy PNG image blob directly to system clipboard
 */
export async function copyPNGToClipboard(options, scale = 4) {
  const dataUrl = await toDataURL(options, {
    format: 'png',
    scale,
  })
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
  } else {
    // Fallback: copy data URL text if binary clipboard isn't supported
    await navigator.clipboard.writeText(dataUrl)
  }
}

/**
 * Print QR Code nicely
 */
export function printQRCode(svgString, title = 'QR Code') {
  const printWindow = window.open('', '_blank', 'width=600,height=600')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #fff;
            color: #111;
          }
          .qr-wrapper {
            max-width: 320px;
            margin-bottom: 24px;
          }
          svg {
            width: 100%;
            height: auto;
          }
          p {
            font-size: 14px;
            color: #666;
            margin: 0;
            word-break: break-all;
            max-width: 400px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="qr-wrapper">${svgString}</div>
        <p>${title}</p>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
