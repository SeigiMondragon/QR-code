import { useState } from 'react'
import { X, CloudUpload, Loader2, BookmarkCheck, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function SaveQRModal({
  isOpen,
  onClose,
  onSave,
  currentId,
  currentTitle,
  values,
  isSaving,
}) {
  const [title, setTitle] = useState(currentTitle || '')

  if (!isOpen) return null

  const handleFormSubmit = (e, forceNew = false) => {
    e.preventDefault()
    onSave({
      title: title.trim() || 'Untitled QR Code',
      isUpdate: Boolean(currentId) && !forceNew,
    })
  }

  const isEditingExisting = Boolean(currentId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CloudUpload className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {isEditingExisting ? 'Update QR Code' : 'Save QR Code'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Persist design and logo to Cloudinary & Firestore
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-title">Name / Label</Label>
            <Input
              id="qr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={values?.value ? `QR for ${values.value.slice(0, 30)}` : 'e.g. My Website'}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Target Content:</span>
              <span className="font-mono text-foreground font-medium truncate max-w-[200px]">
                {values?.value || 'Empty'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Center Logo:</span>
              <span className="text-foreground font-medium">
                {values?.logoValue ? (
                  values.logoValue.startsWith('data:') ? 'Custom file (will upload to Cloudinary)' : 'Attached'
                ) : (
                  'None'
                )}
              </span>
            </div>
            {isEditingExisting && (
              <div className="pt-2 border-t border-border/50 text-[11px] text-primary">
                Currently editing saved code. You can update it or save as a new copy.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            {isEditingExisting && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={(e) => handleFormSubmit(e, true)}
                className="gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Save as New</span>
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="gap-1.5 min-w-[120px] cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="size-4" />
                  <span>{isEditingExisting ? 'Update Existing' : 'Save QR'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
