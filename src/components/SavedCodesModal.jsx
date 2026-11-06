import { useState, useEffect } from 'react'
import {
  X,
  FolderOpen,
  Edit3,
  Trash2,
  Loader2,
  Calendar,
  Sparkles,
  AlertTriangle,
  Archive,
  CheckSquare,
  Square,
} from 'lucide-react'
import { Button } from './ui/button'
import { fetchSavedQRCodes, deleteQRCode } from '@/lib/qr-storage'
import { downloadBatchAsZip } from '@/lib/qr-batch-export'
import { formatDisplayValue } from '@/lib/qr-parser'

export function SavedCodesModal({
  isOpen,
  onClose,
  onLoadCode,
  onToast,
  activeId,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Batch download state
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [batchFormat, setBatchFormat] = useState('png') // 'png' | 'svg'
  const [isExportingBatch, setIsExportingBatch] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    let ignore = false
    if (!isOpen) return

    queueMicrotask(() => {
      if (!ignore) {
        setSelectedIds(new Set())
        setLoading(true)
      }
    })
    fetchSavedQRCodes()
      .then((data) => {
        if (!ignore) setItems(data)
      })
      .catch((err) => {
        console.error(err)
        if (!ignore) onToast?.('Failed to load saved QR codes', 'error')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [isOpen, onToast])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteQRCode(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setConfirmDeleteId(null)
      onToast?.('QR Code deleted', 'info')
    } catch (err) {
      console.error(err)
      onToast?.('Failed to delete QR code', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelect = (item) => {
    onLoadCode(item)
    onClose()
  }

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  const handleBatchDownload = async () => {
    const selectedItems = items.filter((item) => selectedIds.has(item.id))
    if (selectedItems.length === 0) {
      onToast?.('Please select at least one QR code to download', 'info')
      return
    }

    try {
      setIsExportingBatch(true)
      setBatchProgress({ current: 0, total: selectedItems.length })

      await downloadBatchAsZip(selectedItems, batchFormat, (current, total) => {
        setBatchProgress({ current, total })
      })

      onToast?.(`Downloaded ${selectedItems.length} QR codes as ${batchFormat.toUpperCase()} ZIP!`, 'success')
    } catch (err) {
      console.error('Batch export failed:', err)
      onToast?.('Failed to download batch ZIP', 'error')
    } finally {
      setIsExportingBatch(false)
    }
  }

  if (!isOpen) return null

  const isAllSelected = items.length > 0 && selectedIds.size === items.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-border/80 bg-card shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderOpen className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Your Saved QR Codes
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/60">
                  {items.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Select codes to edit or download them in batch as a ZIP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Batch Action Bar (if items exist) */}
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-muted/40 border-b border-border/60 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={toggleSelectAll}
                className="gap-1.5 text-xs text-foreground font-medium cursor-pointer"
              >
                {isAllSelected ? (
                  <CheckSquare className="size-3.5 text-primary" />
                ) : (
                  <Square className="size-3.5 text-muted-foreground" />
                )}
                <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
              </Button>
              {selectedIds.size > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  ({selectedIds.size} of {items.length} selected)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={batchFormat}
                onChange={(e) => setBatchFormat(e.target.value)}
                disabled={isExportingBatch || selectedIds.size === 0}
                aria-label="Batch export format"
                className="h-7 rounded-md border border-border/80 bg-background px-2 text-xs text-foreground shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <option value="png">PNG (1024px)</option>
                <option value="svg">SVG (Vector)</option>
              </select>

              <Button
                type="button"
                size="xs"
                onClick={handleBatchDownload}
                disabled={isExportingBatch || selectedIds.size === 0}
                className="gap-1.5 font-medium cursor-pointer"
              >
                {isExportingBatch ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>
                      {batchProgress.total > 0
                        ? `${batchProgress.current}/${batchProgress.total}`
                        : 'Exporting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Archive className="size-3.5" />
                    <span>
                      Download ZIP {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="size-7 animate-spin text-primary" />
              <span className="text-xs">Fetching your saved QR codes...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 mb-3 text-muted-foreground">
                <Sparkles className="size-6 text-primary/60" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                No saved QR codes yet
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Design a QR code in the studio and click &quot;Save&quot; to keep your styles and logos handy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {items.map((item) => {
                const isCurrent = activeId === item.id
                const isSelected = selectedIds.has(item.id)
                const previewSrc = item.previewUrl || item.values?.logoValue
                const dateStr = item.updatedAt?.toDate
                  ? item.updatedAt.toDate().toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent'

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                        : isCurrent
                        ? 'border-primary/60 bg-muted/30 ring-1 ring-primary/20 shadow-2xs'
                        : 'border-border/70 bg-card hover:border-border hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Checkbox + Preview + Title */}
                      <div className="flex items-start gap-2.5">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(item.id)}
                          className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label={`Select ${item.title}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground/60" />
                          )}
                        </button>

                        {/* Thumbnail */}
                        <div className="relative size-13 shrink-0 rounded-lg border border-border/80 bg-white p-1 shadow-2xs flex items-center justify-center overflow-hidden">
                          {previewSrc ? (
                            <img
                              src={previewSrc}
                              alt={item.title}
                              className="size-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Sparkles className="size-5 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-foreground truncate">
                              {item.title}
                            </h4>
                            {isCurrent && (
                              <span className="shrink-0 text-[10px] bg-primary/15 text-primary px-1.5 py-0.2 rounded-sm font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[11px] text-muted-foreground truncate font-mono mt-0.5"
                            title={item.values?.value || ''}
                          >
                            {formatDisplayValue(item.values?.value)}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-1">
                            <Calendar className="size-3" />
                            <span>{dateStr}</span>
                            {item.values?.logoValue && (
                              <span className="ml-1 text-[9px] bg-muted px-1.5 py-0.2 rounded font-medium">
                                Logo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1.5 w-full justify-end animate-in fade-in">
                          <span className="text-[11px] text-destructive flex items-center gap-1 mr-auto">
                            <AlertTriangle className="size-3" />
                            Delete?
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === item.id}
                            className="text-xs cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="text-xs cursor-pointer"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              'Confirm'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="text-muted-foreground hover:text-destructive text-xs cursor-pointer"
                            title="Delete this QR Code"
                          >
                            <Trash2 className="size-3" />
                          </Button>

                          <Button
                            type="button"
                            variant={isCurrent ? 'outline' : 'default'}
                            size="xs"
                            onClick={() => handleSelect(item)}
                            className="gap-1 text-xs cursor-pointer"
                          >
                            <Edit3 className="size-3" />
                            <span>{isCurrent ? 'Continue Editing' : 'Load & Edit'}</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-border/60 bg-muted/20 flex justify-between items-center text-[11px] text-muted-foreground shrink-0">
          <span>Synced with Firebase Firestore & Cloudinary</span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
