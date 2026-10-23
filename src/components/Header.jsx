import { useState, useEffect } from 'react'
import { QrCode, Sun, Moon, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from './ui/button'

export function Header({ onReset }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qr-theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('qr-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-foreground to-foreground/80 text-background shadow-xs">
            <QrCode className="size-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-foreground">
                QR Craft
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-2.5 text-indigo-500" />
                Studio
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Professional vector & raster QR code generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
            title="Reset to default settings"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline text-xs">Reset</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            className="size-8 rounded-lg"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-foreground/80" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
