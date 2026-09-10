import { ensureAusbildungUpdate, isAusbildungPhase } from './phases'
import type { AusbildungUpdateDraft, WeiterbildungAntrag } from './types'

export const AUSBILDUNG_FORM_FIELD_IDS = {
  outcome: 'ausbildung-field-outcome',
  wiederholung: 'ausbildung-field-wiederholung',
  neuesEnddatum: 'ausbildung-field-bis',
} as const

export type AusbildungFormFieldId = keyof typeof AUSBILDUNG_FORM_FIELD_IDS

export type AusbildungValidationMessage = {
  fieldId: AusbildungFormFieldId
  section: string
  label: string
  message: string
}

/** Outcomes that need an explicit consequence confirm before Bestätigen. */
export type AusbildungConsequenceKind = 'abbruch' | 'keine_wiederholung'

export type AusbildungConsequenceConfirm = {
  kind: AusbildungConsequenceKind
  headerText: string
  body: string
  confirmLabel: string
}

const SELECT_OPTION_MESSAGE = 'Option wählen'
const REQUIRED_DATE_MESSAGE = 'Datum eingeben'

const FIELD_LABELS: Record<AusbildungFormFieldId, string> = {
  outcome: 'Status der Ausbildung',
  wiederholung: 'Wird die Prüfung wiederholt?',
  neuesEnddatum: 'Datum bis',
}

const FIELD_SECTIONS: Record<AusbildungFormFieldId, string> = {
  outcome: 'Ausbildungsdaten',
  wiederholung: 'Ausbildungsdaten',
  neuesEnddatum: 'Ausbildungsdauer',
}

const FIELD_ORDER: AusbildungFormFieldId[] = [
  'outcome',
  'wiederholung',
  'neuesEnddatum',
]

function addMessage(
  messages: AusbildungValidationMessage[],
  fieldId: AusbildungFormFieldId,
  message: string,
) {
  messages.push({
    fieldId,
    section: FIELD_SECTIONS[fieldId],
    label: FIELD_LABELS[fieldId],
    message,
  })
}

export function validateAusbildungUpdate(
  antrag: WeiterbildungAntrag,
  draft: AusbildungUpdateDraft = ensureAusbildungUpdate(antrag),
): AusbildungValidationMessage[] {
  if (!isAusbildungPhase(antrag)) {
    return []
  }

  const messages: AusbildungValidationMessage[] = []
  const isRetryPhase = antrag.unterstatus === 'Prüfung nicht bestanden'

  switch (draft.outcome) {
    case 'ausbildung_bestanden':
    case 'abbruch':
    case 'weitere_pruefung_nicht_bestanden':
      break

    case 'in_ausbildung':
      addMessage(
        messages,
        'outcome',
        'Bitte wähle einen Status, um die Ausbildung abzuschliessen oder zu aktualisieren.',
      )
      break

    case 'pruefung_nicht_bestanden':
      if (isRetryPhase) {
        addMessage(
          messages,
          'outcome',
          'Bitte wähle einen abschliessenden Status (bestanden, weitere Prüfung nicht bestanden oder Abbruch).',
        )
        break
      }
      if (!draft.wiederholung) {
        addMessage(messages, 'wiederholung', SELECT_OPTION_MESSAGE)
      } else if (draft.wiederholung === 'ja' && !draft.neuesEnddatum?.trim()) {
        addMessage(messages, 'neuesEnddatum', REQUIRED_DATE_MESSAGE)
      }
      break

    default:
      addMessage(messages, 'outcome', SELECT_OPTION_MESSAGE)
      break
  }

  return messages.sort(
    (a, b) => FIELD_ORDER.indexOf(a.fieldId) - FIELD_ORDER.indexOf(b.fieldId),
  )
}

export function ausbildungValidationToFieldErrors(
  messages: AusbildungValidationMessage[],
): Partial<Record<AusbildungFormFieldId, string>> {
  return Object.fromEntries(messages.map((message) => [message.fieldId, message.message]))
}

export function firstInvalidAusbildungFieldId(
  messages: AusbildungValidationMessage[],
): AusbildungFormFieldId | undefined {
  return messages[0]?.fieldId
}

export function focusAusbildungFormField(fieldId: AusbildungFormFieldId): void {
  const elementId = AUSBILDUNG_FORM_FIELD_IDS[fieldId]
  const element =
    document.getElementById(elementId) ??
    document.querySelector(`[data-ausbildung-field="${fieldId}"]`)

  if (!element) {
    return
  }

  element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  if ('focus' in element && typeof element.focus === 'function') {
    element.focus()
  }
}

export function getAusbildungConsequenceConfirm(
  draft: AusbildungUpdateDraft,
): AusbildungConsequenceConfirm | null {
  if (draft.outcome === 'abbruch') {
    return {
      kind: 'abbruch',
      headerText: 'Ausbildung abbrechen?',
      body:
        'Beim Abbruch musst du die Post-Beiträge und allfällig bezogene Tage einer Arbeitszeiterleichterung zurückzahlen. Die HR-Beratung kommt auf dich zu und begleitet dich bei den nächsten Schritten.',
      confirmLabel: 'Abbruch bestätigen',
    }
  }

  if (
    draft.outcome === 'pruefung_nicht_bestanden' &&
    draft.wiederholung === 'nein'
  ) {
    return {
      kind: 'keine_wiederholung',
      headerText: 'Ohne Wiederholung abschliessen?',
      body:
        'Wenn du die Prüfung nicht wiederholst, wird die Ausbildung als nicht bestanden abgeschlossen. Du musst die Post-Beiträge und allfällig bezogene Tage einer Arbeitszeiterleichterung zurückzahlen. Die HR-Beratung kommt auf dich zu und begleitet dich bei den nächsten Schritten.',
      confirmLabel: 'Abschliessen bestätigen',
    }
  }

  return null
}
