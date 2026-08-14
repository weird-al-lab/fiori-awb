import { useState } from 'react'
import { Button } from '@ui5/webcomponents-react/Button'
import { ButtonBadge } from '@ui5/webcomponents-react/ButtonBadge'
import { SegmentedButton } from '@ui5/webcomponents-react/SegmentedButton'
import { SegmentedButtonItem } from '@ui5/webcomponents-react/SegmentedButtonItem'
import { SplitButton } from '@ui5/webcomponents-react/SplitButton'
import { ToggleButton } from '@ui5/webcomponents-react/ToggleButton'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

const DESIGNS = [
  'Default',
  'Emphasized',
  'Positive',
  'Negative',
  'Attention',
  'Transparent',
] as const

export function ButtonsGallery() {
  const [togglePressed, setTogglePressed] = useState(false)
  const [segment, setSegment] = useState('a')

  return (
    <>
      <GalleryPanel title="Button designs">
        <DemoGrid>
          {DESIGNS.map((design) => (
            <DemoBlock key={design} label={design}>
              <Button design={design}>{design}</Button>
            </DemoBlock>
          ))}
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Button states">
        <DemoGrid>
          <DemoBlock label="Default">
            <Button>Action</Button>
          </DemoBlock>
          <DemoBlock label="Disabled">
            <Button disabled>Disabled</Button>
          </DemoBlock>
          <DemoBlock label="Emphasized disabled">
            <Button design="Emphasized" disabled>
              Emphasized
            </Button>
          </DemoBlock>
          <DemoBlock label="With icon">
            <Button icon="add">Add</Button>
          </DemoBlock>
          <DemoBlock label="Icon only">
            <Button icon="edit" design="Transparent" accessibleName="Edit" />
          </DemoBlock>
          <DemoBlock label="With badge">
            <Button icon="bell" design="Transparent" accessibleName="Alerts">
              <ButtonBadge slot="badge" design="OverlayText" text="3" />
            </Button>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Toggle / Split / Segmented">
        <DemoGrid>
          <DemoBlock label="ToggleButton">
            <ToggleButton
              pressed={togglePressed}
              onClick={() => setTogglePressed((v) => !v)}
            >
              {togglePressed ? 'On' : 'Off'}
            </ToggleButton>
          </DemoBlock>
          <DemoBlock label="Toggle disabled">
            <ToggleButton disabled pressed>
              Locked
            </ToggleButton>
          </DemoBlock>
          <DemoBlock label="SplitButton">
            <SplitButton>Open</SplitButton>
          </DemoBlock>
          <DemoBlock label="SegmentedButton" wide>
            <SegmentedButton
              onSelectionChange={(e) => {
                const selected = e.detail.selectedItems[0]?.dataset.key
                if (selected) setSegment(selected)
              }}
            >
              <SegmentedButtonItem data-key="a" selected={segment === 'a'}>
                A
              </SegmentedButtonItem>
              <SegmentedButtonItem data-key="b" selected={segment === 'b'}>
                B
              </SegmentedButtonItem>
              <SegmentedButtonItem data-key="c" selected={segment === 'c'}>
                C
              </SegmentedButtonItem>
            </SegmentedButton>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>
    </>
  )
}
