import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Form } from '@ui5/webcomponents-react/Form'
import { FormGroup } from '@ui5/webcomponents-react/FormGroup'
import { FormItem } from '@ui5/webcomponents-react/FormItem'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { List } from '@ui5/webcomponents-react/List'
import { ListItemGroup } from '@ui5/webcomponents-react/ListItemGroup'
import { ListItemStandard } from '@ui5/webcomponents-react/ListItemStandard'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { ObjectStatus } from '@ui5/webcomponents-react/ObjectStatus'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { FlexibleColumnLayout } from '@ui5/webcomponents-react/FlexibleColumnLayout'
import { FlexBoxAlignItems } from '@ui5/webcomponents-react/enums/FlexBoxAlignItems'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import '@ui5/webcomponents-fiori/dist/illustrations/BeforeSearch.js'
import '@ui5/webcomponents-fiori/dist/illustrations/NoData.js'
import { AppShellBar } from '../components/AppShellBar'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import { isAntragPruefungPhase } from '../data/antrag/phases'
import { getAntrag } from '../data/antraege'
import { getEmployee } from '../data/employees'
import { formatFeedTimestamp } from '../data/antrag/format'
import {
  getInboxItem,
  inboxItemVisibleToPersona,
  inboxTaskStatusLabel,
  isWeiterbildungInboxItem,
  listOpenInboxItemsForPersona,
  materializeInboxAngebot,
  subscribeMaInbox,
  type InboxTaskType,
  type MaInboxItem,
} from '../data/inbox'
import { isMarkusMaPersona } from '../data/personas'
import './PosteingangPage.css'

type InboxRow = {
  item: MaInboxItem
  titel: string
  quelle: string
  von: string
  mitarbeiter: string
}

function toInboxRow(item: MaInboxItem): InboxRow | null {
  if (isWeiterbildungInboxItem(item)) {
    const antrag = getAntrag(item.antragId)
    if (!antrag) {
      return null
    }
    const employee = getEmployee(item.employeeId)
    return {
      item,
      titel: antrag.ausbildung || antrag.form.titel || item.title,
      quelle: item.source,
      von: item.createdBy,
      mitarbeiter: employee?.name ?? '—',
    }
  }
  return {
    item,
    titel: item.title,
    quelle: item.source,
    von: item.createdBy,
    mitarbeiter: '—',
  }
}

function formatInboxDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function matchesQuery(row: InboxRow, query: string): boolean {
  if (!query) {
    return true
  }
  const haystack =
    `${row.titel} ${row.quelle} ${row.von} ${row.mitarbeiter}`.toLowerCase()
  return haystack.includes(query)
}

function inboxIdFromTarget(item: HTMLElement | undefined): string | undefined {
  return item?.dataset.inboxId
}

function taskMessage(item: MaInboxItem, mitarbeiter: string): string {
  switch (item.type) {
    case 'antrag-pruefen':
      return `${mitarbeiter} hat einen Weiterbildungsantrag eingereicht. Prüfe den Antrag und lege bei Genehmigung das Angebot fest.`
    case 'angebot-erstellen':
      return `Der Antrag von ${mitarbeiter} wurde genehmigt. Erstelle das Beteiligungsangebot der Post.`
    case 'angebot-pruefen':
      return `${item.createdBy} hat ein Beteiligungsangebot erstellt. Prüfe das Angebot, um die Details zu sehen.`
    case 'antrag-ueberarbeiten':
      return `${item.createdBy} hat den Antrag zur Überarbeitung zurückgesendet. Bearbeite den Antrag und reiche ihn erneut ein.`
    default:
      return 'Diese Aufgabe kommt aus einem anderen SAP-Prozess und ist in diesem Prototyp nicht weiter ausgeführt.'
  }
}

function taskActionLabel(type: InboxTaskType): string | null {
  switch (type) {
    case 'antrag-pruefen':
      return 'Antrag prüfen'
    case 'angebot-erstellen':
      return 'Angebot erstellen'
    case 'angebot-pruefen':
      return 'Angebot prüfen'
    case 'antrag-ueberarbeiten':
      return 'Antrag bearbeiten'
    default:
      return null
  }
}

export function PosteingangPage() {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const { persona, isVg } = usePrototypePersona()
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => subscribeMaInbox(() => setTick((value) => value + 1)), [])

  const rows = useMemo(() => {
    return listOpenInboxItemsForPersona(persona)
      .map(toInboxRow)
      .filter((row): row is InboxRow => row !== null)
  }, [persona, tick])

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return rows.filter((row) => matchesQuery(row, normalized))
  }, [query, rows])

  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, InboxRow[]>()
    for (const row of filteredRows) {
      const header = inboxTaskStatusLabel(row.item.type)
      if (!map.has(header)) {
        order.push(header)
        map.set(header, [])
      }
      map.get(header)?.push(row)
    }
    return order.map((header) => ({ header, rows: map.get(header) ?? [] }))
  }, [filteredRows])

  const selectedItem = taskId ? getInboxItem(taskId) : undefined
  const selectedRow = useMemo(() => {
    if (!selectedItem || selectedItem.status === 'erledigt') {
      return undefined
    }
    return toInboxRow(selectedItem) ?? undefined
  }, [selectedItem, tick])

  const antrag =
    selectedItem && isWeiterbildungInboxItem(selectedItem)
      ? getAntrag(selectedItem.antragId)
      : undefined
  const canAct = Boolean(
    selectedItem && inboxItemVisibleToPersona(selectedItem, persona),
  )
  const hasSelection = Boolean(taskId)
  const selectionMissing =
    hasSelection &&
    (!selectedItem ||
      selectedItem.status === 'erledigt' ||
      (isWeiterbildungInboxItem(selectedItem) && !antrag))

  useEffect(() => {
    if (selectionMissing) {
      navigate('/posteingang', { replace: true })
    }
  }, [navigate, selectionMissing])

  useEffect(() => {
    if (!taskId && filteredRows.length > 0) {
      navigate(`/posteingang/${filteredRows[0].item.id}`, { replace: true })
    }
  }, [filteredRows, navigate, taskId])

  const goHome = () => {
    navigate('/home')
  }

  const closeDetail = () => {
    navigate('/posteingang')
  }

  const openItem = (id: string) => {
    navigate(`/posteingang/${id}`)
  }

  const openAntragReview = (employeeId: string, antragId: string) => {
    navigate(`/weiterbildung/${employeeId}/antrag/${antragId}`)
  }

  const openAntragWizard = (employeeId: string, antragId: string) => {
    navigate(`/weiterbildung/${employeeId}/antrag/${antragId}/bearbeiten/1`)
  }

  const handleTaskAction = () => {
    if (!selectedItem || !isWeiterbildungInboxItem(selectedItem) || !antrag) {
      return
    }

    switch (selectedItem.type) {
      case 'antrag-pruefen':
      case 'angebot-erstellen':
        openAntragReview(selectedItem.employeeId, selectedItem.antragId)
        return
      case 'antrag-ueberarbeiten':
        openAntragWizard(selectedItem.employeeId, selectedItem.antragId)
        return
      case 'angebot-pruefen':
        if (
          isMarkusMaPersona(persona) &&
          persona.employeeId === selectedItem.employeeId &&
          isAntragPruefungPhase(antrag)
        ) {
          const updated = materializeInboxAngebot(selectedItem.id)
          if (!updated) {
            navigate('/posteingang', { replace: true })
            return
          }
          openAntragReview(updated.employeeId, updated.id)
          return
        }
        openAntragReview(selectedItem.employeeId, selectedItem.antragId)
        return
      default:
        return
    }
  }

  const actionLabel = selectedItem ? taskActionLabel(selectedItem.type) : null
  const titel = selectedRow?.titel || selectedItem?.title || ''
  const mitarbeiterName = selectedRow?.mitarbeiter ?? '—'
  const showWeiterbildungDetails = Boolean(
    selectedItem && isWeiterbildungInboxItem(selectedItem) && antrag,
  )

  return (
    <div className="inbox-page app-page">
      <AppShellBar appTitle="Home" onBack={goHome} />

      <FlexibleColumnLayout
        className="inbox-page__fcl"
        layout={hasSelection && !selectionMissing ? 'TwoColumnsMidExpanded' : 'OneColumn'}
        startColumn={
          <div className="inbox-start">
            <div className="inbox-start__header">
              <Title level="H1" size="H4">
                Meine HR-Tickets ({rows.length})
              </Title>
            </div>
            <div className="inbox-start__search">
              <Input
                accessibleName="Tickets suchen"
                placeholder="Suchen"
                value={query}
                onInput={(event) => setQuery(event.target.value ?? '')}
                icon={<Icon name="search" slot="icon" />}
              />
            </div>
            {filteredRows.length === 0 ? (
              <IllustratedMessage
                className="inbox-start__empty"
                name="NoData"
                design="Spot"
                titleText="Keine offenen Tickets"
                subtitleText={
                  query.trim()
                    ? 'Keine Treffer für diese Suche.'
                    : 'Sobald ein Ticket vorliegt, erscheint es hier.'
                }
              />
            ) : (
              <List
                className="inbox-start__list"
                accessibleName="Offene Tickets"
                selectionMode="Single"
                onItemClick={(event) => {
                  const id = inboxIdFromTarget(event.detail.item)
                  if (id) {
                    openItem(id)
                  }
                }}
              >
                {groups.map((group) => (
                  <ListItemGroup key={group.header} headerText={group.header}>
                    {group.rows.map((row) => (
                      <ListItemStandard
                        key={row.item.id}
                        data-inbox-id={row.item.id}
                        text={row.titel}
                        description={
                          isVg
                            ? `${row.mitarbeiter} · ${row.quelle}`
                            : `${row.quelle} · ${row.von}`
                        }
                        additionalText={formatInboxDate(row.item.createdAt)}
                        selected={row.item.id === taskId}
                        navigated={row.item.id === taskId}
                        type="Active"
                      />
                    ))}
                  </ListItemGroup>
                ))}
              </List>
            )}
          </div>
        }
        midColumn={
          <div className="inbox-mid">
            {selectedItem && selectedRow && !selectionMissing && !canAct ? (
              <div className="inbox-mid__guard">
                <MessageStrip design="Critical" hideCloseButton>
                  Diese Aufgabe gehört nicht zu dir.
                </MessageStrip>
              </div>
            ) : selectedItem && selectedRow && !selectionMissing ? (
              <>
                <header className="inbox-mid__header">
                  <div className="inbox-mid__title-block">
                    <FlexBox
                      alignItems={FlexBoxAlignItems.Start}
                      justifyContent={FlexBoxJustifyContent.SpaceBetween}
                      wrap={FlexBoxWrap.Wrap}
                      className="inbox-mid__title-row"
                    >
                      <Title level="H2" size="H4">
                        {titel}
                      </Title>
                      <Button
                        design="Transparent"
                        icon="decline"
                        tooltip="Schliessen"
                        accessibleName="Ticket schliessen"
                        onClick={closeDetail}
                      />
                    </FlexBox>
                    <ObjectStatus
                      className="inbox-mid__status"
                      state={
                        selectedItem.type === 'angebot-pruefen'
                          ? 'Information'
                          : 'None'
                      }
                      showDefaultIcon
                    >
                      {inboxTaskStatusLabel(selectedItem.type)}
                    </ObjectStatus>
                  </div>
                </header>

                <main className="inbox-mid__content">
                  <MessageStrip design="Information" hideCloseButton>
                    {taskMessage(selectedItem, mitarbeiterName)}
                  </MessageStrip>

                  <Form
                    accessibleMode="Display"
                    layout="S1 M1 L1 XL1"
                    itemSpacing="Large"
                    labelSpan="S4 M4 L4 XL4"
                  >
                    <FormGroup>
                      <FormItem labelContent={<Label showColon>Aufgabe</Label>}>
                        <Text>{titel}</Text>
                      </FormItem>
                      {isVg && showWeiterbildungDetails ? (
                        <FormItem labelContent={<Label showColon>Mitarbeitende/r</Label>}>
                          <Text>{mitarbeiterName}</Text>
                        </FormItem>
                      ) : null}
                      <FormItem labelContent={<Label showColon>Quelle</Label>}>
                        <Text>{selectedItem.source}</Text>
                      </FormItem>
                      <FormItem labelContent={<Label showColon>Von</Label>}>
                        <Text>{selectedItem.createdBy}</Text>
                      </FormItem>
                      <FormItem labelContent={<Label showColon>Eingegangen</Label>}>
                        <Text>
                          {formatFeedTimestamp(selectedItem.createdAt)}
                        </Text>
                      </FormItem>
                      {showWeiterbildungDetails && antrag ? (
                        <>
                          <FormItem labelContent={<Label showColon>Anbieter</Label>}>
                            <Text>
                              {antrag.anbieter || antrag.form.anbieter}
                            </Text>
                          </FormItem>
                          <FormItem labelContent={<Label showColon>Von / Bis</Label>}>
                            <Text>
                              {`${antrag.von || antrag.form.von} – ${antrag.bis || antrag.form.bis}`}
                            </Text>
                          </FormItem>
                        </>
                      ) : null}
                    </FormGroup>
                  </Form>
                </main>

                {actionLabel ? (
                  <Bar
                    className="inbox-mid__footer"
                    design="Footer"
                    endContent={
                      <FlexBox
                        justifyContent={FlexBoxJustifyContent.End}
                        alignItems={FlexBoxAlignItems.Center}
                        direction={FlexBoxDirection.Row}
                      >
                        <Button design="Emphasized" onClick={handleTaskAction}>
                          {actionLabel}
                        </Button>
                      </FlexBox>
                    }
                  />
                ) : null}
              </>
            ) : (
              <IllustratedMessage
                className="inbox-mid__empty"
                name="BeforeSearch"
                design="Spot"
                titleText="Ticket auswählen"
                subtitleText="Wähle links ein Ticket, um die Details zu sehen."
              />
            )}
          </div>
        }
      />
    </div>
  )
}
