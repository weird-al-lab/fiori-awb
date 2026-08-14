import { ObjectPage } from '@ui5/webcomponents-react/ObjectPage'
import { ObjectPageHeader } from '@ui5/webcomponents-react/ObjectPageHeader'
import { ObjectPageSection } from '@ui5/webcomponents-react/ObjectPageSection'
import { ObjectPageTitle } from '@ui5/webcomponents-react/ObjectPageTitle'
import { Text } from '@ui5/webcomponents-react/Text'
import { Wizard } from '@ui5/webcomponents-react/Wizard'
import { WizardStep } from '@ui5/webcomponents-react/WizardStep'
import { ObjectPageMode } from '@ui5/webcomponents-react/enums/ObjectPageMode'
import { GalleryPanel } from '../GalleryPanel'

export function WizardObjectGallery() {
  return (
    <>
      <GalleryPanel title="Wizard">
        <Wizard>
          <WizardStep selected titleText="Basics" subtitleText="Step 1">
            <div style={{ padding: '1rem 0' }}>
              <Text>Step content — check selected step indicator colors.</Text>
            </div>
          </WizardStep>
          <WizardStep titleText="Details" subtitleText="Step 2" disabled>
            <Text>Disabled upcoming step</Text>
          </WizardStep>
          <WizardStep titleText="Review" subtitleText="Step 3" disabled>
            <Text>Later step</Text>
          </WizardStep>
        </Wizard>
      </GalleryPanel>

      <GalleryPanel title="ObjectPage (embedded)">
        <div
          className="theme-lab-embed-shell"
          style={{ height: '28rem', overflow: 'auto' }}
        >
          <ObjectPage
            mode={ObjectPageMode.IconTabBar}
            titleArea={
              <ObjectPageTitle
                header="Sample object"
                subHeader="Theme lab object page"
              />
            }
            headerArea={
              <ObjectPageHeader>
                <Text>Header area for ObjectPage token check.</Text>
              </ObjectPageHeader>
            }
            style={{ height: '100%' }}
          >
            <ObjectPageSection id="sec-a" titleText="Section A">
              <div style={{ padding: '1rem' }}>
                <Text>Section A content.</Text>
              </div>
            </ObjectPageSection>
            <ObjectPageSection id="sec-b" titleText="Section B">
              <div style={{ padding: '1rem' }}>
                <Text>Section B content.</Text>
              </div>
            </ObjectPageSection>
          </ObjectPage>
        </div>
      </GalleryPanel>
    </>
  )
}
