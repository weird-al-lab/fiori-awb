import {
  MARKUS_METTLER_EMPLOYEE_ID,
  getEmployee,
} from './employees'
import { isAntragPruefungPhase } from './antrag/phases'
import {
  AUTO_OFFER_AK_PROZENT,
  ensureVereinbarung,
  resolveAutoOfferAze,
} from './antrag/kosten'
import {
  approveAntragAndCreateOffer,
  getAntrag,
  sendAngebotToMa,
  upsertAntrag,
} from './antrag/service'
import type { PrototypePersona } from './personas'
import type { WeiterbildungAntrag } from './antrag/types'

export const MA_INBOX_STORAGE_KEY = 'awb-ma-inbox'
export const MA_INBOX_CHANGED_EVENT = 'awb-ma-inbox-changed'

export type MaInboxItemStatus = 'offen' | 'erledigt'
export type InboxAssigneeRole = 'ma' | 'vg'

export type InboxTaskType =
  | 'antrag-pruefen'
  | 'angebot-erstellen'
  | 'angebot-pruefen'
  | 'antrag-ueberarbeiten'
  | 'hr-ticket'
  | 'spesen'
  | 'zeitabschluss'

export type MaInboxItem = {
  id: string
  type: InboxTaskType
  title: string
  source: string
  createdBy: string
  createdAt: string
  status: MaInboxItemStatus
  /** Case owner (Antrag employee). */
  employeeId: string | null
  /** Who must act on this task. */
  assigneeRole: InboxAssigneeRole
  antragId?: string
}

const SAMPLE_INBOX_TASK_IDS = new Set([
  'inbox-generic-zeitabschluss',
  'inbox-generic-hr-ticket',
  'inbox-generic-spesen',
])

const WEITERBILDUNG_TASK_TYPES = new Set<InboxTaskType>([
  'antrag-pruefen',
  'angebot-erstellen',
  'angebot-pruefen',
  'antrag-ueberarbeiten',
])

function isInboxTaskType(value: unknown): value is InboxTaskType {
  return (
    value === 'antrag-pruefen' ||
    value === 'angebot-erstellen' ||
    value === 'angebot-pruefen' ||
    value === 'antrag-ueberarbeiten' ||
    value === 'hr-ticket' ||
    value === 'spesen' ||
    value === 'zeitabschluss'
  )
}

function inferAssigneeRole(
  type: InboxTaskType,
  raw: Partial<MaInboxItem>,
): InboxAssigneeRole {
  if (raw.assigneeRole === 'ma' || raw.assigneeRole === 'vg') {
    return raw.assigneeRole
  }
  if (
    type === 'antrag-pruefen' ||
    type === 'angebot-erstellen'
  ) {
    return 'vg'
  }
  if (type === 'angebot-pruefen' || type === 'antrag-ueberarbeiten') {
    return 'ma'
  }
  return 'ma'
}

function normalizeItem(raw: Partial<MaInboxItem> & { id?: string }): MaInboxItem | null {
  if (!raw.id) {
    return null
  }
  const type: InboxTaskType = isInboxTaskType(raw.type)
    ? raw.type
    : raw.antragId
      ? 'angebot-pruefen'
      : 'hr-ticket'
  const assigneeRole = inferAssigneeRole(type, raw)
  return {
    id: raw.id,
    type,
    title: raw.title || (type === 'angebot-pruefen' ? 'Weiterbildungsangebot prüfen' : 'Aufgabe'),
    source: raw.source || (WEITERBILDUNG_TASK_TYPES.has(type) ? 'Aus- und Weiterbildung' : 'SAP'),
    createdBy: raw.createdBy || (type === 'angebot-pruefen' ? 'Nathalie Perrin' : 'System'),
    createdAt: raw.createdAt || new Date().toISOString(),
    status: raw.status === 'erledigt' ? 'erledigt' : 'offen',
    employeeId: raw.employeeId ?? null,
    assigneeRole,
    antragId: raw.antragId,
  }
}

function readAll(): MaInboxItem[] {
  try {
    const raw = localStorage.getItem(MA_INBOX_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .map((item) => normalizeItem(item as Partial<MaInboxItem>))
      .filter((item): item is MaInboxItem => item !== null)
  } catch {
    return []
  }
}

function writeAll(items: MaInboxItem[]): void {
  localStorage.setItem(MA_INBOX_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(MA_INBOX_CHANGED_EVENT))
}

export function subscribeMaInbox(onChange: () => void): () => void {
  const handler = () => onChange()
  window.addEventListener(MA_INBOX_CHANGED_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(MA_INBOX_CHANGED_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function clearMaInbox(): void {
  writeAll([])
}

/** Drops previously seeded sample tasks; keeps Weiterbildung tickets. */
export function removeSampleInboxTasks(): void {
  const all = readAll()
  const next = all.filter((item) => !SAMPLE_INBOX_TASK_IDS.has(item.id))
  if (next.length === all.length) {
    return
  }
  writeAll(next)
}

function isVisibleToPersona(item: MaInboxItem, persona: PrototypePersona): boolean {
  if (item.assigneeRole === 'vg') {
    if (persona.role !== 'Vorgesetzter') {
      return false
    }
    if (!item.employeeId) {
      return false
    }
    const employee = getEmployee(item.employeeId)
    return employee?.direkterVorgesetzter === persona.name
  }

  if (persona.role !== 'Mitarbeitender' || !persona.employeeId) {
    return false
  }
  return item.employeeId === persona.employeeId
}

export function listOpenInboxItemsForPersona(
  persona: PrototypePersona,
): MaInboxItem[] {
  return readAll()
    .filter((item) => item.status === 'offen')
    .filter((item) => isVisibleToPersona(item, persona))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** @deprecated Prefer listOpenInboxItemsForPersona */
export function listOpenInboxItems(employeeId?: string | null): MaInboxItem[] {
  return readAll()
    .filter((item) => item.status === 'offen')
    .filter((item) => {
      if (item.employeeId == null) {
        return true
      }
      return Boolean(employeeId) && item.employeeId === employeeId
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function countOpenInboxItemsForPersona(persona: PrototypePersona): number {
  return listOpenInboxItemsForPersona(persona).length
}

/** @deprecated Prefer countOpenInboxItemsForPersona */
export function countOpenInboxItems(employeeId?: string | null): number {
  return listOpenInboxItems(employeeId).length
}

export function getInboxItem(id: string): MaInboxItem | undefined {
  return readAll().find((item) => item.id === id)
}

export function isWeiterbildungInboxItem(
  item: MaInboxItem,
): item is MaInboxItem & { antragId: string; employeeId: string } {
  return WEITERBILDUNG_TASK_TYPES.has(item.type) && Boolean(item.antragId && item.employeeId)
}

/** @deprecated Prefer isWeiterbildungInboxItem */
export function isAngebotInboxItem(
  item: MaInboxItem,
): item is MaInboxItem & { antragId: string } {
  return item.type === 'angebot-pruefen' && Boolean(item.antragId)
}

export function inboxItemVisibleToPersona(
  item: MaInboxItem,
  persona: PrototypePersona,
): boolean {
  return isVisibleToPersona(item, persona)
}

type ExpectedInboxTask = Pick<
  MaInboxItem,
  'type' | 'assigneeRole' | 'employeeId' | 'title' | 'createdBy'
>

function resolveExpectedInboxTask(antrag: WeiterbildungAntrag): ExpectedInboxTask | null {
  const employee = getEmployee(antrag.employeeId)
  const caseTitle = antrag.ausbildung || antrag.form.titel || 'Weiterbildung'

  switch (antrag.unterstatus) {
    case 'In Prüfung VG':
    case 'Eingereicht':
    case 'Wieder eingereicht':
      if (antrag.employeeId === MARKUS_METTLER_EMPLOYEE_ID) {
        return {
          type: 'angebot-pruefen',
          assigneeRole: 'ma',
          employeeId: antrag.employeeId,
          title: caseTitle,
          createdBy: employee?.direkterVorgesetzter || 'Nathalie Perrin',
        }
      }
      return {
        type: 'antrag-pruefen',
        assigneeRole: 'vg',
        employeeId: antrag.employeeId,
        title: caseTitle,
        createdBy: employee?.name || 'Mitarbeitende/r',
      }
    case 'Angebot erstellen':
      return {
        type: 'angebot-erstellen',
        assigneeRole: 'vg',
        employeeId: antrag.employeeId,
        title: caseTitle,
        createdBy: employee?.name || 'Mitarbeitende/r',
      }
    case 'Angebot zur Prüfung':
      return {
        type: 'angebot-pruefen',
        assigneeRole: 'ma',
        employeeId: antrag.employeeId,
        title: caseTitle,
        createdBy: employee?.direkterVorgesetzter || 'Markus Mettler',
      }
    case 'Zur Überarbeitung':
    case 'In Überarbeitung':
      return {
        type: 'antrag-ueberarbeiten',
        assigneeRole: 'ma',
        employeeId: antrag.employeeId,
        title: caseTitle,
        createdBy: employee?.direkterVorgesetzter || 'Markus Mettler',
      }
    default:
      return null
  }
}

/** Keep one open inbox task in sync with the Antrag's current responsibility. */
export function syncInboxForAntrag(antrag: WeiterbildungAntrag): void {
  const expected = resolveExpectedInboxTask(antrag)
  const all = readAll()
  const openForAntrag = all.filter(
    (item) => item.antragId === antrag.id && item.status === 'offen',
  )

  if (!expected) {
    if (openForAntrag.length === 0) {
      return
    }
    writeAll(
      all.map((item) =>
        item.antragId === antrag.id && item.status === 'offen'
          ? { ...item, status: 'erledigt' as const }
          : item,
      ),
    )
    return
  }

  const existingMatch = openForAntrag.find(
    (item) =>
      item.type === expected.type && item.assigneeRole === expected.assigneeRole,
  )

  if (existingMatch) {
    const updated = all.map((item) => {
      if (item.id === existingMatch.id) {
        return {
          ...item,
          ...expected,
          source: 'Aus- und Weiterbildung',
          status: 'offen' as const,
          antragId: antrag.id,
        }
      }
      if (item.antragId === antrag.id && item.status === 'offen') {
        return { ...item, status: 'erledigt' as const }
      }
      return item
    })
    writeAll(updated)
    return
  }

  const closed = all.map((item) =>
    item.antragId === antrag.id && item.status === 'offen'
      ? { ...item, status: 'erledigt' as const }
      : item,
  )
  const item: MaInboxItem = {
    id: `inbox-${crypto.randomUUID()}`,
    ...expected,
    source: 'Aus- und Weiterbildung',
    createdAt: new Date().toISOString(),
    status: 'offen',
    antragId: antrag.id,
  }
  writeAll([...closed, item])
}

export function markInboxItemErledigt(id: string): void {
  writeAll(
    readAll().map((item) =>
      item.id === id ? { ...item, status: 'erledigt' } : item,
    ),
  )
}

export function completeInboxItemsForAntrag(antragId: string): void {
  let changed = false
  const next = readAll().map((item) => {
    if (item.antragId === antragId && item.status === 'offen') {
      changed = true
      return { ...item, status: 'erledigt' as const }
    }
    return item
  })
  if (changed) {
    writeAll(next)
  }
}

export function removeInboxItemsForAntrag(antragId: string): void {
  writeAll(readAll().filter((item) => item.antragId !== antragId))
}

function resolveInboxVgName(antrag: WeiterbildungAntrag): string {
  return getEmployee(antrag.employeeId)?.direkterVorgesetzter || 'Nathalie Perrin'
}

/**
 * Prototype skip: VG Prüfung + auto Angebot (50 % AK, AZE min 50 % of MA request) + send to MA.
 * Does not complete the inbox task — sync runs again on upsert.
 */
export function materializeInboxAngebot(
  taskId: string,
): WeiterbildungAntrag | undefined {
  const item = getInboxItem(taskId)
  if (!item?.antragId) {
    return undefined
  }

  const antrag = getAntrag(item.antragId)
  if (!antrag) {
    markInboxItemErledigt(taskId)
    return undefined
  }

  if (antrag.unterstatus === 'Angebot zur Prüfung') {
    return antrag
  }

  const vgName = resolveInboxVgName(antrag)
  const aze = resolveAutoOfferAze(antrag)
  let next = antrag

  const applyAutoOffer = (current: WeiterbildungAntrag): WeiterbildungAntrag => {
    const vereinbarung = ensureVereinbarung(current)
    return upsertAntrag({
      ...current,
      vereinbarung: {
        ...vereinbarung,
        akModus: 'prozentual',
        akProzent: AUTO_OFFER_AK_PROZENT,
        ...aze,
      },
    })
  }

  if (isAntragPruefungPhase(next)) {
    next = approveAntragAndCreateOffer(next, vgName)
    next = applyAutoOffer(next)
    next = sendAngebotToMa(next, vgName)
  } else if (next.unterstatus === 'Angebot erstellen') {
    next = applyAutoOffer(next)
    next = sendAngebotToMa(next, vgName)
  }

  return next
}

export function inboxTaskStatusLabel(type: InboxTaskType): string {
  switch (type) {
    case 'antrag-pruefen':
      return 'Antrag in Prüfung'
    case 'angebot-erstellen':
      return 'Angebot erstellen'
    case 'angebot-pruefen':
      return 'Angebot zur Prüfung'
    case 'antrag-ueberarbeiten':
      return 'Zur Überarbeitung'
    default:
      return 'Offen'
  }
}
