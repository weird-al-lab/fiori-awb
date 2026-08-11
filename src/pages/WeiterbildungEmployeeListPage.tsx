import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Input } from '@ui5/webcomponents-react/Input'
import { Link } from '@ui5/webcomponents-react/Link'
import { SegmentedButton } from '@ui5/webcomponents-react/SegmentedButton'
import { SegmentedButtonItem } from '@ui5/webcomponents-react/SegmentedButtonItem'
import { Table } from '@ui5/webcomponents-react/Table'
import { TableCell } from '@ui5/webcomponents-react/TableCell'
import { TableHeaderCell } from '@ui5/webcomponents-react/TableHeaderCell'
import { TableHeaderRow } from '@ui5/webcomponents-react/TableHeaderRow'
import { TableRow } from '@ui5/webcomponents-react/TableRow'
import { TableRowActionNavigation } from '@ui5/webcomponents-react/TableRowActionNavigation'
import { Title } from '@ui5/webcomponents-react/Title'
import { AppShellBar } from '../components/AppShellBar'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import { getEmployees } from '../data/employees'
import { getPersonaById } from '../data/personas'
import './WeiterbildungEmployeeListPage.css'

type EmployeeScope = 'direct' | 'all'

const SCOPE_TABLE_TITLE: Record<EmployeeScope, string> = {
  direct: 'Direkt unterstellte Mitarbeiter',
  all: 'Alle Mitarbeiter im Verantwortungsbereich',
}

export function WeiterbildungEmployeeListPage() {
  const navigate = useNavigate()
  const { isMa, persona } = usePrototypePersona()
  const [scope, setScope] = useState<EmployeeScope>('direct')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isMa && persona.employeeId) {
      navigate(`/weiterbildung/${persona.employeeId}`, { replace: true })
    }
  }, [isMa, persona.employeeId, navigate])

  const employees = useMemo(
    () =>
      getEmployees({
        directOnly: scope === 'direct',
        search,
      }),
    [scope, search],
  )

  const goBack = () => {
    navigate('/')
  }

  const openEmployee = (employeeId: string) => {
    navigate(`/weiterbildung/${employeeId}`)
  }

  const handlePersonaChange = (personaId: string) => {
    const next = getPersonaById(personaId)
    if (next.role === 'Mitarbeitender' && next.employeeId) {
      navigate(`/weiterbildung/${next.employeeId}`, { replace: true })
    }
  }

  if (isMa) {
    return (
      <div className="wb-list-page app-page">
        <AppShellBar
          appTitle="Entwicklung"
          onBack={goBack}
          onPersonaChange={handlePersonaChange}
        />
      </div>
    )
  }

  return (
    <div className="wb-list-page app-page">
      <AppShellBar
        appTitle="Entwicklung"
        onBack={goBack}
        onPersonaChange={handlePersonaChange}
      />

      <header className="page-header">
        <div className="page-content-column page-content-column--page-title">
          <Title level="H1" size="H3" className="wb-list-page__title">
            Mitarbeitender/in auswählen
          </Title>
        </div>
      </header>

      <main className="page-content-column page-content-column--main wb-list-page__main">
        <div className="wb-list-page__section">
              <SegmentedButton
                accessibleName="Mitarbeiterfilter"
                className="wb-list-page__scope-filter"
              >
                <SegmentedButtonItem
                  selected={scope === 'direct'}
                  onClick={() => setScope('direct')}
                >
                  Direkte Mitarbeiter
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  selected={scope === 'all'}
                  onClick={() => setScope('all')}
                >
                  Alle Mitarbeiter
                </SegmentedButtonItem>
              </SegmentedButton>

              <div className="wb-list-page__table-wrap">
                <div className="wb-list-page__toolbar">
                  <Title level="H2" size="H5" className="wb-list-page__toolbar-title">
                    {SCOPE_TABLE_TITLE[scope]} ({employees.length})
                  </Title>
                  <Input
                    className="wb-list-page__search"
                    placeholder="Suche nach Name"
                    value={search}
                    onInput={(event) => setSearch(event.target.value ?? '')}
                    icon={<Icon name="search" slot="icon" />}
                  />
                </div>

                <Table
                  accessibleName="Mitarbeiterliste"
                  className="wb-list-page__table"
                  noDataText="Keine Mitarbeitenden gefunden"
                  rowActionCount={1}
                  onRowClick={(event) => {
                    const id = event.detail.row.dataset.employeeId
                    if (id) {
                      openEmployee(id)
                    }
                  }}
                  onRowActionClick={(event) => {
                    const id = event.detail.row.dataset.employeeId
                    if (id) {
                      openEmployee(id)
                    }
                  }}
                  headerRow={
                    <TableHeaderRow slot="headerRow">
                      <TableHeaderCell minWidth="12rem" width="20%">
                        Name
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="8rem" width="15%">
                        Personalnummer
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="10rem" width="20%">
                        Organisationseinheit
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="10rem">
                        Direkte/r Vorgesetzter
                      </TableHeaderCell>
                    </TableHeaderRow>
                  }
                >
                  {employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      interactive
                      data-employee-id={employee.id}
                      actions={
                        <TableRowActionNavigation slot="actions" interactive />
                      }
                    >
                      <TableCell>
                        <Link
                          onClick={(event) => {
                            event.preventDefault()
                            openEmployee(employee.id)
                          }}
                        >
                          {employee.name}
                        </Link>
                      </TableCell>
                      <TableCell>{employee.personalnummer}</TableCell>
                      <TableCell>{employee.organisationseinheit}</TableCell>
                      <TableCell>{employee.direkterVorgesetzter}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
        </div>
      </main>
    </div>
  )
}
