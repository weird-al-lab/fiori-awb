import { Tag } from '@ui5/webcomponents-react/Tag'
import type { WeiterbildungUnterstatus } from '../data/weiterbildungen'

type UnterstatusTagConfig = {
  design: 'Neutral' | 'Positive' | 'Critical'
  hideStateIcon: boolean
}

const UNTERSTATUS_TAG_CONFIG: Record<WeiterbildungUnterstatus, UnterstatusTagConfig> = {
  Entwurf: { design: 'Neutral', hideStateIcon: true },
  'In Überarbeitung': { design: 'Neutral', hideStateIcon: true },
  Eingereicht: { design: 'Neutral', hideStateIcon: true },
  'Wieder eingereicht': { design: 'Neutral', hideStateIcon: true },
  'In Prüfung VG': { design: 'Neutral', hideStateIcon: true },
  'Zur Überarbeitung': { design: 'Critical', hideStateIcon: false },
  'Antrag genehmigt': { design: 'Positive', hideStateIcon: false },
  'Angebot erstellen': { design: 'Neutral', hideStateIcon: true },
  'Angebot zur Prüfung': { design: 'Neutral', hideStateIcon: true },
  'Angebot angenommen': { design: 'Positive', hideStateIcon: false },
  'Ausbildung gestartet': { design: 'Neutral', hideStateIcon: true },
  'Prüfung nicht bestanden': { design: 'Critical', hideStateIcon: false },
  'Ausbildung abgebrochen': { design: 'Critical', hideStateIcon: false },
  'Antrag abgelehnt': { design: 'Critical', hideStateIcon: false },
  'Angebot abgelehnt': { design: 'Critical', hideStateIcon: false },
  'Ausbildung abgeschlossen': { design: 'Positive', hideStateIcon: false },
  'Ausbildung bestanden': { design: 'Positive', hideStateIcon: false },
}

export function UnterstatusTag({ unterstatus }: { unterstatus: WeiterbildungUnterstatus }) {
  const { design, hideStateIcon } = UNTERSTATUS_TAG_CONFIG[unterstatus]

  return (
    <Tag design={design} hideStateIcon={hideStateIcon}>
      {unterstatus}
    </Tag>
  )
}
