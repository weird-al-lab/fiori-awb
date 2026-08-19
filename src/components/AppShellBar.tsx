import { useRef, useState } from 'react'
import { Avatar } from '@ui5/webcomponents-react/Avatar'
import { Button } from '@ui5/webcomponents-react/Button'
import { Menu } from '@ui5/webcomponents-react/Menu'
import { MenuItem } from '@ui5/webcomponents-react/MenuItem'
import { ShellBar } from '@ui5/webcomponents-react/ShellBar'
import { ShellBarBranding } from '@ui5/webcomponents-react/ShellBarBranding'
import { ShellBarItem } from '@ui5/webcomponents-react/ShellBarItem'
import { ShellBarSearch } from '@ui5/webcomponents-react/ShellBarSearch'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import { usePrototypeTheme } from '../context/PrototypeThemeContext'
import { PROTOTYPE_PERSONAS, roleLabel } from '../data/personas'
import { PostLogo } from './PostLogo'

export type AppShellBarProps = {
  appTitle: string
  onBack?: () => void
  /** Called after a persona is selected (e.g. list page redirect for MA) */
  onPersonaChange?: (personaId: string) => void
}

export function AppShellBar({
  appTitle,
  onBack,
  onPersonaChange,
}: AppShellBarProps) {
  const { persona, setPersonaId } = usePrototypePersona()
  const { isCustomTheme, toggleTheme } = usePrototypeTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <ShellBar
        className="app-shell-bar"
        showSearchField
        searchField={<ShellBarSearch placeholder="Suchen" />}
        startButton={
          <Button
            slot="startButton"
            icon="nav-back"
            design="Transparent"
            accessibleName="Zurück"
            onClick={onBack}
          />
        }
        branding={
          <ShellBarBranding
            slot="branding"
            logo={<PostLogo height={32} />}
          />
        }
        profile={
          <Avatar
            slot="profile"
            colorScheme='Accent10'
            initials={persona.initials}
            ref={(node) => {
              avatarRef.current = node
            }}
            accessibleName={`Profil: ${persona.name}`}
          />
        }
        onProfileClick={(event) => {
          avatarRef.current =
            (event.detail.targetRef as HTMLElement | undefined) ??
            avatarRef.current
          setMenuOpen(true)
        }}
      >
        <Button slot="content" design="Transparent" endIcon="slim-arrow-down">
          {appTitle}
        </Button>
        <ShellBarItem icon="iphone" text="Benachrichtigungen" />
        <ShellBarItem
          icon={isCustomTheme ? 'palette' : 'color-fill'}
          text={isCustomTheme ? 'Standard-Theme' : 'Custom-Theme'}
          onClick={toggleTheme}
        />
        <ShellBarItem icon="sys-help" text="Hilfe" />
      </ShellBar>

      <Menu
        headerText="Prototype-Rolle"
        open={menuOpen}
        opener={avatarRef.current}
        onClose={() => setMenuOpen(false)}
        onItemClick={(event) => {
          const id = event.detail.item.dataset.personaId
          if (id) {
            setPersonaId(id)
            onPersonaChange?.(id)
          }
          setMenuOpen(false)
        }}
      >
        {PROTOTYPE_PERSONAS.map((item) => (
          <MenuItem
            key={item.id}
            text={`${item.name} (${roleLabel(item.role)})`}
            data-persona-id={item.id}
            icon={item.id === persona.id ? 'accept' : undefined}
          />
        ))}
      </Menu>
    </>
  )
}
