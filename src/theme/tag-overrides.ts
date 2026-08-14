/**
 * SAP gap: Tag semantic designs (Positive/Negative/Critical/Information) bind to
 * sapButton_Success|Negative|Critical|Information_* — solid fills meant for buttons.
 * Match MessageStrip: light semantic background + strong accent border + body text;
 * state icons use the same ElementColor accents as MessageStrip icons.
 * Radius: Tag.css hardcodes sapButton_BorderCornerRadius (AWB pills); Horizon tags
 * use 0.5rem. Scoped to awb_custom.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Tag.js'
import { CUSTOM_THEME_HOST } from './custom-theme-scope'

/** Horizon Morning default for --sapButton_BorderCornerRadius */
const HORIZON_TAG_RADIUS = '0.5rem'

addCustomCSS(
  'ui5-tag',
  `
  ${CUSTOM_THEME_HOST} .ui5-tag-root {
    border-radius: ${HORIZON_TAG_RADIUS};
  }

  ${CUSTOM_THEME_HOST}:host([design="Positive"]) .ui5-tag-root {
    background-color: var(--sapSuccessBackground);
    border-color: var(--sapMessage_SuccessBorderColor);
    color: var(--sapTextColor);
    text-shadow: none;
  }

  ${CUSTOM_THEME_HOST}:host([design="Positive"]) .ui5-tag-semantic-icon,
  ${CUSTOM_THEME_HOST}:host([design="Positive"]) .ui5-tag-root [ui5-icon],
  ${CUSTOM_THEME_HOST}:host([design="Positive"]) .ui5-tag-root ::slotted([ui5-icon]) {
    color: var(--sapPositiveElementColor);
  }

  ${CUSTOM_THEME_HOST}:host([design="Negative"]) .ui5-tag-root {
    background-color: var(--sapErrorBackground);
    border-color: var(--sapMessage_ErrorBorderColor);
    color: var(--sapTextColor);
    text-shadow: none;
  }

  ${CUSTOM_THEME_HOST}:host([design="Negative"]) .ui5-tag-semantic-icon,
  ${CUSTOM_THEME_HOST}:host([design="Negative"]) .ui5-tag-root [ui5-icon],
  ${CUSTOM_THEME_HOST}:host([design="Negative"]) .ui5-tag-root ::slotted([ui5-icon]) {
    color: var(--sapNegativeElementColor);
  }

  ${CUSTOM_THEME_HOST}:host([design="Critical"]) .ui5-tag-root {
    background-color: var(--sapWarningBackground);
    border-color: var(--sapMessage_WarningBorderColor);
    color: var(--sapTextColor);
    text-shadow: none;
  }

  ${CUSTOM_THEME_HOST}:host([design="Critical"]) .ui5-tag-semantic-icon,
  ${CUSTOM_THEME_HOST}:host([design="Critical"]) .ui5-tag-root [ui5-icon],
  ${CUSTOM_THEME_HOST}:host([design="Critical"]) .ui5-tag-root ::slotted([ui5-icon]) {
    color: var(--sapCriticalElementColor);
  }

  ${CUSTOM_THEME_HOST}:host([design="Information"]) .ui5-tag-root {
    background-color: var(--sapInformationBackground);
    border-color: var(--sapMessage_InformationBorderColor);
    color: var(--sapTextColor);
    text-shadow: none;
  }

  ${CUSTOM_THEME_HOST}:host([design="Information"]) .ui5-tag-semantic-icon,
  ${CUSTOM_THEME_HOST}:host([design="Information"]) .ui5-tag-root [ui5-icon],
  ${CUSTOM_THEME_HOST}:host([design="Information"]) .ui5-tag-root ::slotted([ui5-icon]) {
    color: var(--sapInformativeElementColor);
  }
`,
)
