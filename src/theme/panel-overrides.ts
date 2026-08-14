/**
 * SAP gap: Horizon Panel paints no outer border on :host — only a header separator.
 * LESS tokens alone cannot wrap the full panel; use sapGroup_ContentBorderColor (#B4B3AF).
 * Scoped to awb_custom — Horizon stays stock.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Panel.js'
import { scopeToCustomTheme } from './custom-theme-scope'

addCustomCSS(
  'ui5-panel',
  scopeToCustomTheme(`
  :host(:not([hidden])) {
    box-sizing: border-box;
    border: var(--sapGroup_TitleBorderWidth) solid var(--sapGroup_ContentBorderColor);
  }
`),
)
