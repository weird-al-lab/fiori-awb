import { useState } from 'react'
import { Avatar } from '@ui5/webcomponents-react/Avatar'
import { Button } from '@ui5/webcomponents-react/Button'
import { FlexBox } from '@ui5/webcomponents-react/FlexBox'
import { Icon } from '@ui5/webcomponents-react/Icon'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Text } from '@ui5/webcomponents-react/Text'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { FlexBoxAlignItems } from '@ui5/webcomponents-react/enums/FlexBoxAlignItems'
import { FlexBoxDirection } from '@ui5/webcomponents-react/enums/FlexBoxDirection'
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/enums/FlexBoxJustifyContent'
import '@ui5/webcomponents-fiori/dist/illustrations/NoEntries.js'
import {
  formatFeedTimestamp,
  getInitialsFromName,
  type FeedEintrag,
} from '../data/antraege'
import { usePrototypePersona } from '../context/PrototypePersonaContext'
import './KommentarFeed.css'

type KommentarFeedProps = {
  eintraege: FeedEintrag[]
  onPost: (text: string) => void
}

function FeedItem({ eintrag }: { eintrag: FeedEintrag }) {
  const timestamp = formatFeedTimestamp(eintrag.erstelltAm)

  if (eintrag.typ === 'aktivitaet') {
    return (
      <article className="awb-feed__item awb-feed__item--aktivitaet">
        <div className="awb-feed__marker" aria-hidden="true">
          <span className="awb-feed__marker-dot">
            <Icon name={eintrag.icon ?? 'activity-2'} />
          </span>
        </div>
        <div className="awb-feed__content">
          <Text className="awb-feed__activity-title">{eintrag.titel}</Text>
          <Text className="awb-feed__text">{eintrag.text}</Text>
          <Text className="awb-feed__meta">
            {eintrag.autorName} · {timestamp}
          </Text>
        </div>
      </article>
    )
  }

  return (
    <article className="awb-feed__item awb-feed__item--kommentar">
      <div className="awb-feed__marker" aria-hidden="true">
        <Avatar
          className="awb-feed__avatar"
          initials={getInitialsFromName(eintrag.autorName)}
          size="S"
        />
      </div>
      <div className="awb-feed__content">
        <Text className="awb-feed__author">{eintrag.autorName}</Text>
        <Text className="awb-feed__text">{eintrag.text}</Text>
        <Text className="awb-feed__meta">{timestamp}</Text>
      </div>
    </article>
  )
}

export function KommentarFeed({ eintraege, onPost }: KommentarFeedProps) {
  const { persona } = usePrototypePersona()
  const [draft, setDraft] = useState('')

  const handlePost = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      return
    }
    onPost(trimmed)
    setDraft('')
  }

  return (
    <div className="awb-feed">
      <div className="awb-feed__composer">
        <Avatar
          className="awb-feed__composer-avatar"
          initials={persona.initials}
          size="S"
        />
        <div className="awb-feed__composer-body">
          <TextArea
            className="awb-feed__input"
            rows={3}
            value={draft}
            placeholder="Kommentar schreiben …"
            onInput={(event) => setDraft(event.target.value ?? '')}
          />
          <FlexBox
            justifyContent={FlexBoxJustifyContent.End}
            alignItems={FlexBoxAlignItems.Center}
            direction={FlexBoxDirection.Row}
            className="awb-feed__composer-actions"
          >
            <Button design="Default" onClick={handlePost} disabled={!draft.trim()}>
              Kommentieren
            </Button>
          </FlexBox>
        </div>
      </div>

      {eintraege.length ? (
        <div className="awb-feed__list" role="feed" aria-label="Kommentare und Aktivitäten">
          {eintraege.map((eintrag) => (
            <FeedItem key={eintrag.id} eintrag={eintrag} />
          ))}
        </div>
      ) : (
        <IllustratedMessage
          className="awb-feed__empty"
          name="NoEntries"
          design="Spot"
          titleText="Noch keine Einträge"
          subtitleText="Kommentare und Aktivitäten zu diesem Antrag erscheinen hier chronologisch."
        />
      )}
    </div>
  )
}
