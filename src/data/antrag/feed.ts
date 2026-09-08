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

/** Clears a pending `form.kommentar` without adding it to the activity feed. */
export function consumeFormKommentar(
  antrag: WeiterbildungAntrag,
  feed: FeedEintrag[],
  _autorName: string,
  _erstelltAm: string,
): { feed: FeedEintrag[]; form: AntragFormData } {
  if (!antrag.form.kommentar.trim()) {
    return { feed, form: antrag.form }
  }

  return {
    feed,
    form: { ...antrag.form, kommentar: '' },
  }
}

/** Clears a pending review comment from `form.kommentar` without changing the feed. */
export function flushFormKommentarToFeed(
  antrag: WeiterbildungAntrag,
  _autorName: string = CURRENT_USER_NAME,
): WeiterbildungAntrag {
  if (!antrag.form.kommentar.trim()) {
    return normalizeAntragFeed(antrag)
  }
  const normalized = normalizeAntragFeed(antrag)
  const { form } = consumeFormKommentar(
    normalized,
    [...(normalized.kommentareAktivitaeten ?? [])],
    _autorName,
    new Date().toISOString(),
  )
  return upsertAntrag({
    ...normalized,
    form,
  })
}
