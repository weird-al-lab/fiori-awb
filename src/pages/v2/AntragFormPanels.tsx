import { useState, type ReactNode } from 'react'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { ComboBox } from '@ui5/webcomponents-react/ComboBox'
import { ComboBoxItem } from '@ui5/webcomponents-react/ComboBoxItem'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { AwbDialog } from '../../components/AwbDialog'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Form } from '@ui5/webcomponents-react/Form'
import { FormGroup } from '@ui5/webcomponents-react/FormGroup'
import { FormItem } from '@ui5/webcomponents-react/FormItem'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Option } from '@ui5/webcomponents-react/Option'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { Select } from '@ui5/webcomponents-react/Select'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import {
  FACHRICHTUNG_OPTIONS,
  formatChf,
  formatChfRate,
  getArbeitszeitGrundlage,
  getBundBeteiligung,
  getPostKostenGrundlage,
  SCHULEN_ANBIETER_OPTIONS,
  TYP_OPTIONS,
  type AntragFormData,
  type JaNein,
} from '../../data/antraege'
import './AusbildungAntragForm.css'

const BUND_SUBJEKTFINANZIERUNG_URL =
  'https://www.sbfi.admin.ch/de/bundesbeitraege-fuer-kurse-die-auf-eidgenoessische-pruefungen-vorbereiten'

const FORM_LAYOUT = 'S1 M2 L2 XL2'
const FORM_LABEL_SPAN = 'S12 M12 L12 XL12'
const FORM_ACCESSIBLE_MODE = 'Edit' as const

export const ANTRAG_FORM_SECTION_TITLES = {
  grunddaten: 'Grunddaten',
  kosten: 'Kosten',
  arbeitszeit: 'Arbeitszeit / Pensum',
} as const

function FormSectionBlock({
  title,
  sectionId,
  children,
}: {
  title: string
  sectionId: string
  children: ReactNode
}) {
  return (
    <section className="awb-antrag-form__section" id={sectionId}>
      <Title level="H2" size="H4" className="awb-antrag-form__section-title">
        {title}
      </Title>
      {children}
    </section>
  )
}

function FormGroupInfoHeader({
  title,
  infoLabel,
  onInfo,
}: {
  title: string
  infoLabel: string
  onInfo: () => void
}) {
  return (
    <FormItem>
      <div className="awb-antrag-form__group-header">
        <Title level="H6" size="H6" className="awb-antrag-form__group-header-title">
          {title}
        </Title>
        <Button
          design="Transparent"
          icon="information"
          accessibleName={infoLabel}
          onClick={onInfo}
        />
      </div>
    </FormItem>
  )
}

function RadioFormItem({
  label,
  infoLabel,
  onInfo,
  children,
}: {
  label: ReactNode
  infoLabel?: string
  onInfo?: () => void
  children: ReactNode
}) {
  return (
    <FormItem>
      <div className="awb-antrag-form__stacked-field">
        <div className="awb-antrag-form__label-row">
          {label}
          {onInfo && infoLabel ? (
            <Button
              design="Transparent"
              icon="information"
              accessibleName={infoLabel}
              onClick={onInfo}
            />
          ) : null}
        </div>
        <FlexBox className="awb-antrag-form__radio-row">{children}</FlexBox>
      </div>
    </FormItem>
  )
}

export type AntragFormSectionProps = {
  form: AntragFormData
  onPatch: (patch: Partial<AntragFormData>) => void
}

export type AntragFormArbeitszeitSectionProps = AntragFormSectionProps & {
  employeeTagessatz: number
}

export function AntragFormGrunddatenSection({ form, onPatch }: AntragFormSectionProps) {
  return (
    <FormSectionBlock title={ANTRAG_FORM_SECTION_TITLES.grunddaten} sectionId="grunddaten">
      <Form
        className="awb-antrag-form__form"
        layout={FORM_LAYOUT}
        labelSpan={FORM_LABEL_SPAN}
        accessibleMode={FORM_ACCESSIBLE_MODE}
      >
        <FormGroup headerText="Anbieter und Dauer">
          <FormItem labelContent={<Label required showColon>Titel</Label>}>
            <Input
              value={form.titel}
              onInput={(event) => onPatch({ titel: event.target.value ?? '' })}
            />
          </FormItem>
          <FormItem labelContent={<Label required showColon>Anbieter/-in / Schule</Label>}>
            <ComboBox
              value={form.anbieter}
              placeholder="Schule suchen oder auswählen"
              filter="Contains"
              showClearIcon
              accessibleName="Anbieter/-in / Schule"
              onInput={(event) => onPatch({ anbieter: event.target.value ?? '' })}
              onChange={(event) => onPatch({ anbieter: event.target.value ?? '' })}
            >
              {SCHULEN_ANBIETER_OPTIONS.map((schule) => (
                <ComboBoxItem key={schule} text={schule} />
              ))}
            </ComboBox>
          </FormItem>
          <FormItem>
            <div className="awb-antrag-form__date-row">
              <div className="awb-antrag-form__date-field">
                <Label required showColon>Vom</Label>
                <DatePicker
                  className="awb-antrag-form__date-picker"
                  style={{ width: '100%' }}
                  value={form.von}
                  placeholder="z. B. 13.09.2026"
                  formatPattern="dd.MM.yyyy"
                  onChange={(event) => onPatch({ von: event.detail.value ?? '' })}
                />
              </div>
              <div className="awb-antrag-form__date-field">
                <Label required showColon>Voraussichtlich bis</Label>
                <DatePicker
                  className="awb-antrag-form__date-picker"
                  style={{ width: '100%' }}
                  value={form.bis}
                  placeholder="z. B. 24.12.2026"
                  formatPattern="dd.MM.yyyy"
                  onChange={(event) => onPatch({ bis: event.detail.value ?? '' })}
                />
              </div>
            </div>
          </FormItem>
        </FormGroup>

        <FormGroup headerText="Abschluss">
          <FormItem labelContent={<Label required showColon>Typ</Label>}>
            <Select
              onChange={(event) => {
                const text = event.detail.selectedOption?.textContent ?? ''
                onPatch({ niveau: text === 'Bitte wählen' ? '' : text })
              }}
            >
              <Option data-key="" selected={!form.niveau}>Bitte wählen</Option>
              {TYP_OPTIONS.map((option) => (
                <Option key={option} selected={form.niveau === option}>
                  {option}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem labelContent={<Label required showColon>Fachrichtung</Label>}>
            <Select
              onChange={(event) => {
                const text = event.detail.selectedOption?.textContent ?? ''
                onPatch({ fachrichtung: text === 'Bitte wählen' ? '' : text })
              }}
            >
              <Option data-key="" selected={!form.fachrichtung}>Bitte wählen</Option>
              {FACHRICHTUNG_OPTIONS.map((option) => (
                <Option key={option} selected={form.fachrichtung === option}>
                  {option}
                </Option>
              ))}
            </Select>
          </FormItem>
        </FormGroup>
      </Form>
    </FormSectionBlock>
  )
}

export function AntragFormKostenSection({ form, onPatch }: AntragFormSectionProps) {
  const [beteiligungBundInfoOpen, setBeteiligungBundInfoOpen] = useState(false)
  const bundBetrag = getBundBeteiligung(form)
  const postGrundlage = getPostKostenGrundlage(form)
  const bundBetragLabel =
    bundBetrag > 0 ? `- ${bundBetrag.toLocaleString('de-CH')}` : '0'

  return (
    <FormSectionBlock title={ANTRAG_FORM_SECTION_TITLES.kosten} sectionId="kosten">
      <Form
        className="awb-antrag-form__form"
        layout={FORM_LAYOUT}
        labelSpan={FORM_LABEL_SPAN}
        accessibleMode={FORM_ACCESSIBLE_MODE}
      >
        <FormGroup>
          <FormGroupInfoHeader
            title="Beteiligung Bund"
            infoLabel="Informationen zur Beteiligung Bund"
            onInfo={() => setBeteiligungBundInfoOpen(true)}
          />
          <RadioFormItem
            label={
              <Label required showColon>
                Handelt es sich beim angestrebten Abschluss um eine eidgenössische Prüfung,
                die vom Bund zu 50% finanziert wird
              </Label>
            }
          >
            <RadioButton
              name="bund50"
              text="Ja"
              checked={form.bund50 === 'ja'}
              onChange={() => onPatch({ bund50: 'ja' as JaNein })}
            />
            <RadioButton
              name="bund50"
              text="Nein"
              checked={form.bund50 === 'nein'}
              onChange={() => onPatch({ bund50: 'nein' as JaNein })}
            />
          </RadioFormItem>
        </FormGroup>

        <FormGroup headerText="Ausbildungskosten">
          <FormItem>
            <MessageStrip design="Information" hideCloseButton className="awb-antrag-form__info">
              Bitte erfasse die Ausbildungskosten in CHF. Reise-, Übernachtungs- oder
              Verpflegungskosten werden über die Spesenabrechnung zurückgefordert.
            </MessageStrip>
          </FormItem>
          <FormItem labelContent={<Label required showColon>Kurskosten</Label>}>
            <Input
              value={form.kurskosten}
              onInput={(event) => onPatch({ kurskosten: event.target.value ?? '' })}
            />
          </FormItem>
          <FormItem labelContent={<Label showColon>Beteiligung Bund</Label>}>
            <Text>{bundBetragLabel}</Text>
          </FormItem>
          <FormItem
            labelContent={
              <Label showColon>Zusätzliche Kosten (Einschreibegebühr, Material, etc.)</Label>
            }
          >
            <Input
              value={form.zusaetzlicheKosten}
              onInput={(event) =>
                onPatch({ zusaetzlicheKosten: event.target.value ?? '' })
              }
            />
          </FormItem>
          <FormItem>
            <MessageStrip
              design="ColorSet2"
              colorScheme="9"
              hideCloseButton
              className="awb-antrag-form__info"
              icon={<Icon name="money-bills" slot="icon" />}
            >
              Die Grundlage für die Beteiligung Post an den Ausbildungskosten ist{' '}
              {formatChf(postGrundlage)}
            </MessageStrip>
          </FormItem>
        </FormGroup>
      </Form>

      <AwbDialog
        open={beteiligungBundInfoOpen}
        headerText="Subjektfinanzierung"
        onClose={() => setBeteiligungBundInfoOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button
                  onClick={() =>
                    window.open(BUND_SUBJEKTFINANZIERUNG_URL, '_blank', 'noopener,noreferrer')
                  }
                >
                  Informationen Bund
                </Button>
                <Button design="Emphasized" onClick={() => setBeteiligungBundInfoOpen(false)}>
                  OK
                </Button>
              </>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Informiere dich auf der Seite des Bundes, ob dein Lehrgang vom Bund zu 50%
            finanziert wird.
            <br />
            <br />
            Die Beteiligung der Post wird auf Basis des nicht finanzierten Anteils berechnet.
          </Text>
        </div>
      </AwbDialog>
    </FormSectionBlock>
  )
}

export function AntragFormArbeitszeitSection({
  form,
  employeeTagessatz,
  onPatch,
}: AntragFormArbeitszeitSectionProps) {
  const [arbeitszeiterleichterungInfoOpen, setArbeitszeiterleichterungInfoOpen] =
    useState(false)
  const arbeitszeit = getArbeitszeitGrundlage(form, employeeTagessatz)

  return (
    <FormSectionBlock
      title={ANTRAG_FORM_SECTION_TITLES.arbeitszeit}
      sectionId="arbeitszeit"
    >
      <Form
        className="awb-antrag-form__form"
        layout={FORM_LAYOUT}
        labelSpan={FORM_LABEL_SPAN}
        accessibleMode={FORM_ACCESSIBLE_MODE}
      >
        <FormGroup headerText="Arbeitspensum">
          <RadioFormItem
            label={
              <Label required showColon>
                Muss der Beschäftigungsgrad für die Dauer der Ausbildung angepasst werden
              </Label>
            }
          >
            <RadioButton
              name="pensum"
              text="Ja"
              checked={form.beschaeftigungsgradAnpassen === 'ja'}
              onChange={() => onPatch({ beschaeftigungsgradAnpassen: 'ja' })}
            />
            <RadioButton
              name="pensum"
              text="Nein"
              checked={form.beschaeftigungsgradAnpassen === 'nein'}
              onChange={() => onPatch({ beschaeftigungsgradAnpassen: 'nein' })}
            />
          </RadioFormItem>
        </FormGroup>

        <FormGroup>
          <FormGroupInfoHeader
            title="Arbeitszeiterleichterung"
            infoLabel="Informationen zur Arbeitszeiterleichterung"
            onInfo={() => setArbeitszeiterleichterungInfoOpen(true)}
          />
          <RadioFormItem
            label={
              <Label required showColon>Benötigst du eine Arbeitszeiterleichterung?</Label>
            }
          >
            <RadioButton
              name="aze"
              text="Ja"
              checked={form.arbeitszeiterleichterung === 'ja'}
              onChange={() => onPatch({ arbeitszeiterleichterung: 'ja' })}
            />
            <RadioButton
              name="aze"
              text="Nein"
              checked={form.arbeitszeiterleichterung === 'nein'}
              onChange={() => onPatch({ arbeitszeiterleichterung: 'nein' })}
            />
          </RadioFormItem>
          {form.arbeitszeiterleichterung === 'ja' ? (
            <>
              <FormItem labelContent={<Label required showColon>Anzahl Tage</Label>}>
                <Input
                  value={form.anzahlTageErleichterung}
                  onInput={(event) =>
                    onPatch({ anzahlTageErleichterung: event.target.value ?? '' })
                  }
                />
              </FormItem>
              <FormItem labelContent={<Label required showColon>Begründung</Label>}>
                <Input
                  value={form.begruendungErleichterung}
                  onInput={(event) =>
                    onPatch({ begruendungErleichterung: event.target.value ?? '' })
                  }
                />
              </FormItem>
              <FormItem>
                <MessageStrip
                  design="ColorSet2"
                  colorScheme="9"
                  hideCloseButton
                  className="awb-antrag-form__info"
                  icon={<Icon name="timesheet" slot="icon" />}
                >
                  Die Grundlage für die Beteiligung Post an der Arbeitszeit ist{' '}
                  {formatChf(arbeitszeit.betrag)}
                  {arbeitszeit.tage > 0
                    ? ` (${arbeitszeit.tage} Tage à ${formatChfRate(arbeitszeit.tagessatz)})`
                    : ''}
                </MessageStrip>
              </FormItem>
            </>
          ) : null}
        </FormGroup>
      </Form>

      <AwbDialog
        open={arbeitszeiterleichterungInfoOpen}
        headerText="Arbeitszeiterleichterung (AZE)"
        onClose={() => setArbeitszeiterleichterungInfoOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <Button
                design="Emphasized"
                onClick={() => setArbeitszeiterleichterungInfoOpen(false)}
              >
                OK
              </Button>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Arbeitszeiterleichterung ist als zeitliche Lernunterstützung gedacht und wird in
            den Gesamtbetrag und in die Rückzahlungsverpflichtung einbezogen.
          </Text>
          <ul className="awb-dialog-content__list">
            <li>
              Bei der Arbeitszeiterleichterung (AZE) entscheidet die Führungsperson über die
              effektiv gewährte Anzahl in Tagen oder Stunden.
            </li>
            <li>
              Für Aus- und Weiterbildungen, die in die arbeitsfreie Zeit fallen, wird keine
              AZE gewährt (Ausnahmen sind möglich, bspw. Weiterbildung, die regelmässig nur
              samstags stattfindet).
            </li>
            <li>
              Die Bereiche/Konzerngesellschaften können eigene Vorgaben zu den AZE erlassen.
            </li>
          </ul>
        </div>
      </AwbDialog>
    </FormSectionBlock>
  )
}
