import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { AwbDialog } from '../../components/AwbDialog'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Label } from '@ui5/webcomponents-react/Label'
import { MessageItem } from '@ui5/webcomponents-react/MessageItem'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { MessageView } from '@ui5/webcomponents-react/MessageView'
import { MessageViewButton } from '@ui5/webcomponents-react/MessageViewButton'
import { ObjectPage } from '@ui5/webcomponents-react/ObjectPage'
import { ObjectPageSection } from '@ui5/webcomponents-react/ObjectPageSection'
import { ObjectPageTitle } from '@ui5/webcomponents-react/ObjectPageTitle'
import { Popover } from '@ui5/webcomponents-react/Popover'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { FlexBoxAlignItems } from '@ui5/webcomponents-react/enums/FlexBoxAlignItems'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import { AppShellBar } from '../../components/AppShellBar'
import { OwnCaseGuard } from '../../components/OwnCaseGuard'
import { UnterstatusTag } from '../../components/UnterstatusTag'
import { usePrototypePersona } from '../../context/PrototypePersonaContext'
import {
  beginVgAntragEdit,
  cancelVgAntragEdit,
  createNewAntrag,
  deleteAntrag,
  getAntrag,
  isMaUeberarbeitungPhase,
  isVgAntragPruefungEditable,
  isVgDraftResubmit,
  saveDraft,
  submitAntrag,
  type AntragFormData,
  type AntragFormFieldId,
  type WeiterbildungAntrag,
  ANTRAG_FORM_FIELD_ORDER,
  focusAntragFormField,
  validateAntragForm,
  validationMessagesToFieldErrors,
} from '../../data/antraege'
import { getEmployee } from '../../data/employees'
import {
  AntragFormArbeitszeitSection,
  AntragFormGrunddatenSection,
  AntragFormKostenSection,
} from './AntragFormPanels'
import './AusbildungAntragPage.css'

function updateForm(
  antrag: WeiterbildungAntrag,
  patch: Partial<AntragFormData>,
): WeiterbildungAntrag {
  return {
    ...antrag,
    form: { ...antrag.form, ...patch },
  }
}

function isPersisted(antrag: WeiterbildungAntrag): boolean {
  try {
    return Boolean(getAntrag(antrag.id))
  } catch {
    return false
  }
}

function getPageTitle(antrag: WeiterbildungAntrag, isEdit: boolean): string {
  if (!isEdit) {
    return 'Neuer Weiterbildungsantrag'
  }
  const objectTitle = antrag.form.titel.trim() || antrag.ausbildung.trim()
  return objectTitle || 'Weiterbildungsantrag bearbeiten'
}

const MESSAGE_BUTTON_ID = 'awb-antrag-message-btn'

function focusFirstInvalidField(messages: ReturnType<typeof validateAntragForm>) {
  const firstFieldId = ANTRAG_FORM_FIELD_ORDER.find((fieldId) =>
    messages.some((message) => message.fieldId === fieldId),
  )
  if (firstFieldId) {
    focusAntragFormField(firstFieldId)
  }
}

/** Redirect legacy wizard step URLs to the single-page form. */
export function AusbildungAntragStepRedirect() {
  const { employeeId = '', antragId } = useParams()
  if (antragId) {
    return (
      <Navigate
        to={`/v2/weiterbildung/${employeeId}/antrag/${antragId}/bearbeiten`}
        replace
      />
    )
  }
  return <Navigate to={`/v2/weiterbildung/${employeeId}/antrag/neu`} replace />
}

export function AusbildungAntragPage() {
  const { employeeId = '', antragId } = useParams()
  const navigate = useNavigate()
  const employee = getEmployee(employeeId)
  const { persona, ownsEmployee, isMa, isVg } = usePrototypePersona()
  const isEdit = Boolean(antragId)
  const ownCase = ownsEmployee(employeeId)

  const [antrag, setAntrag] = useState<WeiterbildungAntrag | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [messagePopoverOpen, setMessagePopoverOpen] = useState(false)
  const [showUeberarbeitungBanner, setShowUeberarbeitungBanner] = useState(true)
  const loadedAntragIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!employee) {
      navigate('/v2/weiterbildung', { replace: true })
    }
  }, [employee, navigate])

  useEffect(() => {
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
        navigate(`/v2/weiterbildung/${employee.id}`, { replace: true })
        return
      }
      loadedAntragIdRef.current = antragId
      let loaded: WeiterbildungAntrag = existing
      if (isVg && isVgAntragPruefungEditable(loaded)) {
        loaded = beginVgAntragEdit(loaded)
      }
      setAntrag(loaded)
      return
    }
    loadedAntragIdRef.current = null
    setAntrag((prev) => {
      if (prev && prev.employeeId === employee.id && !getAntrag(prev.id)) {
        return prev
      }
      return createNewAntrag(employee.id)
    })
  }, [antragId, employee, isVg, navigate])

  const goBack = () => {
    if (antrag?.vgBearbeitungAktiv && antragId) {
      cancelVgAntragEdit(antrag)
      navigate(`/v2/weiterbildung/${employeeId}/antrag/${antragId}`)
      return
    }
    navigate(`/v2/weiterbildung/${employeeId}`)
  }

  const persistRevisionDraft = (draft: WeiterbildungAntrag): WeiterbildungAntrag => {
    if (!isMaUeberarbeitungPhase(draft)) {
      return draft
    }
    return saveDraft(draft)
  }

  const handleSaveDraft = () => {
    if (!antrag) {
      return
    }
    const saved = saveDraft(antrag)
    setAntrag(saved)
    navigate(`/v2/weiterbildung/${employeeId}`, {
      state: {
        toast: 'Antrag als Entwurf gespeichert',
      },
    })
  }

  const handleSubmit = () => {
    if (!antrag) {
      return
    }
    setSubmitAttempted(true)
    const validationMessages = validateAntragForm(antrag.form)
    if (validationMessages.length > 0) {
      focusFirstInvalidField(validationMessages)
      return
    }
    const persisted = persistRevisionDraft(antrag)
    setAntrag(persisted)
    const submitted = submitAntrag(persisted, persona.name)
    if (isVg) {
      const toast = isVgDraftResubmit(persisted)
        ? 'Antrag wurde gespeichert.'
        : 'Antrag wurde zur Prüfung weitergeleitet.'
      navigate(`/v2/weiterbildung/${employeeId}/antrag/${submitted.id}`, {
        state: { toast },
      })
      return
    }
    navigate(`/v2/weiterbildung/${employeeId}/antrag/${submitted.id}`, {
      state: { antragSubmitted: true },
    })
  }

  const handleValidationNavigate = (fieldId: AntragFormFieldId) => {
    setMessagePopoverOpen(false)
    focusAntragFormField(fieldId)
  }

  const handleDeleteConfirm = () => {
    if (antrag && isPersisted(antrag)) {
      deleteAntrag(antrag.id)
    }
    setDeleteOpen(false)
    navigate(`/v2/weiterbildung/${employeeId}`)
  }

  const patchForm = (patch: Partial<AntragFormData>) => {
    setAntrag((prev) => (prev ? updateForm(prev, patch) : prev))
  }

  const validationMessages = useMemo(
    () => (submitAttempted && antrag ? validateAntragForm(antrag.form) : []),
    [antrag, submitAttempted],
  )
  const fieldErrors = useMemo(
    () => (submitAttempted ? validationMessagesToFieldErrors(validationMessages) : {}),
    [submitAttempted, validationMessages],
  )
  const validationErrorCount = validationMessages.length

  useEffect(() => {
    if (validationErrorCount === 0) {
      setMessagePopoverOpen(false)
    }
  }, [validationErrorCount])

  if (!employee || !antrag) {
    return null
  }

  const vgAntragEdit = isVg && isVgDraftResubmit(antrag)
  const showDelete = isEdit && isPersisted(antrag) && antrag.unterstatus === 'Entwurf'
  const pageTitle = getPageTitle(antrag, isEdit)
  const maUeberarbeitung = isMa && ownCase && isMaUeberarbeitungPhase(antrag)
  const submitLabel = vgAntragEdit ? 'Speichern' : 'Absenden'

  return (
    <OwnCaseGuard
      ownCase={ownCase}
      onBack={goBack}
      className="awb-antrag-page app-page"
      mainClassName="page-content-column awb-antrag-page__main"
      message="Dieser Fall gehört nicht zu dir."
    >
      <div className="awb-antrag-page app-page">
        <AppShellBar appTitle="Entwicklung" onBack={goBack} />

        <ObjectPage
          className="awb-antrag-page__object"
          titleArea={
            <ObjectPageTitle
              header={
                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  wrap={FlexBoxWrap.Wrap}
                  className="awb-antrag-page__title-row"
                >
                  <Title level="H1" size="H3">
                    {pageTitle}
                  </Title>
                  {isEdit ? <UnterstatusTag unterstatus={antrag.unterstatus} /> : null}
                </FlexBox>
              }
              subHeader={
                <Text>
                  {employee.name} / Personalnr. {employee.personalnummer}
                </Text>
              }
              actionsBar={
                showDelete ? (
                  <FlexBox className="awb-antrag-page__header-actions" wrap={FlexBoxWrap.Wrap}>
                    <Button design="Transparent" icon="delete" onClick={() => setDeleteOpen(true)}>
                      Löschen
                    </Button>
                  </FlexBox>
                ) : undefined
              }
            />
          }
        >
          <ObjectPageSection id="antrag" titleText="Antrag" hideTitleText>
            <main className="page-content-column awb-antrag-page__main">
              <div className="awb-antrag-form__body">
                {maUeberarbeitung && showUeberarbeitungBanner ? (
                  <MessageStrip
                    design="Critical"
                    className="awb-antrag-page__ueberarbeitung-banner"
                    onClose={() => setShowUeberarbeitungBanner(false)}
                  >
                    <div className="awb-antrag-page__ueberarbeitung-banner-content">
                      <Text>Bitte überarbeite deinen Antrag.</Text>
                      {antrag.ueberarbeitungKommentarVg ? (
                        <div className="awb-antrag-page__ueberarbeitung-kommentar">
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
                    className="awb-antrag-page__validation-summary"
                  >
                    Der Antrag enthält Fehler. Bitte korrigiere die markierten Felder.
                  </MessageStrip>
                ) : null}
                <AntragFormGrunddatenSection
                  form={antrag.form}
                  onPatch={patchForm}
                  fieldErrors={fieldErrors}
                />
                <AntragFormKostenSection
                  form={antrag.form}
                  onPatch={patchForm}
                  fieldErrors={fieldErrors}
                />
                <AntragFormArbeitszeitSection
                  form={antrag.form}
                  employeeTagessatz={employee.tagessatz}
                  onPatch={patchForm}
                  fieldErrors={fieldErrors}
                />
              </div>
            </main>
          </ObjectPageSection>
        </ObjectPage>

        <Bar
          className="awb-antrag-page__footer"
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
              className="awb-antrag-page__footer-actions"
            >
              <Button design="Transparent" onClick={goBack}>
                Abbrechen
              </Button>
              {!vgAntragEdit ? (
                <Button design="Default" onClick={handleSaveDraft}>
                  Entwurf speichern
                </Button>
              ) : null}
              <Button design="Emphasized" onClick={handleSubmit}>
                {submitLabel}
              </Button>
            </FlexBox>
          }
        />

        {validationErrorCount > 0 && messagePopoverOpen ? (
          <Popover
            className="awb-antrag-page__message-popover"
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
