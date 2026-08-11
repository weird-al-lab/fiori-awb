import { BESCHAEFTIGUNGSGRAD_PERCENTS } from './constants'
import type { AntragFormData, JaNein, Pruefungszulassung } from './types'

export function parseNumber(value: string): number {
  const normalized = value.replace(/'/g, '').replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

export function formatChf(amount: number): string {
  const rounded = Math.round(amount)
  const formatted = rounded.toLocaleString('de-CH')
  return `CHF ${formatted}.-`
}

export function formatChfRate(amount: number): string {
  return `CHF ${amount.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatChfDecimal(amount: number): string {
  return amount.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatBeschaeftigungsgradOption(
  percent: number,
  currentPercent: number,
): string {
  const label = `${percent}%`
  if (percent === currentPercent) {
    return `${label} (aktueller Beschäftigungsgrad)`
  }
  return label
}

export function getBeschaeftigungsgradOptions(currentPercent: number): string[] {
  return BESCHAEFTIGUNGSGRAD_PERCENTS.map((percent) =>
    formatBeschaeftigungsgradOption(percent, currentPercent),
  )
}

export function parseBeschaeftigungsgradPercent(value: string): number | null {
  const match = value.match(/^(\d+)%/)
  return match ? Number(match[1]) : null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function formatFeedTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function jaNeinLabel(value: JaNein | Pruefungszulassung): string {
  if (value === 'ja') {
    return 'Ja'
  }
  if (value === 'nein') {
    return 'Nein'
  }
  if (value === 'keine') {
    return 'Keine Zulassung nötig'
  }
  return '—'
}

function parseDateParts(value: string): { month: number; year: number } | null {
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!match) {
    return null
  }
  return { month: Number(match[2]) - 1, year: Number(match[3]) }
}

const MONTH_LABELS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const

export function getAuszahlungsMonate(form: AntragFormData): string[] {
  const von = parseDateParts(form.von)
  const bis = parseDateParts(form.bis)
  if (!von) {
    return ['November 2026']
  }

  const start = new Date(von.year, von.month, 1)
  const end = bis
    ? new Date(bis.year, bis.month, 1)
    : new Date(von.year, von.month + 11, 1)

  const months: string[] = []
  const cursor = new Date(start)
  while (cursor <= end && months.length < 24) {
    months.push(`${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months.length ? months : ['November 2026']
}

/** Used by kosten.createDefaultVereinbarung; not part of the public barrel historically. */
export function getDefaultAuszahlungsMonat(form: AntragFormData): string {
  const months = getAuszahlungsMonate(form)
  return months[Math.min(2, months.length - 1)] ?? months[0]
}

export function formDateToIso(value: string): string | undefined {
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!match) {
    return undefined
  }
  const day = match[1].padStart(2, '0')
  const month = match[2].padStart(2, '0')
  const year = match[3]
  return `${year}-${month}-${day}`
}

export function getTrainingMaxDateIso(form: AntragFormData): string | undefined {
  return formDateToIso(form.bis)
}

export function auszahlungsMonatToIso(label: string): string {
  const trimmed = label.trim()
  const spaceIndex = trimmed.lastIndexOf(' ')
  if (spaceIndex <= 0) {
    return ''
  }
  const monthName = trimmed.slice(0, spaceIndex)
  const year = Number(trimmed.slice(spaceIndex + 1))
  const monthIndex = MONTH_LABELS.findIndex(
    (month) => month.toLowerCase() === monthName.toLowerCase(),
  )
  if (monthIndex < 0 || !Number.isFinite(year)) {
    return ''
  }
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function isoToAuszahlungsMonat(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})/)
  if (!match) {
    return ''
  }
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) {
    return ''
  }
  return `${MONTH_LABELS[monthIndex]} ${year}`
}
