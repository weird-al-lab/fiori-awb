import { VERTRAG_SCHWELLENWERT_CHF } from './constants'
import { getDefaultAuszahlungsMonat, parseNumber } from './format'
import type {
  AntragFormData,
  BeitragZeile,
  VereinbarungData,
  VereinbarungKosten,
  WeiterbildungAntrag,
} from './types'

export function getBundBeteiligung(form: AntragFormData): number {
  if (form.bund50 !== 'ja') {
    return 0
  }
  return parseNumber(form.kurskosten) * 0.5
}

export function getPostKostenGrundlage(form: AntragFormData): number {
  return (
    parseNumber(form.kurskosten) -
    getBundBeteiligung(form) +
    parseNumber(form.zusaetzlicheKosten)
  )
}

export function getArbeitszeitGrundlage(
  form: AntragFormData,
  tagessatz: number,
): {
  tage: number
  tagessatz: number
  betrag: number
} {
  const tage =
    form.arbeitszeiterleichterung === 'ja'
      ? parseNumber(form.anzahlTageErleichterung)
      : 0
  return { tage, tagessatz, betrag: tage * tagessatz }
}

export function createDefaultVereinbarung(
  form: AntragFormData,
): VereinbarungData {
  return {
    akModus: 'keine',
    akProzent: null,
    akPauschalBetrag: '',
    azeModus: 'keine',
    azeTage: '',
    sofortauszahlung: false,
    auszahlungsMonat: getDefaultAuszahlungsMonat(form),
    auszahlungsBetrag: '',
    rueckzahlungVereinbaren: 'nein',
    vertragsbestimmungen: '',
    zwingendeAusbildung: 'nein',
    begruendungZwingend: '',
  }
}

export function ensureVereinbarung(antrag: WeiterbildungAntrag): VereinbarungData {
  const base = antrag.vereinbarung ?? createDefaultVereinbarung(antrag.form)
  return {
    ...base,
    rueckzahlungVereinbaren: base.rueckzahlungVereinbaren ?? 'nein',
    zwingendeAusbildung: base.zwingendeAusbildung ?? 'nein',
    begruendungZwingend: base.begruendungZwingend ?? '',
  }
}

export function getVereinbarungKosten(
  form: AntragFormData,
  vereinbarung: VereinbarungData,
  tagessatz: number,
): VereinbarungKosten {
  const akBasis = getPostKostenGrundlage(form)

  let postAk = 0
  if (vereinbarung.akModus === 'prozentual' && vereinbarung.akProzent != null) {
    postAk = (akBasis * vereinbarung.akProzent) / 100
  } else if (vereinbarung.akModus === 'pauschal') {
    postAk = parseNumber(vereinbarung.akPauschalBetrag)
  }

  const maAk = Math.max(0, akBasis - postAk)

  const antragAzeTage =
    form.arbeitszeiterleichterung === 'ja'
      ? parseNumber(form.anzahlTageErleichterung)
      : 0
  const postAzeTage =
    vereinbarung.azeModus === 'pauschal'
      ? Math.min(parseNumber(vereinbarung.azeTage), antragAzeTage)
      : 0
  const postAze = postAzeTage * tagessatz

  const maEingesetzteTage = Math.max(0, antragAzeTage - postAzeTage)
  const maEingesetzteBetrag = maEingesetzteTage * tagessatz
  const maAbbauTage = postAze > 0 ? 1 : 0
  const maAbbauBetrag = maAbbauTage * tagessatz

  const postTotal = postAk + postAze
  const maTotal = maAk + maEingesetzteBetrag + maAbbauBetrag
  const gesamt = postTotal + maTotal

  const postZeilen: BeitragZeile[] = [
    { label: 'Aus-/Weiterbildungskosten (AK)', total: postAk, indent: true },
  ]
  if (postAze > 0) {
    postZeilen.push({
      label: 'Arbeitszeiterleichterungen (AZ)',
      tage: postAzeTage,
      ansatz: tagessatz,
      total: postAze,
      indent: true,
    })
  }

  const maZeilen: BeitragZeile[] = [
    { label: 'Aus-/Weiterbildungskosten', total: maAk, indent: true },
  ]
  if (maEingesetzteBetrag > 0) {
    maZeilen.push({
      label: 'Eingesetzte Tage',
      tage: maEingesetzteTage,
      ansatz: tagessatz,
      total: maEingesetzteBetrag,
      indent: true,
    })
  }
  if (maAbbauBetrag > 0) {
    maZeilen.push({
      label: 'Abbau verfügbare Guthaben',
      tage: maAbbauTage,
      ansatz: tagessatz,
      total: maAbbauBetrag,
      indent: true,
    })
  }

  return {
    akBasis,
    postAk,
    maAk,
    postAzeTage,
    postAze,
    maEingesetzteTage,
    maEingesetzteBetrag,
    maAbbauTage,
    maAbbauBetrag,
    postTotal,
    maTotal,
    gesamt,
    vertragErforderlich: postAk > VERTRAG_SCHWELLENWERT_CHF,
    postZeilen,
    maZeilen,
  }
}

export function isPostAkVolleBeteiligung(
  form: AntragFormData,
  vereinbarung: VereinbarungData,
  tagessatz: number,
): boolean {
  const kosten = getVereinbarungKosten(form, vereinbarung, tagessatz)
  const akBasis = getPostKostenGrundlage(form)

  if (vereinbarung.akModus === 'prozentual') {
    return vereinbarung.akProzent === 100
  }
  if (vereinbarung.akModus === 'pauschal') {
    return akBasis > 0 && kosten.postAk >= akBasis
  }
  return false
}

export function showsZwingendeAusbildungFrage(
  form: AntragFormData,
  vereinbarung: VereinbarungData,
  tagessatz: number,
): boolean {
  const kosten = getVereinbarungKosten(form, vereinbarung, tagessatz)
  return (
    kosten.postAk > VERTRAG_SCHWELLENWERT_CHF &&
    isPostAkVolleBeteiligung(form, vereinbarung, tagessatz)
  )
}

export function isHrBeratungRequiredForSend(vereinbarung: VereinbarungData): boolean {
  return vereinbarung.zwingendeAusbildung === 'ja'
}

export function hasMaRueckzahlungspflicht(
  form: AntragFormData,
  vereinbarung: VereinbarungData,
  tagessatz: number,
): boolean {
  const kosten = getVereinbarungKosten(form, vereinbarung, tagessatz)
  return (
    kosten.postAk > VERTRAG_SCHWELLENWERT_CHF ||
    vereinbarung.rueckzahlungVereinbaren === 'ja'
  )
}
