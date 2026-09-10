import { getEmployee } from '../employees'
import { getAktuellBei, type VertragFilter } from '../weiterbildungen'
import {
  ANTRAEGE_STORAGE_KEY,
  CURRENT_USER_NAME,
  VERTRAG_SCHWELLENWERT_CHF,
  VG_AKTUELL_BEI_LABEL,
} from './constants'
import {
  createAktivitaetEintrag,
  createKommentarEintrag,
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
  hasAntragAenderungen,
} from './phases'
import type {
  AntragFormData,
  AusbildungUpdateDraft,
  ListWeiterbildung,
  WeiterbildungAntrag,
} from './types'

export function createEmptyForm(): AntragFormData {
  return {
    titel: '',
    anbieter: '',
    von: '',
    bis: '',
    niveau: '',
    fachrichtung: '',
    stufe: '',
    bund50: '',
    kurskosten: '',
    zusaetzlicheKosten: '',
    beschaeftigungsgradAnpassen: '',
    gewuenschterBeschaeftigungsgrad: '',
    arbeitszeiterleichterung: '',
    anzahlTageErleichterung: '',
    begruendungErleichterung: '',
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
    aktuellBeiLabel: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Marks an in-review antrag as being edited by VG; MA-visible status stays in review. */
export function beginVgAntragEdit(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  if (!isVgAntragPruefungEditable(antrag)) {
    return antrag
  }
  return upsertAntrag({
    ...antrag,
    vgBearbeitungAktiv: true,
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    // Snapshot current values so Speichern can log / highlight what VG changed.
    formBaselineVorUeberarbeitung:
      antrag.formBaselineVorUeberarbeitung ?? snapshotFormForBaseline(antrag.form),
    ueberarbeitungKommentarVg: null,
  })
}

/** Aborts VG in-review editing; discards unsaved form changes on the client. */
export function cancelVgAntragEdit(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  if (!antrag.vgBearbeitungAktiv) {
    return antrag
  }
  return upsertAntrag({
    ...antrag,
    vgBearbeitungAktiv: false,
    // Drop a baseline that only existed for this VG edit session.
    formBaselineVorUeberarbeitung:
      antrag.unterstatus === 'Wieder eingereicht'
        ? antrag.formBaselineVorUeberarbeitung
        : undefined,
  })
}

function snapshotFormForBaseline(form: AntragFormData): AntragFormData {
  return { ...form }
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
    unterstatus: inRevision
      ? 'In Überarbeitung'
      : vgDraft
        ? antrag.unterstatus
        : 'Entwurf',
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
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

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
    kommentareAktivitaeten: feed,
    hauptstatus: 'Vereinbarung',
    unterstatus: 'Angebot erstellen',
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    vereinbarung: antrag.vereinbarung ?? createDefaultVereinbarung(antrag.form),
    formBaselineVorUeberarbeitung: undefined,
  })
}

export function sendAngebotToMa(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

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
  const acceptedAt = new Date()
  const startedAt = new Date(acceptedAt.getTime() + 1000)
  const employee = getEmployee(antrag.employeeId)
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

  if (!feed.some((entry) => entry.titel === 'Angebot angenommen')) {
    feed.push(
      createAktivitaetEintrag(
        'Angebot angenommen',
        'Das Angebot wurde vom Mitarbeitenden angenommen.',
        autorName,
        acceptedAt.toISOString(),
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
        startedAt.toISOString(),
        'activity-2',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
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
  kommentarOverride?: string,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const employee = getEmployee(antrag.employeeId)
  const kommentarText = (kommentarOverride ?? '').trim()
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

  if (kommentarText) {
    feed.push(createKommentarEintrag(kommentarText, autorName, now))
  }

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

  const baseline = snapshotFormForBaseline(antrag.form)

  return upsertAntrag({
    ...antrag,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Antrag',
    unterstatus: 'Zur Überarbeitung',
    aktuellBeiLabel: employee?.name ?? null,
    ueberarbeitungKommentarVg: kommentarText || null,
    formBaselineVorUeberarbeitung: baseline,
  })
}

export function rejectAntragByVg(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

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
    kommentareAktivitaeten: feed,
    hauptstatus: 'Abschluss',
    unterstatus: 'Antrag abgelehnt',
    aktuellBeiLabel: null,
    formBaselineVorUeberarbeitung: undefined,
  })
}

export function rejectAngebotByMa(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

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
  const feed = [...(normalized.kommentareAktivitaeten ?? [])]

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
  } else {
    const editIteration =
      feed.filter((entry) => entry.titel === 'Antrag durch Führungsperson geändert')
        .length + 1
    const editSuffix =
      editIteration > 1 ? ` (${editIteration}. Anpassung)` : ''
    const hasChanges = hasAntragAenderungen(antrag)

    feed.push(
      createAktivitaetEintrag(
        'Antrag durch Führungsperson geändert',
        hasChanges
          ? employee
            ? `${autorName} hat den eingereichten Antrag für ${employee.name} geändert${editSuffix}.`
            : `${autorName} hat den eingereichten Antrag geändert${editSuffix}.`
          : employee
            ? `${autorName} hat den Antrag für ${employee.name} gespeichert${editSuffix}.`
            : `${autorName} hat den Antrag gespeichert${editSuffix}.`,
        autorName,
        now,
        'edit',
      ),
    )
  }

  return upsertAntrag({
    ...antrag,
    kommentareAktivitaeten: feed,
    hauptstatus: 'Antrag',
    unterstatus: isVgResubmit
      ? antrag.unterstatus
      : isResubmit
        ? 'Wieder eingereicht'
        : 'In Prüfung VG',
    aktuellBeiLabel: VG_AKTUELL_BEI_LABEL,
    vgBearbeitungAktiv: false,
    formBaselineVorUeberarbeitung: antrag.formBaselineVorUeberarbeitung,
    ueberarbeitungKommentarVg: null,
  })
}

export function deleteAntrag(id: string): void {
  const all = readAll().filter((item) => item.id !== id)
  writeAll(all)
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
