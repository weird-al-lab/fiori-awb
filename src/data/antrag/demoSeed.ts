import { EMPLOYEES, getEmployee } from '../employees'
import {
  getAktuellBei,
  HAUPTSTATUS_ORDER,
  STATUS_CATALOG,
  type StatusPair,
  type WeiterbildungHauptstatus,
  type WeiterbildungUnterstatus,
} from '../weiterbildungen'
import { VG_AKTUELL_BEI_LABEL } from './constants'
import { createAktivitaetEintrag } from './feed'
import { formatBeschaeftigungsgradOption } from './format'
import { createDefaultVereinbarung } from './kosten'
import { createDefaultAusbildungUpdate } from './phases'
import { createEmptyForm, replaceAllAntraege } from './service'
import type {
  AntragFormData,
  FeedEintrag,
  VereinbarungData,
  WeiterbildungAntrag,
} from './types'

export const DEMO_ANTRAEGE_VERSION = '4'
export const DEMO_ANTRAEGE_VERSION_KEY = 'awb-demo-antraege-version'

/** Fabian Fankhauser — full status showcase */
export const DEMO_SHOWCASE_EMPLOYEE_ID = 'emp-006'

const DEMO_COURSES = [
  {
    titel: 'CAS Digital Leadership',
    anbieter: 'Fachhochschule Nordwestschweiz',
    niveau: 'CAS',
    fachrichtung: 'Führung / Leadership',
  },
  {
    titel: 'CAS Daten und KI',
    anbieter: 'ETH Zürich Weiterbildung',
    niveau: 'CAS',
    fachrichtung: 'Daten / Digitalisierung / Künstliche Intelligenz',
  },
  {
    titel: 'Eidg. Fachausweis Projektmanagement',
    anbieter: 'SAQ Swiss Association for Quality',
    niveau: 'Eidg. Fachausweis (FA)',
    fachrichtung: 'Projektmanagement',
  },
  {
    titel: 'MAS Business Administration',
    anbieter: 'Universität St.Gallen',
    niveau: 'MAS',
    fachrichtung: 'Betriebswirtschaft',
  },
  {
    titel: 'Weiterbildung Kommunikation',
    anbieter: 'ZHAW School of Management and Law',
    niveau: 'Weiterbildung mit Zertifikat / Bestätigung',
    fachrichtung: 'Kommunikation / Marketing',
  },
] as const

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function hashEmployeeId(employeeId: string): number {
  let hash = 0
  for (let i = 0; i < employeeId.length; i += 1) {
    hash = (hash * 31 + employeeId.charCodeAt(i)) >>> 0
  }
  return hash || 1
}

function pickTwoStatusPairs(employeeId: string): [StatusPair, StatusPair] {
  const rand = mulberry32(hashEmployeeId(employeeId))
  const firstIndex = Math.floor(rand() * STATUS_CATALOG.length)
  let secondIndex = Math.floor(rand() * STATUS_CATALOG.length)
  if (secondIndex === firstIndex) {
    secondIndex = (secondIndex + 1) % STATUS_CATALOG.length
  }
  return [STATUS_CATALOG[firstIndex], STATUS_CATALOG[secondIndex]]
}

function resolveAktuellBeiLabel(
  employeeId: string,
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): string | null {
  const role = getAktuellBei(hauptstatus, unterstatus)
  if (role === 'Vorgesetzter') {
    return VG_AKTUELL_BEI_LABEL
  }
  if (role === 'Mitarbeitender') {
    return getEmployee(employeeId)?.name ?? null
  }
  if (role === 'System') {
    return 'System'
  }
  return null
}

function buildDemoForm(
  employeeId: string,
  courseIndex: number,
): AntragFormData {
  const employee = getEmployee(employeeId)
  const course = DEMO_COURSES[courseIndex % DEMO_COURSES.length]
  const form = createEmptyForm()
  form.vorbesprochen = 'ja'
  form.titel = course.titel
  form.anbieter = course.anbieter
  form.von = '01.09.2026'
  form.bis = '30.06.2027'
  form.niveau = course.niveau
  form.fachrichtung = course.fachrichtung
  form.stufe = employee?.stufe ?? 'FS07'
  form.pruefungszulassung = 'ja'
  form.bund50 = 'nein'
  form.kurskosten = '8500'
  form.zusaetzlicheKosten = '450'
  form.anzahlAusbildungstage = '24'
  form.wochentage = ['Freitag']
  form.beschaeftigungsgradAnpassen = 'nein'
  form.gewuenschterBeschaeftigungsgrad = formatBeschaeftigungsgradOption(
    employee?.beschaeftigungsgrad ?? 100,
    employee?.beschaeftigungsgrad ?? 100,
  )
  form.arbeitszeiterleichterung = 'nein'
  return form
}

function buildDemoVereinbarung(form: AntragFormData): VereinbarungData {
  return {
    ...createDefaultVereinbarung(form),
    akModus: 'prozentual',
    akProzent: 50,
    azeModus: 'keine',
    rueckzahlungVereinbaren: 'nein',
    zwingendeAusbildung: 'nein',
  }
}

function needsVereinbarung(hauptstatus: WeiterbildungHauptstatus): boolean {
  return HAUPTSTATUS_ORDER[hauptstatus] >= HAUPTSTATUS_ORDER.Vereinbarung
}

function needsAusbildungUpdate(
  hauptstatus: WeiterbildungHauptstatus,
  unterstatus: WeiterbildungUnterstatus,
): boolean {
  return (
    hauptstatus === 'Ausbildung' ||
    (hauptstatus === 'Abschluss' &&
      unterstatus !== 'Antrag abgelehnt' &&
      unterstatus !== 'Angebot abgelehnt')
  )
}

function minutesBefore(baseIso: string, minutesAgo: number): string {
  return new Date(Date.parse(baseIso) - minutesAgo * 60 * 1000).toISOString()
}

type DemoFeedStep = {
  titel: string
  text: string
  autorName: string
  icon: string
}

/**
 * Builds a chronological activity history that matches the live transition titles
 * in service.ts for the given Haupt-/Unterstatus.
 */
function buildDemoFeed(
  employeeId: string,
  pair: StatusPair,
  updatedAt: string,
): FeedEintrag[] {
  const employeeName = getEmployee(employeeId)?.name ?? 'Mitarbeitende/r'
  const vg = VG_AKTUELL_BEI_LABEL
  const steps: DemoFeedStep[] = []

  const pushEingereicht = () => {
    steps.push({
      titel: 'Antrag eingereicht',
      text: `Antrag für ${employeeName} wurde zur Prüfung eingereicht.`,
      autorName: employeeName,
      icon: 'paper-plane',
    })
  }

  const pushZurUeberarbeitung = () => {
    steps.push({
      titel: 'Zur Überarbeitung gesendet',
      text: `Antrag für ${employeeName} wurde zur Überarbeitung zurückgesendet.`,
      autorName: vg,
      icon: 'undo',
    })
  }

  const pushWiederEingereicht = () => {
    steps.push({
      titel: 'Antrag wieder eingereicht',
      text: `${employeeName} hat den überarbeiteten Antrag erneut eingereicht.`,
      autorName: employeeName,
      icon: 'paper-plane',
    })
  }

  const pushGenehmigt = () => {
    steps.push({
      titel: 'Antrag genehmigt',
      text: `Antrag für ${employeeName} wurde genehmigt. Angebot wird erstellt.`,
      autorName: vg,
      icon: 'accept',
    })
  }

  const pushAngebotGesendet = () => {
    steps.push({
      titel: 'Angebot an MA gesendet',
      text: `Angebot für ${employeeName} wurde zur Prüfung gesendet.`,
      autorName: vg,
      icon: 'paper-plane',
    })
  }

  const pushAngebotAngenommen = () => {
    steps.push({
      titel: 'Angebot angenommen',
      text: 'Das Angebot wurde vom Mitarbeitenden angenommen.',
      autorName: employeeName,
      icon: 'accept',
    })
  }

  const pushAusbildungGestartet = () => {
    steps.push({
      titel: 'Ausbildung gestartet',
      text: `Die Ausbildung für ${employeeName} wurde gestartet.`,
      autorName: employeeName,
      icon: 'activity-2',
    })
  }

  const pushHappyPathToAusbildung = () => {
    pushEingereicht()
    pushGenehmigt()
    pushAngebotGesendet()
    pushAngebotAngenommen()
    pushAusbildungGestartet()
  }

  switch (`${pair.hauptstatus}|${pair.unterstatus}`) {
    case 'Antrag|Entwurf':
      break

    case 'Antrag|Eingereicht':
    case 'Antrag|In Prüfung VG':
      pushEingereicht()
      break

    case 'Antrag|Zur Überarbeitung':
    case 'Antrag|In Überarbeitung':
      pushEingereicht()
      pushZurUeberarbeitung()
      break

    case 'Antrag|Wieder eingereicht':
      pushEingereicht()
      pushZurUeberarbeitung()
      pushWiederEingereicht()
      break

    case 'Antrag|Antrag genehmigt':
    case 'Vereinbarung|Angebot erstellen':
      pushEingereicht()
      pushGenehmigt()
      break

    case 'Vereinbarung|Angebot zur Prüfung':
      pushEingereicht()
      pushGenehmigt()
      pushAngebotGesendet()
      break

    case 'Vereinbarung|Angebot angenommen':
      pushEingereicht()
      pushGenehmigt()
      pushAngebotGesendet()
      pushAngebotAngenommen()
      break

    case 'Ausbildung|Ausbildung gestartet':
      pushHappyPathToAusbildung()
      break

    case 'Ausbildung|Prüfung nicht bestanden':
      pushHappyPathToAusbildung()
      steps.push({
        titel: 'Prüfung nicht bestanden',
        text: 'Die Prüfung wurde nicht bestanden und wird wiederholt. Neues Enddatum: 31.12.2027.',
        autorName: employeeName,
        icon: 'pending',
      })
      break

    case 'Abschluss|Antrag abgelehnt':
      pushEingereicht()
      steps.push({
        titel: 'Antrag abgelehnt',
        text: 'Der Antrag wurde vom Vorgesetzten abgelehnt.',
        autorName: vg,
        icon: 'decline',
      })
      break

    case 'Abschluss|Angebot abgelehnt':
      pushEingereicht()
      pushGenehmigt()
      pushAngebotGesendet()
      steps.push({
        titel: 'Angebot abgelehnt',
        text: 'Das Angebot wurde vom Mitarbeitenden abgelehnt.',
        autorName: employeeName,
        icon: 'decline',
      })
      break

    case 'Abschluss|Ausbildung abgebrochen':
      pushHappyPathToAusbildung()
      steps.push({
        titel: 'Ausbildung abgebrochen',
        text: 'Die Ausbildung wurde abgebrochen.',
        autorName: employeeName,
        icon: 'decline',
      })
      break

    case 'Abschluss|Ausbildung bestanden':
      pushHappyPathToAusbildung()
      steps.push({
        titel: 'Ausbildung bestanden',
        text: 'Die Ausbildung wurde als bestanden bestätigt.',
        autorName: employeeName,
        icon: 'accept',
      })
      break

    case 'Abschluss|Ausbildung abgeschlossen':
      pushHappyPathToAusbildung()
      steps.push({
        titel: 'Ausbildung abgeschlossen',
        text: 'Die Ausbildung wurde abgeschlossen.',
        autorName: employeeName,
        icon: 'accept',
      })
      break

    case 'Abschluss|Prüfung nicht bestanden':
      pushHappyPathToAusbildung()
      steps.push({
        titel: 'Prüfung nicht bestanden',
        text: 'Die Prüfung wurde nicht bestanden und wird nicht wiederholt.',
        autorName: employeeName,
        icon: 'decline',
      })
      break

    default:
      pushEingereicht()
      break
  }

  const feed: FeedEintrag[] = steps.map((step, index) =>
    createAktivitaetEintrag(
      step.titel,
      step.text,
      step.autorName,
      minutesBefore(updatedAt, (steps.length - 1 - index) * 30),
      step.icon,
    ),
  )

  if (
    pair.unterstatus === 'Zur Überarbeitung' ||
    pair.unterstatus === 'In Überarbeitung' ||
    pair.unterstatus === 'Wieder eingereicht'
  ) {
    const commentTime = minutesBefore(updatedAt, steps.length * 30 - 15)
    feed.push({
      id: `feed-demo-comment-${slug(pair.hauptstatus)}-${slug(pair.unterstatus)}`,
      typ: 'kommentar',
      text: 'Bitte Titel und Kostenangaben nochmals prüfen und konkretisieren.',
      autorName: vg,
      erstelltAm: commentTime,
    })
  }

  return feed
}

export function buildDemoAntrag(
  employeeId: string,
  pair: StatusPair,
  courseIndex: number,
  /** Hours before “now” for updatedAt — used so default last-change sort is stable */
  hoursAgo = 0,
): WeiterbildungAntrag {
  const updatedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
  const form = buildDemoForm(employeeId, courseIndex)
  const id = `demo-${employeeId}-${slug(pair.hauptstatus)}-${slug(pair.unterstatus)}`
  const hasVertrag =
    needsVereinbarung(pair.hauptstatus) &&
    pair.unterstatus !== 'Antrag abgelehnt'

  const antrag: WeiterbildungAntrag = {
    id,
    employeeId,
    hauptstatus: pair.hauptstatus,
    unterstatus: pair.unterstatus,
    ausbildung: form.titel,
    anbieter: form.anbieter,
    von: form.von,
    bis: form.bis,
    hasVertrag,
    form,
    dokumente: [],
    kommentareAktivitaeten: buildDemoFeed(employeeId, pair, updatedAt),
    aktuellBeiLabel: resolveAktuellBeiLabel(
      employeeId,
      pair.hauptstatus,
      pair.unterstatus,
    ),
    createdAt: updatedAt,
    updatedAt,
  }

  if (needsVereinbarung(pair.hauptstatus)) {
    antrag.vereinbarung = buildDemoVereinbarung(form)
  }

  if (needsAusbildungUpdate(pair.hauptstatus, pair.unterstatus)) {
    antrag.ausbildungUpdate = createDefaultAusbildungUpdate(antrag)
  }

  if (
    pair.unterstatus === 'Zur Überarbeitung' ||
    pair.unterstatus === 'In Überarbeitung'
  ) {
    antrag.ueberarbeitungKommentarVg =
      'Bitte Titel und Kostenangaben nochmals prüfen und konkretisieren.'
    antrag.formBaselineVorUeberarbeitung = { ...form, kommentar: '' }
    antrag.dokumenteBaselineVorUeberarbeitung = []
  }

  if (pair.unterstatus === 'Wieder eingereicht') {
    const baseline = { ...form, kommentar: '', titel: `${form.titel} (alt)` }
    antrag.formBaselineVorUeberarbeitung = baseline
    antrag.dokumenteBaselineVorUeberarbeitung = []
    antrag.ueberarbeitungKommentarVg =
      'Bitte Titel und Kostenangaben nochmals prüfen und konkretisieren.'
  }

  return antrag
}

export function buildAllDemoAntraege(): WeiterbildungAntrag[] {
  const antraege: WeiterbildungAntrag[] = []

  // Later catalog entries get more recent updatedAt (show near top when sorted by last change)
  for (const [index, pair] of STATUS_CATALOG.entries()) {
    const hoursAgo = STATUS_CATALOG.length - 1 - index
    antraege.push(
      buildDemoAntrag(DEMO_SHOWCASE_EMPLOYEE_ID, pair, index, hoursAgo),
    )
  }

  for (const employee of EMPLOYEES) {
    if (employee.id === DEMO_SHOWCASE_EMPLOYEE_ID) {
      continue
    }
    const [first, second] = pickTwoStatusPairs(employee.id)
    antraege.push(buildDemoAntrag(employee.id, first, 0, 48))
    antraege.push(buildDemoAntrag(employee.id, second, 1, 24))
  }

  return antraege
}

/** Seeds navigable demo Anträge into localStorage when the demo version changes. */
export function ensureDemoAntraege(): void {
  try {
    const current = localStorage.getItem(DEMO_ANTRAEGE_VERSION_KEY)
    if (current === DEMO_ANTRAEGE_VERSION) {
      return
    }
    replaceAllAntraege(buildAllDemoAntraege())
    localStorage.setItem(DEMO_ANTRAEGE_VERSION_KEY, DEMO_ANTRAEGE_VERSION)
  } catch {
    // Ignore storage failures in restricted environments
  }
}
