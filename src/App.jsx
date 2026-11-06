import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { PresetsBar } from './components/PresetsBar'
import { ContentTypeTabs } from './components/ContentTypeTabs'
import { StyleCustomizer } from './components/StyleCustomizer'
import { PreviewCard } from './components/PreviewCard'
import { Toast } from './components/Toast'
import { SaveQRModal } from './components/SaveQRModal'
import { SavedCodesModal } from './components/SavedCodesModal'
import { saveQRCode, updateQRCode } from './lib/qr-storage'
import { getRuneOptionsFromValues, generateQRCodeDataURL } from './lib/qr-export'
import { cleanWrappingQuotes } from './lib/qr-parser'
import { Sparkles, SlidersHorizontal } from 'lucide-react'

const defaultValues = {
  value: 'https://example.com',
  contentType: 'url',
  dotsStyle: 'rounded',
  dotsColor: '#090d16',
  backgroundColor: '#ffffff',
  useGradient: false,
  gradientType: 'linear',
  gradientRotation: 45,
  gradientColor1: '#6366f1',
  gradientColor2: '#06b6d4',
  squareStyle: 'extra-rounded',
  cornerDotStyle: 'rounded',
  logoValue: '',
  logoSize: 0.2,
  logoShape: 'square',
  ecl: 'M',
  margin: 2,
  presetId: 'minimal-mono',
}

function App() {
  const [values, setValues] = useState(defaultValues)
  const [activeSection, setActiveSection] = useState('pattern')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  // Persistence State
  const [currentSavedId, setCurrentSavedId] = useState(null)
  const [currentSavedTitle, setCurrentSavedTitle] = useState('')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSavedCodesModalOpen, setIsSavedCodesModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: '', type: 'success' })
    }, 3500)
  }, [])

  const handleValuesChange = useCallback((newPartialValues) => {
    setValues((prev) => {
      const isStyleChange = Object.keys(newPartialValues).some((key) =>
        [
          'dotsStyle',
          'squareStyle',
          'cornerDotStyle',
          'dotsColor',
          'backgroundColor',
          'useGradient',
          'gradientColor1',
          'gradientColor2',
          'gradientType',
          'gradientRotation',
        ].includes(key)
      )
      return {
        ...prev,
        ...newPartialValues,
        presetId:
          newPartialValues.presetId !== undefined
            ? newPartialValues.presetId
            : isStyleChange
            ? 'custom'
            : prev.presetId,
      }
    })
  }, [])

  const handleContentChange = useCallback((encodedValue, meta = {}) => {
    setValues((prev) => ({
      ...prev,
      value: encodedValue,
      ...meta,
    }))
  }, [])

  const handleSelectPreset = useCallback((preset) => {
    setValues((prev) => ({
      ...prev,
      dotsStyle: preset.dotsStyle,
      squareStyle: preset.squareStyle,
      cornerDotStyle: preset.cornerDotStyle,
      dotsColor: preset.dotsColor,
      backgroundColor: preset.backgroundColor,
      useGradient: preset.useGradient,
      gradientColor1: preset.gradientColor1,
      gradientColor2: preset.gradientColor2,
      gradientType: preset.gradientType,
      gradientRotation: preset.gradientRotation,
      presetId: preset.id,
    }))
    showToast(`Applied "${preset.name}" preset`, 'info')
  }, [showToast])

  const handleReset = useCallback(() => {
    setValues(defaultValues)
    setCurrentSavedId(null)
    setCurrentSavedTitle('')
    showToast('Reset to default configuration', 'info')
  }, [showToast])

  const handleClearActive = useCallback(() => {
    setCurrentSavedId(null)
    setCurrentSavedTitle('')
    showToast('Unlinked from saved QR code (will save as new copy)', 'info')
  }, [showToast])

  // Save / Update QR Code workflow
  const handleSaveSubmit = async ({ title, isUpdate }) => {
    setIsSaving(true)
    try {
      // 1. Generate preview snapshot
      let previewDataUrl = ''
      try {
        const runeOptions = getRuneOptionsFromValues(values)
        previewDataUrl = await generateQRCodeDataURL(runeOptions, 2)
      } catch (genErr) {
        console.warn('Could not generate preview snapshot for upload:', genErr)
      }

      if (isUpdate && currentSavedId) {
        await updateQRCode(currentSavedId, {
          title,
          values,
          previewDataUrl,
        })
        setCurrentSavedTitle(title)
        showToast(`Updated "${title}" in cloud!`, 'success')
      } else {
        const saved = await saveQRCode({
          title,
          values,
          previewDataUrl,
        })
        setCurrentSavedId(saved.id)
        setCurrentSavedTitle(title)
        showToast(`Saved "${title}" to cloud!`, 'success')
      }
      setIsSaveModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to save QR code', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Load saved QR Code into Studio for re-editing
  const handleLoadSavedCode = (item) => {
    if (!item?.values) return
    const rawVal = item.values.value || ''
    const cleanVal = cleanWrappingQuotes(rawVal)
    setValues({
      ...defaultValues,
      ...item.values,
      value: cleanVal,
    })
    setCurrentSavedId(item.id)
    setCurrentSavedTitle(item.title || 'Untitled QR')
    showToast(`Loaded "${item.title || 'QR Code'}" into studio for editing`, 'success')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/10 selection:text-primary">
      {/* App Header */}
      <Header
        onReset={handleReset}
        onOpenSaved={() => setIsSavedCodesModalOpen(true)}
        activeTitle={currentSavedTitle}
        onClearActive={handleClearActive}
      />

      {/* Main Studio Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Banner / Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-2">
              <Sparkles className="size-3 text-primary" />
              <span>SVG Vector & High-Res PNG Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create Custom QR Codes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalize patterns, gradients, frames, and logos with instant cloud save and high-resolution downloads.
            </p>
          </div>
        </div>

        {/* Curated Presets Carousel */}
        <div className="mb-8">
          <PresetsBar
            currentPresetId={values.presetId}
            onSelectPreset={handleSelectPreset}
          />
        </div>

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] items-start">
          {/* Left Column: Configuration Controls */}
          <section className="space-y-6">
            {/* Card 1: Content Type & Data */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  1. Content & Type
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select a format and enter the destination or details to encode.
                </p>
              </div>
              <ContentTypeTabs
                value={values.value}
                contentType={values.contentType}
                onChange={handleContentChange}
              />
            </div>

            {/* Card 2: Styling & Customization */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-primary" />
                    <span>2. Design & Branding</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Customize dot patterns, gradient effects, and center logos.
                  </p>
                </div>
              </div>

              <StyleCustomizer
                values={values}
                onChange={handleValuesChange}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
          </section>

          {/* Right Column: Live Sticky Preview & Actions */}
          <PreviewCard
            values={values}
            onToast={showToast}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            currentSavedId={currentSavedId}
            currentSavedTitle={currentSavedTitle}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>QR Craft — High-performance vector QR code generator.</p>
          <p className="font-mono text-[11px] text-muted-foreground/80">
            Powered by Rune, Cloudinary, Firebase & React 19
          </p>
        </div>
      </footer>

      {/* Floating Feedback Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Save / Update QR Code Modal */}
      <SaveQRModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveSubmit}
        currentId={currentSavedId}
        currentTitle={currentSavedTitle}
        values={values}
        isSaving={isSaving}
      />

      {/* Saved QR Codes Browser Modal */}
      <SavedCodesModal
        isOpen={isSavedCodesModalOpen}
        onClose={() => setIsSavedCodesModalOpen(false)}
        onLoadCode={handleLoadSavedCode}
        onToast={showToast}
        activeId={currentSavedId}
      />
    </div>
  )
}

export default App
