import { useRef } from 'react'
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  ArrowRightLeft,
  Upload,
  X,
  Info,
} from 'lucide-react'
import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  COLOR_SWATCHES,
  BG_SWATCHES,
  BUILTIN_LOGOS,
  ECL_LEVELS,
} from '@/lib/constants'
import { Label } from './ui/label'
import { ColorPickerInput } from './ui/color-picker'
import { cn } from '@/lib/utils'

export function StyleCustomizer({
  values,
  onChange,
  activeSection,
  onSectionChange,
}) {
  const fileInputRef = useRef(null)

  const handleUpdate = (key, val) => {
    onChange({ [key]: val })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, SVG, JPG, etc.)')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUri = event.target.result
      onChange({
        logoValue: dataUri,
        // When user adds a logo, recommend High ECL so it stays scannable
        ecl: 'H',
      })
    }
    reader.readAsDataURL(file)
  }

  const swapGradientColors = () => {
    onChange({
      gradientColor1: values.gradientColor2,
      gradientColor2: values.gradientColor1,
    })
  }

  const sections = [
    { id: 'pattern', label: 'Pattern & Shapes', icon: Shapes },
    { id: 'color', label: 'Colors & Gradient', icon: Palette },
    { id: 'logo', label: 'Logo & Branding', icon: ImageIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Navigation tabs for style categories */}
      <div className="flex border-b border-border/70 gap-2">
        {sections.map((sec) => {
          const Icon = sec.icon
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSectionChange(sec.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              <span>{sec.label}</span>
            </button>
          )
        })}
      </div>

      {/* SECTION 1: Pattern & Shapes */}
      {activeSection === 'pattern' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Dot Style */}
          <div className="space-y-3">
            <Label>Module / Dot Style</Label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {DOT_STYLES.map((style) => {
                const isSelected = values.dotsStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleUpdate('dotsStyle', style.id)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20 shadow-xs font-semibold'
                        : 'border-border/70 bg-background text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <span className="text-xs">{style.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Corner Squares & Inner Dots */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>Corner Outer Square</Label>
              <div className="grid grid-cols-2 gap-2">
                {CORNER_SQUARE_STYLES.map((sq) => {
                  const isSelected = values.squareStyle === sq.id
                  return (
                    <button
                      key={sq.id}
                      type="button"
                      onClick={() => handleUpdate('squareStyle', sq.id)}
                      className={cn(
                        'flex items-center justify-center rounded-xl border py-2 px-2.5 text-xs transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20 font-semibold shadow-xs'
                          : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      {sq.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Corner Inner Dot</Label>
              <div className="grid grid-cols-3 gap-2">
                {CORNER_DOT_STYLES.map((dot) => {
                  const isSelected = values.cornerDotStyle === dot.id
                  return (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => handleUpdate('cornerDotStyle', dot.id)}
                      className={cn(
                        'flex items-center justify-center rounded-xl border py-2 px-2.5 text-xs transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20 font-semibold shadow-xs'
                          : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      {dot.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Margin / Quiet Zone Slider */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin-slider">Quiet Zone / Margin</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {values.margin ?? 2} modules
              </span>
            </div>
            <input
              id="margin-slider"
              type="range"
              min="0"
              max="6"
              step="1"
              value={values.margin ?? 2}
              onChange={(e) => handleUpdate('margin', Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground">
              A margin provides padding around the QR code so scanners recognize it quickly against busy backgrounds.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: Colors & Gradient */}
      {activeSection === 'color' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Fill Type Switch */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => handleUpdate('useGradient', false)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer',
                !values.useGradient
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Solid Color
            </button>
            <button
              type="button"
              onClick={() => handleUpdate('useGradient', true)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer',
                values.useGradient
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Gradient Fill
            </button>
          </div>

          {!values.useGradient ? (
            /* Solid Colors */
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>QR Code Modules Color</Label>
                <ColorPickerInput
                  value={values.dotsColor}
                  onChange={(val) => handleUpdate('dotsColor', val)}
                  swatches={COLOR_SWATCHES}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Background Color</Label>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(
                        'backgroundColor',
                        values.backgroundColor === 'transparent' ? '#ffffff' : 'transparent'
                      )
                    }
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    {values.backgroundColor === 'transparent' ? 'Use Solid' : 'Transparent'}
                  </button>
                </div>
                <ColorPickerInput
                  value={values.backgroundColor}
                  onChange={(val) => handleUpdate('backgroundColor', val)}
                  swatches={BG_SWATCHES}
                />
              </div>
            </div>
          ) : (
            /* Gradient Controls */
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gradient Start Color</Label>
                  <ColorPickerInput
                    value={values.gradientColor1}
                    onChange={(val) => handleUpdate('gradientColor1', val)}
                    swatches={COLOR_SWATCHES}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gradient End Color</Label>
                    <button
                      type="button"
                      onClick={swapGradientColors}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                      title="Swap gradient colors"
                    >
                      <ArrowRightLeft className="size-3" />
                      Swap
                    </button>
                  </div>
                  <ColorPickerInput
                    value={values.gradientColor2}
                    onChange={(val) => handleUpdate('gradientColor2', val)}
                    swatches={COLOR_SWATCHES}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gradient-type">Gradient Style</Label>
                  <select
                    id="gradient-type"
                    value={values.gradientType}
                    onChange={(e) => handleUpdate('gradientType', e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
                  >
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>

                {values.gradientType === 'linear' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rotation-slider">Linear Angle</Label>
                      <span className="text-xs font-mono text-muted-foreground">
                        {values.gradientRotation}°
                      </span>
                    </div>
                    <input
                      id="rotation-slider"
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={values.gradientRotation}
                      onChange={(e) => handleUpdate('gradientRotation', Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label>Background Canvas Color</Label>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(
                        'backgroundColor',
                        values.backgroundColor === 'transparent' ? '#ffffff' : 'transparent'
                      )
                    }
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    {values.backgroundColor === 'transparent' ? 'Use Solid' : 'Transparent'}
                  </button>
                </div>
                <ColorPickerInput
                  value={values.backgroundColor}
                  onChange={(val) => handleUpdate('backgroundColor', val)}
                  swatches={BG_SWATCHES}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Logo & Branding */}
      {activeSection === 'logo' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Logo Upload & Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Center Logo</Label>
              {values.logoValue && (
                <button
                  type="button"
                  onClick={() => handleUpdate('logoValue', '')}
                  className="inline-flex items-center gap-1 text-[11px] text-destructive hover:underline cursor-pointer"
                >
                  <X className="size-3" />
                  Remove Logo
                </button>
              )}
            </div>

            {/* Drag & Drop / File Browser Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-muted/20 p-5 text-center transition-all hover:border-primary/60 hover:bg-muted/40 cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {values.logoValue ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-12 rounded-lg border border-border/80 bg-background p-1.5 shadow-xs flex items-center justify-center overflow-hidden">
                    <img
                      src={values.logoValue}
                      alt="Logo preview"
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-foreground">
                      Custom logo active
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Click to choose a different image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground">
                      Upload your logo or icon
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      PNG, SVG, or JPG (max 2MB recommended)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Built-in Brand Icons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">
                Or select a preset icon:
              </span>
              <div className="flex flex-wrap gap-2">
                {BUILTIN_LOGOS.map((logo) => {
                  const isSelected = values.logoValue === logo.uri
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          logoValue: isSelected ? '' : logo.uri,
                          ecl: isSelected ? values.ecl : 'H',
                        })
                      }}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                          : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      <img src={logo.uri} alt="" className="size-3.5 object-contain" />
                      <span>{logo.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Logo Size and Shape Settings (only relevant if logo is selected) */}
          {values.logoValue && (
            <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="logo-size-slider">Logo Size</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(values.logoSize * 100)}%
                  </span>
                </div>
                <input
                  id="logo-size-slider"
                  type="range"
                  min="0.10"
                  max="0.32"
                  step="0.01"
                  value={values.logoSize}
                  onChange={(e) => handleUpdate('logoSize', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo Container Shape</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['circle', 'square'].map((shape) => {
                    const isSelected = values.logoShape === shape
                    return (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => handleUpdate('logoShape', shape)}
                        className={cn(
                          'rounded-lg border py-2 text-xs font-medium capitalize transition-all cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                            : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        )}
                      >
                        {shape}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Error Correction Level */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <Label>Error Correction Level (ECL)</Label>
              {values.logoValue && values.ecl !== 'H' && (
                <span className="text-[11px] text-amber-500 font-medium">
                  High recommended with logo
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ECL_LEVELS.map((lvl) => {
                const isSelected = values.ecl === lvl.id
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleUpdate('ecl', lvl.id)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20 shadow-xs font-semibold'
                        : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <span className="text-xs">{lvl.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="size-3.5 shrink-0 text-muted-foreground" />
              Higher error correction allows codes to be scanned even when covered by logos or partially damaged.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
