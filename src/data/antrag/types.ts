import type {
  Weiterbildung,
  WeiterbildungHauptstatus,
  WeiterbildungUnterstatus,
} from '../weiterbildungen'

export type FeedEintragTyp = 'kommentar' | 'aktivitaet'

export type FeedEintrag = {
  id: string
  typ: FeedEintragTyp
  text: string
  autorName: string
  erstelltAm: string
  titel?: string
  icon?: string
}

export type JaNein = 'ja' | 'nein' | ''
export type Pruefungszulassung = 'ja' | 'nein' | 'keine' | ''

export type AntragDokument = {
  id: string
  name: string
  mimeType: string
  size: number
  uploadedAt: string
}

export type AkModus = 'keine' | 'prozentual' | 'pauschal'
export type AzeModus = 'keine' | 'pauschal'
export type AkProzent = 25 | 50 | 75 | 100
export type RueckzahlungVereinbaren = 'ja' | 'nein'
export type ZwingendeAusbildung = 'ja' | 'nein'

export type VereinbarungData = {
  akModus: AkModus
  akProzent: AkProzent | null
  akPauschalBetrag: string
  azeModus: AzeModus
  azeTage: string
  sofortauszahlung: boolean
  auszahlungsMonat: string
  auszahlungsBetrag: string
  rueckzahlungVereinbaren: RueckzahlungVereinbaren
  vertragsbestimmungen: string
  zwingendeAusbildung: ZwingendeAusbildung | null
  begruendungZwingend: string
}

export type AntragFormData = {
  // Step 1 – Grunddaten
  vorbesprochen: JaNein
  titel: string
  anbieter: string
  von: string
  bis: string
  niveau: string
  fachrichtung: string
  stufe: string
  pruefungszulassung: Pruefungszulassung
  zulassungErklaerung: string
  // Step 2 – Kosten
  bund50: JaNein
  kurskosten: string
  zusaetzlicheKosten: string
  // Step 3 – Arbeitszeit / Pensum
  anzahlAusbildungstage: string
  wochentage: string[]
  schulzeitenBemerkungen: string
  beschaeftigungsgradAnpassen: JaNein
  gewuenschterBeschaeftigungsgrad: string
  arbeitszeiterleichterung: JaNein
  anzahlTageErleichterung: string
  begruendungErleichterung: string
  // Step 4 – Dokumente / Kommentare
  kommentar: string
}

export type AusbildungOutcome =
  | 'in_ausbildung'
  | 'pruefung_nicht_bestanden'
  | 'weitere_pruefung_nicht_bestanden'
  | 'ausbildung_bestanden'
  | 'abbruch'

export type AusbildungUpdateDraft = {
  outcome: AusbildungOutcome
  wiederholung?: JaNein
  neuesEnddatum?: string
}

export type WeiterbildungAntrag = {
  id: string
  employeeId: string
  hauptstatus: WeiterbildungHauptstatus
  unterstatus: WeiterbildungUnterstatus
  ausbildung: string
  anbieter: string
  von: string
  bis: string
  hasVertrag: boolean
  form: AntragFormData
  vereinbarung?: VereinbarungData
  ausbildungUpdate?: AusbildungUpdateDraft
  dokumente: AntragDokument[]
  kommentareAktivitaeten?: FeedEintrag[]
  /** VG comment from the latest send-back for MA revision banner */
  ueberarbeitungKommentarVg?: string | null
  /** Form snapshot when VG sent back for revision; used to highlight MA changes */
  formBaselineVorUeberarbeitung?: AntragFormData
  /** Document ids at send-back time */
  dokumenteBaselineVorUeberarbeitung?: string[]
  aktuellBeiLabel: string | null
  updatedAt: string
  createdAt: string
}

export type ListWeiterbildung = Weiterbildung & {
  isPersistedAntrag?: boolean
  aktuellBeiLabel?: string | null
  /** ISO timestamp — used for default table sort (last change) */
  updatedAt?: string
}

export type BeitragZeile = {
  label: string
  tage?: number
  ansatz?: number
  total: number
  indent?: boolean
}

export type VereinbarungKosten = {
  akBasis: number
  postAk: number
  maAk: number
  postAzeTage: number
  postAze: number
  maEingesetzteTage: number
  maEingesetzteBetrag: number
  maAbbauTage: number
  maAbbauBetrag: number
  postTotal: number
  maTotal: number
  gesamt: number
  vertragErforderlich: boolean
  postZeilen: BeitragZeile[]
  maZeilen: BeitragZeile[]
}
