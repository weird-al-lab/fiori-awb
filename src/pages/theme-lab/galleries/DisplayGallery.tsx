import { Link as RouterLink } from 'react-router-dom'
import { Avatar } from '@ui5/webcomponents-react/Avatar'
import { AvatarGroup } from '@ui5/webcomponents-react/AvatarGroup'
import { ExpandableText } from '@ui5/webcomponents-react/ExpandableText'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { Link } from '@ui5/webcomponents-react/Link'
import { NotificationListItem } from '@ui5/webcomponents-react/NotificationListItem'
import { Text } from '@ui5/webcomponents-react/Text'
import { Timeline } from '@ui5/webcomponents-react/Timeline'
import { TimelineItem } from '@ui5/webcomponents-react/TimelineItem'
import { Title } from '@ui5/webcomponents-react/Title'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

export function DisplayGallery() {
  return (
    <>
      <GalleryPanel title="Typography / Link / Icon">
        <p className="theme-lab-note" style={{ marginTop: 0 }}>
          Full token map and specimens live under{' '}
          <RouterLink to="/theme-lab/typography">Theme Lab → Typography</RouterLink>.
        </p>
        <DemoGrid>
          <DemoBlock label="Titles" wide>
            <Title size="H2">Heading H2</Title>
            <Title size="H4">Heading H4</Title>
            <Title size="H5">Heading H5</Title>
          </DemoBlock>
          <DemoBlock label="Text" wide>
            <Text>Body text using sapTextColor / font tokens.</Text>
            <ExpandableText maxCharacters={40}>
              Longer expandable text that collapses after a few characters so you
              can verify link and text styling together.
            </ExpandableText>
          </DemoBlock>
          <DemoBlock label="Link">
            <Link href="#theme-lab">Inline link</Link>
          </DemoBlock>
          <DemoBlock label="Link disabled">
            <Link href="#theme-lab" disabled>
              Disabled link
            </Link>
          </DemoBlock>
          <DemoBlock label="Icons">
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '1.5rem' }}>
              <Icon name="employee" />
              <Icon name="edit" />
              <Icon name="delete" />
              <Icon name="accept" />
            </div>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Avatar / AvatarGroup">
        <DemoGrid>
          <DemoBlock label="Sizes">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Avatar initials="XS" size="XS" colorScheme="Accent6" />
              <Avatar initials="S" size="S" colorScheme="Accent8" />
              <Avatar initials="M" size="M" colorScheme="Accent10" />
            </div>
          </DemoBlock>
          <DemoBlock label="AvatarGroup">
            <AvatarGroup>
              <Avatar initials="A" colorScheme="Accent1" />
              <Avatar initials="B" colorScheme="Accent2" />
              <Avatar initials="C" colorScheme="Accent3" />
              <Avatar initials="D" colorScheme="Accent4" />
            </AvatarGroup>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Timeline">
        <Timeline>
          <TimelineItem
            titleText="Submitted"
            subtitleText="Yesterday"
            icon="accept"
            name="Markus"
          >
            Antrag eingereicht
          </TimelineItem>
          <TimelineItem
            titleText="In review"
            subtitleText="Today"
            icon="pending"
            name="HR"
          >
            Waiting for approval
          </TimelineItem>
        </Timeline>
      </GalleryPanel>

      <GalleryPanel title="NotificationListItem">
        <NotificationListItem
          titleText="New training request"
          importance="Important"
          showClose
          footnotes={<span>2 hours ago</span>}
        >
          Please review the Weiterbildung application for Alice.
        </NotificationListItem>
        <NotificationListItem
          titleText="Reminder"
          footnotes={<span>Yesterday</span>}
          read
        >
          Complete your profile settings.
        </NotificationListItem>
      </GalleryPanel>
    </>
  )
}
