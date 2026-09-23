import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { AwbDialog } from '../components/AwbDialog'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Label } from '@ui5/webcomponents-react/Label'
import { MessageItem } from '@ui5/webcomponents-react/MessageItem'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { MessageView } from '@ui5/webcomponents-react/MessageView'
import { MessageViewButton } from '@ui5/webcomponents-react/MessageViewButton'
import { Popover } from '@ui5/webcomponents-react/Popover'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { Wizard } from '@ui5/webcomponents-react/Wizard'
import { WizardStep } from '@ui5/webcomponents-react/WizardStep'
import { FlexBoxAlignItems } from '@ui5/webcomponents-react/enums/FlexBoxAlignItems'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import { AppShellBar } from '../components/AppShellBar'
import { OwnCaseGuard } from '../components/OwnCaseGuard'
import { UnterstatusTag } from '../components/UnterstatusTag'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import {
  beginVgAntragEdit,
  cancelVgAntragEdit,
  createNewAntrag,
  deleteAntrag,
  firstInvalidAntragFieldId,
  focusAntragFormField,
  formatBeschaeftigungsgradOption,
  getAntrag,
  getAntragFormFieldStep,
  parseBeschaeftigungsgradPercent,
  saveDraft,
  isMaUeberarbeitungPhase,
  isVgAntragPruefungEditable,
  isVgDraftResubmit,
  submitAntrag,
  validateAntragForm,
  validateAntragFormStep,
  validationMessagesToFieldErrors,
  type AntragFormData,
  type AntragFormFieldId,
  type WeiterbildungAntrag,
} from '../data/antraege'
import { getEmployee } from '../data/employees'
import { removeInboxItemsForAntrag } from '../data/inbox'
import {
  AntragFormArbeitszeitSection,
  AntragFormGrunddatenSection,
  AntragFormKostenSection,
} from './v2/AntragFormPanels'
import './AusbildungAntragWizardPage.css'

const STEP_COUNT = 3
const MESSAGE_BUTTON_ID = 'awb-wizard-message-btn'

const WIZARD_STEPS = [
  { number: 1, title: 'Grunddaten' },
  { number: 2, title: 'Kosten' },
  { number: 3, title: 'Arbeitszeit / Pensum' },
] as const

function unlockStorageKey(antragId: string | undefined): string {
  return `awb-wizard-unlock:${antragId ?? 'neu'}`
}

function readUnlocked(antragId: string | undefined, fallback: number): number {
  try {
    const raw = sessionStorage.getItem(unlockStorageKey(antragId))
    const value = Number(raw)
    if (Number.isFinite(value) && value >= 1 && value <= STEP_COUNT) {
      return value
    }
  } catch {
    // ignore
  }
  return fallback
}

function writeUnlocked(antragId: string | undefined, value: number): void {
  try {
    sessionStorage.setItem(unlockStorageKey(antragId), String(value))
  } catch {
    // ignore
  }
}

export function wizardStepPath(
  employeeId: string,
  antragId: string | undefined,
  step: number,
): string {
  if (antragId) {
    return `/weiterbildung/${employeeId}/antrag/${antragId}/bearbeiten/${step}`
  }
  return `/weiterbildung/${employeeId}/antrag/neu/${step}`
}

function parseStep(raw: string | undefined): number {
  const value = Number(raw)
  if (Number.isFinite(value) && value >= 1 && value <= STEP_COUNT) {
    return value
  }
  return 0
}

function updateForm(
  antrag: WeiterbildungAntrag,
  patch: Partial<AntragFormData>,
): WeiterbildungAntrag {
  return {
    ...antrag,
    form: { ...antrag.form, ...patch },
  }
}

function getPageTitle(antrag: WeiterbildungAntrag, isEdit: boolean): string {
  if (!isEdit) {
    return 'Neuer Weiterbildungsantrag'
  }
  const objectTitle = antrag.form.titel.trim() || antrag.ausbildung.trim()
  return objectTitle || 'Weiterbildungsantrag bearbeiten'
}

function WizardStepper({
  step,
  unlockedUntil,
  onSelect,
}: {
  step: number
  unlockedUntil: number
  onSelect: (next: number) => void
}) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const wizard = navRef.current?.querySelector('ui5-wizard') as
      | (HTMLElement & { width?: number })
      | null
    if (!wizard) {
      return
    }

    // UI5 registers ResizeHandler only on content items. Our nav-only layout
    // hides those (display:none), so viewport changes never update `width` /
    // never re-run _adjustHeaderOverflow. Observe the host and sync width.
    const ro = new ResizeObserver(() => {
      const nextWidth = wizard.getBoundingClientRect().width
      if (wizard.width !== nextWidth) {
        wizard.width = nextWidth
      }
    })
    ro.observe(wizard)
    return () => ro.disconnect()
  }, [step, unlockedUntil])

  return (
    <nav ref={navRef} className="awb-wizard__stepper" aria-label="Wizard-Schritte">
      {/*
        Official UI5 Wizard navigator: shrinks titles, then groups/stacks steps;
        popover on desktop, dialog on phone (SAP Fiori responsive behavior).
      */}
      <Wizard
        className="awb-wizard__ui5-wizard"
        contentLayout="SingleStep"
        onStepChange={(event) => {
          if (event.detail.withScroll) {
            return
          }
          const steps = Array.from(
            (event.target as HTMLElement).querySelectorAll('ui5-wizard-step'),
          )
          const index = steps.indexOf(event.detail.step) + 1
          if (index >= 1 && index <= unlockedUntil) {
            onSelect(index)
          }
        }}
      >
        {WIZARD_STEPS.map((item) => (
          <WizardStep
            key={item.number}
            titleText={item.title}
            selected={item.number === step}
            disabled={item.number > unlockedUntil}
          >
            {/* Placeholder keeps the step slot valid; content is rendered outside. */}
            <span className="awb-wizard__nav-placeholder" aria-hidden="true" />
          </WizardStep>
        ))}
      </Wizard>
    </nav>
  )
}

/** Redirect `/neu` and `/bearbeiten` to step 1 */
export function AusbildungAntragWizardRedirect() {
  const { employeeId = '', antragId } = useParams()
  return <Navigate to={wizardStepPath(employeeId, antragId, 1)} replace />
}

export function AusbildungAntragWizardPage() {
  const { employeeId = '', antragId, step: stepParam } = useParams()
  const navigate = useNavigate()
  const employee = getEmployee(employeeId)
  const { persona, ownsEmployee, isVg, isMa } = usePrototypePersona()
  const isEdit = Boolean(antragId)
  const stepFromUrl = parseStep(stepParam)
  const ownCase = ownsEmployee(employeeId)

  const [antrag, setAntrag] = useState<WeiterbildungAntrag | null>(null)
  const [unlockedUntil, setUnlockedUntil] = useState(() =>
    readUnlocked(antragId, isEdit ? STEP_COUNT : 1),
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  /** none = quiet; step = current-step only (Nächster Schritt); all = full form (Absenden) */
  const [validationMode, setValidationMode] = useState<'none' | 'step' | 'all'>('none')
  const [messagePopoverOpen, setMessagePopoverOpen] = useState(false)
  const [showUeberarbeitungBanner, setShowUeberarbeitungBanner] = useState(true)
  const loadedAntragIdRef = useRef<string | null>(null)
  const pendingFocusFieldRef = useRef<AntragFormFieldId | null>(null)

  const step = stepFromUrl

  useEffect(() => {
    if (!employee) {
      navigate('/weiterbildung', { replace: true })
    }
  }, [employee, navigate])

  useEffect(() => {
    setValidationMode('none')
    setMessagePopoverOpen(false)
    pendingFocusFieldRef.current = null
    setShowUeberarbeitungBanner(true)
  }, [antragId])

  useEffect(() => {
    if (!employee) {
      return
    }
    if (antragId) {
      if (loadedAntragIdRef.current === antragId) {
        return
      }
      const existing = getAntrag(antragId)
      if (!existing || existing.employeeId !== employee.id) {
        navigate(`/weiterbildung/${employee.id}`, { replace: true })
        return
      }
      const percent =
        parseBeschaeftigungsgradPercent(existing.form.gewuenschterBeschaeftigungsgrad) ??
        employee.beschaeftigungsgrad
      loadedAntragIdRef.current = antragId
      let loaded: WeiterbildungAntrag = {
        ...existing,
        form: {
          ...existing.form,
          gewuenschterBeschaeftigungsgrad: formatBeschaeftigungsgradOption(
            percent,
            employee.beschaeftigungsgrad,
          ),
        },
      }
      if (isVg && isVgAntragPruefungEditable(loaded)) {
        loaded = beginVgAntragEdit(loaded)
      }
      setAntrag(loaded)
      const unlocked = readUnlocked(antragId, STEP_COUNT)
      setUnlockedUntil(Math.max(unlocked, STEP_COUNT))
      writeUnlocked(antragId, STEP_COUNT)
      return
    }
    loadedAntragIdRef.current = null
    setAntrag((prev) => {
      if (prev && prev.employeeId === employee.id && !getAntrag(prev.id)) {
        return prev
      }
      return createNewAntrag(employee.id)
    })
    setUnlockedUntil(readUnlocked(undefined, 1))
  }, [antragId, employee, isVg, navigate])

  useEffect(() => {
    if (!employee || !stepFromUrl) {
      return
    }
    if (stepFromUrl > unlockedUntil) {
      navigate(wizardStepPath(employeeId, antragId, unlockedUntil), { replace: true })
    }
  }, [antragId, employee, employeeId, navigate, stepFromUrl, unlockedUntil])

  const validationMessages = useMemo(() => {
    if (!antrag || validationMode === 'none' || !step) {
      return []
    }
    if (validationMode === 'step') {
      return validateAntragFormStep(antrag.form, step)
    }
    return validateAntragForm(antrag.form)
  }, [antrag, step, validationMode])
  const fieldErrors = useMemo(
    () => validationMessagesToFieldErrors(validationMessages),
    [validationMessages],
  )
  const validationErrorCount = validationMessages.length

  useEffect(() => {
    if (validationErrorCount === 0) {
      setMessagePopoverOpen(false)
    }
  }, [validationErrorCount])

  useEffect(() => {
    const fieldId = pendingFocusFieldRef.current
    if (!fieldId || !step || getAntragFormFieldStep(fieldId) !== step) {
      return
    }
    pendingFocusFieldRef.current = null
    const frame = window.requestAnimationFrame(() => {
      focusAntragFormField(fieldId)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [step, fieldErrors, antrag])

  const goToStep = (next: number, nextAntragId = antragId) => {
    const unlocked = Math.max(unlockedUntil, next)
    setUnlockedUntil(unlocked)
    writeUnlocked(nextAntragId, unlocked)
    navigate(wizardStepPath(employeeId, nextAntragId, next))
  }

  const focusValidationField = (fieldId: AntragFormFieldId) => {
    const targetStep = getAntragFormFieldStep(fieldId)
    if (targetStep !== step) {
      pendingFocusFieldRef.current = fieldId
      goToStep(targetStep)
      return
    }
    focusAntragFormField(fieldId)
  }

  const goBack = () => {
    if (antrag?.vgBearbeitungAktiv && antragId) {
      cancelVgAntragEdit(antrag)
      navigate(`/weiterbildung/${employeeId}/antrag/${antragId}`)
      return
    }
    navigate(`/weiterbildung/${employeeId}`)
  }

  const handleCancelVgEdit = () => {
    if (!antrag || !antragId) {
      return
    }
    cancelVgAntragEdit(antrag)
    navigate(`/weiterbildung/${employeeId}/antrag/${antragId}`)
  }

  const handleSave = () => {
    if (!antrag) {
      return
    }
    const saved = saveDraft(antrag)
    writeUnlocked(saved.id, Math.max(unlockedUntil, step || 1))
    navigate(`/weiterbildung/${employeeId}`, {
      state: {
        toast: 'Antrag als Entwurf gespeichert',
      },
    })
  }

  const persistRevisionDraft = (draft: WeiterbildungAntrag): WeiterbildungAntrag => {
    if (!isMaUeberarbeitungPhase(draft)) {
      return draft
    }
    return saveDraft(draft)
  }

  const handleSubmit = () => {
    if (!antrag) {
      return
    }
    setValidationMode('all')
    const messages = validateAntragForm(antrag.form)
    if (messages.length > 0) {
      const firstFieldId = firstInvalidAntragFieldId(messages)
      if (firstFieldId) {
        focusValidationField(firstFieldId)
      }
      return
    }
    const persisted = persistRevisionDraft(antrag)
    setAntrag(persisted)
    const submitted = submitAntrag(persisted, persona.name)
    if (isVg) {
      const toast = isVgDraftResubmit(persisted)
        ? 'Antrag wurde aktualisiert und steht zur Prüfung bereit.'
        : 'Antrag wurde zur Prüfung weitergeleitet.'
      navigate(`/weiterbildung/${employeeId}/antrag/${submitted.id}`, {
        state: { toast },
      })
      return
    }
    navigate(`/weiterbildung/${employeeId}/antrag/${submitted.id}`, {
      state: { antragSubmitted: true },
    })
  }

  const handleValidationNavigate = (fieldId: AntragFormFieldId) => {
    setMessagePopoverOpen(false)
    focusValidationField(fieldId)
  }

  const handleDeleteConfirm = () => {
    if (antrag && isPersisted(antrag)) {
      removeInboxItemsForAntrag(antrag.id)
      deleteAntrag(antrag.id)
    }
    setDeleteOpen(false)
    navigate(`/weiterbildung/${employeeId}`)
  }

  const goNext = () => {
    if (!antrag || !step) {
      return
    }
    const saved = persistRevisionDraft(antrag)
    setAntrag(saved)
    const stepMessages = validateAntragFormStep(saved.form, step)
    if (stepMessages.length > 0) {
      setValidationMode('step')
      const firstFieldId = firstInvalidAntragFieldId(stepMessages)
      if (firstFieldId) {
        focusAntragFormField(firstFieldId)
      }
      return
    }
    setValidationMode('none')
    goToStep(Math.min(step + 1, STEP_COUNT))
  }

  const goPrev = () => {
    if (antrag) {
      const saved = persistRevisionDraft(antrag)
      setAntrag(saved)
    }
    goToStep(Math.max((step || 1) - 1, 1))
  }

  const patchForm = (patch: Partial<AntragFormData>) => {
    setAntrag((prev) => (prev ? updateForm(prev, patch) : prev))
  }

  const redirectTarget = useMemo(() => {
    if (!employeeId) {
      return null
    }
    if (!stepFromUrl) {
      return wizardStepPath(employeeId, antragId, 1)
    }
    return null
  }, [antragId, employeeId, stepFromUrl])

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />
  }

  if (!employee || !antrag || !step) {
    return null
  }

  const form = antrag.form
  const vgAntragEdit = isVg && isVgDraftResubmit(antrag)
  const maUeberarbeitung = isMa && ownCase && isMaUeberarbeitungPhase(antrag)
  const submitLabel = vgAntragEdit ? 'Speichern' : 'Absenden'
  const pageTitle = getPageTitle(antrag, isEdit)
  const showDelete =
    isEdit && isPersisted(antrag) && antrag.unterstatus === 'Entwurf' && !vgAntragEdit

  return (
    <OwnCaseGuard
      ownCase={ownCase}
      onBack={() => navigate(`/weiterbildung/${employeeId}`)}
      className="awb-wizard app-page"
      mainClassName="page-content-column"
      message="Dieser Fall gehört nicht zu dir."
    >
    <div className="awb-wizard app-page">
      <div className="app-sticky-header">
        <AppShellBar appTitle="Entwicklung" onBack={goBack} />

        <div className="page-header">
          <div className="page-content-column page-content-column--header-row">
            <div className="awb-wizard__title-block">
              <FlexBox
                alignItems={FlexBoxAlignItems.Center}
                wrap={FlexBoxWrap.Wrap}
                className="awb-wizard__title-row"
              >
                <Title level="H1" size="H3">
                  {pageTitle}
                </Title>
                <UnterstatusTag unterstatus={antrag.unterstatus} />
              </FlexBox>
              <Text className="awb-wizard__subtitle">
                {employee.name} / Personalnr. {employee.personalnummer}
              </Text>
            </div>
            <FlexBox className="awb-wizard__header-actions" wrap={FlexBoxWrap.Wrap}>
              {vgAntragEdit ? (
                <Button design="Transparent" onClick={handleCancelVgEdit}>
                  Abbrechen
                </Button>
              ) : (
                <>
                  {showDelete ? (
                    <Button
                      design="Transparent"
                      icon="delete"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Löschen
                    </Button>
                  ) : null}
                  <Button design="Default" onClick={handleSave}>
                    Entwurf speichern
                  </Button>
                </>
              )}
            </FlexBox>
          </div>

          <div className="page-content-column page-content-column--stepper">
            <WizardStepper
              step={step}
              unlockedUntil={unlockedUntil}
              onSelect={(next) => goToStep(next)}
            />
          </div>
        </div>
      </div>

      <main className="page-content-column page-content-column--main awb-wizard__content" key={step}>
        {maUeberarbeitung && showUeberarbeitungBanner ? (
          <MessageStrip
            design="Critical"
            className="awb-wizard__ueberarbeitung-banner"
            onClose={() => setShowUeberarbeitungBanner(false)}
          >
            <div className="awb-wizard__ueberarbeitung-banner-content">
              <Text>Bitte überarbeite deinen Antrag.</Text>
              {antrag.ueberarbeitungKommentarVg ? (
                <div className="awb-wizard__ueberarbeitung-kommentar">
                  <Label showColon>Was muss überarbeitet werden</Label>
                  <Text>{antrag.ueberarbeitungKommentarVg}</Text>
                </div>
              ) : null}
            </div>
          </MessageStrip>
        ) : null}
        {validationErrorCount > 0 ? (
          <MessageStrip
            design="Negative"
            hideCloseButton
            className="awb-wizard__validation-summary"
          >
            Der Antrag enthält Fehler. Bitte korrigiere die markierten Felder.
          </MessageStrip>
        ) : null}

        {step === 1 ? (
          <div className="awb-wizard__step-body awb-antrag-form__body">
            <AntragFormGrunddatenSection
              form={form}
              onPatch={patchForm}
              fieldErrors={fieldErrors}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="awb-wizard__step-body awb-antrag-form__body">
            <AntragFormKostenSection
              form={form}
              onPatch={patchForm}
              fieldErrors={fieldErrors}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="awb-wizard__step-body awb-antrag-form__body">
            <AntragFormArbeitszeitSection
              form={form}
              employeeTagessatz={employee.tagessatz}
              onPatch={patchForm}
              fieldErrors={fieldErrors}
            />
          </div>
        ) : null}
      </main>

      <Bar
        className="awb-wizard__footer"
        design="FloatingFooter"
        startContent={
          validationErrorCount > 0 ? (
            <MessageViewButton
              id={MESSAGE_BUTTON_ID}
              type="Negative"
              counter={validationErrorCount}
              onClick={() => setMessagePopoverOpen(true)}
            />
          ) : undefined
        }
        endContent={
          <FlexBox
            justifyContent={FlexBoxJustifyContent.End}
            alignItems={FlexBoxAlignItems.Center}
            className="awb-wizard__footer-actions"
          >
            {step > 1 ? (
              <Button design="Transparent" onClick={goPrev}>
                Zurück
              </Button>
            ) : null}
            {step < STEP_COUNT ? (
              <Button design="Emphasized" onClick={goNext}>
                Nächster Schritt
              </Button>
            ) : (
              <Button design="Emphasized" onClick={handleSubmit}>
                {submitLabel}
              </Button>
            )}
          </FlexBox>
        }
      />

      {validationErrorCount > 0 && messagePopoverOpen ? (
        <Popover
          className="awb-wizard__message-popover"
          open
          opener={MESSAGE_BUTTON_ID}
          placement="Top"
          verticalAlign="Bottom"
          horizontalAlign="Start"
          onClose={() => setMessagePopoverOpen(false)}
        >
          <MessageView groupItems>
            {validationMessages.map((message) => (
              <MessageItem
                key={message.fieldId}
                type="Negative"
                groupName={message.section}
                titleText={message.label}
                subtitleText={message.message}
                onClick={() => handleValidationNavigate(message.fieldId)}
              />
            ))}
          </MessageView>
        </Popover>
      ) : null}

      <AwbDialog
        open={deleteOpen}
        headerText="Antrag löschen"
        onClose={() => setDeleteOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Transparent" onClick={() => setDeleteOpen(false)}>
                  Abbrechen
                </Button>
                <Button design="Negative" onClick={handleDeleteConfirm}>
                  Löschen
                </Button>
              </>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Möchtest du diesen Antrag unwiderruflich löschen? Nicht gespeicherte Änderungen
            gehen verloren.
          </Text>
        </div>
      </AwbDialog>
    </div>
    </OwnCaseGuard>
  )
}

function isPersisted(antrag: WeiterbildungAntrag): boolean {
  try {
    return Boolean(getAntrag(antrag.id))
  } catch {
    return false
  }
}
