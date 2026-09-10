import { isHauptstatusReached } from '../weiterbildungen'
import type {
  AntragFormData,
  AusbildungUpdateDraft,
  WeiterbildungAntrag,
} from './types'

export function isVereinbarungPhase(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Vereinbarung' ||
    antrag.unterstatus === 'Angebot erstellen' ||
    antrag.unterstatus === 'Angebot zur Prüfung' ||
    antrag.unterstatus === 'Angebot angenommen'
  )
}

export function isAusbildungPhase(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Ausbildung' &&
    (antrag.unterstatus === 'Ausbildung gestartet' ||
      antrag.unterstatus === 'Prüfung nicht bestanden')
  )
}

export function isAbschlussPhase(antrag: WeiterbildungAntrag): boolean {
  return antrag.hauptstatus === 'Abschluss'
}

/** Whether a later ObjectPage tab may be selected (phase has been reached / not skipped). */
export function isProcessPhaseReached(
  antrag: WeiterbildungAntrag,
  phase: 'Vereinbarung' | 'Ausbildung',
): boolean {
  return isHauptstatusReached(antrag.hauptstatus, antrag.unterstatus, phase)
}

export function isAntragPruefungPhase(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Antrag' &&
    (antrag.unterstatus === 'In Prüfung VG' ||
      antrag.unterstatus === 'Eingereicht' ||
      antrag.unterstatus === 'Wieder eingereicht')
  )
}

export function isMaUeberarbeitungPhase(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Antrag' &&
    (antrag.unterstatus === 'Zur Überarbeitung' ||
      antrag.unterstatus === 'In Überarbeitung')
  )
}

/** VG may open the form from these review statuses while the antrag stays in review for MA. */
export function isVgAntragPruefungEditable(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Antrag' &&
    !antrag.vgBearbeitungAktiv &&
    (antrag.unterstatus === 'In Prüfung VG' ||
      antrag.unterstatus === 'Wieder eingereicht')
  )
}

/** VG is actively editing an in-review antrag (employee still sees review status). */
export function isVgBearbeitungAktiv(antrag: WeiterbildungAntrag): boolean {
  return antrag.vgBearbeitungAktiv === true
}

/** @deprecated Prefer isVgBearbeitungAktiv — kept for existing call sites */
export function isVgDraftResubmit(antrag: WeiterbildungAntrag): boolean {
  return isVgBearbeitungAktiv(antrag)
}

const UEBERARBEITUNG_FORM_KEYS: (keyof AntragFormData)[] = [
  'titel',
  'anbieter',
  'von',
  'bis',
  'niveau',
  'fachrichtung',
  'bund50',
  'kurskosten',
  'zusaetzlicheKosten',
  'beschaeftigungsgradAnpassen',
  'gewuenschterBeschaeftigungsgrad',
  'arbeitszeiterleichterung',
  'anzahlTageErleichterung',
  'begruendungErleichterung',
]

function formFieldEqual(
  baseline: AntragFormData,
  current: AntragFormData,
  key: keyof AntragFormData,
): boolean {
  return baseline[key] === current[key]
}

/** Changed form field keys vs baseline (MA resubmit or after VG edit). */
export function getAntragAenderungen(antrag: WeiterbildungAntrag): Set<string> {
  const baseline = antrag.formBaselineVorUeberarbeitung
  if (!baseline || antrag.hauptstatus !== 'Antrag') {
    return new Set()
  }
  if (
    antrag.unterstatus !== 'Wieder eingereicht' &&
    antrag.unterstatus !== 'In Prüfung VG'
  ) {
    return new Set()
  }

  const changed = new Set<string>()
  for (const key of UEBERARBEITUNG_FORM_KEYS) {
    if (!formFieldEqual(baseline, antrag.form, key)) {
      changed.add(key)
    }
  }

  return changed
}

export function hasAntragAenderungen(antrag: WeiterbildungAntrag): boolean {
  return getAntragAenderungen(antrag).size > 0
}

export function createDefaultAusbildungUpdate(
  antrag: WeiterbildungAntrag,
): AusbildungUpdateDraft {
  if (antrag.unterstatus === 'Prüfung nicht bestanden') {
    return {
      outcome: 'pruefung_nicht_bestanden',
      wiederholung: '',
      neuesEnddatum: '',
    }
  }
  return {
    outcome: 'in_ausbildung',
    wiederholung: '',
    neuesEnddatum: '',
  }
}

export function ensureAusbildungUpdate(
  antrag: WeiterbildungAntrag,
): AusbildungUpdateDraft {
  return antrag.ausbildungUpdate ?? createDefaultAusbildungUpdate(antrag)
}

export function canConfirmAusbildungUpdate(
  antrag: WeiterbildungAntrag,
  draft: AusbildungUpdateDraft = ensureAusbildungUpdate(antrag),
): boolean {
  if (!isAusbildungPhase(antrag)) {
    return false
  }

  switch (draft.outcome) {
    case 'ausbildung_bestanden':
    case 'abbruch':
    case 'weitere_pruefung_nicht_bestanden':
      return true
    case 'pruefung_nicht_bestanden':
      // Retry phase: this radio is not confirmable — pick a closing status.
      if (antrag.unterstatus === 'Prüfung nicht bestanden') {
        return false
      }
      if (draft.wiederholung === 'nein') {
        return true
      }
      if (draft.wiederholung === 'ja') {
        return Boolean(draft.neuesEnddatum?.trim())
      }
      return false
    default:
      return false
  }
}
