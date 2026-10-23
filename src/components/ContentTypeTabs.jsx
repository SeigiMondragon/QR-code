import { useState, useEffect } from 'react'
import { Link2, AlignLeft, Wifi, Mail, Phone, UserCheck, Eye, EyeOff } from 'lucide-react'
import { data } from '@kroszborg/rune'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { cn } from '@/lib/utils'

const CONTENT_TYPES = [
  { id: 'url', label: 'URL / Link', icon: Link2 },
  { id: 'text', label: 'Plain Text', icon: AlignLeft },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'vcard', label: 'Contact (vCard)', icon: UserCheck },
]

export function ContentTypeTabs({ value, onChange }) {
  const [activeTab, setActiveTab] = useState('url')

  // Sub-states for each specific payload
  const [urlInput, setUrlInput] = useState(value || 'https://example.com')
  const [textInput, setTextInput] = useState('Scan to explore')
  const [wifiData, setWifiData] = useState({
    ssid: 'MyWiFiNetwork',
    password: '',
    encryption: 'WPA',
    hidden: false,
  })
  const [showWifiPassword, setShowWifiPassword] = useState(false)
  const [emailData, setEmailData] = useState({
    to: 'hello@example.com',
    subject: 'Inquiry',
    body: 'Hi there, I scanned your QR code!',
  })
  const [phoneInput, setPhoneInput] = useState('+1234567890')
  const [vcardData, setVcardData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    org: 'Design Studio',
    title: 'Creative Director',
    phone: '+1 (555) 019-2834',
    email: 'alex@designstudio.io',
    url: 'https://designstudio.io',
  })

  // Whenever inputs change, compute formatted payload and notify parent
  useEffect(() => {
    let payload = ''
    switch (activeTab) {
      case 'url':
        payload = urlInput.trim()
        break
      case 'text':
        payload = textInput
        break
      case 'wifi':
        if (wifiData.ssid) {
          payload = data.wifi({
            ssid: wifiData.ssid,
            password: wifiData.password || undefined,
            encryption: wifiData.encryption,
            hidden: wifiData.hidden,
          })
        }
        break
      case 'email':
        if (emailData.to) {
          payload = data.email({
            to: emailData.to,
            subject: emailData.subject || undefined,
            body: emailData.body || undefined,
          })
        }
        break
      case 'phone':
        payload = phoneInput ? data.tel(phoneInput) : ''
        break
      case 'vcard':
        payload = data.vcard({
          firstName: vcardData.firstName,
          lastName: vcardData.lastName,
          org: vcardData.org || undefined,
          title: vcardData.title || undefined,
          phone: vcardData.phone || undefined,
          email: vcardData.email || undefined,
          url: vcardData.url || undefined,
        })
        break
      default:
        payload = urlInput
    }
    onChange(payload)
  }, [activeTab, urlInput, textInput, wifiData, emailData, phoneInput, vcardData, onChange])

  return (
    <div className="space-y-4">
      {/* Type navigation pill tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/70">
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon
          const isActive = activeTab === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setActiveTab(type.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <Icon className="size-3.5" />
              <span>{type.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Form Fields */}
      <div className="pt-1">
        {activeTab === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="qr-url">Website or Landing Page URL</Label>
            <div className="relative">
              <Input
                id="qr-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="pl-3 font-mono text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: Include https:// so phones immediately offer to open the link when scanned.
            </p>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="qr-text">Plain Text Content</Label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {textInput.length} chars
              </span>
            </div>
            <textarea
              id="qr-text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={4}
              placeholder="Enter message, instructions, coupon codes, serial numbers..."
              className="w-full resize-y rounded-lg border border-border/80 bg-background p-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        )}

        {activeTab === 'wifi' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifiData.ssid}
                onChange={(e) => setWifiData((prev) => ({ ...prev, ssid: e.target.value }))}
                placeholder="Office-Guest-5G"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wifi-pass">Password</Label>
              <div className="relative">
                <Input
                  id="wifi-pass"
                  type={showWifiPassword ? 'text' : 'password'}
                  value={wifiData.password}
                  onChange={(e) => setWifiData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty for open networks"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showWifiPassword ? 'Hide password' : 'Show password'}
                >
                  {showWifiPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wifi-enc">Security Protocol</Label>
              <select
                id="wifi-enc"
                value={wifiData.encryption}
                onChange={(e) => setWifiData((prev) => ({ ...prev, encryption: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                <option value="WEP">WEP (Legacy)</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                id="wifi-hidden"
                type="checkbox"
                checked={wifiData.hidden}
                onChange={(e) => setWifiData((prev) => ({ ...prev, hidden: e.target.checked }))}
                className="size-4 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="wifi-hidden" className="text-xs text-muted-foreground cursor-pointer">
                This is a hidden network (SSID is not broadcasted)
              </label>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email-to">Recipient Email Address</Label>
              <Input
                id="email-to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="support@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-sub">Subject Line</Label>
              <Input
                id="email-sub"
                value={emailData.subject}
                onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Product Feedback"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-body">Pre-filled Body Message</Label>
              <textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData((prev) => ({ ...prev, body: e.target.value }))}
                rows={2}
                placeholder="Optional pre-filled message..."
                className="w-full resize-y rounded-lg border border-border/80 bg-background p-2.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </div>
          </div>
        )}

        {activeTab === 'phone' && (
          <div className="space-y-2">
            <Label htmlFor="phone-num">Phone Number (with Country Code)</Label>
            <Input
              id="phone-num"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 (555) 234-5678"
            />
            <p className="text-[11px] text-muted-foreground">
              Scanning directly opens the phone dialer with this number pre-entered.
            </p>
          </div>
        )}

        {activeTab === 'vcard' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="vcard-fn">First Name</Label>
              <Input
                id="vcard-fn"
                value={vcardData.firstName}
                onChange={(e) => setVcardData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Alex"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcard-ln">Last Name</Label>
              <Input
                id="vcard-ln"
                value={vcardData.lastName}
                onChange={(e) => setVcardData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Morgan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcard-org">Organization / Company</Label>
              <Input
                id="vcard-org"
                value={vcardData.org}
                onChange={(e) => setVcardData((prev) => ({ ...prev, org: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcard-title">Job Title</Label>
              <Input
                id="vcard-title"
                value={vcardData.title}
                onChange={(e) => setVcardData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Director"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcard-phone">Mobile Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                value={vcardData.phone}
                onChange={(e) => setVcardData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555-0199"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcard-email">Work Email</Label>
              <Input
                id="vcard-email"
                type="email"
                value={vcardData.email}
                onChange={(e) => setVcardData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="alex@company.com"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
