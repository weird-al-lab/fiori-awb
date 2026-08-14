import { useRef, useState } from 'react'
import { BusyIndicator } from '@ui5/webcomponents-react/BusyIndicator'
import { Button } from '@ui5/webcomponents-react/Button'
import { Dialog } from '@ui5/webcomponents-react/Dialog'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Popover } from '@ui5/webcomponents-react/Popover'
import { ProgressIndicator } from '@ui5/webcomponents-react/ProgressIndicator'
import { Tag } from '@ui5/webcomponents-react/Tag'
import { Text } from '@ui5/webcomponents-react/Text'
import { Toast } from '@ui5/webcomponents-react/Toast'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

export function FeedbackGallery() {
  const [toastOpen, setToastOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverOpener = useRef<HTMLElement | null>(null)

  return (
    <>
      <GalleryPanel title="MessageStrip">
        <DemoGrid>
          <DemoBlock label="Information" wide>
            <MessageStrip design="Information">Information message</MessageStrip>
          </DemoBlock>
          <DemoBlock label="Positive" wide>
            <MessageStrip design="Positive">Success message</MessageStrip>
          </DemoBlock>
          <DemoBlock label="Critical" wide>
            <MessageStrip design="Critical">Warning message</MessageStrip>
          </DemoBlock>
          <DemoBlock label="Negative" wide>
            <MessageStrip design="Negative">Error message</MessageStrip>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Progress / Busy / Tag">
        <DemoGrid>
          <DemoBlock label="Progress 35%" wide>
            <ProgressIndicator value={35} valueState="None" displayValue="35%" />
          </DemoBlock>
          <DemoBlock label="Progress error" wide>
            <ProgressIndicator value={70} valueState="Negative" />
          </DemoBlock>
          <DemoBlock label="BusyIndicator">
            <BusyIndicator active size="M" />
          </DemoBlock>
          <DemoBlock label="Tags">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag design="Set1" colorScheme="1">
                Neutral
              </Tag>
              <Tag design="Set1" colorScheme="2">
                Accent
              </Tag>
              <Tag design="Negative">Error</Tag>
              <Tag design="Positive">OK</Tag>
              <Tag design="Critical">Warn</Tag>
              <Tag design="Information">Info</Tag>
            </div>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Toast / Dialog / Popover">
        <DemoGrid>
          <DemoBlock label="Toast">
            <Button
              onClick={() => {
                setToastOpen(true)
              }}
            >
              Show toast
            </Button>
            <Toast
              open={toastOpen}
              onClose={() => setToastOpen(false)}
              duration={2500}
            >
              Saved successfully
            </Toast>
          </DemoBlock>
          <DemoBlock label="Dialog">
            <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
            <Dialog
              open={dialogOpen}
              headerText="Confirm"
              onClose={() => setDialogOpen(false)}
              footer={
                <>
                  <Button design="Emphasized" onClick={() => setDialogOpen(false)}>
                    OK
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                </>
              }
            >
              <Text>Dialog body for theme check.</Text>
            </Dialog>
          </DemoBlock>
          <DemoBlock label="Popover">
            <Button
              ref={(node) => {
                popoverOpener.current = node
              }}
              onClick={() => setPopoverOpen(true)}
            >
              Open popover
            </Button>
            <Popover
              open={popoverOpen}
              opener={popoverOpener.current ?? undefined}
              onClose={() => setPopoverOpen(false)}
              headerText="Popover"
            >
              <Text>Popover content</Text>
            </Popover>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="IllustratedMessage">
        <IllustratedMessage
          name="NoData"
          titleText="No data"
          subtitleText="Nothing to show in this demo state."
        />
      </GalleryPanel>
    </>
  )
}
