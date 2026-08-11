import { getEmployee } from '../employees'
import { CURRENT_USER_NAME } from './constants'
import type { AntragFormData, FeedEintrag, WeiterbildungAntrag } from './types'
import { upsertAntrag } from './service'

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
  const kommentar = antrag.form.kommentar.trim()

  if (kommentar) {
    feed.push(
      createKommentarEintrag(
        kommentar,
        employee?.name ?? CURRENT_USER_NAME,
        antrag.updatedAt,
      ),
    )
  }

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
    (a, b) => new Date(b.erstelltAm).getTime() - new Date(a.erstelltAm).getTime(),
  )
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

/** Moves a non-empty `form.kommentar` into the feed once, then clears the form field. */
export function consumeFormKommentar(
  antrag: WeiterbildungAntrag,
  feed: FeedEintrag[],
  autorName: string,
  erstelltAm: string,
): { feed: FeedEintrag[]; form: AntragFormData } {
  const kommentar = antrag.form.kommentar.trim()
  if (!kommentar) {
    return { feed, form: antrag.form }
  }

  const alreadyInFeed = feed.some(
    (entry) => entry.typ === 'kommentar' && entry.text === kommentar,
  )
  return {
    feed: alreadyInFeed
      ? feed
      : [...feed, createKommentarEintrag(kommentar, autorName, erstelltAm)],
    form: { ...antrag.form, kommentar: '' },
  }
}

/** Persists a pending review comment from `form.kommentar` into the timeline without status change. */
export function flushFormKommentarToFeed(
  antrag: WeiterbildungAntrag,
  autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  if (!antrag.form.kommentar.trim()) {
    return normalizeAntragFeed(antrag)
  }
  const normalized = normalizeAntragFeed(antrag)
  const now = new Date().toISOString()
  const { feed, form } = consumeFormKommentar(
    normalized,
    [...(normalized.kommentareAktivitaeten ?? [])],
    autorName,
    now,
  )
  return upsertAntrag({
    ...normalized,
    form,
    kommentareAktivitaeten: feed,
  })
}
