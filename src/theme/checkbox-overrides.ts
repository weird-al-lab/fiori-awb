/**
 * SAP gap: checkbox active (mousedown) uses sapContent_Selected_Hover_Background
 * while hover uses sapField_Selector_Hover_Background. Even after LESS aligns
 * Selected_Hover, keep this bridge so active matches Default button hover fill.
 * Scoped to awb_custom.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import { scopeToCustomTheme } from './custom-theme-scope'

addCustomCSS(
  'ui5-checkbox',
  scopeToCustomTheme(`
  :host {
    --_ui5_checkbox_active_background: var(--sapField_Selector_Hover_Background);
  }
`),
)
