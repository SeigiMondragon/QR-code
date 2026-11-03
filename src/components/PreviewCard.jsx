import { useState } from 'react'
import {
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Sparkles,
  CloudUpload,
  BookmarkCheck,
} from 'lucide-react'
import QR from './qr/QR'
import { Button } from './ui/button'
import {
  downloadPNG,
  downloadSVG,
  copyPNGToClipboard,
  copySVGToClipboard,
  printQRCode,
  getRuneOptionsFromValues,
} from '@/lib/qr-export'
import { toSVGString } from '@kroszborg/rune'
import { cn } from '@/lib/utils'

export function PreviewCard({
  values,
  onToast,
  onOpenSaveModal,
  currentSavedId,
  currentSavedTitle,
}) {
  const [scale, setScale] = useState(4) // 4x = 1024px
  const [isExporting, setIsExporting] = useState(false)
  const [copiedType, setCopiedType] = useState(null)

  const getRuneOptions = () => getRuneOptionsFromValues(values)

  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true)
      const opts = getRuneOptions()
      await downloadPNG(opts, scale, 'qr-code.png')
      onToast?.('Downloaded PNG successfully!', 'success')
    } catch (err) {
      console.error(err)
      onToast?.('Failed to download PNG', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadSVG = async () => {
    try {
      setIsExporting(true)
      const opts = getRuneOptions()
      await downloadSVG(opts, 'qr-code.svg')
      onToast?.('Downloaded SVG vector successfully!', 'success')
    } catch (err) {
      console.error(err)
      onToast?.('Failed to download SVG', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyImage = async () => {
    try {
      setCopiedType('image')
      const opts = getRuneOptions()
      await copyPNGToClipboard(opts, scale)
      onToast?.('QR Image copied to clipboard!', 'success')
      setTimeout(() => setCopiedType(null), 2000)
    } catch (err) {
      console.error(err)
      onToast?.('Could not copy image (browser permission)', 'error')
      setCopiedType(null)
    }
  }

  const handleCopySVG = async () => {
    try {
      setCopiedType('svg')
      const opts = getRuneOptions()
      await copySVGToClipboard(opts)
      onToast?.('SVG markup copied to clipboard!', 'success')
      setTimeout(() => setCopiedType(null), 2000)
    } catch (err) {
      console.error(err)
      onToast?.('Failed to copy SVG', 'error')
      setCopiedType(null)
    }
  }

  const handlePrint = () => {
    try {
      const opts = getRuneOptions()
      const svg = toSVGString(opts)
      printQRCode(svg, values.value)
    } catch (err) {
      console.error(err)
      onToast?.('Could not open print window', 'error')
    }
  }

  const isUrl = values.value?.startsWith('http://') || values.value?.startsWith('https://')
  const isTransparent = values.backgroundColor === 'transparent'

  return (
    <aside className="sticky top-20 flex flex-col gap-4">
      {/* Live Preview Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col items-center">
        {/* Card Header */}
        <div className="flex w-full items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-foreground">Live Preview</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            <ShieldCheck className="size-3 text-emerald-500" />
            ECL: {values.logoValue && (values.ecl === 'L' || values.ecl === 'M') ? 'H' : values.ecl}
          </span>
        </div>

        {/* The QR Code Stage */}
        <div className="my-6 relative flex w-full items-center justify-center">
          <div
            className={cn(
              'relative flex aspect-square w-full max-w-[280px] sm:max-w-[300px] items-center justify-center rounded-2xl border border-border/80 p-5 shadow-sm transition-all',
              isTransparent
                ? 'bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]'
                : 'bg-white'
            )}
          >
            {values.value?.trim() ? (
              <QR {...values} className="size-full max-h-full max-w-full drop-shadow-2xs" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-xs text-muted-foreground p-6">
                <Sparkles className="size-6 text-muted-foreground/50 mb-2" />
                <span>Enter content to generate your QR code</span>
              </div>
            )}
          </div>
        </div>

        {/* Content details & quick link test */}
        <div className="w-full rounded-xl bg-muted/40 p-3 text-left border border-border/60">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span className="font-medium">Decoded Content</span>
            <span className="font-mono">{values.value?.length || 0} characters</span>
          </div>
          <p className="font-mono text-xs text-foreground/90 break-all line-clamp-2">
            {values.value || 'None'}
          </p>
          {isUrl && (
            <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
              <a
                href={values.value}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <span>Test open link</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>

        {/* Persistence & Export Section */}
        <div className="mt-5 w-full space-y-3 pt-4 border-t border-border/60">
          {/* Cloud Save / Update Button */}
          <Button
            type="button"
            onClick={onOpenSaveModal}
            disabled={!values.value}
            className="w-full h-10 gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium shadow-xs cursor-pointer"
          >
            {currentSavedId ? (
              <>
                <BookmarkCheck className="size-4" />
                <span>Update Saved QR ({currentSavedTitle || 'Design'})</span>
              </>
            ) : (
              <>
                <CloudUpload className="size-4" />
                <span>Save QR Code to Cloud</span>
              </>
            )}
          </Button>

          {/* Resolution Selector & Primary Download */}
          <div className="flex items-center gap-2">
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              aria-label="Resolution"
              className="flex h-10 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
            >
              <option value={2}>512px (Web)</option>
              <option value={4}>1024px (High-Res)</option>
              <option value={8}>2048px (Ultra Print)</option>
            </select>

            <Button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isExporting || !values.value}
              className="flex-1 h-10 gap-2 cursor-pointer"
            >
              <Download className="size-4" />
              <span>Download PNG</span>
            </Button>
          </div>

          {/* Secondary Action Grid */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSVG}
              disabled={isExporting || !values.value}
              className="h-9 gap-1.5 text-xs cursor-pointer"
              title="Download scalable SVG vector"
            >
              <FileCode className="size-3.5" />
              <span>SVG</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyImage}
              disabled={isExporting || !values.value}
              className="h-9 gap-1.5 text-xs cursor-pointer"
              title="Copy PNG image to clipboard"
            >
              {copiedType === 'image' ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isExporting || !values.value}
              className="h-9 gap-1.5 text-xs cursor-pointer"
              title="Print QR code"
            >
              <Printer className="size-3.5" />
              <span>Print</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopySVG}
            disabled={isExporting || !values.value}
            className="w-full text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
          >
            {copiedType === 'svg' ? 'SVG markup copied!' : 'Copy raw SVG markup'}
          </Button>
        </div>
      </div>
    </aside>
  )
}
