import type { AkProzent } from './types'

export const ANTRAEGE_STORAGE_KEY = 'awb-antraege'
export const DOKUMENTE_DB_NAME = 'awb-dokumente'
export const DOKUMENTE_STORE = 'blobs'
export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024
export const VG_AKTUELL_BEI_LABEL = 'Mettler Markus, PN'
/** @deprecated Prefer persona from PrototypePersonaContext */
export const CURRENT_USER_ROLE = 'Vorgesetzter' as const
/** Default VG display name when no persona author is passed */
export const CURRENT_USER_NAME = 'Markus Mettler'
export const CURRENT_USER_INITIALS = 'MM'

export const TYP_OPTIONS = [
  'Bachelor',
  'Berufsmaturität',
  'CAS',
  'DAS',
  'Diplom HF',
  'Doktorat (PhD)',
  'Eidg. Berufsattest (EBA)',
  'Eidg. Diplom',
  'Eidg. Fachausweis (FA)',
  'Eidg. Fähigkeitszeugnis (EFZ)',
  'Fachmaturität',
  'FMS Ausweis',
  'Gymnasiale Maturität',
  'MAS',
  'Master',
  'Nachdiplomstudium HF',
  'Vorlehre, Praktische Ausbildung (PrA)',
  'Weiterbildung mit Zertifikat / Bestätigung',
  'Weiterbildung ohne Bestätigung',
] as const

export const FACHRICHTUNG_OPTIONS = [
  'Administration / Sekretariat',
  'Betriebswirtschaft',
  'Daten / Digitalisierung / Künstliche Intelligenz',
  'Fahren / Mechanik',
  'Finanzen / Rechnungswesen / Banking / Controlling',
  'Immobilien / Facility Management / Bau / Hauswirtschaft',
  'Informatik / IT-Security',
  'Innovation',
  'Leadership / Management',
  'Logistik',
  'Marketing / Kommunikation',
  'Personal / Organisation / Kultur',
  'Projektmanagement / Agilität',
  'Psychologie / Pädagogik / Soziales',
  'Risk / Legal / Compliance',
  'Sprachen',
  'Verkauf / Beratung',
  'Sonstige',
] as const

/** Alphabetical list of Swiss adult-education / Weiterbildung schools (prototype). */
export const SCHULEN_ANBIETER_OPTIONS = [
  'Academia Engiadina',
  'AKAD Business',
  'Bénédict-Schule Bern',
  'Bénédict-Schule St. Gallen',
  'Bénédict-Schule Zürich',
  'Careum Weiterbildung',
  'EB Basel',
  'EB Luzern',
  'EB Zürich',
  'ECAP Schweiz',
  'Feusi Bildungszentrum',
  'FFHS Fernfachhochschule Schweiz',
  'gibb Bern',
  'HWZ Hochschule für Wirtschaft Zürich',
  'IBAW',
  'Juventus Schulen',
  'Klubschule Migros',
  'KV Business School Zürich',
  'KV Luzern',
  'Minerva Schulen',
  'PH Bern Weiterbildung',
  'SAWI Akademie',
  'SIU Schweizerisches Institut für Unternehmerschulung',
  'TEKO Schweizerische Fachschule',
  'VHS Zürich',
  'WISS Schulen für Wirtschaft Informatik Immobilien',
  'WKS KV Bildung Bern',
  'ZB. Zentrum Bildung Baden',
  'ZHAW Weiterbildung',
  'ZHdK Weiterbildung',
] as const

export const WOCHENTAG_OPTIONS = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const

export const BESCHAEFTIGUNGSGRAD_PERCENTS = [100, 90, 80, 70, 60, 50] as const

export const VERTRAG_SCHWELLENWERT_CHF = 5000

export const AK_PROZENT_OPTIONS: readonly { value: AkProzent; label: string }[] = [
  { value: 25, label: '25 % (motivierend)' },
  { value: 50, label: '50 % (teilw. erforderlich)' },
  { value: 75, label: '75 % (erwünscht)' },
  { value: 100, label: '100 % (angeordnet / zwingend)' },
] as const
