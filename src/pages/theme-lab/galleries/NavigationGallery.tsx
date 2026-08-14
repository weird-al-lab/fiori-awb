import { Breadcrumbs } from '@ui5/webcomponents-react/Breadcrumbs'
import { BreadcrumbsItem } from '@ui5/webcomponents-react/BreadcrumbsItem'
import { ProductSwitch } from '@ui5/webcomponents-react/ProductSwitch'
import { ProductSwitchItem } from '@ui5/webcomponents-react/ProductSwitchItem'
import { SideNavigation } from '@ui5/webcomponents-react/SideNavigation'
import { SideNavigationItem } from '@ui5/webcomponents-react/SideNavigationItem'
import { SideNavigationSubItem } from '@ui5/webcomponents-react/SideNavigationSubItem'
import { Tab } from '@ui5/webcomponents-react/Tab'
import { TabContainer } from '@ui5/webcomponents-react/TabContainer'
import { Toolbar } from '@ui5/webcomponents-react/Toolbar'
import { ToolbarButton } from '@ui5/webcomponents-react/ToolbarButton'
import { ToolbarSeparator } from '@ui5/webcomponents-react/ToolbarSeparator'
import { ToolbarSpacer } from '@ui5/webcomponents-react/ToolbarSpacer'
import { GalleryPanel } from '../GalleryPanel'

export function NavigationGallery() {
  return (
    <>
      <GalleryPanel title="Breadcrumbs">
        <Breadcrumbs>
          <BreadcrumbsItem href="#home">Home</BreadcrumbsItem>
          <BreadcrumbsItem href="#lab">Theme Lab</BreadcrumbsItem>
          <BreadcrumbsItem>Navigation</BreadcrumbsItem>
        </Breadcrumbs>
      </GalleryPanel>

      <GalleryPanel title="TabContainer">
        <TabContainer>
          <Tab text="Overview" selected>
            <div style={{ padding: '0.75rem 0' }}>Overview content</div>
          </Tab>
          <Tab text="Details">
            <div style={{ padding: '0.75rem 0' }}>Details content</div>
          </Tab>
          <Tab text="Disabled" disabled />
        </TabContainer>
      </GalleryPanel>

      <GalleryPanel title="SideNavigation">
        <div style={{ maxWidth: '16rem', border: '1px solid var(--sapGroup_ContentBorderColor)' }}>
          <SideNavigation>
            <SideNavigationItem text="Home" icon="home" selected />
            <SideNavigationItem text="People" icon="group" expanded>
              <SideNavigationSubItem text="Employees" />
              <SideNavigationSubItem text="Managers" />
            </SideNavigationItem>
            <SideNavigationItem text="Settings" icon="action-settings" />
          </SideNavigation>
        </div>
      </GalleryPanel>

      <GalleryPanel title="Toolbar">
        <Toolbar>
          <ToolbarButton text="Create" icon="add" design="Emphasized" />
          <ToolbarButton text="Edit" icon="edit" />
          <ToolbarSeparator />
          <ToolbarButton text="Delete" icon="delete" design="Negative" />
          <ToolbarSpacer />
          <ToolbarButton text="Filter" icon="filter" design="Transparent" />
        </Toolbar>
      </GalleryPanel>

      <GalleryPanel title="ProductSwitch">
        <ProductSwitch>
          <ProductSwitchItem
            titleText="Home"
            subtitleText="Launchpad"
            icon="home"
          />
          <ProductSwitchItem
            titleText="Theme Lab"
            subtitleText="Prototype"
            icon="palette"
          />
          <ProductSwitchItem
            titleText="Weiterbildung"
            subtitleText="HR"
            icon="education"
          />
        </ProductSwitch>
      </GalleryPanel>
    </>
  )
}
