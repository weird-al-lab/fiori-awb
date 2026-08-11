import { getEmployee } from '../employees'
import { getAktuellBei, type VertragFilter } from '../weiterbildungen'
import {
  ANTRAEGE_STORAGE_KEY,
  CURRENT_USER_NAME,
  VERTRAG_SCHWELLENWERT_CHF,
  VG_AKTUELL_BEI_LABEL,
} from './constants'
import { deleteDokumentBlob } from './dokumente'
import {
  consumeFormKommentar,
  createAktivitaetEintrag,
  normalizeAntragFeed,
} from './feed'
import { formatBeschaeftigungsgradOption } from './format'
import {
  createDefaultVereinbarung,
  ensureVereinbarung,
  getVereinbarungKosten,
} from './kosten'
import {
  canConfirmAusbildungUpdate,
  ensureAusbildungUpdate,
  isMaUeberarbeitungPhase,
  isVgAntragPruefungEditable,
  isVgDraftResubmit,
} from './phases'
import type {
  AntragFormData,
  AusbildungUpdateDraft,
  ListWeiterbildung,
  WeiterbildungAntrag,
} from './types'

export function createEmptyForm(): AntragFormData {
  return {
    vorbesprochen: '',
    titel: '',
    anbieter: '',
    von: '',
    bis: '',
    niveau: '',
    fachrichtung: '',
    stufe: '',
    pruefungszulassung: '',
    zulassungErklaerung: '',
    bund50: '',
    kurskosten: '',
    zusaetzlicheKosten: '',
    anzahlAusbildungstage: '',
    wochentage: [],
    schulzeitenBemerkungen: '',
    beschaeftigungsgradAnpassen: '',
    gewuenschterBeschaeftigungsgrad: '',
    arbeitszeiterleichterung: '',
    anzahlTageErleichterung: '',
    begruendungErleichterung: '',
    kommentar: '',
  }
}

export function createNewAntrag(employeeId: string): WeiterbildungAntrag {
  const now = new Date().toISOString()
  const employee = getEmployee(employeeId)
  const form = createEmptyForm()
  if (employee) {
    form.gewuenschterBeschaeftigungsgrad = formatBeschaeftigungsgradOption(
      employee.beschaeftigungsgrad,
      employee.beschaeftigungsgrad,
    )
  }
  return {
    id: `antrag-${crypto.randomUUID()}`,
    employeeId,
    hauptstatus: 'Antrag',
    unterstatus: 'Entwurf',
    ausbildung: '',
    anbieter: '',
    von: '',
    bis: '',
    hasVertrag: false,
    form,
    dokumente: [],
    aktuellBeiLabel: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Pulls an in-review antrag into Entwurf when VG starts editing. */
export function beginVgAntragEdit(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  if (!isVgAntragPruefungEditable(antrag)) {
    return antrag
  }
  return upsertAntrag({
    ...antrag,
    hauptstatus: 'Antrag',
    unterstatus: 'Entwurf',
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    formBaselineVorUeberarbeitung: undefined,
    dokumenteBaselineVorUeberarbeitung: undefined,
    ueberarbeitungKommentarVg: null,
  })
}

function snapshotFormForBaseline(form: AntragFormData): AntragFormData {
  return {
    ...form,
    kommentar: '',
    wochentage: [...form.wochentage],
  }
}

function syncHasVertrag(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  if (!antrag.vereinbarung) {
    return antrag
  }
  const employee = getEmployee(antrag.employeeId)
  const kosten = getVereinbarungKosten(
    antrag.form,
    antrag.vereinbarung,
    employee?.tagessatz ?? 0,
  )
  return {
    ...antrag,
    hasVertrag:
      kosten.postAk > VERTRAG_SCHWELLENWERT_CHF ||
      antrag.vereinbarung.rueckzahlungVereinbaren === 'ja',
  }
}

function syncListFields(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  const { form } = antrag
  return {
    ...antrag,
    ausbildung: form.titel.trim() || 'Ohne Titel',
    anbieter: form.anbieter.trim(),
    von: form.von,
    bis: form.bis,
  }
}

function readAll(): WeiterbildungAntrag[] {
  try {
    const raw = localStorage.getItem(ANTRAEGE_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as WeiterbildungAntrag[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(antraege: WeiterbildungAntrag[]): void {
  localStorage.setItem(ANTRAEGE_STORAGE_KEY, JSON.stringify(antraege))
  window.dispatchEvent(new CustomEvent('awb-antraege-changed'))
}

/** Replaces the entire Anträge store (used by demo seed reset). */
export function replaceAllAntraege(antraege: WeiterbildungAntrag[]): void {
  writeAll(antraege)
}

export function listAntraege(employeeId?: string): WeiterbildungAntrag[] {
  const all = readAll()
  if (!employeeId) {
    return all
  }
  return all.filter((item) => item.employeeId === employeeId)
}

export function getAntrag(id: string): WeiterbildungAntrag | undefined {
  const antrag = readAll().find((item) => item.id === id)
  return antrag ? normalizeAntragFeed(antrag) : undefined
}

export function upsertAntrag(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  const synced = syncHasVertrag(
    syncListFields({
      ...antrag,
      updatedAt: new Date().toISOString(),
    }),
  )
  const all = readAll()
  const index = all.findIndex((item) => item.id === synced.id)
  if (index >= 0) {
    all[index] = synced
  } else {
    all.push(synced)
  }
  writeAll(all)
  return synced
}

export function saveDraft(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  const inRevision = isMaUeberarbeitungPhase(antrag)
  const vgDraft = isVgDraftResubmit(antrag)
  const employee = getEmployee(antrag.employeeId)
  return upsertAntrag({
    ...antrag,
    hauptstatus: 'Antrag',
    unterstatus: inRevision ? 'In Überarbeitung' : 'Entwurf',
    aktuellBeiLabel: inRevision
      ? (employee?.name ?? null)
      : vgDraft
        ? VG_AKTUELL_BEI_LABEL
        : null,
  })
}

export function approveAntragAndCreateOffer(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  if (!feed.some((entry) => entry.titel === 'Antrag genehmigt')) {
    feed.push(
      createAktivitaetEintrag(
        'Antrag genehmigt',
        employee
          ? `Antrag für ${employee.name} wurde genehmigt. Angebot wird erstellt.`
          : 'Antrag wurde genehmigt. Angebot wird erstellt.',
        autorName,
        now,
        'accept',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot erstellen',
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    vereinbarung: antrag.vereinbarung ?? createDefaultVereinbarung(antrag.form),
    formBaselineVorUeberarbeitung: undefined,
    dokumenteBaselineVorUeberarbeitung: undefined,
  })
}

export function sendAngebotToMa(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  if (!feed.some((entry) => entry.titel === 'Angebot an MA gesendet')) {
    feed.push(
      createAktivitaetEintrag(
        'Angebot an MA gesendet',
        employee
          ? `Angebot für ${employee.name} wurde zur Prüfung gesendet.`
          : 'Angebot wurde zur Prüfung gesendet.',
        autorName,
        now,
        'paper-plane',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot zur Prüfung',
    aktuellBeiLabel: employee?.name ?? null,
    vereinbarung: ensureVereinbarung(antrag),
  })
}

export function acceptAngebotByMa(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  if (!feed.some((entry) => entry.titel === 'Angebot angenommen')) {
    feed.push(
      createAktivitaetEintrag(
        'Angebot angenommen',
        'Das Angebot wurde vom Mitarbeitenden angenommen.',
        autorName,
        now,
        'accept',
      ),
    )
  }

  if (!feed.some((entry) => entry.titel === 'Ausbildung gestartet')) {
    feed.push(
      createAktivitaetEintrag(
        'Ausbildung gestartet',
        employee
          ? `Die Ausbildung für ${employee.name} wurde gestartet.`
          : 'Die Ausbildung wurde gestartet.',
        autorName,
        now,
        'activity-2',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Ausbildung',
    unterstatus: 'Ausbildung gestartet',
    aktuellBeiLabel: employee?.name ?? null,
    vereinbarung: ensureVereinbarung(antrag),
    ausbildungUpdate: {
      outcome: 'in_ausbildung',
      wiederholung: '',
      neuesEnddatum: '',
    },
  })
}

export function sendAntragToUeberarbeitung(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  const kommentarText = antrag.form.kommentar.trim()
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  const sendBackIteration =
    feed.filter((entry) => entry.titel === 'Zur Überarbeitung gesendet').length + 1
  const sendBackSuffix =
    sendBackIteration > 1 ? ` (${sendBackIteration}. Rücksendung)` : ''

  feed.push(
    createAktivitaetEintrag(
      'Zur Überarbeitung gesendet',
      employee
        ? `Antrag für ${employee.name} wurde zur Überarbeitung zurückgesendet${sendBackSuffix}.`
        : `Antrag wurde zur Überarbeitung zurückgesendet${sendBackSuffix}.`,
      autorName,
      now,
      'undo',
    ),
  )

  const baseline = snapshotFormForBaseline(form)

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Antrag',
    unterstatus: 'Zur Überarbeitung',
    aktuellBeiLabel: employee?.name ?? null,
    ueberarbeitungKommentarVg: kommentarText || null,
    formBaselineVorUeberarbeitung: baseline,
    dokumenteBaselineVorUeberarbeitung: antrag.dokumente.map((doc) => doc.id),
  })
}

export function rejectAntragByVg(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  feed.push(
    createAktivitaetEintrag(
      'Antrag abgelehnt',
      'Der Antrag wurde vom Vorgesetzten abgelehnt.',
      autorName,
      now,
      'decline',
    ),
  )

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Abschluss',
    unterstatus: 'Antrag abgelehnt',
    aktuellBeiLabel: null,
    formBaselineVorUeberarbeitung: undefined,
    dokumenteBaselineVorUeberarbeitung: undefined,
  })
}

export function rejectAngebotByMa(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  feed.push(
    createAktivitaetEintrag(
      'Angebot abgelehnt',
      'Das Angebot wurde vom Mitarbeitenden abgelehnt.',
      autorName,
      now,
      'decline',
    ),
  )

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Abschluss',
    unterstatus: 'Angebot abgelehnt',
    aktuellBeiLabel: null,
    vereinbarung: ensureVereinbarung(antrag),
  })
}

export function saveAusbildungDraft(
  antrag: WeiterbildungAntrag,
  draft: AusbildungUpdateDraft,
): WeiterbildungAntrag {
  const nextEnddatum = draft.neuesEnddatum?.trim()
  const shouldUpdateEndDate =
    draft.outcome === 'in_ausbildung' &&
    Boolean(nextEnddatum) &&
    nextEnddatum !== (antrag.bis || antrag.form.bis)

  return upsertAntrag({
    ...antrag,
    ...(shouldUpdateEndDate
      ? { form: { ...antrag.form, bis: nextEnddatum! } }
      : {}),
    ausbildungUpdate: draft,
  })
}

export function confirmAusbildungUpdate(
  antrag: WeiterbildungAntrag,
  draft: AusbildungUpdateDraft = ensureAusbildungUpdate(antrag),
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  if (!canConfirmAusbildungUpdate(antrag, draft)) {
    return antrag
  }

  const normalized = normalizeAntragFeed(antrag)
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)

  let hauptstatus = antrag.hauptstatus
  let unterstatus = antrag.unterstatus
  let form = antrag.form
  let aktuellBeiLabel: string | null = employee?.name ?? null

  if (draft.outcome === 'ausbildung_bestanden') {
    hauptstatus = 'Abschluss'
    unterstatus = 'Ausbildung bestanden'
    aktuellBeiLabel = null
    feed.push(
      createAktivitaetEintrag(
        'Ausbildung bestanden',
        'Die Ausbildung wurde als bestanden bestätigt.',
        autorName,
        now,
        'accept',
      ),
    )
  } else if (draft.outcome === 'abbruch') {
    hauptstatus = 'Abschluss'
    unterstatus = 'Ausbildung abgebrochen'
    aktuellBeiLabel = null
    feed.push(
      createAktivitaetEintrag(
        'Ausbildung abgebrochen',
        'Die Ausbildung wurde abgebrochen.',
        autorName,
        now,
        'decline',
      ),
    )
  } else if (draft.outcome === 'weitere_pruefung_nicht_bestanden') {
    hauptstatus = 'Abschluss'
    unterstatus = 'Prüfung nicht bestanden'
    aktuellBeiLabel = null
    feed.push(
      createAktivitaetEintrag(
        'Prüfung nicht bestanden',
        'Eine weitere Prüfung wurde nicht bestanden. Der Fall wird abgeschlossen.',
        autorName,
        now,
        'decline',
      ),
    )
  } else if (draft.outcome === 'pruefung_nicht_bestanden' && draft.wiederholung === 'nein') {
    hauptstatus = 'Abschluss'
    unterstatus = 'Prüfung nicht bestanden'
    aktuellBeiLabel = null
    feed.push(
      createAktivitaetEintrag(
        'Prüfung nicht bestanden',
        'Die Prüfung wurde nicht bestanden und wird nicht wiederholt.',
        autorName,
        now,
        'decline',
      ),
    )
  } else if (
    draft.outcome === 'pruefung_nicht_bestanden' &&
    draft.wiederholung === 'ja' &&
    draft.neuesEnddatum?.trim()
  ) {
    hauptstatus = 'Ausbildung'
    unterstatus = 'Prüfung nicht bestanden'
    form = { ...form, bis: draft.neuesEnddatum.trim() }
    aktuellBeiLabel = employee?.name ?? null
    feed.push(
      createAktivitaetEintrag(
        'Prüfung nicht bestanden',
        `Die Prüfung wurde nicht bestanden und wird wiederholt. Neues Enddatum: ${draft.neuesEnddatum.trim()}.`,
        autorName,
        now,
        'pending',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus,
    unterstatus,
    aktuellBeiLabel,
    ausbildungUpdate:
      hauptstatus === 'Ausbildung'
        ? {
            outcome: 'pruefung_nicht_bestanden',
            wiederholung: '',
            neuesEnddatum: '',
          }
        : undefined,
  })
}

export function submitAntrag(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  const isResubmit = isMaUeberarbeitungPhase(antrag)
  const isVgResubmit = isVgDraftResubmit(antrag)
  let feed = [...(normalized.kommentareAktivitaeten ?? [])]
  let form = antrag.form

  ;({ feed, form } = consumeFormKommentar(antrag, feed, autorName, now))

  if (!isVgResubmit) {
    const aktivitaetTitel = isResubmit ? 'Antrag wieder eingereicht' : 'Antrag eingereicht'
    const shouldAddAktivitaet =
      isResubmit || !feed.some((entry) => entry.titel === aktivitaetTitel)

    if (shouldAddAktivitaet) {
      const resubmitIteration = isResubmit
        ? feed.filter((entry) => entry.titel === 'Antrag wieder eingereicht').length + 1
        : 0
      const resubmitSuffix =
        resubmitIteration > 1 ? ` (${resubmitIteration}. Überarbeitung)` : ''

      feed.push(
        createAktivitaetEintrag(
          aktivitaetTitel,
          isResubmit
            ? employee
              ? `${employee.name} hat den überarbeiteten Antrag erneut eingereicht${resubmitSuffix}.`
              : `Der überarbeitete Antrag wurde erneut eingereicht${resubmitSuffix}.`
            : employee
              ? `Antrag für ${employee.name} wurde zur Prüfung eingereicht.`
              : 'Antrag wurde zur Prüfung eingereicht.',
          autorName,
          now,
          'paper-plane',
        ),
      )
    }
  }

  return upsertAntrag({
    ...antrag,
    form,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Antrag',
    unterstatus: isResubmit ? 'Wieder eingereicht' : 'In Prüfung VG',
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    formBaselineVorUeberarbeitung: isVgResubmit
      ? undefined
      : antrag.formBaselineVorUeberarbeitung,
    dokumenteBaselineVorUeberarbeitung: isVgResubmit
      ? undefined
      : antrag.dokumenteBaselineVorUeberarbeitung,
    ueberarbeitungKommentarVg: null,
  })
}

export function deleteAntrag(id: string): void {
  const existing = getAntrag(id)
  const all = readAll().filter((item) => item.id !== id)
  writeAll(all)
  if (existing) {
    void Promise.all(existing.dokumente.map((doc) => deleteDokumentBlob(doc.id)))
  }
}

export function isPersistedAntragId(id: string): boolean {
  return Boolean(getAntrag(id))
}

export function antragToListItem(antrag: WeiterbildungAntrag): ListWeiterbildung {
  return {
    id: antrag.id,
    employeeId: antrag.employeeId,
    hauptstatus: antrag.hauptstatus,
    unterstatus: antrag.unterstatus,
    ausbildung: antrag.ausbildung,
    anbieter: antrag.anbieter,
    von: antrag.von,
    bis: antrag.bis,
    hasVertrag: antrag.hasVertrag,
    isPersistedAntrag: true,
    aktuellBeiLabel: antrag.aktuellBeiLabel,
    updatedAt: antrag.updatedAt,
  }
}

export function getMergedWeiterbildungenByEmployee(
  employeeId: string,
  options?: { vertrag?: VertragFilter; search?: string },
): ListWeiterbildung[] {
  const vertrag = options?.vertrag ?? 'all'
  const search = options?.search?.trim().toLowerCase() ?? ''

  return listAntraege(employeeId)
    .map(antragToListItem)
    .filter((item) => {
      if (vertrag === 'with' && !item.hasVertrag) {
        return false
      }
      if (vertrag === 'without' && item.hasVertrag) {
        return false
      }
      if (search && !item.ausbildung.toLowerCase().includes(search)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0
      return bTime - aTime
    })
}

export function getAktuellBeiDisplay(item: ListWeiterbildung): string {
  if (item.aktuellBeiLabel) {
    return item.aktuellBeiLabel
  }
  return getAktuellBei(item.hauptstatus, item.unterstatus) ?? ''
}
