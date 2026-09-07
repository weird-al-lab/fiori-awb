import { useEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { AwbDialog } from '../../components/AwbDialog'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Label } from '@ui5/webcomponents-react/Label'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import {
  ObjectPage,
  type ObjectPageDomRef,
} from '@ui5/webcomponents-react/ObjectPage'
import { ObjectPageHeader } from '@ui5/webcomponents-react/ObjectPageHeader'
import { ObjectPageSection } from '@ui5/webcomponents-react/ObjectPageSection'
import { ObjectPageTitle } from '@ui5/webcomponents-react/ObjectPageTitle'
import type { TabDomRef } from '@ui5/webcomponents-react/Tab'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { Toast } from '@ui5/webcomponents-react/Toast'
import { FlexBoxAlignItems } from '@ui5/webcomponents-react/enums/FlexBoxAlignItems'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import { ObjectPageMode } from '@ui5/webcomponents-react/enums/ObjectPageMode'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { AppShellBar } from '../../components/AppShellBar'
import { AusbildungSection } from '../../components/AusbildungSection'
import { OwnCaseGuard } from '../../components/OwnCaseGuard'
import {
  buildProcessSteps,
  getPreferredReviewSectionId,
  MicroProcessFlow,
} from '../../components/MicroProcessFlow'
import { useObjectPageHeaderExpanded } from '../../layout/useObjectPageHeaderExpanded'
import { KommentarFeed } from '../../components/KommentarFeed'
import { UnterstatusTag } from '../../components/UnterstatusTag'
import { VereinbarungSection } from '../../components/VereinbarungSection'
import { usePrototypePersona } from '../../context/PrototypePersonaContext'
import {
  acceptAngebotByMa,
  addKommentarToAntrag,
  approveAntragAndCreateOffer,
  beginVgAntragEdit,
  canConfirmAusbildungUpdate,
  confirmAusbildungUpdate,
  ensureAusbildungUpdate,
  ensureVereinbarung,
  flushFormKommentarToFeed,
  formatChf,
  formatChfRate,
  getAntragAenderungen,
  getAntrag,
  getArbeitszeitGrundlage,
  getBundBeteiligung,
  getFeedEintraege,
  getPostKostenGrundlage,
  isAbschlussPhase,
  isAntragPruefungPhase,
  isAusbildungPhase,
  isMaUeberarbeitungPhase,
  isVgAntragPruefungEditable,
  hasMaRueckzahlungspflicht,
  isHrBeratungRequiredForSend,
  isProcessPhaseReached,
  isVereinbarungPhase,
  rejectAngebotByMa,
  rejectAntragByVg,
  saveAusbildungDraft,
  sendAngebotToMa,
  sendAntragToUeberarbeitung,
  jaNeinLabel,
  upsertAntrag,
  type AusbildungUpdateDraft,
  type VereinbarungData,
  type WeiterbildungAntrag,
} from '../../data/antraege'
import { getEmployee } from '../../data/employees'
import type { WeiterbildungHauptstatus } from '../../data/weiterbildungen'
import './AusbildungAntragReviewPage.css'

function DisplayField({
  label,
  value,
  changed,
}: {
  label: string
  value: string
  changed?: boolean
}) {
  return (
    <div
      className={`awb-review__field${changed ? ' awb-review__field--changed' : ''}`}
    >
      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        wrap={FlexBoxWrap.Wrap}
        className="awb-review__field-header"
      >
        <Label showColon>{label}</Label>
        {changed ? (
          <Text className="awb-review__field-changed-hint">Geändert</Text>
        ) : null}
      </FlexBox>
      <Text>{value || '—'}</Text>
    </div>
  )
}

function ReviewPanel({
  title,
  onEdit,
  fixed,
  children,
}: {
  title: string
  onEdit?: () => void
  fixed?: boolean
  children: ReactNode
}) {
  const customHeader = onEdit ? (
    <div slot="header" className="awb-review__panel-header">
      <Title level="H2" size="H5">
        {title}
      </Title>
      <Button design="Transparent" icon="edit" onClick={onEdit}>
        Bearbeiten
      </Button>
    </div>
  ) : undefined

  return (
    <Panel
      className="awb-review__panel"
      collapsed={false}
      fixed={fixed}
      accessibleName={title}
      headerLevel="H3"
      headerText={onEdit ? undefined : title}
      header={customHeader}
    >
      <div className="awb-review__panel-body">{children}</div>
    </Panel>
  )
}

function SectionMain({
  sectionId,
  children,
}: {
  sectionId: string
  children: ReactNode
}) {
  return (
    <main
      className="page-content-column awb-review__main"
      data-section-id={sectionId}
    >
      {children}
    </main>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="awb-review__group">
      <Text className="awb-review__group-title">{title}</Text>
      {children}
    </div>
  )
}

function ReviewProcessFlow({
  hauptstatus,
  unterstatus,
}: {
  hauptstatus: WeiterbildungHauptstatus
  unterstatus: WeiterbildungAntrag['unterstatus']
}) {
  const steps = buildProcessSteps(hauptstatus, unterstatus)

  return (
    <div className="awb-review__process-band">
      <MicroProcessFlow steps={steps} aria-label="Ausbildungsprozess" />
    </div>
  )
}

export function AusbildungAntragReviewPage() {
  const { employeeId = '', antragId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const employee = getEmployee(employeeId)
  const { persona, isVg, isMa, ownsEmployee } = usePrototypePersona()
  const objectPageRef = useRef<ObjectPageDomRef>(null)
  const vereinbarungTabRef = useRef<TabDomRef | null>(null)
  const ausbildungTabRef = useRef<TabDomRef | null>(null)

  const [antrag, setAntrag] = useState<WeiterbildungAntrag | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastText, setToastText] = useState('')
  const [rejectAntragOpen, setRejectAntragOpen] = useState(false)
  const [rejectAngebotOpen, setRejectAngebotOpen] = useState(false)
  const [hrBeratungOpen, setHrBeratungOpen] = useState(false)
  const [maAngebotEinverstanden, setMaAngebotEinverstanden] = useState(false)
  const [maAngebotHrKostenPflicht, setMaAngebotHrKostenPflicht] = useState(false)
  const [showMaReviewBanner, setShowMaReviewBanner] = useState(true)
  const [showMaUeberarbeitungBanner, setShowMaUeberarbeitungBanner] = useState(true)
  const [showVgResubmitBanner, setShowVgResubmitBanner] = useState(true)
  const [showRoleBanner, setShowRoleBanner] = useState(true)
  const [showAusbildungBanner, setShowAusbildungBanner] = useState(true)
  const [programmaticSectionId, setProgrammaticSectionId] = useState<
    string | undefined
  >(undefined)

  const ownCase = ownsEmployee(employeeId)

  useEffect(() => {
    setMaAngebotEinverstanden(false)
    setMaAngebotHrKostenPflicht(false)
    setShowMaReviewBanner(true)
    setShowMaUeberarbeitungBanner(true)
    setShowVgResubmitBanner(true)
  }, [antragId])

  useEffect(() => {
    if (!employee) {
      navigate('/v2/weiterbildung', { replace: true })
      return
    }
    const existing = getAntrag(antragId)
    if (!existing || existing.employeeId !== employee.id) {
      navigate(`/v2/weiterbildung/${employee.id}`, { replace: true })
      return
    }
    const loaded = isVereinbarungPhase(existing)
      ? { ...existing, vereinbarung: ensureVereinbarung(existing) }
      : isAusbildungPhase(existing)
        ? { ...existing, ausbildungUpdate: ensureAusbildungUpdate(existing) }
        : existing
    setAntrag(loaded)
    setProgrammaticSectionId(
      getPreferredReviewSectionId(loaded.hauptstatus, loaded.unterstatus),
    )
  }, [antragId, employee, navigate])

  useObjectPageHeaderExpanded(objectPageRef, antrag?.id)

  const vereinbarungTabEnabled = antrag
    ? isProcessPhaseReached(antrag, 'Vereinbarung')
    : false
  const ausbildungTabEnabled = antrag
    ? isProcessPhaseReached(antrag, 'Ausbildung')
    : false

  const setVereinbarungTabRef = (tab: TabDomRef | null) => {
    vereinbarungTabRef.current = tab
    if (tab) {
      tab.disabled = !vereinbarungTabEnabled
    }
  }

  const setAusbildungTabRef = (tab: TabDomRef | null) => {
    ausbildungTabRef.current = tab
    if (tab) {
      tab.disabled = !ausbildungTabEnabled
    }
  }

  useEffect(() => {
    if (vereinbarungTabRef.current) {
      vereinbarungTabRef.current.disabled = !vereinbarungTabEnabled
    }
    if (ausbildungTabRef.current) {
      ausbildungTabRef.current.disabled = !ausbildungTabEnabled
    }
  }, [vereinbarungTabEnabled, ausbildungTabEnabled])

  useEffect(() => {
    const state = location.state as { toast?: string } | null
    if (state?.toast) {
      setToastText(state.toast)
      setToastOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const goBack = () => {
    navigate(`/v2/weiterbildung/${employeeId}`)
  }

  const openEdit = () => {
    if (antrag && isVg && isVgAntragPruefungEditable(antrag)) {
      const updated = beginVgAntragEdit(antrag)
      setAntrag(updated)
    }
    navigate(`/v2/weiterbildung/${employeeId}/antrag/${antragId}/bearbeiten`)
  }

  const handleReviewSave = () => {
    if (!antrag) {
      return
    }
    if (isAusbildungPhase(antrag)) {
      const saved = saveAusbildungDraft(antrag, ensureAusbildungUpdate(antrag))
      setAntrag(saved)
      setToastText('Entwurf gespeichert')
      setToastOpen(true)
      return
    }
    const withComment = flushFormKommentarToFeed(antrag, persona.name)
    const toSave = isVereinbarungPhase(withComment)
      ? { ...withComment, vereinbarung: ensureVereinbarung(withComment) }
      : withComment
    const saved = upsertAntrag(toSave)
    setAntrag(saved)
    setToastText('Änderungen gespeichert')
    setToastOpen(true)
  }

  const executeSendToUeberarbeitung = () => {
    if (!antrag) {
      return
    }
    const updated = sendAntragToUeberarbeitung(antrag, persona.name)
    setAntrag(updated)
    setToastText('Antrag wurde zur Überarbeitung an die/ den Mitarbeitende/n gesendet')
    setToastOpen(true)
  }

  const handleSendToUeberarbeitung = () => {
    if (!antrag) {
      return
    }
    executeSendToUeberarbeitung()
  }

  const handleApproveAntrag = () => {
    if (!antrag) {
      return
    }
    const approved = approveAntragAndCreateOffer(antrag, persona.name)
    setAntrag(approved)
    setProgrammaticSectionId('vereinbarung')
    setShowRoleBanner(true)
    setToastText('Antrag genehmigt. Bitte legen Sie den Arbeitgeberbeitrag fest.')
    setToastOpen(true)
  }

  const handleSendAngebotToMa = () => {
    if (!antrag) {
      return
    }
    const updated = sendAngebotToMa(
      {
        ...antrag,
        vereinbarung: ensureVereinbarung(antrag),
      },
      persona.name,
    )
    setAntrag(updated)
    setToastText('Angebot wurde an die/ den Mitarbeitende/n zur Prüfung gesendet')
    setToastOpen(true)
  }

  const handleAcceptAngebot = () => {
    if (!antrag) {
      return
    }
    const updated = acceptAngebotByMa(
      {
        ...antrag,
        vereinbarung: ensureVereinbarung(antrag),
      },
      persona.name,
    )
    flushSync(() => {
      setAntrag(updated)
    })
    navigate(`/v2/weiterbildung/${employeeId}`, {
      state: { toast: 'Angebot angenommen — Ausbildung gestartet' },
    })
  }

  const handleRejectAntragConfirm = () => {
    if (!antrag) {
      return
    }
    const updated = rejectAntragByVg(antrag, persona.name)
    setAntrag(updated)
    setProgrammaticSectionId(
      getPreferredReviewSectionId(updated.hauptstatus, updated.unterstatus),
    )
    setRejectAntragOpen(false)
    setToastText('Antrag abgelehnt')
    setToastOpen(true)
  }

  const handleRejectAngebotConfirm = () => {
    if (!antrag) {
      return
    }
    const updated = rejectAngebotByMa(
      {
        ...antrag,
        vereinbarung: ensureVereinbarung(antrag),
      },
      persona.name,
    )
    flushSync(() => {
      setAntrag(updated)
      setRejectAngebotOpen(false)
    })
    navigate(`/v2/weiterbildung/${employeeId}`, {
      state: { toast: 'Angebot abgelehnt' },
    })
  }

  const handleAusbildungChange = (draft: AusbildungUpdateDraft) => {
    if (!antrag) {
      return
    }
    setAntrag({ ...antrag, ausbildungUpdate: draft })
  }

  const handleConfirmAusbildung = () => {
    if (!antrag) {
      return
    }
    const draft = ensureAusbildungUpdate(antrag)
    if (!canConfirmAusbildungUpdate(antrag, draft)) {
      return
    }
    const updated = confirmAusbildungUpdate(antrag, draft, persona.name)
    setAntrag(updated)
    setProgrammaticSectionId(
      getPreferredReviewSectionId(updated.hauptstatus, updated.unterstatus),
    )
    setToastText('Status aktualisiert')
    setToastOpen(true)
  }

  const handleVereinbarungChange = (vereinbarung: VereinbarungData) => {
    if (!antrag) {
      return
    }
    setAntrag({ ...antrag, vereinbarung })
  }

  const handlePreviewVertrag = () => {
    setToastText('Vorschau des Vertragsdokuments folgt in einer späteren Prototyp-Etappe')
    setToastOpen(true)
  }

  const handlePostKommentar = (text: string) => {
    if (!antrag) {
      return
    }
    const flushed = flushFormKommentarToFeed(antrag, persona.name)
    const updated = addKommentarToAntrag(flushed, text, persona.name)
    const saved = upsertAntrag(updated)
    setAntrag(saved)
    setToastText('Kommentar hinzugefügt')
    setToastOpen(true)
  }

  if (!employee || !antrag) {
    return null
  }

  const { form } = antrag
  const bundBetrag = getBundBeteiligung(form)
  const postGrundlage = getPostKostenGrundlage(form)
  const arbeitszeit = getArbeitszeitGrundlage(form, employee.tagessatz)
  const feedEintraege = getFeedEintraege(antrag)
  const inVereinbarungPhase = isVereinbarungPhase(antrag)
  const inAusbildungPhase = isAusbildungPhase(antrag)
  const inAbschlussPhase = isAbschlussPhase(antrag)
  const inAntragPruefung = isAntragPruefungPhase(antrag)
  const maUeberarbeitung = isMa && ownCase && isMaUeberarbeitungPhase(antrag)
  const vgResubmitReview =
    isVg && ownCase && antrag.unterstatus === 'Wieder eingereicht'
  const aenderungen = vgResubmitReview ? getAntragAenderungen(antrag) : new Set<string>()
  const fieldChanged = (key: string) => aenderungen.has(key)
  const schrittLabel = antrag.unterstatus
  const maAngebotPruefung =
    isMa && ownCase && antrag.unterstatus === 'Angebot zur Prüfung'
  const maAusbildungUpdate =
    isMa && ownCase && inAusbildungPhase
  const canEditAntrag = (isVg && inAntragPruefung) || maUeberarbeitung
  const canConfirmAusbildung =
    maAusbildungUpdate && canConfirmAusbildungUpdate(antrag)
  const showWorkflowFooter =
    (isVg && inAntragPruefung) ||
    (isVg && antrag.unterstatus === 'Angebot erstellen') ||
    maAngebotPruefung ||
    maAusbildungUpdate ||
    maUeberarbeitung
  const hrBeratungBlocksSend =
    isVg &&
    antrag.unterstatus === 'Angebot erstellen' &&
    isHrBeratungRequiredForSend(ensureVereinbarung(antrag))
  const maRueckzahlungspflicht = hasMaRueckzahlungspflicht(
    form,
    ensureVereinbarung(antrag),
    employee.tagessatz,
  )
  const maCanAcceptAngebot = maAngebotEinverstanden && maAngebotHrKostenPflicht
  const maAcceptAngebotLabel = maRueckzahlungspflicht
    ? 'Elektronisch unterschreiben'
    : 'Angebot akzeptieren'

  return (
    <OwnCaseGuard
      ownCase={ownCase}
      onBack={goBack}
      className="awb-review app-page"
      mainClassName="page-content-column awb-review__main"
      message={`Dieser Fall gehört nicht zu dir. Wechsle zur Rolle von ${employee.name} oder öffne deinen eigenen Fall.`}
    >
    <div className="awb-review app-page">
      <AppShellBar appTitle="Entwicklung" onBack={goBack} />

      <ObjectPage
        ref={objectPageRef}
        className="awb-review__object"
        mode={ObjectPageMode.IconTabBar}
        selectedSectionId={programmaticSectionId}
        onSelectedSectionChange={() => {
          if (programmaticSectionId) {
            setProgrammaticSectionId(undefined)
          }
        }}
        titleArea={
          <ObjectPageTitle
            header={
              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                wrap={FlexBoxWrap.Wrap}
                className="awb-review__title-row"
              >
                <Title level="H1" size="H3">
                  Aus- / Weiterbildung
                </Title>
                <UnterstatusTag unterstatus={antrag.unterstatus} />
              </FlexBox>
            }
            subHeader={
              <Text>
                {employee.name}, {employee.organisationseinheit}
              </Text>
            }
            actionsBar={
              <FlexBox className="awb-review__header-actions">
                <Button design="Transparent" onClick={goBack}>
                  Schliessen
                </Button>
                {canEditAntrag ? (
                  <Button design="Default" onClick={openEdit}>
                    Bearbeiten
                  </Button>
                ) : null}
                {ownCase &&
                ((isVg && inVereinbarungPhase && antrag.unterstatus === 'Angebot erstellen') ||
                  maAusbildungUpdate) ? (
                  <Button design="Default" onClick={handleReviewSave}>
                    Speichern
                  </Button>
                ) : null}
              </FlexBox>
            }
          />
        }
        headerArea={
          <ObjectPageHeader>
            <div className="awb-review__header-body">
              <ReviewProcessFlow
                hauptstatus={antrag.hauptstatus}
                unterstatus={antrag.unterstatus}
              />

              <FlexBox wrap={FlexBoxWrap.Wrap} className="awb-review__facets">
                <DisplayField label="Ausbildung" value={antrag.ausbildung} />
                <DisplayField label="Von" value={antrag.von} />
                <DisplayField label="Bis" value={antrag.bis} />
                <DisplayField label="Schritt" value={schrittLabel} />
                <DisplayField
                  label="Aktuell bei"
                  value={antrag.aktuellBeiLabel ?? '—'}
                />
              </FlexBox>
            </div>
          </ObjectPageHeader>
        }
      >
        <ObjectPageSection id="antrag" titleText="Antrag">
          <SectionMain sectionId="antrag">
            {!inVereinbarungPhase &&
            !inAusbildungPhase &&
            !inAbschlussPhase &&
            isVg &&
            showRoleBanner &&
            !vgResubmitReview ? (
              <MessageStrip
                design="Information"
                className="awb-review__content-banner"
                onClose={() => setShowRoleBanner(false)}
              >
                Du bearbeitest diesen Antrag als Vorgesetzte/r von {employee.name}. Bitte
                prüfe den Antrag aus fachlicher Sicht.
              </MessageStrip>
            ) : null}
            {maUeberarbeitung && showMaUeberarbeitungBanner ? (
              <MessageStrip
                design="Critical"
                className="awb-review__content-banner"
                onClose={() => setShowMaUeberarbeitungBanner(false)}
              >
                {antrag.ueberarbeitungKommentarVg
                  ? `Überarbeite den Antrag. Kommentar VG: ${antrag.ueberarbeitungKommentarVg}`
                  : 'Überarbeite den Antrag.'}
              </MessageStrip>
            ) : null}
            {vgResubmitReview && showVgResubmitBanner ? (
              <MessageStrip
                design="Information"
                className="awb-review__content-banner"
                onClose={() => setShowVgResubmitBanner(false)}
              >
                {aenderungen.size > 0
                  ? 'Antrag erneut eingereicht. Geänderte Felder sind markiert.'
                  : 'Antrag erneut eingereicht.'}
              </MessageStrip>
            ) : null}
            <ReviewPanel title="Grunddaten">
              <div className="awb-review__two-col">
                <Group title="Anbieter und Dauer">
                  <DisplayField label="Titel" value={form.titel} changed={fieldChanged('titel')} />
                  <DisplayField
                    label="Anbieter/-in / Schule"
                    value={form.anbieter}
                    changed={fieldChanged('anbieter')}
                  />
                  <DisplayField label="Vom" value={form.von} changed={fieldChanged('von')} />
                  <DisplayField
                    label="Voraussichtlich bis"
                    value={form.bis}
                    changed={fieldChanged('bis')}
                  />
                </Group>
                <Group title="Abschluss">
                  <DisplayField label="Typ" value={form.niveau} changed={fieldChanged('niveau')} />
                  <DisplayField
                    label="Fachrichtung"
                    value={form.fachrichtung}
                    changed={fieldChanged('fachrichtung')}
                  />
                </Group>
              </div>
            </ReviewPanel>

            <ReviewPanel title="Kosten">
              <div className="awb-review__two-col">
                <Group title="Beteiligung Bund">
                  <DisplayField
                    label="Eidgenössische Prüfung mit 50% Bund"
                    value={jaNeinLabel(form.bund50)}
                    changed={fieldChanged('bund50')}
                  />
                </Group>
                <Group title="Ausbildungskosten">
                  <DisplayField
                    label="Kurskosten"
                    value={form.kurskosten || '—'}
                    changed={fieldChanged('kurskosten')}
                  />
                  <DisplayField
                    label="Beteiligung Bund"
                    value={
                      bundBetrag > 0
                        ? `- ${bundBetrag.toLocaleString('de-CH')}`
                        : '0'
                    }
                    changed={fieldChanged('bund50') || fieldChanged('kurskosten')}
                  />
                  <DisplayField
                    label="Zusätzliche Kosten"
                    value={form.zusaetzlicheKosten || '—'}
                    changed={fieldChanged('zusaetzlicheKosten')}
                  />
                  <MessageStrip
                    design="ColorSet2"
                    colorScheme="9"
                    hideCloseButton
                    className="awb-review__info"
                    icon={<Icon name="money-bills" slot="icon" />}
                  >
                    Die Grundlage für die Beteiligung Post an den Ausbildungskosten ist{' '}
                    {formatChf(postGrundlage)}
                  </MessageStrip>
                </Group>
              </div>
            </ReviewPanel>

            <ReviewPanel title="Arbeitszeit / Pensum">
              <div className="awb-review__two-col">
                <Group title="Arbeitspensum / Erleichterung">
                  <DisplayField
                    label="Beschäftigungsgrad anpassen"
                    value={jaNeinLabel(form.beschaeftigungsgradAnpassen)}
                    changed={fieldChanged('beschaeftigungsgradAnpassen')}
                  />
                  <DisplayField
                    label="Arbeitszeiterleichterung"
                    value={jaNeinLabel(form.arbeitszeiterleichterung)}
                    changed={fieldChanged('arbeitszeiterleichterung')}
                  />
                  {form.arbeitszeiterleichterung === 'ja' ? (
                    <>
                      <DisplayField
                        label="Anzahl Tage"
                        value={form.anzahlTageErleichterung}
                        changed={fieldChanged('anzahlTageErleichterung')}
                      />
                      <DisplayField
                        label="Begründung"
                        value={form.begruendungErleichterung}
                        changed={fieldChanged('begruendungErleichterung')}
                      />
                      <MessageStrip
                        design="ColorSet2"
                        colorScheme="9"
                        hideCloseButton
                        className="awb-review__info"
                        icon={<Icon name="timesheet" slot="icon" />}
                      >
                        Die Grundlage für die Beteiligung Post an der Arbeitszeit ist{' '}
                        {formatChf(arbeitszeit.betrag)}
                        {arbeitszeit.tage > 0
                          ? ` (${arbeitszeit.tage} Tage à ${formatChfRate(arbeitszeit.tagessatz)})`
                          : ''}
                      </MessageStrip>
                    </>
                  ) : null}
                </Group>
              </div>
            </ReviewPanel>
          </SectionMain>
        </ObjectPageSection>

        <ObjectPageSection
          id="vereinbarung"
          titleText="Vereinbarung"
          tabRef={setVereinbarungTabRef}
        >
          <SectionMain sectionId="vereinbarung">
            {vereinbarungTabEnabled &&
            (inVereinbarungPhase ||
              inAusbildungPhase ||
              (inAbschlussPhase && antrag.vereinbarung)) ? (
              <VereinbarungSection
                antrag={
                  antrag.vereinbarung
                    ? antrag
                    : { ...antrag, vereinbarung: ensureVereinbarung(antrag) }
                }
                employee={employee}
                employeeName={employee.name}
                showRoleBanner={
                  isVg &&
                  showRoleBanner &&
                  antrag.unterstatus === 'Angebot erstellen'
                }
                onCloseRoleBanner={() => setShowRoleBanner(false)}
                showMaReviewBanner={showMaReviewBanner}
                onCloseMaReviewBanner={() => setShowMaReviewBanner(false)}
                onChange={handleVereinbarungChange}
                onPreviewVertrag={handlePreviewVertrag}
                onHrBeratungBeiziehen={() => setHrBeratungOpen(true)}
                maOfferAcceptance={
                  maAngebotPruefung
                    ? {
                        hasRueckzahlung: maRueckzahlungspflicht,
                        einverstanden: maAngebotEinverstanden,
                        hrKostenPflicht: maAngebotHrKostenPflicht,
                        onEinverstandenChange: setMaAngebotEinverstanden,
                        onHrKostenPflichtChange: setMaAngebotHrKostenPflicht,
                      }
                    : undefined
                }
                maReview={maAngebotPruefung}
                readOnly={!isVg || antrag.unterstatus !== 'Angebot erstellen'}
              />
            ) : (
              <MessageStrip design="Information" hideCloseButton>
                Dieser Bereich wird verfügbar, sobald der Antrag genehmigt wurde.
              </MessageStrip>
            )}
          </SectionMain>
        </ObjectPageSection>

        <ObjectPageSection
          id="ausbildung"
          titleText="Ausbildung"
          tabRef={setAusbildungTabRef}
        >
          <SectionMain sectionId="ausbildung">
            {ausbildungTabEnabled && (inAusbildungPhase || inAbschlussPhase) ? (
              <AusbildungSection
                antrag={antrag}
                readOnly={!maAusbildungUpdate}
                showUpdateBanner={showAusbildungBanner}
                onCloseBanner={() => setShowAusbildungBanner(false)}
                onChange={handleAusbildungChange}
                onWeisungClick={() => {
                  setToastText('Weisung folgt in einer späteren Prototyp-Etappe')
                  setToastOpen(true)
                }}
              />
            ) : (
              <MessageStrip design="Information" hideCloseButton>
                Dieser Bereich wird verfügbar, sobald die Ausbildung gestartet
                wurde.
              </MessageStrip>
            )}
          </SectionMain>
        </ObjectPageSection>

        <ObjectPageSection
          id="kommentare"
          titleText="Kommentare und Aktivitäten"
        >
          <SectionMain sectionId="kommentare">
            <ReviewPanel title="Kommentare und Aktivitäten">
              <KommentarFeed
                eintraege={feedEintraege}
                onPost={handlePostKommentar}
              />
            </ReviewPanel>
          </SectionMain>
        </ObjectPageSection>
      </ObjectPage>

      {showWorkflowFooter ? (
        <Bar
          className="awb-review__footer"
          design="FloatingFooter"
          endContent={
            <FlexBox
              justifyContent={FlexBoxJustifyContent.End}
              alignItems={FlexBoxAlignItems.Center}
              direction={FlexBoxDirection.Row}
              className="awb-review__footer-actions"
            >
              {isVg && inAntragPruefung ? (
                <>
                  <Button design="Default" onClick={() => setRejectAntragOpen(true)}>
                    Antrag ablehnen
                  </Button>
                  <Button design="Default" onClick={handleSendToUeberarbeitung}>
                    An MA zur Überarbeitung
                  </Button>
                  <Button design="Emphasized" onClick={handleApproveAntrag}>
                    Genehmigen und Angebot erstellen
                  </Button>
                </>
              ) : isVg && antrag.unterstatus === 'Angebot erstellen' ? (
                <>
                  <Button
                    design="Transparent"
                    icon="question-mark"
                    onClick={() => setHrBeratungOpen(true)}
                  >
                    HR-Beratung
                  </Button>
                  <Button design="Default" onClick={() => setRejectAntragOpen(true)}>
                    Antrag ablehnen
                  </Button>
                  <Button
                    design="Emphasized"
                    disabled={hrBeratungBlocksSend}
                    onClick={handleSendAngebotToMa}
                  >
                    Genehmigen und an MA senden
                  </Button>
                </>
              ) : maAngebotPruefung ? (
                <>
                  <Button design="Default" onClick={() => setRejectAngebotOpen(true)}>
                    Angebot ablehnen
                  </Button>
                  <Button
                    design="Emphasized"
                    disabled={!maCanAcceptAngebot}
                    onClick={handleAcceptAngebot}
                  >
                    {maAcceptAngebotLabel}
                  </Button>
                </>
              ) : maUeberarbeitung ? (
                <Button design="Emphasized" onClick={openEdit}>
                  Antrag bearbeiten
                </Button>
              ) : (
                <Button
                  design="Emphasized"
                  disabled={!canConfirmAusbildung}
                  onClick={handleConfirmAusbildung}
                >
                  Bestätigen
                </Button>
              )}
            </FlexBox>
          }
        />
      ) : null}

      <AwbDialog
        open={rejectAntragOpen}
        headerText="Antrag ablehnen"
        onClose={() => setRejectAntragOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Transparent" onClick={() => setRejectAntragOpen(false)}>
                  Abbrechen
                </Button>
                <Button design="Negative" onClick={handleRejectAntragConfirm}>
                  Antrag ablehnen
                </Button>
              </>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Möchtest du diesen Antrag wirklich ablehnen? Der Antrag wird abgeschlossen und
            kann nicht mehr bearbeitet werden.
          </Text>
        </div>
      </AwbDialog>

      <AwbDialog
        open={rejectAngebotOpen}
        headerText="Angebot ablehnen"
        onClose={() => setRejectAngebotOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Transparent" onClick={() => setRejectAngebotOpen(false)}>
                  Abbrechen
                </Button>
                <Button design="Negative" onClick={handleRejectAngebotConfirm}>
                  Angebot ablehnen
                </Button>
              </>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Möchtest du dieses Angebot wirklich ablehnen? Der Antrag wird abgeschlossen und
            kann nicht mehr bearbeitet werden.
          </Text>
        </div>
      </AwbDialog>

      <AwbDialog
        open={hrBeratungOpen}
        headerText="HR-Beratung"
        onClose={() => setHrBeratungOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button onClick={() => setHrBeratungOpen(false)}>Abbrechen</Button>
                <Button
                  design="Emphasized"
                  onClick={() => setHrBeratungOpen(false)}
                >
                  HR-Beratung beiziehen
                </Button>
              </>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            In folgenden Situationen kann es sinnvoll sein, die HR-Beratung beizuziehen:
          </Text>
          <ul className="awb-dialog-content__list">
          <li>Beteiligung Post &gt; CHF 5&apos;000 (Vertrag)</li>
          <li>Wenn AZE gewährt wird</li>
          <li>
            Wenn du unsicher bist, welche prozentuale Beteiligung der Post angemessen ist.
          </li>
        </ul>
        </div>
      </AwbDialog>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">
        {toastText}
      </Toast>
    </div>
    </OwnCaseGuard>
  )
}
