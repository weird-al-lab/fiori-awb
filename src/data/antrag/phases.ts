import { isHauptstatusReached } from '../weiterbildungen'
import type {
  AntragFormData,
  AusbildungUpdateDraft,
  FeedEintrag,
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

/** VG may open the wizard from these review statuses; editing moves the antrag to Entwurf. */
export function isVgAntragPruefungEditable(antrag: WeiterbildungAntrag): boolean {
  return (
    antrag.hauptstatus === 'Antrag' &&
    (antrag.unterstatus === 'In Prüfung VG' ||
      antrag.unterstatus === 'Wieder eingereicht')
  )
}

function antragWasSubmittedBefore(feed: FeedEintrag[]): boolean {
  return feed.some(
    (entry) =>
      entry.titel === 'Antrag eingereicht' ||
      entry.titel === 'Antrag wieder eingereicht',
  )
}

/** Entwurf after a prior MA submission — VG is editing, not first-time MA submit. */
export function isVgDraftResubmit(antrag: WeiterbildungAntrag): boolean {
  if (antrag.unterstatus !== 'Entwurf' || isMaUeberarbeitungPhase(antrag)) {
    return false
  }
  return antragWasSubmittedBefore(antrag.kommentareAktivitaeten ?? [])
}

const UEBERARBEITUNG_FORM_KEYS: (keyof AntragFormData)[] = [
  'vorbesprochen',
  'titel',
  'anbieter',
  'von',
  'bis',
  'niveau',
  'fachrichtung',
  'pruefungszulassung',
  'zulassungErklaerung',
  'bund50',
  'kurskosten',
  'zusaetzlicheKosten',
  'anzahlAusbildungstage',
  'wochentage',
  'schulzeitenBemerkungen',
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
  if (key === 'wochentage') {
    const a = [...baseline.wochentage].sort().join('\0')
    const b = [...current.wochentage].sort().join('\0')
    return a === b
  }
  return baseline[key] === current[key]
}

/** Changed form field keys since VG send-back; empty when not in Wieder eingereicht. */
export function getAntragAenderungen(antrag: WeiterbildungAntrag): Set<string> {
  const baseline = antrag.formBaselineVorUeberarbeitung
  if (!baseline || antrag.unterstatus !== 'Wieder eingereicht') {
    return new Set()
  }

  const changed = new Set<string>()
  for (const key of UEBERARBEITUNG_FORM_KEYS) {
    if (!formFieldEqual(baseline, antrag.form, key)) {
      changed.add(key)
    }
  }

  const baseDocIds = [...(antrag.dokumenteBaselineVorUeberarbeitung ?? [])].sort().join(
    '\0',
  )
  const currentDocIds = antrag.dokumente
    .map((doc) => doc.id)
    .sort()
    .join('\0')
  if (baseDocIds !== currentDocIds) {
    changed.add('dokumente')
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
