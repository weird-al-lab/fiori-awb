import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Title } from '@ui5/webcomponents-react/Title'
import { AppShellBar } from '../../components/AppShellBar'
import './theme-lab.css'

type ThemeLabLayoutProps = {
  title: string
  onBack: () => void
  children: ReactNode
  showCategoryNav?: boolean
}

export function ThemeLabLayout({
  title,
  onBack,
  children,
  showCategoryNav,
}: ThemeLabLayoutProps) {
  return (
    <div className="theme-lab-page app-page">
      <AppShellBar appTitle="Theme Lab" onBack={onBack} />
      <div className="theme-lab-body">
        <Title level="H2" wrappingType="None">
          {title}
        </Title>
        {showCategoryNav ? (
          <nav className="theme-lab-nav-links" aria-label="Theme Lab Kategorien">
            <Link to="/theme-lab">Übersicht</Link>
          </nav>
        ) : null}
        {children}
      </div>
    </div>
  )
}
