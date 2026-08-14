/**
 * SAP gap: Token.css uses hard-coded --_ui5_token_border_radius (.375rem), not
 * --sapButton_TokenBorderCornerRadius. Bridge private vars to the semantic token
 * (set to @sapButton_BorderCornerRadius in awb_custom.less). Scoped to awb_custom.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Token.js'
import { scopeToCustomTheme } from './custom-theme-scope'

addCustomCSS(
  'ui5-token',
  scopeToCustomTheme(`
  :host {
    --_ui5_token_border_radius: var(--sapButton_TokenBorderCornerRadius);
    --_ui5_token_focus_outline_border_radius: var(--sapButton_TokenBorderCornerRadius);
  }
`),
)
