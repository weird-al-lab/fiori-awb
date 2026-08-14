import { ColorPalette } from '@ui5/webcomponents-react/ColorPalette'
import { ColorPaletteItem } from '@ui5/webcomponents-react/ColorPaletteItem'
import { ColorPicker } from '@ui5/webcomponents-react/ColorPicker'
import { RatingIndicator } from '@ui5/webcomponents-react/RatingIndicator'
import { Search } from '@ui5/webcomponents-react/Search'
import { SearchItem } from '@ui5/webcomponents-react/SearchItem'
import { Text } from '@ui5/webcomponents-react/Text'
import { Token } from '@ui5/webcomponents-react/Token'
import { Tokenizer } from '@ui5/webcomponents-react/Tokenizer'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

export function MiscGallery() {
  return (
    <>
      <GalleryPanel title="Color / Rating">
        <DemoGrid>
          <DemoBlock label="ColorPicker" wide>
            <ColorPicker color="rgb(80, 79, 75)" />
          </DemoBlock>
          <DemoBlock label="ColorPalette" wide>
            <ColorPalette>
              <ColorPaletteItem value="black" />
              <ColorPaletteItem value="darkblue" />
              <ColorPaletteItem value="#ffcc00" />
              <ColorPaletteItem value="#504F4B" />
              <ColorPaletteItem value="#050400" />
              <ColorPaletteItem value="green" />
            </ColorPalette>
          </DemoBlock>
          <DemoBlock label="RatingIndicator">
            <RatingIndicator value={3.5} max={5} />
          </DemoBlock>
          <DemoBlock label="Rating readonly">
            <RatingIndicator value={4} max={5} readonly />
          </DemoBlock>
          <DemoBlock label="Rating disabled">
            <RatingIndicator value={2} max={5} disabled />
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Tokenizer / Search">
        <DemoGrid>
          <DemoBlock label="Tokenizer" wide>
            <Tokenizer>
              <Token text="HR" />
              <Token text="Finance" />
              <Token text="IT" />
            </Tokenizer>
          </DemoBlock>
          <DemoBlock label="Search" wide>
            <Search placeholder="Search…" style={{ width: '100%' }}>
              <SearchItem text="Weiterbildung" />
              <SearchItem text="Theme Lab" />
              <SearchItem text="Mitarbeitende" />
            </Search>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Not demoed (special runtime)">
        <Text>
          Skipped for this temporary gallery because they need device APIs or
          heavy app shells: BarcodeScannerDialog (camera), full UserMenu /
          UserSettingsDialog flows, FlexibleColumnLayout / DynamicPage /
          NavigationLayout full-app shells, AnalyticalTable (large data grid),
          MediaGallery (asset-heavy). Add later if cascade checks require them.
        </Text>
      </GalleryPanel>
    </>
  )
}
