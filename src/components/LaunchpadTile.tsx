import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { Icon } from '@ui5/webcomponents-react/Icon'
import type { CSSProperties } from 'react'
import './LaunchpadTile.css'

export type LaunchpadTileProps = {
  title: string
  subtitle?: string
  icon?: string
  value?: string
  valueColor?: 'Critical' | 'Neutral' | 'Positive' | 'Negative'
  footer?: string
  tcode?: string
  onClick?: () => void
}

const valueColorStyle: Record<NonNullable<LaunchpadTileProps['valueColor']>, CSSProperties> = {
  Critical: { color: 'var(--sapCriticalTextColor)' },
  Neutral: { color: 'var(--sapNeutralTextColor)' },
  Positive: { color: 'var(--sapPositiveTextColor)' },
  Negative: { color: 'var(--sapNegativeTextColor)' },
}

export function LaunchpadTile({
  title,
  subtitle,
  icon,
  value,
  valueColor = 'Neutral',
  footer,
  tcode,
  onClick,
}: LaunchpadTileProps) {
  const isNumeric = value !== undefined
  const accessibleName = [title, tcode].filter(Boolean).join(' ')

  return (
    <button type="button" className="launchpad-tile" onClick={onClick} aria-label={accessibleName}>
      <Card
        className="launchpad-tile__card"
        accessibleName={accessibleName}
        header={
          <CardHeader
            titleText={title}
            subtitleText={subtitle}
            interactive={false}
          />
        }
      >
        <div className="launchpad-tile__body">
          <div className="launchpad-tile__main">
            {isNumeric ? (
              <div className="launchpad-tile__numeric">
                {icon ? <Icon name={icon} className="launchpad-tile__numeric-icon" /> : null}
                <span className="launchpad-tile__value" style={valueColorStyle[valueColor]}>
                  {value}
                </span>
              </div>
            ) : icon ? (
              <Icon name={icon} className="launchpad-tile__icon" />
            ) : null}
          </div>

          {footer ? <div className="launchpad-tile__footer">{footer}</div> : null}
          {tcode ? <div className="launchpad-tile__tcode">{tcode}</div> : null}
        </div>
      </Card>
    </button>
  )
}
