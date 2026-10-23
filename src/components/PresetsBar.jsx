import { PRESET_THEMES } from '@/lib/constants'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PresetsBar({ currentPresetId, onSelectPreset }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Curated Styles
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">Click to apply instant styling</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PRESET_THEMES.map((preset) => {
          const isSelected = currentPresetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={cn(
                'group relative flex flex-col items-start rounded-xl border p-2.5 text-left transition-all hover:border-primary/50 hover:shadow-xs active:scale-98 cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-border/70 bg-background hover:bg-muted/40'
              )}
            >
              <div className="mb-2 flex w-full items-center justify-between">
                <div
                  className="size-6 rounded-md shadow-2xs border border-black/10 flex items-center justify-center text-[10px]"
                  style={{
                    background: preset.previewGradient || preset.dotsColor,
                  }}
                />
                {preset.badge && (
                  <span className="text-[10px] font-medium text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded-full">
                    {preset.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground line-clamp-1">
                {preset.name}
              </span>
              <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {preset.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
