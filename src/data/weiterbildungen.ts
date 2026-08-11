export type WeiterbildungHauptstatus =
  | 'Antrag'
  | 'Vereinbarung'
  | 'Ausbildung'
  | 'Abschluss'

export type AntragUnterstatus =
  | 'Entwurf'
  | 'In Überarbeitung'
  | 'Eingereicht'
  | 'Wieder eingereicht'
  | 'In Prüfung VG'
  | 'Zur Überarbeitung'
  | 'Antrag genehmigt'

export type VereinbarungUnterstatus =
  | 'Angebot erstellen'
  | 'Angebot zur Prüfung'
  | 'Angebot angenommen'

export type AusbildungUnterstatus =
  | 'Ausbildung gestartet'
  | 'Prüfung nicht bestanden'

export type AbschlussUnterstatus =
  | 'Ausbildung abgebrochen'
  | 'Antrag abgelehnt'
  | 'Angebot abgelehnt'
  | 'Ausbildung abgeschlossen'
  | 'Ausbildung bestanden'
  | 'Prüfung nicht bestanden'

export type WeiterbildungUnterstatus =
  | AntragUnterstatus
  | VereinbarungUnterstatus
  | AusbildungUnterstatus
  | AbschlussUnterstatus

export type AktuellBei = 'Mitarbeitender' | 'Vorgesetzter' | 'System'

export type StatusPair = {
  hauptstatus: WeiterbildungHauptstatus
  unterstatus: WeiterbildungUnterstatus
  aktuellBei: AktuellBei | null
}

/**
 * Single source of truth for valid Hauptstatus + Unterstatus combinations.
 * Used by Aktuell-bei lookup and demo seed generation.
 */
export const STATUS_CATALOG: readonly StatusPair[] = [
  { hauptstatus: 'Antrag', unterstatus: 'Entwurf', aktuellBei: null },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'In Überarbeitung',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'Eingereicht',
    aktuellBei: 'Vorgesetzter',
  },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'Wieder eingereicht',
    aktuellBei: 'System',
  },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'In Prüfung VG',
    aktuellBei: 'Vorgesetzter',
  },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'Zur Überarbeitung',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Antrag',
    unterstatus: 'Antrag genehmigt',
    aktuellBei: 'Vorgesetzter',
  },
  {
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot erstellen',
    aktuellBei: 'Vorgesetzter',
  },
  {
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot zur Prüfung',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot angenommen',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Ausbildung',
    unterstatus: 'Ausbildung gestartet',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Ausbildung',
    unterstatus: 'Prüfung nicht bestanden',
    aktuellBei: 'Mitarbeitender',
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Ausbildung abgebrochen',
    aktuellBei: null,
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Antrag abgelehnt',
    aktuellBei: null,
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Angebot abgelehnt',
    aktuellBei: null,
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Ausbildung abgeschlossen',
    aktuellBei: null,
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Ausbildung bestanden',
    aktuellBei: null,
  },
  {
    hauptstatus: 'Abschluss',
    unterstatus: 'Prüfung nicht bestanden',
    aktuellBei: null,
  },
] as const

const AKTUELL_BEI_MAP: Partial<
  Record<`${WeiterbildungHauptstatus}|${WeiterbildungUnterstatus}`, AktuellBei | null>
> = Object.fromEntries(
  STATUS_CATALOG.map((pair) => [
    `${pair.hauptstatus}|${pair.unterstatus}`,
    pair.aktuellBei,
  ]),
)

export function getAktuellBei(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): AktuellBei | null {
  return AKTUELL_BEI_MAP[`${hauptstatus}|${unterstatus}`] ?? null
}

export type Weiterbildung = {
  id: string
  employeeId: string
  hauptstatus: WeiterbildungHauptstatus
  unterstatus: WeiterbildungUnterstatus
  ausbildung: string
  anbieter: string
  von: string
  bis: string
  hasVertrag: boolean
}

export type VertragFilter = 'all' | 'with' | 'without'

export const HAUPTSTATUS_ORDER: Record<WeiterbildungHauptstatus, number> = {
  Antrag: 0,
  Vereinbarung: 1,
  Ausbildung: 2,
  Abschluss: 3,
}

/**
 * Highest main-status index that was actually reached.
 * For early Abschluss, skipped phases stay below this index.
 */
export function getLastReachedHauptstatusIndex(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): number {
  if (hauptstatus !== 'Abschluss') {
    return HAUPTSTATUS_ORDER[hauptstatus]
  }

  switch (unterstatus as AbschlussUnterstatus) {
    case 'Antrag abgelehnt':
      return HAUPTSTATUS_ORDER.Antrag
    case 'Angebot abgelehnt':
      return HAUPTSTATUS_ORDER.Vereinbarung
    case 'Ausbildung abgebrochen':
    case 'Ausbildung bestanden':
    case 'Ausbildung abgeschlossen':
    case 'Prüfung nicht bestanden':
      return HAUPTSTATUS_ORDER.Ausbildung
    default:
      return HAUPTSTATUS_ORDER.Ausbildung
  }
}

/** Whether a main process phase was reached (not skipped by early Abschluss). */
export function isHauptstatusReached(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
  phase: Exclude<WeiterbildungHauptstatus, 'Abschluss'>,
): boolean {
  return (
    getLastReachedHauptstatusIndex(hauptstatus, unterstatus) >=
    HAUPTSTATUS_ORDER[phase]
  )
}
