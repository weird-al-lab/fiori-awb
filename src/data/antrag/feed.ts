import { getEmployee } from '../employees'
import { CURRENT_USER_NAME } from './constants'
import type { FeedEintrag, WeiterbildungAntrag } from './types'

export function createKommentarEintrag(
  text: string,
  autorName: string,
  erstelltAm = new Date().toISOString(),
): FeedEintrag {
  return {
    id: `feed-${crypto.randomUUID()}`,
    typ: 'kommentar',
    text,
    autorName,
    erstelltAm,
  }
}

export function createAktivitaetEintrag(
  titel: string,
  text: string,
  autorName: string,
  erstelltAm = new Date().toISOString(),
  icon = 'activity-2',
): FeedEintrag {
  return {
    id: `feed-${crypto.randomUUID()}`,
    typ: 'aktivitaet',
    titel,
    text,
    autorName,
    erstelltAm,
    icon,
  }
}

export function normalizeAntragFeed(antrag: WeiterbildungAntrag): WeiterbildungAntrag {
  if (antrag.kommentareAktivitaeten?.length) {
    return antrag
  }

  const employee = getEmployee(antrag.employeeId)
  const feed: FeedEintrag[] = []

  if (antrag.unterstatus !== 'Entwurf') {
    feed.push(
      createAktivitaetEintrag(
        'Antrag eingereicht',
        employee
          ? `Antrag für ${employee.name} wurde zur Prüfung eingereicht.`
          : 'Antrag wurde zur Prüfung eingereicht.',
        employee?.name ?? CURRENT_USER_NAME,
        antrag.updatedAt,
        'paper-plane',
      ),
    )
  }

  if (!feed.length) {
    return antrag
  }

  return { ...antrag, kommentareAktivitaeten: feed }
}

export function getFeedEintraege(antrag: WeiterbildungAntrag): FeedEintrag[] {
  const normalized = normalizeAntragFeed(antrag)
  return [...(normalized.kommentareAktivitaeten ?? [])].sort(
    (a, b) => new Date(a.erstelltAm).getTime() - new Date(b.erstelltAm).getTime(),
  )
}

export function getAktivitaetFeedEintraege(antrag: WeiterbildungAntrag): FeedEintrag[] {
  return getFeedEintraege(antrag).filter((entry) => entry.typ === 'aktivitaet')
}

export function addKommentarToAntrag(
  antrag: WeiterbildungAntrag,
  text: string,
  autorName: string,
): WeiterbildungAntrag {
  const trimmed = text.trim()
  if (!trimmed) {
    return antrag
  }
  const normalized = normalizeAntragFeed(antrag)
  return {
    ...normalized,
    kommentareAktivitaeten: [
      ...(normalized.kommentareAktivitaeten ?? []),
      createKommentarEintrag(trimmed, autorName),
    ],
  }
}
