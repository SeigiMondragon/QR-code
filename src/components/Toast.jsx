import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  const icons = {
    success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="size-4 text-destructive shrink-0" />,
    info: <Info className="size-4 text-indigo-500 shrink-0" />,
  }

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {icons[type] || icons.success}
      <span className="text-sm font-medium text-foreground">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
