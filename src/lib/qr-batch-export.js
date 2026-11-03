import JSZip from 'jszip'
import { toSVGString, toDataURL } from '@kroszborg/rune'
import { getRuneOptionsFromValues } from './qr-export'

/**
 * Sanitize a string into a safe file basename.
 */
function sanitizeFilename(name, fallback = 'qr-code') {
  const safe = (name || '')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
  return safe || fallback
}

/**
 * Batch renders an array of QR code items and downloads them as a single .zip archive.
 *
 * @param {Array<Object>} items - Array of saved QR records { id, title, values }
 * @param {'png' | 'svg'} [format='png'] - Export format
 * @param {(current: number, total: number) => void} [onProgress] - Optional progress callback
 * @returns {Promise<void>}
 */
export async function downloadBatchAsZip(items, format = 'png', onProgress) {
  if (!items || items.length === 0) return

  const zip = new JSZip()
  const usedNames = new Map()

  const total = items.length
  for (let i = 0; i < total; i++) {
    const item = items[i]
    if (onProgress) {
      onProgress(i + 1, total)
    }

    const baseName = sanitizeFilename(item.title, `qr-${i + 1}`)
    const count = usedNames.get(baseName) || 0
    usedNames.set(baseName, count + 1)
    const fileName = count > 0 ? `${baseName}-${count}` : baseName

    const options = getRuneOptionsFromValues(item.values || {})

    if (format === 'svg') {
      const svgString = toSVGString(options)
      zip.file(`${fileName}.svg`, svgString)
    } else {
      // PNG export (1024px high res)
      const dataUrl = await toDataURL(options, {
        format: 'png',
        scale: 4,
      })
      const base64Content = dataUrl.split(',')[1]
      zip.file(`${fileName}.png`, base64Content, { base64: true })
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const downloadUrl = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `qr-codes-batch-${format}-${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000)
}
