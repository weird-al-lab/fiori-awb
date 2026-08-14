import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { ComboBox } from '@ui5/webcomponents-react/ComboBox'
import { ComboBoxItem } from '@ui5/webcomponents-react/ComboBoxItem'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { AwbDialog } from '../components/AwbDialog'
import { FileUploader } from '@ui5/webcomponents-react/FileUploader'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { MultiComboBox } from '@ui5/webcomponents-react/MultiComboBox'
import { MultiComboBoxItem } from '@ui5/webcomponents-react/MultiComboBoxItem'
import { Option } from '@ui5/webcomponents-react/Option'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { Select } from '@ui5/webcomponents-react/Select'
import { BusyIndicator } from '@ui5/webcomponents-react/BusyIndicator'
import { Text } from '@ui5/webcomponents-react/Text'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { Title } from '@ui5/webcomponents-react/Title'
import { UploadCollection } from '@ui5/webcomponents-react/UploadCollection'
import { UploadCollectionItem } from '@ui5/webcomponents-react/UploadCollectionItem'
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
  createDokumentMeta,
  createNewAntrag,
  deleteAntrag,
  deleteDokumentBlob,
  FACHRICHTUNG_OPTIONS,
  formatChf,
  formatChfRate,
  formatBeschaeftigungsgradOption,
  formatFileSize,
  getAntrag,
  getArbeitszeitGrundlage,
  getBeschaeftigungsgradOptions,
  getBundBeteiligung,
  getPostKostenGrundlage,
  MAX_DOCUMENT_BYTES,
  TYP_OPTIONS,
  parseBeschaeftigungsgradPercent,
  saveDokumentBlob,
  saveDraft,
  flushFormKommentarToFeed,
  SCHULEN_ANBIETER_OPTIONS,
  isMaUeberarbeitungPhase,
  isVgAntragPruefungEditable,
  isVgDraftResubmit,
  submitAntrag,
  type AntragFormData,
  type JaNein,
  type Pruefungszulassung,
  type WeiterbildungAntrag,
  WOCHENTAG_OPTIONS,
} from '../data/antraege'
import { getEmployee } from '../data/employees'
import './AusbildungAntragWizardPage.css'

const STEP_COUNT = 4

const BUND_SUBJEKTFINANZIERUNG_URL =
  'https://www.sbfi.admin.ch/de/bundesbeitraege-fuer-kurse-die-auf-eidgenoessische-pruefungen-vorbereiten'

const WIZARD_STEPS = [
  { number: 1, title: 'Grunddaten' },
  { number: 2, title: 'Kosten' },
  { number: 3, title: 'Arbeitszeit / Pensum' },
  { number: 4, title: 'Dokumente / Kommentare', subtitle: 'Optional' },
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

function RequiredLabel({ children }: { children: string }) {
  return (
    <Label required showColon>
      {children}
    </Label>
  )
}

function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`awb-wizard__field${className ? ` ${className}` : ''}`}>
      {required ? <RequiredLabel>{label}</RequiredLabel> : <Label showColon>{label}</Label>}
      {children}
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="awb-wizard__card">
      <Title level="H2" size="H5" className="awb-wizard__card-title">
        {title}
      </Title>
      {children}
    </section>
  )
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
            subtitleText={'subtitle' in item ? item.subtitle : undefined}
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
  const { persona, ownsEmployee, isVg } = usePrototypePersona()
  const isEdit = Boolean(antragId)
  const stepFromUrl = parseStep(stepParam)
  const ownCase = ownsEmployee(employeeId)

  const [antrag, setAntrag] = useState<WeiterbildungAntrag | null>(null)
  const [unlockedUntil, setUnlockedUntil] = useState(() =>
    readUnlocked(antragId, isEdit ? STEP_COUNT : 1),
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pruefungszulassungInfoOpen, setPruefungszulassungInfoOpen] = useState(false)
  const [beteiligungBundInfoOpen, setBeteiligungBundInfoOpen] = useState(false)
  const [arbeitszeiterleichterungInfoOpen, setArbeitszeiterleichterungInfoOpen] =
    useState(false)
  const [uploadError, setUploadError] = useState('')
  const [docsBusy, setDocsBusy] = useState(false)
  const loadedAntragIdRef = useRef<string | null>(null)

  const step = stepFromUrl

  useEffect(() => {
    if (!employee) {
      navigate('/weiterbildung', { replace: true })
    }
  }, [employee, navigate])

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

  const goToStep = (next: number, nextAntragId = antragId) => {
    const unlocked = Math.max(unlockedUntil, next)
    setUnlockedUntil(unlocked)
    writeUnlocked(nextAntragId, unlocked)
    navigate(wizardStepPath(employeeId, nextAntragId, next))
  }

  const goBack = () => {
    navigate(`/weiterbildung/${employeeId}`)
  }

  const handleSave = () => {
    if (!antrag) {
      return
    }
    const withComment = flushFormKommentarToFeed(antrag, persona.name)
    const saved = saveDraft(withComment)
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
    const persisted = persistRevisionDraft(antrag)
    setAntrag(persisted)
    const submitted = submitAntrag(persisted, persona.name)
    const toast = isVgDraftResubmit(persisted)
      ? 'Antrag wurde aktualisiert und steht zur Prüfung bereit.'
      : isVg
        ? 'Antrag wurde zur Prüfung weitergeleitet.'
        : 'Dein Antrag wurde an Mettler Markus zur Prüfung weitergeleitet'
    navigate(`/weiterbildung/${employeeId}/antrag/${submitted.id}`, {
      state: { toast },
    })
  }

  const handleDeleteConfirm = () => {
    if (antrag && isPersisted(antrag)) {
      deleteAntrag(antrag.id)
    }
    setDeleteOpen(false)
    navigate(`/weiterbildung/${employeeId}`)
  }

  const goNext = () => {
    if (antrag) {
      const saved = persistRevisionDraft(antrag)
      setAntrag(saved)
    }
    const next = Math.min((step || 1) + 1, STEP_COUNT)
    goToStep(next)
  }

  const goPrev = () => {
    if (antrag) {
      const saved = persistRevisionDraft(antrag)
      setAntrag(saved)
    }
    const prev = Math.max((step || 1) - 1, 1)
    goToStep(prev)
  }

  const patchForm = (patch: Partial<AntragFormData>) => {
    setAntrag((prev) => (prev ? updateForm(prev, patch) : prev))
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !antrag) {
      return
    }
    setUploadError('')
    setDocsBusy(true)
    try {
      const nextDocs = [...antrag.dokumente]
      for (const file of Array.from(files)) {
        if (file.size > MAX_DOCUMENT_BYTES) {
          setUploadError(
            `"${file.name}" überschreitet das Limit von ${formatFileSize(MAX_DOCUMENT_BYTES)}.`,
          )
          continue
        }
        const meta = createDokumentMeta(file)
        await saveDokumentBlob(meta.id, file)
        nextDocs.push(meta)
      }
      setAntrag({ ...antrag, dokumente: nextDocs })
    } finally {
      setDocsBusy(false)
    }
  }

  const handleRemoveDokument = async (dokumentId: string) => {
    if (!antrag) {
      return
    }
    setDocsBusy(true)
    try {
      await deleteDokumentBlob(dokumentId)
      setAntrag({
        ...antrag,
        dokumente: antrag.dokumente.filter((doc) => doc.id !== dokumentId),
      })
    } finally {
      setDocsBusy(false)
    }
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
  const bundBetrag = getBundBeteiligung(form)
  const postGrundlage = getPostKostenGrundlage(form)
  const arbeitszeit = getArbeitszeitGrundlage(form, employee.tagessatz)

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
                  Aus- / Weiterbildung beantragen
                </Title>
                <UnterstatusTag unterstatus={antrag.unterstatus} />
              </FlexBox>
              <Text className="awb-wizard__subtitle">
                {employee.name} / Personalnr. {employee.personalnummer}
              </Text>
            </div>
            <FlexBox className="awb-wizard__header-actions" wrap={FlexBoxWrap.Wrap}>
              <Button design="Transparent" icon="delete" onClick={() => setDeleteOpen(true)}>
                Löschen
              </Button>
              <Button design="Default" onClick={handleSave}>
                Speichern und schliessen
              </Button>
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
        {step === 1 ? (
          <div className="awb-wizard__step-body">
            <SectionCard title="Besprechungen">
              <FormField
                label="Wurde die Aus-/Weiterbildung mit der vorgesetzten Person vorbesprochen"
                required
              >
                <FlexBox className="awb-wizard__radio-row">
                  <RadioButton
                    name="vorbesprochen"
                    text="Ja"
                    checked={form.vorbesprochen === 'ja'}
                    onChange={() => patchForm({ vorbesprochen: 'ja' })}
                  />
                  <RadioButton
                    name="vorbesprochen"
                    text="Nein"
                    checked={form.vorbesprochen === 'nein'}
                    onChange={() => patchForm({ vorbesprochen: 'nein' })}
                  />
                </FlexBox>
              </FormField>
            </SectionCard>

            <SectionCard title="Anbieter und Dauer">
              <div className="awb-wizard__two-col">
                <div className="awb-wizard__col">
                  <Text className="awb-wizard__group-label">Ausbildung und Anbieter</Text>
                  <FormField label="Titel" required>
                    <Input
                      value={form.titel}
                      onInput={(event) =>
                        patchForm({ titel: event.target.value ?? '' })
                      }
                    />
                  </FormField>
                  <FormField label="Anbieter/-in / Schule" required>
                    <ComboBox
                      value={form.anbieter}
                      placeholder="Schule suchen oder auswählen"
                      filter="Contains"
                      showClearIcon
                      accessibleName="Anbieter/-in / Schule"
                      onInput={(event) =>
                        patchForm({ anbieter: event.target.value ?? '' })
                      }
                      onChange={(event) =>
                        patchForm({ anbieter: event.target.value ?? '' })
                      }
                    >
                      {SCHULEN_ANBIETER_OPTIONS.map((schule) => (
                        <ComboBoxItem key={schule} text={schule} />
                      ))}
                    </ComboBox>
                  </FormField>
                </div>
                <div className="awb-wizard__col">
                  <Text className="awb-wizard__group-label">Dauer der Ausbildung</Text>
                  <FormField label="Vom" required>
                    <DatePicker
                      value={form.von}
                      placeholder="z. B. 13.09.2026"
                      formatPattern="dd.MM.yyyy"
                      onChange={(event) =>
                        patchForm({ von: event.detail.value ?? '' })
                      }
                    />
                  </FormField>
                  <FormField label="Voraussichtlich bis" required>
                    <DatePicker
                      value={form.bis}
                      placeholder="z. B. 24.12.2026"
                      formatPattern="dd.MM.yyyy"
                      onChange={(event) =>
                        patchForm({ bis: event.detail.value ?? '' })
                      }
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Abschluss und Zulassung">
              <div className="awb-wizard__two-col">
                <div className="awb-wizard__col">
                  <Text className="awb-wizard__group-label">Abschluss</Text>
                  <FormField label="Typ" required>
                    <Select
                      onChange={(event) => {
                        const text = event.detail.selectedOption?.textContent ?? ''
                        patchForm({
                          niveau: text === 'Bitte wählen' ? '' : text,
                        })
                      }}
                    >
                      <Option data-key="" selected={!form.niveau}>
                        Bitte wählen
                      </Option>
                      {TYP_OPTIONS.map((option) => (
                        <Option key={option} selected={form.niveau === option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Fachrichtung" required>
                    <Select
                      onChange={(event) => {
                        const text = event.detail.selectedOption?.textContent ?? ''
                        patchForm({
                          fachrichtung: text === 'Bitte wählen' ? '' : text,
                        })
                      }}
                    >
                      <Option data-key="" selected={!form.fachrichtung}>
                        Bitte wählen
                      </Option>
                      {FACHRICHTUNG_OPTIONS.map((option) => (
                        <Option key={option} selected={form.fachrichtung === option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div className="awb-wizard__col">
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    className="awb-wizard__group-label-row"
                  >
                    <Text className="awb-wizard__group-label">Prüfungszulassung</Text>
                    <Button
                      design="Transparent"
                      icon="information"
                      accessibleName="Informationen zur Prüfungszulassung"
                      onClick={() => setPruefungszulassungInfoOpen(true)}
                    />
                  </FlexBox>
                  <FormField
                    label="Ist die Zulassung zur Prüfung gewährleistet"
                    required
                  >
                    <FlexBox className="awb-wizard__radio-row">
                      {(
                        [
                          ['ja', 'Ja'],
                          ['nein', 'Nein'],
                          ['keine', 'Keine Zulassung nötig'],
                        ] as const
                      ).map(([value, label]) => (
                        <RadioButton
                          key={value}
                          name="pruefungszulassung"
                          text={label}
                          checked={form.pruefungszulassung === value}
                          onChange={() =>
                            patchForm({
                              pruefungszulassung: value as Pruefungszulassung,
                            })
                          }
                        />
                      ))}
                    </FlexBox>
                  </FormField>
                  {form.pruefungszulassung === 'nein' ? (
                    <FormField label="Erklärung" required>
                      <Input
                        value={form.zulassungErklaerung}
                        onInput={(event) =>
                          patchForm({
                            zulassungErklaerung: event.target.value ?? '',
                          })
                        }
                      />
                    </FormField>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="awb-wizard__step-body">
            <SectionCard title="Kosten und Finanzierung">
              <div className="awb-wizard__two-col">
                <div className="awb-wizard__col">
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    className="awb-wizard__group-label-row"
                  >
                    <Text className="awb-wizard__group-label">Beteiligung Bund</Text>
                    <Button
                      design="Transparent"
                      icon="information"
                      accessibleName="Informationen zur Beteiligung Bund"
                      onClick={() => setBeteiligungBundInfoOpen(true)}
                    />
                  </FlexBox>
                  <FormField
                    label="Handelt es sich beim angestrebten Abschluss um eine eidgenössische Prüfung, die vom Bund zu 50% finanziert wird"
                    required
                  >
                    <FlexBox className="awb-wizard__radio-row">
                      <RadioButton
                        name="bund50"
                        text="Ja"
                        checked={form.bund50 === 'ja'}
                        onChange={() => patchForm({ bund50: 'ja' as JaNein })}
                      />
                      <RadioButton
                        name="bund50"
                        text="Nein"
                        checked={form.bund50 === 'nein'}
                        onChange={() => patchForm({ bund50: 'nein' as JaNein })}
                      />
                    </FlexBox>
                  </FormField>
                </div>
                <div className="awb-wizard__col">
                  <Text className="awb-wizard__group-label">Ausbildungskosten</Text>
                  <Text>
                    Bitte erfasse die Ausbildungskosten in CHF. Reise-, Übernachtungs-
                    oder Verpflegungskosten werden über die Spesenabrechnung
                    zurückgefordert.
                  </Text>
                  <FormField label="Kurskosten" required>
                    <Input
                      value={form.kurskosten}
                      onInput={(event) =>
                        patchForm({ kurskosten: event.target.value ?? '' })
                      }
                    />
                  </FormField>
                  <FormField label="Beteiligung Bund">
                    <Input
                      value={bundBetrag > 0 ? `- ${bundBetrag.toLocaleString('de-CH')}` : '0'}
                      readonly
                    />
                  </FormField>
                  <FormField label="Zusätzliche Kosten">
                    <Input
                      value={form.zusaetzlicheKosten}
                      placeholder="z. B. Einschreibegebühr, Material"
                      onInput={(event) =>
                        patchForm({
                          zusaetzlicheKosten: event.target.value ?? '',
                        })
                      }
                    />
                  </FormField>
                  <MessageStrip
                    design="ColorSet2"
                    colorScheme="9"
                    hideCloseButton
                    className="awb-wizard__info"
                    icon={<Icon name="money-bills" slot="icon" />}
                  >
                    Die Grundlage für die Beteiligung Post an den Ausbildungskosten ist{' '}
                    {formatChf(postGrundlage)}
                  </MessageStrip>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="awb-wizard__step-body">
            <SectionCard title="Ausbildungszeiten">
              <div className="awb-wizard__three-col">
                <FormField label="Anzahl Ausbildungstage">
                  <Input
                    value={form.anzahlAusbildungstage}
                    onInput={(event) =>
                      patchForm({
                        anzahlAusbildungstage: event.target.value ?? '',
                      })
                    }
                  />
                </FormField>
                <FormField label="Wochentage">
                  <MultiComboBox
                    onSelectionChange={(event) => {
                      const items = event.detail.items ?? []
                      patchForm({
                        wochentage: items
                          .map((item) => item.text ?? '')
                          .filter(Boolean),
                      })
                    }}
                  >
                    {WOCHENTAG_OPTIONS.map((tag) => (
                      <MultiComboBoxItem
                        key={tag}
                        text={tag}
                        selected={form.wochentage.includes(tag)}
                      />
                    ))}
                  </MultiComboBox>
                </FormField>
                <FormField label="Schulzeiten / Bemerkungen">
                  <Input
                    value={form.schulzeitenBemerkungen}
                    onInput={(event) =>
                      patchForm({
                        schulzeitenBemerkungen: event.target.value ?? '',
                      })
                    }
                  />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard title="Arbeitszeit">
              <div className="awb-wizard__two-col">
                <div className="awb-wizard__col">
                  <Text className="awb-wizard__group-label">Arbeitspensum</Text>
                  <FormField
                    label="Muss der Beschäftigungsgrad für die Dauer der Ausbildung angepasst werden"
                    required
                  >
                    <FlexBox className="awb-wizard__radio-row">
                      <RadioButton
                        name="pensum"
                        text="Ja"
                        checked={form.beschaeftigungsgradAnpassen === 'ja'}
                        onChange={() =>
                          patchForm({ beschaeftigungsgradAnpassen: 'ja' })
                        }
                      />
                      <RadioButton
                        name="pensum"
                        text="Nein"
                        checked={form.beschaeftigungsgradAnpassen === 'nein'}
                        onChange={() =>
                          patchForm({ beschaeftigungsgradAnpassen: 'nein' })
                        }
                      />
                    </FlexBox>
                  </FormField>
                  {form.beschaeftigungsgradAnpassen === 'ja' ? (
                    <FormField
                      label="Gewünschter Beschäftigungsgrad ab Ausbildungsbeginn"
                      required
                    >
                      <Select
                        onChange={(event) => {
                          const text = event.detail.selectedOption?.textContent ?? ''
                          patchForm({
                            gewuenschterBeschaeftigungsgrad:
                              text === 'Bitte wählen' ? '' : text,
                          })
                        }}
                      >
                        <Option data-key="" selected={!form.gewuenschterBeschaeftigungsgrad}>
                          Bitte wählen
                        </Option>
                        {getBeschaeftigungsgradOptions(employee.beschaeftigungsgrad).map((option) => (
                          <Option
                            key={option}
                            selected={form.gewuenschterBeschaeftigungsgrad === option}
                          >
                            {option}
                          </Option>
                        ))}
                      </Select>
                    </FormField>
                  ) : null}
                </div>
                <div className="awb-wizard__col">
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    className="awb-wizard__group-label-row"
                  >
                    <Text className="awb-wizard__group-label">Arbeitszeiterleichterung</Text>
                    <Button
                      design="Transparent"
                      icon="information"
                      accessibleName="Informationen zur Arbeitszeiterleichterung"
                      onClick={() => setArbeitszeiterleichterungInfoOpen(true)}
                    />
                  </FlexBox>
                  <FormField
                    label="Soll eine Arbeitszeiterleichterung beantragt werden"
                    required
                  >
                    <FlexBox className="awb-wizard__radio-row">
                      <RadioButton
                        name="aze"
                        text="Ja"
                        checked={form.arbeitszeiterleichterung === 'ja'}
                        onChange={() =>
                          patchForm({ arbeitszeiterleichterung: 'ja' })
                        }
                      />
                      <RadioButton
                        name="aze"
                        text="Nein"
                        checked={form.arbeitszeiterleichterung === 'nein'}
                        onChange={() =>
                          patchForm({ arbeitszeiterleichterung: 'nein' })
                        }
                      />
                    </FlexBox>
                  </FormField>
                  {form.arbeitszeiterleichterung === 'ja' ? (
                    <>
                      <FormField label="Anzahl Tage" required>
                        <Input
                          value={form.anzahlTageErleichterung}
                          onInput={(event) =>
                            patchForm({
                              anzahlTageErleichterung: event.target.value ?? '',
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Begründung" required>
                        <Input
                          value={form.begruendungErleichterung}
                          onInput={(event) =>
                            patchForm({
                              begruendungErleichterung: event.target.value ?? '',
                            })
                          }
                        />
                      </FormField>
                      <MessageStrip
                        design="ColorSet2"
                        colorScheme="9"
                        hideCloseButton
                        className="awb-wizard__info"
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
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="awb-wizard__step-body">
            <SectionCard title="Dokumente">
              <Text>
                Lade optionale Beilagen hoch (max. {formatFileSize(MAX_DOCUMENT_BYTES)}{' '}
                pro Datei). Die Dateien bleiben lokal im Browser gespeichert.
              </Text>
              <FileUploader
                hideInput
                multiple
                onChange={(event) => {
                  void handleFiles(event.detail.files)
                }}
              >
                <Button design="Transparent" icon="upload">
                  Dokument hochladen
                </Button>
              </FileUploader>
              {uploadError ? (
                <MessageStrip
                  design="Negative"
                  onClose={() => setUploadError('')}
                  className="awb-wizard__info"
                >
                  {uploadError}
                </MessageStrip>
              ) : null}
              <BusyIndicator
                active={docsBusy}
                delay={0}
                text="Dokumente werden verarbeitet …"
                className="awb-wizard__uploads-busy"
              >
                <UploadCollection
                  className="awb-wizard__uploads"
                  noDataText="Keine Dokumente hochgeladen"
                  hideDragOverlay
                  onItemDelete={(event) => {
                    const id = event.detail.item.dataset.dokumentId
                    if (id) {
                      void handleRemoveDokument(id)
                    }
                  }}
                >
                {antrag.dokumente.map((doc) => (
                  <UploadCollectionItem
                    key={doc.id}
                    fileName={doc.name}
                    data-dokument-id={doc.id}
                    hideDeleteButton={false}
                    uploadState="Complete"
                  >
                    <Text slot="thumbnail">{formatFileSize(doc.size)}</Text>
                  </UploadCollectionItem>
                ))}
              </UploadCollection>
              </BusyIndicator>
            </SectionCard>

            <SectionCard title="Kommentar">
              <FormField label="Kommentar">
                <TextArea
                  rows={5}
                  value={form.kommentar}
                  placeholder="Schreibe einen Kommentar zur Begründung"
                  onInput={(event) =>
                    patchForm({ kommentar: event.target.value ?? '' })
                  }
                />
              </FormField>
            </SectionCard>
          </div>
        ) : null}
      </main>

      <Bar
        className="awb-wizard__footer"
        design="FloatingFooter"
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
                Absenden
              </Button>
            )}
          </FlexBox>
        }
      />

      <AwbDialog
        open={pruefungszulassungInfoOpen}
        headerText="Prüfungszulassung"
        onClose={() => setPruefungszulassungInfoOpen(false)}
        footer={
          <Bar
            design="Footer"
            endContent={
              <Button
                design="Emphasized"
                onClick={() => setPruefungszulassungInfoOpen(false)}
              >
                OK
              </Button>
            }
          />
        }
      >
        <div className="awb-dialog-content">
          <Text>
            Für viele Aus- und Weiterbildungen müssen bestimmte Voraussetzungen für die
            Prüfung erfüllt sein, zum Beispiel eine passende Ausbildung oder
            Berufserfahrung.
            <br />
            <br />
            Kläre diese bei der zuständigen Stelle, falls eine Zulassung nötig ist.
            Möglicherweise musst du dafür einen Nachweis einreichen, etwa eine
            Arbeitsbestätigung oder ein Zwischenzeugnis.
          </Text>
        </div>
      </AwbDialog>

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
                <Button
                  design="Emphasized"
                  onClick={() => setBeteiligungBundInfoOpen(false)}
                >
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
            Die Beteiligung der Post wird auf Basis des nicht finanzierten Anteils
            berechnet.
          </Text>
        </div>
      </AwbDialog>

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
