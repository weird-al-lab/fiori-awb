import { useNavigate } from 'react-router-dom'
import { List } from '@ui5/webcomponents-react/List'
import { ListItemStandard } from '@ui5/webcomponents-react/ListItemStandard'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { AppShellBar } from '../components/AppShellBar'
import './PrototypeIndexPage.css'

const VERSIONS = [
  {
    id: 'current',
    path: '/home',
    title: 'Aktuelle Version',
    description: 'Gesicherter Stand des bestehenden Flows',
    additionalText: 'V1',
    icon: 'history',
  },
  {
    id: 'copy',
    path: '/v2',
    title: 'Arbeitskopie',
    description: 'Kopie zum Überarbeiten — der aktuelle Stand bleibt unverändert',
    additionalText: 'V2',
    icon: 'copy',
  },
] as const

export function PrototypeIndexPage() {
  const navigate = useNavigate()

  return (
    <div className="prototype-index app-page">
      <AppShellBar appTitle="Prototypen" />

      <header className="page-header">
        <div className="page-content-column page-content-column--page-title">
          <Title level="H1" size="H3">
            Aus- und Weiterbildung
          </Title>
        </div>
      </header>

      <main className="page-content-column page-content-column--main prototype-index__main">
        <Text className="prototype-index__intro">
          Wählen Sie eine Version des Prototyps. Die aktuelle Version bleibt als
          Referenz erhalten; Änderungen gehören in die Arbeitskopie.
        </Text>

        <List
          accessibleName="Prototype-Versionen"
          className="prototype-index__list"
          selectionMode="None"
        >
          {VERSIONS.map((version) => (
            <ListItemStandard
              key={version.id}
              additionalText={version.additionalText}
              description={version.description}
              icon={version.icon}
              type="Navigation"
              wrappingType="Normal"
              onClick={() => navigate(version.path)}
            >
              {version.title}
            </ListItemStandard>
          ))}
        </List>
      </main>
    </div>
  )
}
