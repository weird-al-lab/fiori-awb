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

const HOME_TAB = 'Meine Startseite'

const ROLE_TABS = [
  'Allgemein',
  'CO Projektleiter / Controller',
  'Mitarbeitende/r',
  'PN Leistungserfassung',
  'PN MAZU',
] as const

const ACTIVE_ROLE_TAB = 'Mitarbeitende/r'

type LaunchpadTileData = {
  title: string
  subtitle?: string
  icon?: string
  value?: string
  valueColor?: 'Critical' | 'Neutral'
  footer?: string
  tcode?: string
}

type TileSection = {
  title: string
  tiles: LaunchpadTileData[]
}

const TILE_SECTIONS: TileSection[] = [
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
  {
    title: 'Beurteilen & Entwickeln',
    tiles: [
      { title: 'DIALOG', icon: 'sales-document', tcode: 'SFSF' },
      { title: 'Entwicklungsziele', icon: 'pdf-attachment', tcode: 'SFSF' },
      { title: 'Leistungsziele', icon: 'pdf-attachment', tcode: 'SFSF' },
      { title: 'Zwischenzeugnis bestellen', icon: 'pdf-attachment', tcode: 'zeugnis.ch' },
      { title: 'Weiterbildung beantragen', icon: 'pdf-attachment', tcode: 'ERP35020' },
      {
        title: 'Lernangebote',
        subtitle: 'Intern/Extern',
        icon: 'pdf-attachment',
        tcode: 'Viva Learning',
      },
    ],
  },
]

function PageShellBar() {
  return (
    <ShellBar
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
      <ShellBarItem icon="iphone" text="Notifications" />
      <ShellBarItem icon="sys-help" text="Help" />
    </ShellBar>
  )
}

function RoleTabBar() {
  return (
    <header className="mitarbeitende-page__nav" aria-label="Rollen und Bereiche">
      <div className="mitarbeitende-page__page-shell">
        <div className="mitarbeitende-page__page-column">
          <div className="mitarbeitende-page__nav-row">
            <Button
              design="Default"
              icon="edit"
              accessibleName="Edit"
              className="mitarbeitende-page__edit-tab-btn"
            />
            <TabContainer
              collapsed
              className="mitarbeitende-page__tabs"
              headerBackgroundDesign="Solid"
              contentBackgroundDesign="Transparent"
            >
              <Tab text={HOME_TAB} className="mitarbeitende-page__home-tab" />
              <TabSeparator />
              {ROLE_TABS.map((label) => (
                <Tab key={label} text={label} selected={label === ACTIVE_ROLE_TAB} />
              ))}
            </TabContainer>
          </div>
        </div>
      </div>
    </header>
  )
}

function TileSectionView({ section }: { section: TileSection }) {
  return (
    <section className="tile-section" aria-labelledby={`section-${section.title}`}>
      <Title id={`section-${section.title}`} level="H2" size="H4" className="tile-section__title">
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
      <PageShellBar />
      <RoleTabBar />

      <main className="mitarbeitende-page__content">
        <div className="mitarbeitende-page__page-shell mitarbeitende-page__page-shell--content">
          <div className="mitarbeitende-page__page-column mitarbeitende-page__content-inner">
            <Title level="H1" size="H3" className="mitarbeitende-page__page-title">
              {ACTIVE_ROLE_TAB}
            </Title>

            <FlexBox direction={FlexBoxDirection.Column} className="mitarbeitende-page__sections">
              {TILE_SECTIONS.map((section) => (
                <TileSectionView key={section.title} section={section} />
              ))}
            </FlexBox>
          </div>
        </div>
      </main>
    </div>
  )
}
