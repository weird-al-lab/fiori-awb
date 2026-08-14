/**
 * SAP gap: Breadcrumbs current page (no href) renders as ui5-label; Link items
 * use design="Emphasized". Label never switches to sapFontBoldFamily for Standard
 * design current location — must be forced in shadow DOM.
 * Scoped to awb_custom — Horizon stays stock weight.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Label.js'
import { scopeToCustomTheme } from './custom-theme-scope'

addCustomCSS(
  'ui5-label',
  scopeToCustomTheme(`
  :host-context(.ui5-breadcrumbs-current-location) {
    font-family: var(--sapFontBoldFamily);
  }
`),
)
