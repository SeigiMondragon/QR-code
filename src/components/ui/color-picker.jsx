import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function ColorPickerInput({
  value = '#000000',
  onChange,
  className,
  swatches = [],
  id,
}) {
  const inputRef = useRef(null)

  const handleHexChange = (e) => {
    let hex = e.target.value
    if (!hex.startsWith('#')) hex = '#' + hex
    onChange?.(hex)
  }

  const isTransparent = value === 'transparent'

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-10 shrink-0 rounded-lg border border-border/80 shadow-xs transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden cursor-pointer"
          aria-label="Choose color"
        >
          {isTransparent ? (
            <div className="size-full bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0] flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
              None
            </div>
          ) : (
            <div
              className="size-full"
              style={{ backgroundColor: value }}
            />
          )}
          <input
            ref={inputRef}
            id={id}
            type="color"
            value={isTransparent ? '#ffffff' : value}
            onChange={(e) => onChange?.(e.target.value)}
            className="absolute inset-0 opacity-0 pointer-events-none"
            tabIndex={-1}
          />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={handleHexChange}
            placeholder="#000000"
            className="flex h-10 w-full font-mono uppercase rounded-lg border border-border/80 bg-background px-3 py-2 text-xs text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {swatches.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {swatches.map((color) => {
            const isSelected = value?.toLowerCase() === color?.toLowerCase()
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange?.(color)}
                style={{ backgroundColor: color }}
                className={cn(
                  'size-5 rounded-full border border-black/10 shadow-2xs transition-transform hover:scale-115 active:scale-95 cursor-pointer',
                  isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                )}
                aria-label={`Select color ${color}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
