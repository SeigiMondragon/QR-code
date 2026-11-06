/**
 * Utilities for detecting, parsing, and formatting QR code content payloads.
 */

export function cleanWrappingQuotes(str) {
  if (typeof str !== 'string') return ''
  let s = str.trim()
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  return s
}

export function parseWifi(raw) {
  const content = (raw || '').replace(/^WIFI:/i, '').replace(/;;*$/, '')
  const tokens = []
  let current = ''
  let escaped = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (escaped) {
      current += ch
      escaped = false
    } else if (ch === '\\') {
      escaped = true
    } else if (ch === ';') {
      tokens.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) tokens.push(current)

  const unescapeVal = (str) => str.replace(/\\([\\;:,"])/g, '$1')

  let ssid = ''
  let password = ''
  let encryption = 'WPA'
  let hidden = false

  for (const token of tokens) {
    if (token.startsWith('S:')) {
      ssid = unescapeVal(token.slice(2))
    } else if (token.startsWith('P:')) {
      password = unescapeVal(token.slice(2))
    } else if (token.startsWith('T:')) {
      encryption = token.slice(2) || 'WPA'
    } else if (token.startsWith('H:')) {
      hidden = token.slice(2).toLowerCase() === 'true'
    }
  }

  return { ssid, password, encryption, hidden }
}

export function parseEmail(raw) {
  const withoutPrefix = (raw || '').replace(/^mailto:/i, '')
  const [toPart, queryPart] = withoutPrefix.split('?')
  let to = decodeURIComponent(toPart || '')
  let subject = ''
  let body = ''

  if (queryPart) {
    try {
      const params = new URLSearchParams(queryPart)
      subject = params.get('subject') || ''
      body = params.get('body') || ''
    } catch {
      // fallback if malformed query
    }
  }

  return { to, subject, body }
}

export function parseTel(raw) {
  return (raw || '').replace(/^tel:/i, '')
}

export function parseVcard(raw) {
  const lines = (raw || '').split(/\r?\n/)
  let firstName = ''
  let lastName = ''
  let org = ''
  let title = ''
  let phone = ''
  let email = ''
  let url = ''

  for (const line of lines) {
    if (line.startsWith('N:') || line.startsWith('N;')) {
      const val = line.replace(/^N[^:]*:/, '')
      const parts = val.split(';')
      lastName = parts[0]?.replace(/\\([;,])/g, '$1') || ''
      firstName = parts[1]?.replace(/\\([;,])/g, '$1') || ''
    } else if (line.startsWith('FN:') || line.startsWith('FN;')) {
      const fn = line.replace(/^FN[^:]*:/, '').replace(/\\([;,])/g, '$1')
      if (!firstName && !lastName) {
        const parts = fn.split(' ')
        firstName = parts[0] || ''
        lastName = parts.slice(1).join(' ') || ''
      }
    } else if (line.startsWith('ORG:') || line.startsWith('ORG;')) {
      org = line.replace(/^ORG[^:]*:/, '').replace(/\\([;,])/g, '$1')
    } else if (line.startsWith('TITLE:') || line.startsWith('TITLE;')) {
      title = line.replace(/^TITLE[^:]*:/, '').replace(/\\([;,])/g, '$1')
    } else if (line.startsWith('TEL:') || line.startsWith('TEL;')) {
      phone = line.replace(/^TEL[^:]*:/, '')
    } else if (line.startsWith('EMAIL:') || line.startsWith('EMAIL;')) {
      email = line.replace(/^EMAIL[^:]*:/, '')
    } else if (line.startsWith('URL:') || line.startsWith('URL;')) {
      url = line.replace(/^URL[^:]*:/, '')
    }
  }

  return { firstName, lastName, org, title, phone, email, url }
}

export function detectContentType(val, explicitType) {
  if (
    explicitType &&
    ['url', 'text', 'wifi', 'email', 'phone', 'vcard'].includes(explicitType)
  ) {
    return explicitType
  }
  const s = cleanWrappingQuotes(val)
  if (!s) return 'url'
  if (/^wifi:/i.test(s)) return 'wifi'
  if (/^mailto:/i.test(s)) return 'email'
  if (/^tel:/i.test(s)) return 'phone'
  if (/^BEGIN:VCARD/i.test(s) || s.includes('BEGIN:VCARD')) return 'vcard'
  if (/^https?:\/\//i.test(s) || /^www\./i.test(s)) return 'url'
  return 'text'
}

export function parsePayload(raw, explicitType) {
  const cleaned = cleanWrappingQuotes(raw)
  const type = detectContentType(cleaned, explicitType)

  switch (type) {
    case 'wifi':
      return { type, data: parseWifi(cleaned) }
    case 'email':
      return { type, data: parseEmail(cleaned) }
    case 'phone':
      return { type, data: { phone: parseTel(cleaned) } }
    case 'vcard':
      return { type, data: parseVcard(cleaned) }
    case 'text':
      return { type, data: { text: cleaned } }
    case 'url':
    default:
      return { type: 'url', data: { url: cleaned } }
  }
}

export function formatDisplayValue(val) {
  if (!val) return 'Empty content'
  const cleaned = cleanWrappingQuotes(val)
  if (/^wifi:/i.test(cleaned)) {
    const parsed = parseWifi(cleaned)
    return `Wi-Fi: ${parsed.ssid || 'Network'} (${parsed.encryption || 'WPA'})`
  }
  if (/^mailto:/i.test(cleaned)) {
    const parsed = parseEmail(cleaned)
    return `Email: ${parsed.to}${parsed.subject ? ` (${parsed.subject})` : ''}`
  }
  if (/^tel:/i.test(cleaned)) {
    return `Phone: ${parseTel(cleaned)}`
  }
  if (/^BEGIN:VCARD/i.test(cleaned) || cleaned.includes('BEGIN:VCARD')) {
    const parsed = parseVcard(cleaned)
    const name = [parsed.firstName, parsed.lastName].filter(Boolean).join(' ')
    return `Contact: ${name || parsed.org || 'vCard'}`
  }
  return cleaned
}
