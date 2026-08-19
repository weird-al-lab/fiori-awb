import { useRef, useState } from 'react'
import { Avatar } from '@ui5/webcomponents-react/Avatar'
import { Button } from '@ui5/webcomponents-react/Button'
import { Menu } from '@ui5/webcomponents-react/Menu'
import { MenuItem } from '@ui5/webcomponents-react/MenuItem'
import { ShellBar } from '@ui5/webcomponents-react/ShellBar'
import { ShellBarBranding } from '@ui5/webcomponents-react/ShellBarBranding'
import { ShellBarItem } from '@ui5/webcomponents-react/ShellBarItem'
import { ShellBarSearch } from '@ui5/webcomponents-react/ShellBarSearch'
import { Text } from '@ui5/webcomponents-react/Text'
import { PostLogo } from '../../../components/PostLogo'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

export function ShellGallery() {
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <GalleryPanel title="ShellBar (embedded)">
        <p className="theme-lab-note" style={{ marginTop: 0 }}>
          Uses the same ShellBar tokens as the app chrome. Profile avatar hover
          may need addCustomCSS (see shellbar-search-overrides.ts) — not pure
          token cascade.
        </p>
        <div className="theme-lab-embed-shell">
          <ShellBar
            showSearchField
            searchField={<ShellBarSearch placeholder="Suchen" />}
            branding={
              <ShellBarBranding
                slot="branding"
                logo={<PostLogo height={32} />}
              >
                Theme Lab
              </ShellBarBranding>
            }
            profile={
              <Avatar
                slot="profile"
                colorScheme="Accent10"
                initials="TL"
                ref={(node) => {
                  avatarRef.current = node
                }}
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
              Entwicklung
            </Button>
            <ShellBarItem icon="iphone" text="Benachrichtigungen" />
            <ShellBarItem icon="palette" text="Theme" />
            <ShellBarItem icon="sys-help" text="Hilfe" />
          </ShellBar>
        </div>
        <Menu
          headerText="Profile menu"
          open={menuOpen}
          opener={avatarRef.current}
          onClose={() => setMenuOpen(false)}
        >
          <MenuItem text="Option A" icon="employee" />
          <MenuItem text="Option B" icon="action-settings" />
        </Menu>
      </GalleryPanel>

      <GalleryPanel title="Avatar (Accent10)">
        <DemoGrid>
          <DemoBlock label="Default">
            <Avatar colorScheme="Accent10" initials="MM" />
          </DemoBlock>
          <DemoBlock label="Interactive (hover token)">
            <Avatar
              colorScheme="Accent10"
              initials="MM"
              mode="Interactive"
            />
          </DemoBlock>
          <DemoBlock label="Disabled">
            <Avatar colorScheme="Accent10" initials="MM" disabled />
          </DemoBlock>
        </DemoGrid>
        <Text className="theme-lab-note">
          Interactive avatar uses @sapAvatar_10_Hover_Background on hover.
        </Text>
      </GalleryPanel>
    </>
  )
}
