import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Timeline } from '@ui5/webcomponents-react/Timeline'
import { TimelineItem } from '@ui5/webcomponents-react/TimelineItem'
import '@ui5/webcomponents-fiori/dist/illustrations/SimpleMail.js'
import './AntragSubmittedOutlook.css'

type AntragSubmittedOutlookProps = {
  reviewerName: string
  isResubmit?: boolean
}

export function AntragSubmittedOutlook({
  reviewerName,
  isResubmit = false,
}: AntragSubmittedOutlookProps) {
  return (
    <div className="awb-antrag-submitted">
      <IllustratedMessage
        className="awb-antrag-submitted__message"
        name="SimpleMail"
        design="Spot"
        titleText="Du hast den ersten Schritt gemacht"
        subtitleText={`Danke. ${reviewerName} prüft den Antrag als Nächstes.`}
      />
      <Timeline
        className="awb-antrag-submitted__timeline"
        accessibleName="Nächste Schritte nach der Einreichung"
      >
        <TimelineItem
          titleText={isResubmit ? 'Überarbeitung eingereicht' : 'Antrag eingereicht'}
          subtitleText="Erledigt"
          icon="accept"
          state="Positive"
        />
        <TimelineItem
          titleText="Prüfung durch Vorgesetzte/n"
          subtitleText="Als Nächstes"
          icon="employee"
        >
          {reviewerName} prüft den Antrag fachlich.
        </TimelineItem>
        <TimelineItem
          titleText="Angebot der Post"
          subtitleText="Danach"
          icon="document"
        >
          Du erhältst ein Beteiligungsangebot zur Prüfung.
        </TimelineItem>
        <TimelineItem
          titleText="Deine Entscheidung"
          subtitleText="Danach"
          icon="decision"
        >
          Du nimmst das Angebot an oder lehnst es ab.
        </TimelineItem>
        <TimelineItem
          titleText="Ausbildung"
          subtitleText="Zum Schluss"
          icon="study-leave"
        >
          Nach der Annahme hältst du den Status der Ausbildung aktuell.
        </TimelineItem>
      </Timeline>
    </div>
  )
}
