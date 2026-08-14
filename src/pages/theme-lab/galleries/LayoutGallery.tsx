import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { Carousel } from '@ui5/webcomponents-react/Carousel'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Grid } from '@ui5/webcomponents-react/Grid'
import { Panel } from '@ui5/webcomponents-react/Panel'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

export function LayoutGallery() {
  return (
    <>
      <GalleryPanel title="Panel / Card">
        <DemoGrid>
          <DemoBlock label="Panel" wide>
            <Panel headerText="Collapsible panel" collapsed={false}>
              <Text>Panel content uses group / content background tokens.</Text>
            </Panel>
          </DemoBlock>
          <DemoBlock label="Card" wide>
            <Card
              header={
                <CardHeader
                  titleText="Sample card"
                  subtitleText="Subtitle"
                  additionalText="3 of 5"
                />
              }
            >
              <div style={{ padding: '1rem' }}>
                <Text>Card body content for theme verification.</Text>
              </div>
            </Card>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Bar">
        <Bar
          startContent={<Button design="Transparent" icon="nav-back" />}
          children={<Title level="H5">Bar title</Title>}
          endContent={<Button design="Emphasized">Save</Button>}
        />
      </GalleryPanel>

      <GalleryPanel title="FlexBox / Grid">
        <FlexBox
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.SpaceBetween}
          style={{ gap: '1rem', marginBottom: '1rem' }}
        >
          <div style={{ padding: '0.75rem', background: 'var(--sapGroup_ContentBackground)', flex: 1 }}>
            Flex A
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--sapList_AlternatingBackground)', flex: 1 }}>
            Flex B
          </div>
        </FlexBox>
        <Grid defaultSpan="XL4 L4 M6 S12">
          <div style={{ padding: '0.75rem', background: 'var(--sapGroup_ContentBackground)' }}>
            Grid 1
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--sapList_AlternatingBackground)' }}>
            Grid 2
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--sapGroup_ContentBackground)' }}>
            Grid 3
          </div>
        </Grid>
      </GalleryPanel>

      <GalleryPanel title="Carousel">
        <Carousel style={{ height: '8rem' }}>
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--sapGroup_ContentBackground)' }}>
            Slide 1
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--sapList_AlternatingBackground)' }}>
            Slide 2
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--sapInformativeColor)' }}>
            Slide 3
          </div>
        </Carousel>
      </GalleryPanel>
    </>
  )
}
