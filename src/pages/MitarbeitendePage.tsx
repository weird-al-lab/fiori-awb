import { Avatar } from '@ui5/webcomponents-react/Avatar'
import { Button } from '@ui5/webcomponents-react/Button'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { ShellBar } from '@ui5/webcomponents-react/ShellBar'
import { ShellBarBranding } from '@ui5/webcomponents-react/ShellBarBranding'
import { ShellBarItem } from '@ui5/webcomponents-react/ShellBarItem'
import { ShellBarSearch } from '@ui5/webcomponents-react/ShellBarSearch'
import { Tab } from '@ui5/webcomponents-react/Tab'
import { TabContainer } from '@ui5/webcomponents-react/TabContainer'
import { TabSeparator } from '@ui5/webcomponents-react/TabSeparator'
import { Title } from '@ui5/webcomponents-react/Title'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxWrap } from '@ui5/webcomponents-react/enums/FlexBoxWrap'
import { LaunchpadTile } from '../components/LaunchpadTile'
import './MitarbeitendePage.css'

const ROLE_TABS = [
  'Allgemein',
  'CO Projektleiter / Controller',
  'Mitarbeitende/r',
  'PN Leistungserfassung',
  'PN MAZU',
] as const

const SELECTED_TAB = 'Mitarbeitende/r'

type TileSection = {
  title: string
  tiles: Array<{
    title: string
    subtitle?: string
    icon?: string
    value?: string
    valueColor?: 'Critical' | 'Neutral'
    footer?: string
    tcode?: string
  }>
}

const SECTIONS: TileSection[] = [
  {
    title: 'Allgemein',
    tiles: [
      {
        title: 'Meine HR-Tickets',
        icon: 'doc-attachment',
        value: '1',
        valueColor: 'Critical',
        footer: 'Offene/s Ticket/s',
      },
    ],
  },
  {
    title: 'Spesen & Finanzen',
    tiles: [
      { title: 'Lohnabrechnung einsehen', icon: 'sales-document', tcode: 'ERP35020' },
      { title: 'Lohnkonto ändern', icon: 'pdf-attachment', tcode: 'ERP35020' },
      {
        title: 'Ausbezahlte Spesen',
        subtitle: 'Übersicht',
        icon: 'pdf-attachment',
        tcode: 'ERP35020',
      },
      {
        title: 'Meine Spesenabrechnung',
        icon: 'travel-expense',
        value: '0',
        valueColor: 'Neutral',
        footer: 'Offene Abrechnungen',
      },
    ],
  },
  {
    title: 'Arbeitszeit',
    tiles: [
      {
        title: 'Zeitwirtschaft',
        subtitle: 'Zoom',
        icon: 'sales-document',
        tcode: 'ERP35020',
      },
    ],
  },
  {
    title: 'Gesundheit',
    tiles: [
      { title: 'Arztzeugnis hochladen', icon: 'sales-document', tcode: 'ERP35020' },
      { title: 'Nichtberufsunfall melden', icon: 'pdf-attachment', tcode: 'ERP35020' },
      { title: 'Arbeitsaufnahme melden', icon: 'pdf-attachment', tcode: 'ERP35020' },
    ],
  },
]

function TileSectionView({ section }: { section: TileSection }) {
  return (
    <section className="tile-section">
      <Title level="H4" size="H4" className="tile-section__title">
        {section.title}
      </Title>
      <FlexBox wrap={FlexBoxWrap.Wrap} className="tile-section__grid">
        {section.tiles.map((tile) => (
          <LaunchpadTile key={tile.title} {...tile} />
        ))}
      </FlexBox>
    </section>
  )
}

export function MitarbeitendePage() {
  return (
    <div className="mitarbeitende-page">
      <ShellBar
        showNotifications
        showSearchField
        searchField={<ShellBarSearch placeholder="Search" />}
        startButton={
          <Button slot="startButton" icon="nav-back" design="Transparent" accessibleName="Back" />
        }
        branding={
          <ShellBarBranding
            slot="branding"
            logo={
              <img
                src="https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg"
                alt="SAP"
                height={30}
              />
            }
          />
        }
        profile={<Avatar slot="profile" initials="JD" />}
      >
        <Button slot="content" design="Transparent" endIcon="slim-arrow-down">
          Home
        </Button>
        <ShellBarItem icon="sys-help" text="Help" />
      </ShellBar>

      <header className="mitarbeitende-page__nav">
        <div className="mitarbeitende-page__nav-inner">
          <TabContainer
            collapsed
            className="mitarbeitende-page__tabs"
            headerBackgroundDesign="Solid"
            contentBackgroundDesign="Transparent"
          >
            <Tab text="Meine Startseite" className="mitarbeitende-page__home-tab" />
            <TabSeparator />
            <Tab icon="edit" text="Edit" />
            {ROLE_TABS.map((label) => (
              <Tab key={label} text={label} selected={label === SELECTED_TAB} />
            ))}
          </TabContainer>
        </div>
      </header>

      <main className="mitarbeitende-page__content">
        <div className="mitarbeitende-page__content-inner">
          <Title level="H3" size="H3" className="mitarbeitende-page__page-title">
            Mitarbeitende/r
          </Title>

          <FlexBox direction={FlexBoxDirection.Column} className="mitarbeitende-page__sections">
            {SECTIONS.map((section) => (
              <TileSectionView key={section.title} section={section} />
            ))}
          </FlexBox>
        </div>
      </main>
    </div>
  )
}
