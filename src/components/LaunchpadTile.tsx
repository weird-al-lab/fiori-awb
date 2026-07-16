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
  const accessibleName = [title, subtitle, tcode].filter(Boolean).join(' ')

  return (
    <button type="button" className="launchpad-tile" onClick={onClick} aria-label={accessibleName}>
      <div className="launchpad-tile__surface">
        <div
          className={`launchpad-tile__body${tcode ? ' launchpad-tile__body--with-tcode' : ' launchpad-tile__body--full'}`}
        >
          <div className="launchpad-tile__header">
            <span className="launchpad-tile__title">{title}</span>
            {subtitle ? <span className="launchpad-tile__subtitle">{subtitle}</span> : null}
          </div>

          <div className="launchpad-tile__content">
            {isNumeric ? (
              <div className="launchpad-tile__numeric">
                {icon ? <Icon name={icon} className="launchpad-tile__numeric-icon" /> : null}
                <span className="launchpad-tile__value" style={valueColorStyle[valueColor]}>
                  {value}
                </span>
              </div>
            ) : icon ? (
              <Icon
                name={icon}
                className={
                  icon === 'pdf-attachment'
                    ? 'launchpad-tile__icon launchpad-tile__icon--small'
                    : 'launchpad-tile__icon'
                }
              />
            ) : null}
          </div>

          {footer ? <div className="launchpad-tile__footer">{footer}</div> : null}
        </div>

        {tcode ? (
          <div className="launchpad-tile__tcode-wrap">
            <span className="launchpad-tile__tcode">{tcode}</span>
          </div>
        ) : null}
      </div>
    </button>
  )
}
