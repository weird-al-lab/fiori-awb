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
    title: 'Variante mit Wizard',
    description: 'Favorisierte Variante aus UX-Sicht',
    additionalText: 'VWizard',
    icon: 'history',
  },
  {
    id: 'copy',
    path: '/v2',
    title: 'Variante mit Formular',
    description: 'Einfache Alternative',
    additionalText: 'VForm',
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
