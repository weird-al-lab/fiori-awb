import { useEffect, useState, type ReactNode } from 'react'
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
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import {
  ANTRAG_FORM_SECTION_TITLES,
  FACHRICHTUNG_OPTIONS,
  formatChf,
  formatChfRate,
  getArbeitszeitGrundlage,
  getBundBeteiligung,
  getPostKostenGrundlage,
  isBund50NiveauEligible,
  jaNeinLabel,
  SCHULEN_ANBIETER_OPTIONS,
  TYP_OPTIONS,
  type AntragFormData,
  type AntragFormFieldId,
  type JaNein,
} from '../../data/antraege'
import './AusbildungAntragForm.css'

const BUND_SUBJEKTFINANZIERUNG_URL =
  'https://www.sbfi.admin.ch/de/bundesbeitraege-fuer-kurse-die-auf-eidgenoessische-pruefungen-vorbereiten'

const FORM_LAYOUT = 'S1 M2 L2 XL2'
const FORM_LABEL_SPAN = 'S12 M12 L12 XL12'
const FORM_ACCESSIBLE_MODE = 'Edit' as const

export { ANTRAG_FORM_SECTION_TITLES } from '../../data/antraege'

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

export type AntragFormSectionProps = {
  form: AntragFormData
  onPatch: (patch: Partial<AntragFormData>) => void
  fieldErrors?: Partial<Record<AntragFormFieldId, string>>
}

function fieldValueState(error?: string) {
  return error ? ('Negative' as const) : ('None' as const)
}

function fieldValueStateMessage(error?: string) {
  return error ? <span slot="valueStateMessage">{error}</span> : undefined
}

function RadioFormItem({
  label,
  infoLabel,
  onInfo,
  error,
  fieldId,
  children,
}: {
  label: ReactNode
  infoLabel?: string
  onInfo?: () => void
  error?: string
  fieldId?: AntragFormFieldId
  children: ReactNode
}) {
  return (
    <FormItem>
      <div className="awb-antrag-form__stacked-field" data-antrag-field={fieldId}>
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
        {error ? (
          <MessageStrip design="Negative" hideCloseButton className="awb-antrag-form__field-error">
            {error}
          </MessageStrip>
        ) : null}
      </div>
    </FormItem>
  )
}

export type AntragFormArbeitszeitSectionProps = AntragFormSectionProps & {
  employeeTagessatz: number
}

export function AntragFormGrunddatenSection({
  form,
  onPatch,
  fieldErrors = {},
}: AntragFormSectionProps) {
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
              id="antrag-field-titel"
              data-antrag-field="titel"
              value={form.titel}
              valueState={fieldValueState(fieldErrors.titel)}
              valueStateMessage={fieldValueStateMessage(fieldErrors.titel)}
              onInput={(event) => onPatch({ titel: event.target.value ?? '' })}
            />
          </FormItem>
          <FormItem labelContent={<Label required showColon>Anbieter/-in / Schule</Label>}>
            <ComboBox
              id="antrag-field-anbieter"
              data-antrag-field="anbieter"
              value={form.anbieter}
              valueState={fieldValueState(fieldErrors.anbieter)}
              valueStateMessage={fieldValueStateMessage(fieldErrors.anbieter)}
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
                  id="antrag-field-von"
                  data-antrag-field="von"
                  className="awb-antrag-form__date-picker"
                  style={{ width: '100%' }}
                  value={form.von}
                  valueState={fieldValueState(fieldErrors.von)}
                  valueStateMessage={fieldValueStateMessage(fieldErrors.von)}
                  placeholder="z. B. 13.09.2026"
                  formatPattern="dd.MM.yyyy"
                  onChange={(event) => onPatch({ von: event.detail.value ?? '' })}
                />
              </div>
              <div className="awb-antrag-form__date-field">
                <Label required showColon>Voraussichtlich bis</Label>
                <DatePicker
                  id="antrag-field-bis"
                  data-antrag-field="bis"
                  className="awb-antrag-form__date-picker"
                  style={{ width: '100%' }}
                  value={form.bis}
                  valueState={fieldValueState(fieldErrors.bis)}
                  valueStateMessage={fieldValueStateMessage(fieldErrors.bis)}
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
              id="antrag-field-niveau"
              data-antrag-field="niveau"
              valueState={fieldValueState(fieldErrors.niveau)}
              valueStateMessage={fieldValueStateMessage(fieldErrors.niveau)}
              onChange={(event) => {
                const text = event.detail.selectedOption?.textContent ?? ''
                const niveau = text === 'Bitte wählen' ? '' : text
                const patch: Partial<AntragFormData> = { niveau }
                if (!isBund50NiveauEligible(niveau)) {
                  patch.bund50 = 'nein'
                } else if (!isBund50NiveauEligible(form.niveau)) {
                  patch.bund50 = ''
                }
                onPatch(patch)
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
              id="antrag-field-fachrichtung"
              data-antrag-field="fachrichtung"
              valueState={fieldValueState(fieldErrors.fachrichtung)}
              valueStateMessage={fieldValueStateMessage(fieldErrors.fachrichtung)}
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

export function AntragFormKostenSection({
  form,
  onPatch,
  fieldErrors = {},
}: AntragFormSectionProps) {
  const [beteiligungBundInfoOpen, setBeteiligungBundInfoOpen] = useState(false)
  const bund50Locked = !isBund50NiveauEligible(form.niveau)
  const bundBetrag = getBundBeteiligung(form)
  const postGrundlage = getPostKostenGrundlage(form)
  const bundBetragLabel =
    bundBetrag > 0 ? `- ${bundBetrag.toLocaleString('de-CH')}` : '0'
  const showBundBetrag = form.bund50 === 'ja'

  useEffect(() => {
    if (bund50Locked && form.bund50 !== 'nein') {
      onPatch({ bund50: 'nein' })
    }
  }, [bund50Locked, form.bund50, onPatch])

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
            fieldId="bund50"
            error={fieldErrors.bund50}
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
              checked={!bund50Locked && form.bund50 === 'ja'}
              disabled={bund50Locked}
              onChange={() => onPatch({ bund50: 'ja' as JaNein })}
            />
            <RadioButton
              name="bund50"
              text="Nein"
              checked={bund50Locked ? true : form.bund50 === 'nein'}
              disabled={bund50Locked}
              onChange={() => onPatch({ bund50: 'nein' as JaNein })}
            />
          </RadioFormItem>
        </FormGroup>

        <FormGroup headerText="Weiterbildungskosten">
          <FormItem>
            <MessageStrip design="Information" hideCloseButton className="awb-antrag-form__info">
              Bitte erfasse die Weiterbildungskosten in CHF. Reise-, Übernachtungs- oder
              Verpflegungskosten werden über die Spesenabrechnung zurückgefordert.
            </MessageStrip>
          </FormItem>
          <FormItem labelContent={<Label required showColon>Kurskosten</Label>}>
            <Input
              id="antrag-field-kurskosten"
              data-antrag-field="kurskosten"
              value={form.kurskosten}
              valueState={fieldValueState(fieldErrors.kurskosten)}
              valueStateMessage={fieldValueStateMessage(fieldErrors.kurskosten)}
              onInput={(event) => onPatch({ kurskosten: event.target.value ?? '' })}
            />
          </FormItem>
          {showBundBetrag ? (
            <FormItem labelContent={<Label showColon>Beteiligung Bund</Label>}>
              <Text>{bundBetragLabel}</Text>
            </FormItem>
          ) : null}
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
              Die Grundlage für die Beteiligung Post an den Weiterbildungskosten ist{' '}
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
  fieldErrors = {},
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
            fieldId="beschaeftigungsgradAnpassen"
            error={fieldErrors.beschaeftigungsgradAnpassen}
            label={
              <Label required showColon>
                Muss der Beschäftigungsgrad für die Dauer der Weiterbildung angepasst werden
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
            fieldId="arbeitszeiterleichterung"
            error={fieldErrors.arbeitszeiterleichterung}
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
                  id="antrag-field-anzahl-tage-erleichterung"
                  data-antrag-field="anzahlTageErleichterung"
                  value={form.anzahlTageErleichterung}
                  valueState={fieldValueState(fieldErrors.anzahlTageErleichterung)}
                  valueStateMessage={fieldValueStateMessage(fieldErrors.anzahlTageErleichterung)}
                  onInput={(event) =>
                    onPatch({ anzahlTageErleichterung: event.target.value ?? '' })
                  }
                />
              </FormItem>
              <FormItem labelContent={<Label required showColon>Begründung</Label>}>
                <TextArea
                  id="antrag-field-begruendung-erleichterung"
                  data-antrag-field="begruendungErleichterung"
                  rows={4}
                  style={{ width: '100%' }}
                  value={form.begruendungErleichterung}
                  valueState={fieldValueState(fieldErrors.begruendungErleichterung)}
                  valueStateMessage={fieldValueStateMessage(fieldErrors.begruendungErleichterung)}
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

function ReviewStackedField({
  label,
  value,
  changed,
}: {
  label: ReactNode
  value: string
  changed?: boolean
}) {
  return (
    <FormItem>
      <div
        className={`awb-antrag-form__stacked-field${changed ? ' awb-review__field--changed' : ''}`}
      >
        <div className="awb-antrag-form__label-row">{label}</div>
        <Text>{value || '—'}</Text>
      </div>
    </FormItem>
  )
}

function ReviewGroupHeader({ title }: { title: string }) {
  return (
    <FormItem>
      <div className="awb-antrag-form__group-header">
        <Title level="H6" size="H6" className="awb-antrag-form__group-header-title">
          {title}
        </Title>
      </div>
    </FormItem>
  )
}

export type AntragReviewArbeitszeitSectionProps = {
  form: AntragFormData
  employeeTagessatz: number
  fieldChanged?: (key: string) => boolean
}

export function AntragReviewArbeitszeitSection({
  form,
  employeeTagessatz,
  fieldChanged = () => false,
}: AntragReviewArbeitszeitSectionProps) {
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
          <ReviewStackedField
            label={
              <Label showColon>
                Muss der Beschäftigungsgrad für die Dauer der Weiterbildung angepasst werden
              </Label>
            }
            value={jaNeinLabel(form.beschaeftigungsgradAnpassen)}
            changed={fieldChanged('beschaeftigungsgradAnpassen')}
          />
        </FormGroup>

        <FormGroup>
          <ReviewGroupHeader title="Arbeitszeiterleichterung" />
          <ReviewStackedField
            label={<Label showColon>Benötigst du eine Arbeitszeiterleichterung?</Label>}
            value={jaNeinLabel(form.arbeitszeiterleichterung)}
            changed={fieldChanged('arbeitszeiterleichterung')}
          />
          {form.arbeitszeiterleichterung === 'ja' ? (
            <>
              <ReviewStackedField
                label={<Label showColon>Anzahl Tage</Label>}
                value={form.anzahlTageErleichterung}
                changed={fieldChanged('anzahlTageErleichterung')}
              />
              <ReviewStackedField
                label={<Label showColon>Begründung</Label>}
                value={form.begruendungErleichterung}
                changed={fieldChanged('begruendungErleichterung')}
              />
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
    </FormSectionBlock>
  )
}
