import { useNavigate } from 'react-router-dom'
import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { AppShellBar } from '../components/AppShellBar'
import './FlowsIndexPage.css'

type Flow = {
  title: string
  subtitle: string
  description: string
  icon: string
  to: string
}

const FLOWS: Flow[] = [
  {
    title: 'Home-Launchpad',
    subtitle: 'Mitarbeitende/r · Startseite',
    description:
      'SAP-Fiori-Startseite mit Kacheln für Spesen, Arbeitszeit, Gesundheit und Entwicklung.',
    icon: 'home',
    to: '/home',
  },
  {
    title: 'Weiterbildung beantragen',
    subtitle: 'Ausbildungsantrag · Wizard',
    description:
      'Kompletter Antragsfluss: Mitarbeitendenliste, Objektseite, Antrags-Wizard und Prüfung.',
    icon: 'education',
    to: '/weiterbildung',
  },
  {
    title: 'Theme Lab',
    subtitle: 'UI5 Theme-Kaskade',
    description:
      'Galerie aller Komponenten mit Custom-Theme-Overrides zum Prüfen des Designs.',
    icon: 'palette',
    to: '/theme-lab',
  },
]

export function FlowsIndexPage() {
  const navigate = useNavigate()

  return (
    <div className="flows-index-page app-page">
      <div className="app-sticky-header">
        <AppShellBar appTitle="Prototypen" />
      </div>

      <main className="page-content-column page-content-column--main flows-index-page__content">
        <div className="flows-index-page__intro">
          <Title level="H1" size="H2">
            Prototypen
          </Title>
          <Text className="flows-index-page__intro-text">
            Alle Flows in diesem Projekt. Wähle einen aus, um ihn zu öffnen.
          </Text>
        </div>

        <div className="flows-index-page__grid">
          {FLOWS.map((flow) => (
            <Card
              key={flow.to}
              className="flows-index-page__card"
              header={
                <CardHeader
                  titleText={flow.title}
                  subtitleText={flow.subtitle}
                  avatar={<Icon name={flow.icon} />}
                  interactive
                  onClick={() => navigate(flow.to)}
                />
              }
            >
              <div className="flows-index-page__card-body">
                <Text>{flow.description}</Text>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
