import { useEffect, type ReactNode } from 'react'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Label } from '@ui5/webcomponents-react/Label'
import { Link } from '@ui5/webcomponents-react/Link'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { Text } from '@ui5/webcomponents-react/Text'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import {
  createDefaultAusbildungUpdate,
  ensureAusbildungUpdate,
  isAbschlussPhase,
  isAusbildungPhase,
  type AusbildungOutcome,
  type AusbildungUpdateDraft,
  type JaNein,
  type WeiterbildungAntrag,
} from '../data/antraege'
import './AusbildungSection.css'

type AusbildungSectionProps = {
  antrag: WeiterbildungAntrag
  readOnly: boolean
  showUpdateBanner: boolean
  onCloseBanner?: () => void
  onChange: (draft: AusbildungUpdateDraft) => void
  onWeisungClick?: () => void
}

function GroupTitle({ children }: { children: string }) {
  return <Text className="awb-ausbildung__group-title">{children}</Text>
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

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="awb-ausbildung__field">
      <Label showColon>{label}</Label>
      <Text>{value || '—'}</Text>
    </div>
  )
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
  showUpdateBanner,
  onCloseBanner,
  onChange,
  onWeisungClick,
}: AusbildungSectionProps) {
  const draft = ensureAusbildungUpdate(antrag)
  const isRetryPhase = antrag.unterstatus === 'Prüfung nicht bestanden'
  const inAusbildung = isAusbildungPhase(antrag)
  const inAbschluss = isAbschlussPhase(antrag)
  const interactive = !readOnly && inAusbildung

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
    interactive &&
    (draft.outcome === 'in_ausbildung' ||
      (draft.outcome === 'pruefung_nicht_bestanden' && draft.wiederholung === 'ja'))

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
        <div className="awb-ausbildung__grid">
          <div className="awb-ausbildung__col">
            <GroupTitle>Status der Ausbildung</GroupTitle>

            {interactive ? (
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="awb-ausbildung__radios"
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
              </FlexBox>
            ) : (
              <DisplayField label="Aktueller Status" value={summaryOutcome} />
            )}

            {showWiederholung ? (
              <div className="awb-ausbildung__follow-up">
                <GroupTitle>Wird die Prüfung wiederholt?</GroupTitle>
                <FlexBox
                  direction={FlexBoxDirection.Column}
                  className="awb-ausbildung__radios"
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
            ) : null}

            {showFailNoRetryWarning ? (
              <MessageStrip design="Critical" hideCloseButton>
                Hier sollte ein Text kommen, der erklärt, wie es in diesem Fall
                weitergeht.
              </MessageStrip>
            ) : null}

            {showWeitereWarning ? (
              <MessageStrip design="Critical" hideCloseButton>
                Du gibst an, die zweite Prüfung nicht bestanden zu haben. Damit
                werden 1/3 der durch die Post ausbezahlten Beträge für deine Aus-
                oder Weiterbildung sowie allfällig bezogene Tage einer
                Arbeitszeiterleichterung rückzahlungspflichtig.
              </MessageStrip>
            ) : null}

            {showAbbruchWarning ? (
              <MessageStrip design="Critical" hideCloseButton>
                Mit dem Abbruch werden die durch die Post ausbezahlten Beträge
                für deine Aus- oder Weiterbildung sowie allfällig bezogene Tage
                einer Arbeitszeiterleichterung rückzahlungspflichtig.{' '}
                <Link
                  onClick={(event) => {
                    event.preventDefault()
                    onWeisungClick?.()
                  }}
                >
                  Siehe Weisung
                </Link>
              </MessageStrip>
            ) : null}
          </div>

          <div className="awb-ausbildung__col">
            <GroupTitle>Ausbildungsdauer</GroupTitle>
            <div className="awb-ausbildung__dates">
              <div className="awb-ausbildung__field">
                <Label showColon>Datum von</Label>
                <Text>{antrag.von || antrag.form.von || '—'}</Text>
              </div>
              <div className="awb-ausbildung__field">
                <Label showColon>Datum bis</Label>
                {showEndDateEdit ? (
                  <DatePicker
                    value={endDateValue}
                    placeholder={
                      draft.outcome === 'in_ausbildung' ? undefined : 'neues Enddatum'
                    }
                    formatPattern="dd.MM.yyyy"
                    accessibleName="Datum bis"
                    onChange={(event) =>
                      patch({ neuesEnddatum: event.detail.value ?? '' })
                    }
                  />
                ) : (
                  <Text>{antrag.bis || antrag.form.bis || '—'}</Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </AusbildungPanel>
    </div>
  )
}
