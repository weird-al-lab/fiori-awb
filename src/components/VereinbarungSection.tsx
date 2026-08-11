import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@ui5/webcomponents-react/Button'
import { CheckBox } from '@ui5/webcomponents-react/CheckBox'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { Link } from '@ui5/webcomponents-react/Link'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { SegmentedButton } from '@ui5/webcomponents-react/SegmentedButton'
import { SegmentedButtonItem } from '@ui5/webcomponents-react/SegmentedButtonItem'
import { Switch } from '@ui5/webcomponents-react/Switch'
import { Text } from '@ui5/webcomponents-react/Text'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { Title } from '@ui5/webcomponents-react/Title'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import {
  AK_PROZENT_OPTIONS,
  auszahlungsMonatToIso,
  formatChfDecimal,
  getArbeitszeitGrundlage,
  getPostKostenGrundlage,
  getTrainingMaxDateIso,
  getVereinbarungKosten,
  isoToAuszahlungsMonat,
  showsZwingendeAusbildungFrage,
  VERTRAG_SCHWELLENWERT_CHF,
  type AkModus,
  type AkProzent,
  type AzeModus,
  type BeitragZeile,
  type RueckzahlungVereinbaren,
  type VereinbarungData,
  type VereinbarungKosten,
  type WeiterbildungAntrag,
  type ZwingendeAusbildung,
} from '../data/antraege'
import type { Employee } from '../data/employees'
import './VereinbarungSection.css'

type VereinbarungSectionProps = {
  antrag: WeiterbildungAntrag
  employee: Employee
  employeeName: string
  showRoleBanner: boolean
  onCloseRoleBanner: () => void
  showMaReviewBanner?: boolean
  onCloseMaReviewBanner?: () => void
  onChange: (vereinbarung: VereinbarungData) => void
  onPreviewVertrag: () => void
  onHrBeratungBeiziehen?: () => void
  /** MA offer review — checkbox state for acceptance */
  maOfferAcceptance?: {
    hasRueckzahlung: boolean
    einverstanden: boolean
    hrKostenPflicht: boolean
    onEinverstandenChange: (checked: boolean) => void
    onHrKostenPflichtChange: (checked: boolean) => void
  }
  /** MA reviewing offer — banner + summary, read-only panels */
  maReview?: boolean
  readOnly?: boolean
}

function GroupTitle({ children }: { children: string }) {
  return (
    <Text className="awb-vereinbarung__group-title">{children}</Text>
  )
}

function VereinbarungPanel({
  title,
  collapsed = false,
  children,
}: {
  title: string
  collapsed?: boolean
  children: ReactNode
}) {
  return (
    <Panel
      className="awb-review__panel"
      collapsed={collapsed}
      accessibleName={title}
      headerLevel="H3"
      headerText={title}
    >
      <div className="awb-review__panel-body">{children}</div>
    </Panel>
  )
}

function akBeteiligungSummary(vereinbarung: VereinbarungData): string {
  if (vereinbarung.akModus === 'keine') {
    return 'Keine'
  }
  if (vereinbarung.akModus === 'prozentual') {
    return vereinbarung.akProzent != null
      ? `${vereinbarung.akProzent}%`
      : 'Prozentual (nicht gewählt)'
  }
  const betrag = vereinbarung.akPauschalBetrag.trim()
  return betrag ? `Pauschal CHF ${betrag}` : 'Pauschal'
}

function AngebotSummary({
  antrag,
  kosten,
  onPreviewVertrag,
  maOfferAcceptance,
}: {
  antrag: WeiterbildungAntrag
  kosten: VereinbarungKosten
  onPreviewVertrag: () => void
  maOfferAcceptance: NonNullable<VereinbarungSectionProps['maOfferAcceptance']>
}) {
  const vereinbarung = antrag.vereinbarung!
  const hasRueckzahlung = maOfferAcceptance.hasRueckzahlung
  const rueckzahlung = hasRueckzahlung ? 'Ja' : 'Nein'
  const azeText =
    vereinbarung.azeModus === 'pauschal' && kosten.postAzeTage > 0
      ? `${kosten.postAzeTage} Tage`
      : 'Keine'
  const kommentarVg = antrag.form.kommentar.trim() || '—'

  return (
    <div className="awb-vereinbarung__summary">
      <Title level="H2" size="H5">
        Zusammenfassung des Angebots
      </Title>
      <ul className="awb-vereinbarung__summary-list">
        <li className="awb-vereinbarung__summary-row awb-vereinbarung__summary-row--ok">
          <span aria-hidden="true">✓</span>
          <Text>
            Beteiligung Post an Ausbildungskosten: {akBeteiligungSummary(vereinbarung)}
          </Text>
        </li>
        <li className="awb-vereinbarung__summary-row awb-vereinbarung__summary-row--ok">
          <span aria-hidden="true">✓</span>
          <Text>Arbeitszeiterleichterung: {azeText}</Text>
        </li>
        <li className="awb-vereinbarung__summary-row awb-vereinbarung__summary-row--ok">
          <span aria-hidden="true">✓</span>
          <Text>
            Gesamtbeteiligung Post: CHF {formatChfDecimal(kosten.postTotal)}
          </Text>
        </li>
        <li className="awb-vereinbarung__summary-row awb-vereinbarung__summary-row--info">
          <span aria-hidden="true">ℹ</span>
          <Text>Rückzahlung: {rueckzahlung}</Text>
        </li>
        <li className="awb-vereinbarung__summary-row awb-vereinbarung__summary-row--muted">
          <span aria-hidden="true">—</span>
          <Text>Kommentar Vorgesetzte/r: {kommentarVg}</Text>
        </li>
      </ul>
      {hasRueckzahlung ? (
        <div className="awb-vereinbarung__summary-actions">
          <Button design="Default" onClick={onPreviewVertrag}>
            Vertrag lesen
          </Button>
        </div>
      ) : null}
      <div className="awb-vereinbarung__summary-zustimmung">
        <GroupTitle>Zustimmung</GroupTitle>
        <Text>
          {hasRueckzahlung
            ? 'Mit dem Klick auf "Elektronisch unterschreiben" wird Vertrag signiert und im E-Dossier abgelegt.'
            : 'Mit dem Klick auf "Angebot akzeptieren" wird das Angebot bestätigt.'}
        </Text>
        <div className="awb-vereinbarung__summary-checks">
          <CheckBox
            checked={maOfferAcceptance.einverstanden}
            onChange={(event) =>
              maOfferAcceptance.onEinverstandenChange(event.target.checked)
            }
            text={
              hasRueckzahlung
                ? 'Ich habe den Vertrag gelesen und bin mit dem Inhalt einverstanden (inkl. Rückzahlungsverpflichtung).'
                : 'Ich habe Antrag und Angebot gelesen und bin mit dem Inhalt einverstanden.'
            }
          />
          <CheckBox
            checked={maOfferAcceptance.hrKostenPflicht}
            onChange={(event) =>
              maOfferAcceptance.onHrKostenPflichtChange(event.target.checked)
            }
            text={
              hasRueckzahlung
                ? 'Falls die tatsächlichen Kosten meiner Aus- oder Weiterbildung unerwartet wesentlich tiefer ausfallen, bin ich verpflichtet, HR-Services zu informieren.'
                : 'Falls die tatsächlichen Kosten der Aus-/Weiterbildung unerwartet wesentlich tiefer ausfallen, bin ich verpflichtet, HR-Services zu informieren.'
            }
          />
        </div>
      </div>
    </div>
  )
}

function BreakdownTable({
  kosten,
  expanded,
}: {
  kosten: VereinbarungKosten
  expanded: boolean
}) {
  if (!expanded) {
    return null
  }

  const renderRows = (zeilen: BeitragZeile[], groupLabel: string, groupTotal: number) => (
    <>
      <tr className="awb-vereinbarung__table-group">
        <td>{groupLabel}</td>
        <td />
        <td />
        <td className="awb-vereinbarung__table-num">{formatChfDecimal(groupTotal)}</td>
      </tr>
      {zeilen.map((zeile) => (
        <tr key={`${groupLabel}-${zeile.label}`} className="awb-vereinbarung__table-row">
          <td className="awb-vereinbarung__table-indent">{zeile.label}</td>
          <td className="awb-vereinbarung__table-num">
            {zeile.tage !== undefined ? zeile.tage : ''}
          </td>
          <td className="awb-vereinbarung__table-num">
            {zeile.ansatz !== undefined ? formatChfDecimal(zeile.ansatz) : ''}
          </td>
          <td className="awb-vereinbarung__table-num">{formatChfDecimal(zeile.total)}</td>
        </tr>
      ))}
    </>
  )

  return (
    <div className="awb-vereinbarung__breakdown">
      <table className="awb-vereinbarung__table">
        <thead>
          <tr>
            <th />
            <th>Tage</th>
            <th>Ansatz (CHF)</th>
            <th>Total (CHF)</th>
          </tr>
        </thead>
        <tbody>
          {renderRows(kosten.postZeilen, 'Beitrag Post', kosten.postTotal)}
          {renderRows(kosten.maZeilen, 'Beitrag MA', kosten.maTotal)}
        </tbody>
      </table>
    </div>
  )
}

function KostenCard({
  kosten,
}: {
  kosten: VereinbarungKosten
}) {
  const [expanded, setExpanded] = useState(true)
  const postShare = kosten.gesamt > 0 ? (kosten.postTotal / kosten.gesamt) * 100 : 50
  const maShare = kosten.gesamt > 0 ? (kosten.maTotal / kosten.gesamt) * 100 : 50

  return (
    <div className="awb-vereinbarung__kosten-card">
      <Text className="awb-vereinbarung__kosten-label">Gesamtkosten und Beiträge</Text>
      <Text className="awb-vereinbarung__kosten-total">
        CHF {formatChfDecimal(kosten.gesamt)}
      </Text>

      <div className="awb-vereinbarung__bar" role="img" aria-label="Kostenaufteilung Post und MA">
        <span
          className="awb-vereinbarung__bar-post"
          style={{ width: `${postShare}%` }}
        />
        <span
          className="awb-vereinbarung__bar-ma"
          style={{ width: `${maShare}%` }}
        />
      </div>

      <FlexBox wrap={FlexBoxWrap.Wrap} className="awb-vereinbarung__legend">
        <span className="awb-vereinbarung__legend-item">
          <span className="awb-vereinbarung__legend-swatch awb-vereinbarung__legend-swatch--post" />
          Beitrag Post: CHF {formatChfDecimal(kosten.postTotal)}
        </span>
        <span className="awb-vereinbarung__legend-item">
          <span className="awb-vereinbarung__legend-swatch awb-vereinbarung__legend-swatch--ma" />
          Beitrag MA: CHF {formatChfDecimal(kosten.maTotal)}
        </span>
      </FlexBox>

      <Link
        className="awb-vereinbarung__toggle-link"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Aufschlüsselung ausblenden ▴' : 'Aufschlüsselung anzeigen ▾'}
      </Link>

      <BreakdownTable kosten={kosten} expanded={expanded} />
    </div>
  )
}

export function VereinbarungSection({
  antrag,
  employee,
  employeeName,
  showRoleBanner,
  onCloseRoleBanner,
  showMaReviewBanner = true,
  onCloseMaReviewBanner,
  onChange,
  onPreviewVertrag,
  onHrBeratungBeiziehen,
  maOfferAcceptance,
  maReview = false,
  readOnly = false,
}: VereinbarungSectionProps) {
  const vereinbarung = antrag.vereinbarung!
  const kosten = getVereinbarungKosten(antrag.form, vereinbarung, employee.tagessatz)
  const akBasis = getPostKostenGrundlage(antrag.form)
  const antragAzeTage = getArbeitszeitGrundlage(antrag.form, employee.tagessatz).tage
  const trainingMaxDate = getTrainingMaxDateIso(antrag.form)
  const auszahlungsMonatIso =
    auszahlungsMonatToIso(vereinbarung.auszahlungsMonat) || undefined
  const locked = readOnly || maReview

  const patch = (partial: Partial<VereinbarungData>) => {
    if (locked) {
      return
    }
    onChange({ ...vereinbarung, ...partial })
  }

  const postAkZero = kosten.postAk === 0
  const switchChecked = postAkZero ? true : vereinbarung.sofortauszahlung
  const switchDisabled = locked || postAkZero
  const showMonatBetrag = !postAkZero && !vereinbarung.sofortauszahlung
  const betragPlaceholder = `Maximal ${formatChfDecimal(kosten.postAk)}`

  const prevPostAkRef = useRef(kosten.postAk)
  useEffect(() => {
    if (locked) {
      return
    }
    if (prevPostAkRef.current === 0 && kosten.postAk > 0 && !vereinbarung.sofortauszahlung) {
      patch({ sofortauszahlung: true })
    }
    prevPostAkRef.current = kosten.postAk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kosten.postAk, locked])

  const auszahlungsBetragNum = parseNumber(vereinbarung.auszahlungsBetrag)
  const mitNaechstemLohn = Math.max(0, kosten.postAk - auszahlungsBetragNum)
  const lohnBetrag = formatChfDecimal(mitNaechstemLohn)
  const vertragPflichtig = kosten.postAk > VERTRAG_SCHWELLENWERT_CHF
  const showZwingendeFrage = showsZwingendeAusbildungFrage(
    antrag.form,
    vereinbarung,
    employee.tagessatz,
  )
  const hrBeratungFlow = showZwingendeFrage && vereinbarung.zwingendeAusbildung === 'ja'
  const showVertragsDetails =
    vertragPflichtig || vereinbarung.rueckzahlungVereinbaren === 'ja' || hrBeratungFlow
  const panelsCollapsed = maReview

  const prevShowZwingendeFrageRef = useRef(showZwingendeFrage)
  useEffect(() => {
    if (locked) {
      return
    }
    if (prevShowZwingendeFrageRef.current && !showZwingendeFrage) {
      patch({
        zwingendeAusbildung: null,
        begruendungZwingend: '',
      })
    } else if (showZwingendeFrage && vereinbarung.zwingendeAusbildung === null) {
      patch({ zwingendeAusbildung: 'nein' })
    }
    prevShowZwingendeFrageRef.current = showZwingendeFrage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showZwingendeFrage, locked, vereinbarung.zwingendeAusbildung])

  return (
    <div className="awb-vereinbarung">
      {maReview && showMaReviewBanner ? (
        <MessageStrip
          design="Information"
          className="awb-vereinbarung__banner"
          onClose={onCloseMaReviewBanner}
        >
          Bitte prüfe das Angebot deines Vorgesetzten und entscheide, ob du es annehmen
          möchtest.
        </MessageStrip>
      ) : showRoleBanner ? (
        <MessageStrip
          design="Information"
          className="awb-vereinbarung__banner"
          onClose={onCloseRoleBanner}
        >
          Du bearbeitest diesen Antrag als Vorgesetzte/r von {employeeName}. Bitte lege
          den Arbeitgeberbeitrag fest.
        </MessageStrip>
      ) : null}

      {maReview && maOfferAcceptance ? (
        <AngebotSummary
          antrag={antrag}
          kosten={kosten}
          onPreviewVertrag={onPreviewVertrag}
          maOfferAcceptance={maOfferAcceptance}
        />
      ) : null}

      <VereinbarungPanel
        title="Beteiligungsangebot der Post"
        collapsed={panelsCollapsed}
      >
        <div className="awb-vereinbarung__beteiligung-grid">
          <div className="awb-vereinbarung__controls">
            <GroupTitle>Beteiligung an Aus- und Weiterbildungskosten (AK)</GroupTitle>
            <SegmentedButton accessibleName="Beteiligung Ausbildungskosten">
              {(
                [
                  ['keine', 'Keine'],
                  ['prozentual', 'Prozentual'],
                  ['pauschal', 'Pauschal'],
                ] as const
              ).map(([value, label]) => (
                <SegmentedButtonItem
                  key={value}
                  selected={vereinbarung.akModus === value}
                  disabled={locked}
                  onClick={() => {
                    if (!locked) {
                      patch({ akModus: value as AkModus })
                    }
                  }}
                >
                  {label}
                </SegmentedButtonItem>
              ))}
            </SegmentedButton>

            {vereinbarung.akModus === 'prozentual' ? (
              <div className="awb-vereinbarung__field-group">
                <Label showColon>Prozentuale Beteiligung Post</Label>
                <FlexBox direction={FlexBoxDirection.Column} className="awb-vereinbarung__radios">
                  {AK_PROZENT_OPTIONS.map(({ value, label }) => (
                    <RadioButton
                      key={value}
                      name="akProzent"
                      text={label}
                      checked={vereinbarung.akProzent === value}
                      disabled={locked}
                      onChange={() => patch({ akProzent: value as AkProzent })}
                    />
                  ))}
                </FlexBox>
              </div>
            ) : null}

            {vereinbarung.akModus === 'pauschal' ? (
              <div className="awb-vereinbarung__field-group">
                <Label showColon>Pauschale Beteiligung Post</Label>
                <FlexBox className="awb-vereinbarung__input-with-unit">
                  <Input
                    value={vereinbarung.akPauschalBetrag}
                    placeholder={`max. ${formatChfDecimal(akBasis)}`}
                    disabled={locked}
                    onInput={(event) =>
                      patch({ akPauschalBetrag: event.target.value ?? '' })
                    }
                  />
                  <Text>CHF</Text>
                </FlexBox>
              </div>
            ) : null}

            <GroupTitle>Beteiligung an Arbeitszeiterleichterung (AZE)</GroupTitle>
            <SegmentedButton accessibleName="Beteiligung Arbeitszeiterleichterung">
              {(
                [
                  ['keine', 'Keine'],
                  ['pauschal', 'Pauschal'],
                ] as const
              ).map(([value, label]) => (
                <SegmentedButtonItem
                  key={value}
                  selected={vereinbarung.azeModus === value}
                  disabled={locked}
                  onClick={() => {
                    if (!locked) {
                      patch({ azeModus: value as AzeModus })
                    }
                  }}
                >
                  {label}
                </SegmentedButtonItem>
              ))}
            </SegmentedButton>

            {vereinbarung.azeModus === 'pauschal' ? (
              <div className="awb-vereinbarung__field-group">
                <Label showColon>Pauschale Beteiligung Post</Label>
                <FlexBox className="awb-vereinbarung__input-with-unit">
                  <Input
                    className="awb-vereinbarung__input-narrow"
                    value={vereinbarung.azeTage}
                    placeholder={`max. ${antragAzeTage}`}
                    disabled={locked}
                    onInput={(event) => patch({ azeTage: event.target.value ?? '' })}
                  />
                  <Text>Tage</Text>
                </FlexBox>
              </div>
            ) : null}
          </div>

          <KostenCard kosten={kosten} />
        </div>
      </VereinbarungPanel>

      {kosten.postAk > 0 ? (
        <VereinbarungPanel
          title="Auszahlung Aus- und Weiterbildungskosten"
          collapsed={panelsCollapsed}
        >
          <div className="awb-vereinbarung__auszahlung-grid">
            <div className="awb-vereinbarung__auszahlung-col">
              <GroupTitle>Zeitpunkt</GroupTitle>
              <FlexBox className="awb-vereinbarung__switch-row">
                <Switch
                  checked={switchChecked}
                  disabled={switchDisabled}
                  onChange={(event) => {
                    if (locked) {
                      return
                    }
                    const checked = event.target.checked
                    patch({
                      sofortauszahlung: checked,
                      ...(checked ? { auszahlungsBetrag: '' } : {}),
                    })
                  }}
                />
                <Text>Auszahlung mit nächstem Lohn</Text>
              </FlexBox>
            </div>

            <div className="awb-vereinbarung__auszahlung-col">
              <GroupTitle>Betrag</GroupTitle>
              <div className="awb-vereinbarung__auszahlung-fields">
                {showMonatBetrag ? (
                  <>
                    <div className="awb-vereinbarung__field-group">
                      <Label showColon>Monat</Label>
                      <DatePicker
                        className="awb-vereinbarung__month-picker"
                        value={auszahlungsMonatIso}
                        displayFormat="MMMM yyyy"
                        valueFormat="yyyy-MM"
                        maxDate={trainingMaxDate}
                        placeholder="Monat wählen"
                        readonly={locked}
                        onChange={(event) => {
                          if (locked) {
                            return
                          }
                          const iso = event.detail.value ?? ''
                          const label = isoToAuszahlungsMonat(iso)
                          if (label) {
                            patch({ auszahlungsMonat: label })
                          }
                        }}
                      />
                    </div>
                    <div className="awb-vereinbarung__field-group">
                      <Label showColon>Betrag</Label>
                      <FlexBox className="awb-vereinbarung__input-with-unit">
                        <Input
                          value={vereinbarung.auszahlungsBetrag}
                          placeholder={betragPlaceholder}
                          disabled={locked}
                          onInput={(event) =>
                            patch({ auszahlungsBetrag: event.target.value ?? '' })
                          }
                        />
                        <Text>CHF</Text>
                      </FlexBox>
                    </div>
                  </>
                ) : null}
                <div className="awb-vereinbarung__field-group">
                  <Label showColon>Mit nächstem Lohn</Label>
                  <Text>{lohnBetrag}</Text>
                </div>
              </div>
            </div>
          </div>
        </VereinbarungPanel>
      ) : null}

      {kosten.postAk > 0 || kosten.postAze > 0 ? (
        <VereinbarungPanel
          title="Rückzahlungspflicht des Mitarbeiters"
          collapsed={panelsCollapsed}
        >
        {showZwingendeFrage ? (
          <div className="awb-vereinbarung__zwingende-block">
            <GroupTitle>Zwingende Aus-/Weiterbildung</GroupTitle>
            <div className="awb-vereinbarung__field-group">
              <Label showColon>
                Die Aus- oder Weiterbildung ist für die Ausübung der Arbeit eine
                zwingende Voraussetzung
              </Label>
              <FlexBox
                direction={FlexBoxDirection.Row}
                className="awb-vereinbarung__radios awb-vereinbarung__radios--inline"
              >
                {(
                  [
                    ['ja', 'Ja (Keine Rückzahlungspflicht)'],
                    ['nein', 'Nein'],
                  ] as const
                ).map(([value, label]) => (
                  <RadioButton
                    key={value}
                    name="zwingendeAusbildung"
                    text={label}
                    checked={vereinbarung.zwingendeAusbildung === value}
                    disabled={locked}
                    onChange={() =>
                      patch({
                        zwingendeAusbildung: value as ZwingendeAusbildung,
                        ...(value === 'nein' ? { begruendungZwingend: '' } : {}),
                      })
                    }
                  />
                ))}
              </FlexBox>
            </div>
          </div>
        ) : null}
        <div
          className={`awb-vereinbarung__rueckzahlung-grid${showVertragsDetails ? '' : ' awb-vereinbarung__rueckzahlung-grid--single'}`}
        >
          <div className="awb-vereinbarung__rueckzahlung-col">
            <GroupTitle>Vertrag</GroupTitle>
            {hrBeratungFlow ? (
              <MessageStrip design="Information" hideCloseButton>
                Begründe warum die Aus- oder Weiterbildung zwingend ist. Die HR-Beratung
                überprüft deinen Antrag und nimmt mit dir Kontakt auf.
              </MessageStrip>
            ) : vertragPflichtig ? (
              <MessageStrip design="Critical" hideCloseButton>
                Für diese Aus-/Weiterbildung wird zwingend ein gegenseitiger Vertrag
                erstellt, da der Beitrag der Post an den Ausbildungskosten von CHF{' '}
                {formatChfDecimal(kosten.postAk)}.- den festgelegten Schwellenwert
                übersteigt
              </MessageStrip>
            ) : (
              <>
                <MessageStrip design="Information" hideCloseButton>
                  Beteiligungen von weniger als CHF 5&apos;000 sind im Normalfall nicht
                  rückzahlungspflichtig.
                </MessageStrip>
                <div className="awb-vereinbarung__field-group">
                  <Label showColon>
                    Soll dennoch eine Rückzahlungsverpflichtung vereinbart werden?
                  </Label>
                  <FlexBox
                    direction={FlexBoxDirection.Row}
                    className="awb-vereinbarung__radios awb-vereinbarung__radios--inline"
                  >
                    {(
                      [
                        ['ja', 'Ja'],
                        ['nein', 'Nein'],
                      ] as const
                    ).map(([value, label]) => (
                      <RadioButton
                        key={value}
                        name="rueckzahlungVereinbaren"
                        text={label}
                        checked={vereinbarung.rueckzahlungVereinbaren === value}
                        disabled={locked}
                        onChange={() =>
                          patch({ rueckzahlungVereinbaren: value as RueckzahlungVereinbaren })
                        }
                      />
                    ))}
                  </FlexBox>
                </div>
              </>
            )}
          </div>
          {showVertragsDetails ? (
            <div className="awb-vereinbarung__rueckzahlung-col">
              {hrBeratungFlow ? (
                <>
                  <GroupTitle>Begründung</GroupTitle>
                  <TextArea
                    className="awb-vereinbarung__vertrag-input"
                    rows={5}
                    placeholder="Begründung"
                    value={vereinbarung.begruendungZwingend}
                    readonly={locked}
                    onInput={(event) =>
                      patch({ begruendungZwingend: event.target.value ?? '' })
                    }
                  />
                </>
              ) : (
                <>
                  <GroupTitle>Spezielle Vertragsbestimmungen</GroupTitle>
                  <Text>
                    Eintragungen werden als besondere Vertragsbestimmungen übernommen.
                    Textformulierungen sind mit der zuständigen HR Beratung vorgängig
                    abzusprechen.
                  </Text>
                  <TextArea
                    className="awb-vereinbarung__vertrag-input"
                    rows={5}
                    placeholder="Vertragsbestimmung erfassen"
                    value={vereinbarung.vertragsbestimmungen}
                    readonly={locked}
                    onInput={(event) =>
                      patch({ vertragsbestimmungen: event.target.value ?? '' })
                    }
                  />
                </>
              )}
            </div>
          ) : null}
        </div>
        {showVertragsDetails ? (
          <div className="awb-vereinbarung__preview-row">
            {hrBeratungFlow ? (
              <Button design="Default" onClick={onHrBeratungBeiziehen}>
                HR Beratung beiziehen
              </Button>
            ) : (
              <Button design="Default" onClick={onPreviewVertrag}>
                Vorschau Vertragsdokument
              </Button>
            )}
          </div>
        ) : null}
        </VereinbarungPanel>
      ) : null}
    </div>
  )
}

function parseNumber(value: string): number {
  const normalized = value.replace(/'/g, '').replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}
