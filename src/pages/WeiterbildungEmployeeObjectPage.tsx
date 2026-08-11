import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@ui5/webcomponents-react/Breadcrumbs'
import { BreadcrumbsItem } from '@ui5/webcomponents-react/BreadcrumbsItem'
import { Button } from '@ui5/webcomponents-react/Button'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import {
  ObjectPage,
  type ObjectPageDomRef,
} from '@ui5/webcomponents-react/ObjectPage'
import { ObjectPageHeader } from '@ui5/webcomponents-react/ObjectPageHeader'
import { ObjectPageSection } from '@ui5/webcomponents-react/ObjectPageSection'
import { ObjectPageTitle } from '@ui5/webcomponents-react/ObjectPageTitle'
import { SegmentedButton } from '@ui5/webcomponents-react/SegmentedButton'
import { SegmentedButtonItem } from '@ui5/webcomponents-react/SegmentedButtonItem'
import { Table } from '@ui5/webcomponents-react/Table'
import { TableCell } from '@ui5/webcomponents-react/TableCell'
import { TableHeaderCell } from '@ui5/webcomponents-react/TableHeaderCell'
import { TableHeaderRow } from '@ui5/webcomponents-react/TableHeaderRow'
import { TableRow } from '@ui5/webcomponents-react/TableRow'
import { TableRowAction } from '@ui5/webcomponents-react/TableRowAction'
import { TableRowActionNavigation } from '@ui5/webcomponents-react/TableRowActionNavigation'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { Toast } from '@ui5/webcomponents-react/Toast'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import { AppShellBar } from '../components/AppShellBar'
import { OwnCaseGuard } from '../components/OwnCaseGuard'
import { UnterstatusTag } from '../components/UnterstatusTag'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import { useObjectPageHeaderExpanded } from '../layout/useObjectPageHeaderExpanded'
import {
  getAktuellBeiDisplay,
  getMergedWeiterbildungenByEmployee,
  isPersistedAntragId,
} from '../data/antraege'
import { getEmployee } from '../data/employees'
import { getPersonaById } from '../data/personas'
import {
  type VertragFilter,
  type WeiterbildungUnterstatus,
} from '../data/weiterbildungen'
import './WeiterbildungEmployeeObjectPage.css'

const VERTRAG_TABLE_TITLE: Record<VertragFilter, string> = {
  all: 'Alle Aus- und Weiterbildungen',
  with: 'Aus und Weiterbildungen mit Vertrag',
  without: 'Aus und Weiterbildungen ohne Vertrag',
}

function HeaderFacet({ label, value }: { label: string; value: string }) {
  return (
    <div className="wb-object-page__facet-pair">
      <Label showColon>{label}</Label>
      <Text>{value}</Text>
    </div>
  )
}

export function WeiterbildungEmployeeObjectPage() {
  const { employeeId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const employee = getEmployee(employeeId)
  const { ownsEmployee, isMa, persona } = usePrototypePersona()
  const objectPageRef = useRef<ObjectPageDomRef>(null)
  const ownCase = ownsEmployee(employeeId)

  const [vertragFilter, setVertragFilter] = useState<VertragFilter>('all')
  const [search, setSearch] = useState('')
  const [storageTick, setStorageTick] = useState(0)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastText, setToastText] = useState('')

  useEffect(() => {
    if (!employee) {
      navigate('/weiterbildung', { replace: true })
    }
  }, [employee, navigate])

  useObjectPageHeaderExpanded(objectPageRef, employee?.id)

  useEffect(() => {
    const state = location.state as { toast?: string } | null
    if (state?.toast) {
      setToastText(state.toast)
      setToastOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const refresh = () => setStorageTick((value) => value + 1)
    window.addEventListener('awb-antraege-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('awb-antraege-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const weiterbildungen = useMemo(() => {
    if (!employee) {
      return []
    }
    return getMergedWeiterbildungenByEmployee(employee.id, {
      vertrag: vertragFilter,
      search,
    })
  }, [employee, vertragFilter, search, storageTick])

  const goBack = () => {
    if (isMa) {
      navigate('/', { replace: true })
      return
    }
    navigate('/weiterbildung', { replace: true })
  }

  const openAntrag = (id: string, unterstatus: WeiterbildungUnterstatus) => {
    if (!isPersistedAntragId(id)) {
      return
    }
    if (unterstatus === 'Entwurf') {
      navigate(`/weiterbildung/${employeeId}/antrag/${id}/bearbeiten/1`)
      return
    }
    navigate(`/weiterbildung/${employeeId}/antrag/${id}`)
  }

  if (!employee) {
    return null
  }

  const handlePersonaChange = (personaId: string) => {
    const next = getPersonaById(personaId)
    if (next.role === 'Mitarbeitender' && next.employeeId) {
      navigate(`/weiterbildung/${next.employeeId}`, { replace: true })
    }
  }

  const pageTitle = isMa ? (
    <ObjectPageTitle
      key="ma-title"
      header={<Title level="H1" size="H3">{employee.name}</Title>}
      subHeader={<Text>Personalnummer: {employee.personalnummer}</Text>}
    />
  ) : (
    <ObjectPageTitle
      key="vg-title"
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbsItem
            href="/weiterbildung"
            onClick={(event) => {
              event.preventDefault()
              navigate('/weiterbildung')
            }}
          >
            Mitarbeiter
          </BreadcrumbsItem>
          <BreadcrumbsItem>{employee.name}</BreadcrumbsItem>
        </Breadcrumbs>
      }
      header={<Title level="H1" size="H3">{employee.name}</Title>}
      subHeader={<Text>Personalnummer: {employee.personalnummer}</Text>}
    />
  )

  return (
    <OwnCaseGuard
      ownCase={ownCase}
      onBack={goBack}
      className="wb-object-page app-page"
    >
    <div className="wb-object-page app-page">
      <AppShellBar
        appTitle="Entwicklung"
        onBack={goBack}
        onPersonaChange={handlePersonaChange}
      />

      <ObjectPage
        key={persona.id}
        ref={objectPageRef}
        className="wb-object-page__object"
        titleArea={pageTitle}
        headerArea={
          <ObjectPageHeader>
            <FlexBox
              wrap={FlexBoxWrap.Wrap}
              className="wb-object-page__facets"
            >
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="wb-object-page__facet-col"
              >
                <HeaderFacet label="Funktion" value={employee.funktion} />
                <HeaderFacet
                  label="Org.Einheit"
                  value={employee.organisationseinheit}
                />
              </FlexBox>
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="wb-object-page__facet-col"
              >
                <HeaderFacet
                  label="Anstellungsverh."
                  value={employee.anstellungsverhaeltnis}
                />
                <HeaderFacet label="Stufe" value={employee.stufe} />
              </FlexBox>
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="wb-object-page__facet-col"
              >
                <HeaderFacet label="Adresse" value={employee.adresse} />
                <HeaderFacet label="PLZ/Ort" value={employee.plzOrt} />
              </FlexBox>
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="wb-object-page__facet-col"
              >
                <HeaderFacet
                  label="Geburtsdatum"
                  value={employee.geburtsdatum}
                />
                <HeaderFacet
                  label="Eintritt Post"
                  value={employee.eintrittPost}
                />
              </FlexBox>
            </FlexBox>
          </ObjectPageHeader>
        }
      >
        <ObjectPageSection
          id="weiterbildungen"
          titleText="Übersicht Aus- und Weiterbildungen"
          hideTitleText
        >
          <div className="page-content-column page-content-column--align-only wb-object-page__section">
            <Title level="H2" size="H3" className="wb-object-page__section-title">
              Übersicht Aus- und Weiterbildungen
            </Title>

            <div className="wb-object-page__actions-row">
              <SegmentedButton accessibleName="Vertragsfilter">
                <SegmentedButtonItem
                  selected={vertragFilter === 'all'}
                  onClick={() => setVertragFilter('all')}
                >
                  Alle
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  selected={vertragFilter === 'with'}
                  onClick={() => setVertragFilter('with')}
                >
                  Mit Vertrag
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  selected={vertragFilter === 'without'}
                  onClick={() => setVertragFilter('without')}
                >
                  Ohne Vertrag
                </SegmentedButtonItem>
              </SegmentedButton>

              <Button
                design="Emphasized"
                icon="add"
                onClick={() =>
                  navigate(`/weiterbildung/${employee.id}/antrag/neu`)
                }
              >
                Ausbildung beantragen
              </Button>
            </div>

            <div className="wb-object-page__table-wrap">
              <div className="wb-object-page__toolbar">
                <Title level="H3" size="H5" className="wb-object-page__toolbar-title">
                  {VERTRAG_TABLE_TITLE[vertragFilter]} ({weiterbildungen.length})
                </Title>
                <Input
                  className="wb-object-page__search"
                  placeholder="Suche nach Ausbildung"
                  value={search}
                  onInput={(event) => setSearch(event.target.value ?? '')}
                  icon={<Icon name="search" slot="icon" />}
                />
              </div>

              <Table
                accessibleName="Aus- und Weiterbildungen"
                className="wb-object-page__table"
                noDataText="Keine Weiterbildungen gefunden"
                rowActionCount={2}
                overflowMode="Scroll"
                onRowClick={(event) => {
                  const id = event.detail.row.dataset.wbId
                  const unterstatus = event.detail.row.dataset.unterstatus as
                    | WeiterbildungUnterstatus
                    | undefined
                  if (id && unterstatus) {
                    openAntrag(id, unterstatus)
                  }
                }}
                onRowActionClick={(event) => {
                  const id = event.detail.row.dataset.wbId
                  const unterstatus = event.detail.row.dataset.unterstatus as
                    | WeiterbildungUnterstatus
                    | undefined
                  if (id && unterstatus) {
                    openAntrag(id, unterstatus)
                  }
                }}
                headerRow={
                  <TableHeaderRow slot="headerRow">
                    <TableHeaderCell minWidth="14rem">
                      Ausbildung
                    </TableHeaderCell>
                    <TableHeaderCell minWidth="7rem" width="8rem">
                      Vom
                    </TableHeaderCell>
                    <TableHeaderCell minWidth="7rem" width="8rem">
                      Bis
                    </TableHeaderCell>
                    <TableHeaderCell minWidth="8rem" width="10rem">
                      Hauptstatus
                    </TableHeaderCell>
                    <TableHeaderCell minWidth="10rem" width="12rem">
                      Unterstatus
                    </TableHeaderCell>
                    <TableHeaderCell minWidth="10rem" width="12rem">
                      Aktuell bei
                    </TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {weiterbildungen.map((item) => (
                  <TableRow
                    key={item.id}
                    interactive={Boolean(item.isPersistedAntrag)}
                    data-wb-id={item.id}
                    data-unterstatus={item.unterstatus}
                    actions={
                      <>
                        <TableRowAction
                          slot="actions"
                          icon="overflow"
                          text="Weitere Aktionen"
                        />
                        <TableRowActionNavigation
                          slot="actions"
                          interactive={Boolean(item.isPersistedAntrag)}
                        />
                      </>
                    }
                  >
                    <TableCell>{item.ausbildung}</TableCell>
                    <TableCell>{item.von}</TableCell>
                    <TableCell>{item.bis}</TableCell>
                    <TableCell>{item.hauptstatus}</TableCell>
                    <TableCell>
                      <UnterstatusTag unterstatus={item.unterstatus} />
                    </TableCell>
                    <TableCell>{getAktuellBeiDisplay(item)}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        </ObjectPageSection>
      </ObjectPage>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">
        {toastText}
      </Toast>
    </div>
    </OwnCaseGuard>
  )
}
