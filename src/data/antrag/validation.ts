import { ANTRAG_FORM_SECTION_TITLES, isBund50NiveauEligible } from './constants'
import { parseNumber } from './format'
import type { AntragFormData } from './types'

export const ANTRAG_FORM_FIELD_IDS = {
  titel: 'antrag-field-titel',
  anbieter: 'antrag-field-anbieter',
  von: 'antrag-field-von',
  bis: 'antrag-field-bis',
  niveau: 'antrag-field-niveau',
  fachrichtung: 'antrag-field-fachrichtung',
  bund50: 'antrag-field-bund50',
  kurskosten: 'antrag-field-kurskosten',
  beschaeftigungsgradAnpassen: 'antrag-field-beschaeftigungsgrad-anpassen',
  arbeitszeiterleichterung: 'antrag-field-arbeitszeiterleichterung',
  anzahlTageErleichterung: 'antrag-field-anzahl-tage-erleichterung',
  begruendungErleichterung: 'antrag-field-begruendung-erleichterung',
} as const

export type AntragFormFieldId = keyof typeof ANTRAG_FORM_FIELD_IDS

export type AntragFormValidationMessage = {
  fieldId: AntragFormFieldId
  section: string
  label: string
  message: string
}

const REQUIRED_MESSAGE = 'Wert eingeben'
const SELECT_OPTION_MESSAGE = 'Option wählen'

const FIELD_LABELS: Record<AntragFormFieldId, string> = {
  titel: 'Titel',
  anbieter: 'Anbieter/-in / Schule',
  von: 'Vom',
  bis: 'Voraussichtlich bis',
  niveau: 'Typ',
  fachrichtung: 'Fachrichtung',
  bund50: 'Beteiligung Bund',
  kurskosten: 'Kurskosten',
  beschaeftigungsgradAnpassen: 'Beschäftigungsgrad anpassen',
  arbeitszeiterleichterung: 'Arbeitszeiterleichterung',
  anzahlTageErleichterung: 'Anzahl Tage',
  begruendungErleichterung: 'Begründung',
}

const FIELD_SECTIONS: Record<AntragFormFieldId, string> = {
  titel: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  anbieter: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  von: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  bis: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  niveau: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  fachrichtung: ANTRAG_FORM_SECTION_TITLES.grunddaten,
  bund50: ANTRAG_FORM_SECTION_TITLES.kosten,
  kurskosten: ANTRAG_FORM_SECTION_TITLES.kosten,
  beschaeftigungsgradAnpassen: ANTRAG_FORM_SECTION_TITLES.arbeitszeit,
  arbeitszeiterleichterung: ANTRAG_FORM_SECTION_TITLES.arbeitszeit,
  anzahlTageErleichterung: ANTRAG_FORM_SECTION_TITLES.arbeitszeit,
  begruendungErleichterung: ANTRAG_FORM_SECTION_TITLES.arbeitszeit,
}

/** Visual / focus order for validation navigation. */
export const ANTRAG_FORM_FIELD_ORDER: AntragFormFieldId[] = [
  'titel',
  'anbieter',
  'von',
  'bis',
  'niveau',
  'fachrichtung',
  'bund50',
  'kurskosten',
  'beschaeftigungsgradAnpassen',
  'arbeitszeiterleichterung',
  'anzahlTageErleichterung',
  'begruendungErleichterung',
]

function parseUiDate(value: string): Date | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
  if (!match) {
    return null
  }
  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function addRequired(
  messages: AntragFormValidationMessage[],
  fieldId: AntragFormFieldId,
  message = REQUIRED_MESSAGE,
) {
  messages.push({
    fieldId,
    section: FIELD_SECTIONS[fieldId],
    label: FIELD_LABELS[fieldId],
    message,
  })
}

export function validateAntragForm(form: AntragFormData): AntragFormValidationMessage[] {
  const messages: AntragFormValidationMessage[] = []

  if (!form.titel.trim()) {
    addRequired(messages, 'titel')
  }
  if (!form.anbieter.trim()) {
    addRequired(messages, 'anbieter')
  }
  if (!form.von.trim()) {
    addRequired(messages, 'von')
  }
  if (!form.bis.trim()) {
    addRequired(messages, 'bis')
  }
  if (!form.niveau.trim()) {
    addRequired(messages, 'niveau')
  }
  if (!form.fachrichtung.trim()) {
    addRequired(messages, 'fachrichtung')
  }

  const vonDate = form.von.trim() ? parseUiDate(form.von) : null
  const bisDate = form.bis.trim() ? parseUiDate(form.bis) : null
  if (form.von.trim() && !vonDate) {
    addRequired(messages, 'von', 'Gültiges Datum eingeben')
  }
  if (form.bis.trim() && !bisDate) {
    addRequired(messages, 'bis', 'Gültiges Datum eingeben')
  }
  if (vonDate && bisDate && bisDate < vonDate) {
    addRequired(messages, 'bis', 'Das Enddatum muss nach dem Startdatum liegen.')
  }

  if (isBund50NiveauEligible(form.niveau) && !form.bund50) {
    addRequired(messages, 'bund50', SELECT_OPTION_MESSAGE)
  }

  if (!form.kurskosten.trim()) {
    addRequired(messages, 'kurskosten')
  } else if (parseNumber(form.kurskosten) <= 0) {
    addRequired(messages, 'kurskosten', 'Gültigen Betrag eingeben')
  }

  if (!form.beschaeftigungsgradAnpassen) {
    addRequired(messages, 'beschaeftigungsgradAnpassen', SELECT_OPTION_MESSAGE)
  }
  if (!form.arbeitszeiterleichterung) {
    addRequired(messages, 'arbeitszeiterleichterung', SELECT_OPTION_MESSAGE)
  }

  if (form.arbeitszeiterleichterung === 'ja') {
    if (!form.anzahlTageErleichterung.trim()) {
      addRequired(messages, 'anzahlTageErleichterung')
    } else if (parseNumber(form.anzahlTageErleichterung) <= 0) {
      addRequired(messages, 'anzahlTageErleichterung', 'Gültige Anzahl eingeben')
    }
    if (!form.begruendungErleichterung.trim()) {
      addRequired(messages, 'begruendungErleichterung')
    }
  }

  return messages
}

export function validationMessagesToFieldErrors(
  messages: AntragFormValidationMessage[],
): Partial<Record<AntragFormFieldId, string>> {
  return Object.fromEntries(messages.map((message) => [message.fieldId, message.message]))
}

export function focusAntragFormField(fieldId: AntragFormFieldId): void {
  const elementId = ANTRAG_FORM_FIELD_IDS[fieldId]
  const element =
    document.getElementById(elementId) ??
    document.querySelector(`[data-antrag-field="${fieldId}"]`)

  if (!element) {
    return
  }

  element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  if ('focus' in element && typeof element.focus === 'function') {
    element.focus()
  }
}
