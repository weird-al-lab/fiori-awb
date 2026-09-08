import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@ui5/webcomponents-react/Button'
import { CheckBox } from '@ui5/webcomponents-react/CheckBox'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { Link } from '@ui5/webcomponents-react/Link'
import { List } from '@ui5/webcomponents-react/List'
import { ListItemStandard } from '@ui5/webcomponents-react/ListItemStandard'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { SegmentedButton } from '@ui5/webcomponents-react/SegmentedButton'
import { SegmentedButtonItem } from '@ui5/webcomponents-react/SegmentedButtonItem'
import { Switch } from '@ui5/webcomponents-react/Switch'
import { Text } from '@ui5/webcomponents-react/Text'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
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

const AK_MODUS_OPTIONS = [
  { value: 'prozentual', label: 'Prozentual' },
  { value: 'pauschal', label: 'Pauschal' },
  { value: 'keine', label: 'Keine' },
] as const satisfies ReadonlyArray<{ value: AkModus; label: string }>

const AZE_MODUS_OPTIONS = [
  { value: 'pauschal', label: 'Pauschal' },
  { value: 'keine', label: 'Keine' },
] as const satisfies ReadonlyArray<{ value: AzeModus; label: string }>

function BeteiligungModeControl<T extends string>({
  locked,
  title,
  accessibleName,
  value,
  options,
  onSelect,
}: {
  locked: boolean
  title: string
  accessibleName: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onSelect: (next: T) => void
}) {
  return (
    <>
      <GroupTitle>{title}</GroupTitle>
      <SegmentedButton accessibleName={accessibleName}>
        {options.map((option) => {
          const selected = value === option.value
          return (
            <SegmentedButtonItem
              key={option.value}
              selected={selected}
              disabled={locked && !selected}
              onClick={() => {
                if (!locked) {
                  onSelect(option.value)
                }
              }}
            >
              {option.label}
            </SegmentedButtonItem>
          )
        })}
      </SegmentedButton>
    </>
  )
}

function VereinbarungPanel({
  title,
  collapsed = false,
  fixed = false,
  children,
}: {
  title: string
  collapsed?: boolean
  fixed?: boolean
  children: ReactNode
}) {
  return (
    <Panel
      className="awb-review__panel"
      collapsed={collapsed}
      fixed={fixed}
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

type OfferFacts = {
  akText: string
  azeText: string
  postTotal: string
  auszahlungText: string
  rueckzahlung: 'Ja' | 'Nein'
  hasRueckzahlung: boolean
}

function auszahlungSummary(
  vereinbarung: VereinbarungData,
  kosten: VereinbarungKosten,
): string {
  if (kosten.postAk <= 0) {
    return 'Keine'
  }
  const total = `CHF ${formatChfDecimal(kosten.postAk)}`
  if (vereinbarung.sofortauszahlung) {
    return `Mit nächstem Lohn (${total})`
  }
  const scheduled = parseNumber(vereinbarung.auszahlungsBetrag)
  const month = vereinbarung.auszahlungsMonat.trim()
  if (scheduled > 0 && month) {
    const rest = Math.max(0, kosten.postAk - scheduled)
    const first = `${month}: CHF ${formatChfDecimal(scheduled)}`
    return rest > 0 ? `${first} · Rest mit nächstem Lohn` : first
  }
  if (month) {
    return `${month} (${total})`
  }
  return total
}

function getOfferFacts(
  antrag: WeiterbildungAntrag,
  kosten: VereinbarungKosten,
  hasRueckzahlung: boolean,
): OfferFacts {
  const vereinbarung = antrag.vereinbarung!
  return {
    akText: akBeteiligungSummary(vereinbarung),
    azeText:
      vereinbarung.azeModus === 'pauschal' && kosten.postAzeTage > 0
        ? `${kosten.postAzeTage} Tage`
        : 'Keine',
    postTotal: formatChfDecimal(kosten.postTotal),
    auszahlungText: auszahlungSummary(vereinbarung, kosten),
    rueckzahlung: hasRueckzahlung ? 'Ja' : 'Nein',
    hasRueckzahlung,
  }
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
  const facts = getOfferFacts(antrag, kosten, maOfferAcceptance.hasRueckzahlung)

  return (
    <VereinbarungPanel title="Zusammenfassung des Angebots" fixed>
      <List
        className="awb-vereinbarung__summary-list-ui5"
        accessibleName="Zusammenfassung des Angebots"
      >
        <ListItemStandard
          icon="study-leave"
          description={facts.akText}
          wrappingType="Normal"
          type="Inactive"
        >
          Beteiligung Post an Ausbildungskosten
        </ListItemStandard>
        {antrag.form.arbeitszeiterleichterung === 'ja' ? (
          <ListItemStandard
            icon="timesheet"
            description={facts.azeText}
            wrappingType="Normal"
            type="Inactive"
          >
            Arbeitszeiterleichterung
          </ListItemStandard>
        ) : null}
        <ListItemStandard
          icon="money-bills"
          description={`CHF ${facts.postTotal}`}
          wrappingType="Normal"
          type="Inactive"
        >
          Gesamtbeteiligung Post
        </ListItemStandard>
        <ListItemStandard
          icon="monitor-payments"
          description={facts.auszahlungText}
          wrappingType="Normal"
          type="Inactive"
        >
          Auszahlung Aus- und Weiterbildungskosten
        </ListItemStandard>
        <ListItemStandard
          icon="customer-order-entry"
          description={facts.rueckzahlung}
          wrappingType="Normal"
          type="Inactive"
        >
          Rückzahlung
        </ListItemStandard>
      </List>

      {facts.hasRueckzahlung ? (
        <div className="awb-vereinbarung__summary-actions">
          <Button design="Default" onClick={onPreviewVertrag}>
            Vertrag lesen
          </Button>
        </div>
      ) : null}
      <div className="awb-vereinbarung__summary-zustimmung">
        <div className="awb-vereinbarung__summary-checks">
          <CheckBox
            checked={maOfferAcceptance.einverstanden}
            onChange={(event) =>
              maOfferAcceptance.onEinverstandenChange(event.target.checked)
            }
            text={
              facts.hasRueckzahlung
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
              facts.hasRueckzahlung
                ? 'Ich bestätige, dass ich vom Anbieter zugelassen worden bin. Falls die tatsächlichen Kosten der Aus- oder Weiterbildung unerwartet wesentlich tiefer ausfallen, bin ich verpflichtet, HR-Services zu informieren.'
                : 'Ich bestätige, dass ich vom Anbieter zugelassen worden bin. Falls die tatsächlichen Kosten der Aus- oder Weiterbildung unerwartet wesentlich tiefer ausfallen, bin ich verpflichtet, HR-Services zu informieren.'
            }
          />
        </div>
      </div>
    </VereinbarungPanel>
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
  const showAze = antrag.form.arbeitszeiterleichterung === 'ja'

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
            <BeteiligungModeControl
              locked={locked}
              title="Beteiligung an Aus- und Weiterbildungskosten (AK)"
              accessibleName="Beteiligung Ausbildungskosten"
              value={vereinbarung.akModus}
              options={AK_MODUS_OPTIONS}
              onSelect={(akModus) => patch({ akModus })}
            />

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
                      readonly={locked}
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
                    readonly={locked}
                    onInput={(event) =>
                      patch({ akPauschalBetrag: event.target.value ?? '' })
                    }
                  />
                  <Text>CHF</Text>
                </FlexBox>
              </div>
            ) : null}

            {showAze ? (
              <>
                <BeteiligungModeControl
                  locked={locked}
                  title="Beteiligung an Arbeitszeiterleichterung (AZE)"
                  accessibleName="Beteiligung Arbeitszeiterleichterung"
                  value={vereinbarung.azeModus}
                  options={AZE_MODUS_OPTIONS}
                  onSelect={(azeModus) => patch({ azeModus })}
                />

                {vereinbarung.azeModus === 'pauschal' ? (
                  <div className="awb-vereinbarung__field-group">
                    <Label showColon>Pauschale Beteiligung Post</Label>
                    <FlexBox className="awb-vereinbarung__input-with-unit">
                      <Input
                        className="awb-vereinbarung__input-narrow"
                        value={vereinbarung.azeTage}
                        placeholder={`max. ${antragAzeTage}`}
                        readonly={locked}
                        onInput={(event) => patch({ azeTage: event.target.value ?? '' })}
                      />
                      <Text>Tage</Text>
                    </FlexBox>
                  </div>
                ) : null}
              </>
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
                  disabled={postAkZero}
                  readonly={locked}
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
                          readonly={locked}
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
                    readonly={locked}
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
                        readonly={locked}
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
