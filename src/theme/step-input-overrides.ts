/**
 * SAP gap: Horizon hard-codes StepInput focus to #0070f2 via private --_ui5_* vars.
 * Align with Input focus ring (sapContent_Focus* + sapField_Active_BorderColor).
 * Scoped to awb_custom — Horizon keeps stock blue focus.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/StepInput.js'
import { scopeToCustomTheme } from './custom-theme-scope'

addCustomCSS(
  'ui5-step-input',
  scopeToCustomTheme(`
  :host {
    --_ui5_step_input_input_border_focused_after: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapField_Active_BorderColor);
    --_ui5_step_input_input_border_radius_focused_after: var(--sapField_BorderCornerRadius);
  }
`),
)
