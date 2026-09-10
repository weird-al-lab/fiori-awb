import { useEffect, type ReactNode } from 'react'
import { Button } from '@ui5/webcomponents-react/Button'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Form } from '@ui5/webcomponents-react/Form'
import { FormGroup } from '@ui5/webcomponents-react/FormGroup'
import { FormItem } from '@ui5/webcomponents-react/FormItem'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Label } from '@ui5/webcomponents-react/Label'
import { Link } from '@ui5/webcomponents-react/Link'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { Text } from '@ui5/webcomponents-react/Text'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import '@ui5/webcomponents-fiori/dist/illustrations/SuccessHighFive.js'
import {
  AUSBILDUNG_FORM_FIELD_IDS,
  createDefaultAusbildungUpdate,
  ensureAusbildungUpdate,
  isAbschlussPhase,
  isAusbildungPhase,
  type AusbildungFormFieldId,
  type AusbildungOutcome,
  type AusbildungUpdateDraft,
  type JaNein,
  type WeiterbildungAntrag,
} from '../data/antraege'
import './AusbildungSection.css'

const FORM_LAYOUT = 'S1 M2 L2 XL2'
const FORM_LABEL_SPAN = 'S12 M12 L12 XL12'

type AusbildungSectionProps = {
  antrag: WeiterbildungAntrag
  readOnly: boolean
  /** When true, Datum bis stays editable even if status radios are read-only. */
  endDateEditable?: boolean
  showUpdateBanner: boolean
  onCloseBanner?: () => void
  onChange: (draft: AusbildungUpdateDraft) => void
  onWeisungClick?: () => void
  onProfilUpdateClick?: () => void
  fieldErrors?: Partial<Record<AusbildungFormFieldId, string>>
}

function AusbildungPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Panel
      className="awb-review__panel"
      collapsed={false}
      accessibleName={title}
      headerLevel="H3"
      headerText={title}
    >
      <div className="awb-review__panel-body">{children}</div>
    </Panel>
  )
}

function fieldValueState(error?: string) {
  return error ? ('Negative' as const) : ('None' as const)
}

function fieldValueStateMessage(error?: string) {
  return error ? <span slot="valueStateMessage">{error}</span> : undefined
}

function outcomeLabel(
  outcome: AusbildungOutcome,
  phase: 'gestartet' | 'pruefung',
): string {
  switch (outcome) {
    case 'in_ausbildung':
      return 'In Ausbildung'
    case 'pruefung_nicht_bestanden':
      return 'Prüfung nicht bestanden'
    case 'weitere_pruefung_nicht_bestanden':
      return 'Weitere Prüfung nicht bestanden'
    case 'ausbildung_bestanden':
      return 'Ausbildung bestanden'
    case 'abbruch':
      return 'Abbruch der Ausbildung'
    default:
      return phase === 'gestartet' ? 'In Ausbildung' : 'Prüfung nicht bestanden'
  }
}

export function AusbildungSection({
  antrag,
  readOnly,
  endDateEditable = false,
  showUpdateBanner,
  onCloseBanner,
  onChange,
  onWeisungClick,
  onProfilUpdateClick,
  fieldErrors = {},
}: AusbildungSectionProps) {
  const draft = ensureAusbildungUpdate(antrag)
  const isRetryPhase = antrag.unterstatus === 'Prüfung nicht bestanden'
  const inAusbildung = isAusbildungPhase(antrag)
  const inAbschluss = isAbschlussPhase(antrag)
  const interactive = !readOnly && inAusbildung
  const stillInAusbildung =
    inAusbildung &&
    !isRetryPhase &&
    draft.outcome === 'in_ausbildung'
  const showBestandenDelight = antrag.unterstatus === 'Ausbildung bestanden'
  const formAccessibleMode =
    interactive || endDateEditable ? ('Edit' as const) : ('Display' as const)

  useEffect(() => {
    if (!antrag.ausbildungUpdate && inAusbildung) {
      onChange(createDefaultAusbildungUpdate(antrag))
    }
    // Intentionally only when entering Ausbildung without a draft
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antrag.id, antrag.unterstatus, inAusbildung])

  const patch = (partial: Partial<AusbildungUpdateDraft>) => {
    onChange({ ...draft, ...partial })
  }

  const setOutcome = (outcome: AusbildungOutcome) => {
    onChange({
      ...draft,
      outcome,
      wiederholung:
        outcome === 'pruefung_nicht_bestanden' ? draft.wiederholung || '' : '',
      neuesEnddatum:
        outcome === 'pruefung_nicht_bestanden' && draft.wiederholung === 'ja'
          ? draft.neuesEnddatum
          : '',
    })
  }

  const setWiederholung = (wiederholung: JaNein) => {
    onChange({
      ...draft,
      wiederholung,
      neuesEnddatum: wiederholung === 'ja' ? draft.neuesEnddatum : '',
    })
  }

  const showWiederholung =
    interactive &&
    !isRetryPhase &&
    draft.outcome === 'pruefung_nicht_bestanden'

  const showEndDateEdit =
    (interactive &&
      (draft.outcome === 'in_ausbildung' ||
        (draft.outcome === 'pruefung_nicht_bestanden' &&
          draft.wiederholung === 'ja'))) ||
    (endDateEditable && stillInAusbildung)

  const endDateValue =
    draft.outcome === 'in_ausbildung'
      ? draft.neuesEnddatum || antrag.bis || antrag.form.bis || ''
      : draft.neuesEnddatum ?? ''

  const showFailNoRetryWarning =
    showWiederholung && draft.wiederholung === 'nein'

  const showWeitereWarning =
    interactive &&
    isRetryPhase &&
    draft.outcome === 'weitere_pruefung_nicht_bestanden'

  const showAbbruchWarning =
    interactive && draft.outcome === 'abbruch'

  const summaryOutcome = inAbschluss
    ? antrag.unterstatus
    : outcomeLabel(
        draft.outcome,
        isRetryPhase ? 'pruefung' : 'gestartet',
      )

  return (
    <div className="awb-ausbildung">
      {showUpdateBanner && interactive ? (
        <MessageStrip
          design="Information"
          className="awb-ausbildung__banner"
          onClose={onCloseBanner}
        >
          Bitte prüfe und aktualisiere den Status der Ausbildung.
        </MessageStrip>
      ) : null}

      <AusbildungPanel title="Ausbildungsdaten">
        <Form
          className="awb-ausbildung__form"
          layout={FORM_LAYOUT}
          labelSpan={FORM_LABEL_SPAN}
          accessibleMode={formAccessibleMode}
        >
          <FormGroup headerText="Status der Ausbildung">
            {interactive ? (
              <FormItem>
                <div
                  id={AUSBILDUNG_FORM_FIELD_IDS.outcome}
                  data-ausbildung-field="outcome"
                  role="radiogroup"
                  aria-label="Status der Ausbildung"
                  aria-invalid={Boolean(fieldErrors.outcome) || undefined}
                  className="awb-ausbildung__radios awb-ausbildung__radios--column"
                >
                  {!isRetryPhase ? (
                    <>
                      <RadioButton
                        name="ausbildung-outcome"
                        text="In Ausbildung"
                        checked={draft.outcome === 'in_ausbildung'}
                        onChange={() => setOutcome('in_ausbildung')}
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Prüfung nicht bestanden"
                        checked={draft.outcome === 'pruefung_nicht_bestanden'}
                        onChange={() => setOutcome('pruefung_nicht_bestanden')}
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Ausbildung bestanden"
                        checked={draft.outcome === 'ausbildung_bestanden'}
                        onChange={() => setOutcome('ausbildung_bestanden')}
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Abbruch der Ausbildung"
                        checked={draft.outcome === 'abbruch'}
                        onChange={() => setOutcome('abbruch')}
                      />
                    </>
                  ) : (
                    <>
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Prüfung nicht bestanden"
                        checked={draft.outcome === 'pruefung_nicht_bestanden'}
                        onChange={() => setOutcome('pruefung_nicht_bestanden')}
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Weitere Prüfung nicht bestanden"
                        checked={
                          draft.outcome === 'weitere_pruefung_nicht_bestanden'
                        }
                        onChange={() =>
                          setOutcome('weitere_pruefung_nicht_bestanden')
                        }
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Ausbildung bestanden"
                        checked={draft.outcome === 'ausbildung_bestanden'}
                        onChange={() => setOutcome('ausbildung_bestanden')}
                      />
                      <RadioButton
                        name="ausbildung-outcome"
                        text="Abbruch der Ausbildung"
                        checked={draft.outcome === 'abbruch'}
                        onChange={() => setOutcome('abbruch')}
                      />
                    </>
                  )}
                </div>
                {fieldErrors.outcome ? (
                  <MessageStrip
                    design="Negative"
                    hideCloseButton
                    className="awb-ausbildung__field-error"
                  >
                    {fieldErrors.outcome}
                  </MessageStrip>
                ) : null}
              </FormItem>
            ) : (
              <FormItem
                labelContent={<Label showColon>Aktueller Status</Label>}
              >
                <Text>{summaryOutcome || '—'}</Text>
              </FormItem>
            )}

            {showWiederholung ? (
              <FormItem>
                <div
                  id={AUSBILDUNG_FORM_FIELD_IDS.wiederholung}
                  data-ausbildung-field="wiederholung"
                  role="radiogroup"
                  aria-labelledby="ausbildung-wiederholung-label"
                  aria-invalid={Boolean(fieldErrors.wiederholung) || undefined}
                  className="awb-ausbildung__follow-up"
                >
                  <Label id="ausbildung-wiederholung-label" showColon>
                    Wird die Prüfung wiederholt?
                  </Label>
                  <FlexBox
                    direction={FlexBoxDirection.Row}
                    className="awb-ausbildung__radios awb-ausbildung__radios--inline"
                  >
                    <RadioButton
                      name="ausbildung-wiederholung"
                      text="Ja"
                      checked={draft.wiederholung === 'ja'}
                      onChange={() => setWiederholung('ja')}
                    />
                    <RadioButton
                      name="ausbildung-wiederholung"
                      text="Nein"
                      checked={draft.wiederholung === 'nein'}
                      onChange={() => setWiederholung('nein')}
                    />
                  </FlexBox>
                </div>
                {fieldErrors.wiederholung ? (
                  <MessageStrip
                    design="Negative"
                    hideCloseButton
                    className="awb-ausbildung__field-error"
                  >
                    {fieldErrors.wiederholung}
                  </MessageStrip>
                ) : null}
              </FormItem>
            ) : null}

            {showFailNoRetryWarning ? (
              <FormItem>
                <MessageStrip design="Critical" hideCloseButton>
                  Ohne Wiederholung wird die Ausbildung als nicht bestanden
                  abgeschlossen. Du musst die Post-Beiträge und allfällig bezogene
                  Tage einer Arbeitszeiterleichterung zurückzahlen. Die
                  HR-Beratung kommt auf dich zu.
                </MessageStrip>
              </FormItem>
            ) : null}

            {showWeitereWarning ? (
              <FormItem>
                <MessageStrip design="Critical" hideCloseButton>
                  Du musst einen Drittel der Post-Beiträge und allfällig bezogene
                  Tage einer Arbeitszeiterleichterung zurückzahlen.
                </MessageStrip>
              </FormItem>
            ) : null}

            {showAbbruchWarning ? (
              <FormItem>
                <MessageStrip design="Critical" hideCloseButton>
                  Beim Abbruch musst du die Post-Beiträge und allfällig bezogene
                  Tage einer Arbeitszeiterleichterung zurückzahlen. Die
                  HR-Beratung kommt auf dich zu.{' '}
                  <Link
                    onClick={(event) => {
                      event.preventDefault()
                      onWeisungClick?.()
                    }}
                  >
                    Weisung anzeigen
                  </Link>
                </MessageStrip>
              </FormItem>
            ) : null}
          </FormGroup>

          <FormGroup headerText="Ausbildungsdauer">
            <div className="awb-ausbildung__dauer-row">
              <FormItem labelContent={<Label showColon>Datum von</Label>}>
                <Text>{antrag.von || antrag.form.von || '—'}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Datum bis</Label>}>
                {showEndDateEdit ? (
                  <DatePicker
                    id={AUSBILDUNG_FORM_FIELD_IDS.neuesEnddatum}
                    data-ausbildung-field="neuesEnddatum"
                    value={endDateValue}
                    formatPattern="dd.MM.yyyy"
                    accessibleName="Datum bis"
                    style={{ width: '100%' }}
                    valueState={fieldValueState(fieldErrors.neuesEnddatum)}
                    valueStateMessage={fieldValueStateMessage(
                      fieldErrors.neuesEnddatum,
                    )}
                    onChange={(event) =>
                      patch({ neuesEnddatum: event.detail.value ?? '' })
                    }
                  />
                ) : (
                  <Text>{antrag.bis || antrag.form.bis || '—'}</Text>
                )}
              </FormItem>
            </div>
          </FormGroup>
        </Form>

        {showBestandenDelight ? (
          <IllustratedMessage
            className="awb-ausbildung__delight"
            name="SuccessHighFive"
            design="Spot"
            titleText="Herzlichen Glückwunsch!"
            subtitleText="Deine Ausbildung ist bestanden. Falls sich dein höchster Bildungsabschluss dadurch geändert hat, aktualisiere bitte deine Profilinformationen."
          >
            <Button design="Emphasized" onClick={onProfilUpdateClick}>
              Profil aktualisieren
            </Button>
          </IllustratedMessage>
        ) : null}
      </AusbildungPanel>
    </div>
  )
}
