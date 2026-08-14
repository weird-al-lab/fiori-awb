/**
 * SAP gap: Horizon disables form controls with opacity fade and solid outlines.
 * Match Default button disabled: opacity 1, white surface, LabelColor (#696864),
 * dashed border via --awbButton_Disabled_BorderStyle.
 * Switch intentionally excluded — keeps Horizon opacity fade.
 * Scoped to awb_custom — Horizon stays stock.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/TextArea.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/ComboBox.js'
import '@ui5/webcomponents/dist/MultiComboBox.js'
import '@ui5/webcomponents/dist/MultiInput.js'
import '@ui5/webcomponents/dist/DatePicker.js'
import '@ui5/webcomponents/dist/DateRangePicker.js'
import '@ui5/webcomponents/dist/DateTimePicker.js'
import '@ui5/webcomponents/dist/TimePicker.js'
import '@ui5/webcomponents/dist/FileUploader.js'
import '@ui5/webcomponents/dist/StepInput.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/RadioButton.js'
import '@ui5/webcomponents/dist/Slider.js'
import '@ui5/webcomponents/dist/RangeSlider.js'
import { scopeToCustomTheme } from './custom-theme-scope'

const DISABLED_BORDER = `
  var(--sapField_BorderWidth) var(--awbButton_Disabled_BorderStyle) var(--sapContent_LabelColor)
`

/** Input-based fields (Input, Select, ComboBox, Multi*, pickers, FileUploader). */
const INPUT_HOST_DISABLED = scopeToCustomTheme(`
  :host([disabled]) {
    opacity: 1;
    background: none;
    background-color: var(--sapField_Background);
    box-shadow: none;
    border: ${DISABLED_BORDER};
    color: var(--sapContent_LabelColor);
    --sapField_TextColor: var(--sapContent_LabelColor);
    --_ui5_input_disabled_opacity: 1;
    --_ui5_input_disabled_border_color: var(--sapContent_LabelColor);
  }
`)

const TEXTAREA_DISABLED = scopeToCustomTheme(`
  :host([disabled]) {
    opacity: 1;
    color: var(--sapContent_LabelColor);
    --sapField_TextColor: var(--sapContent_LabelColor);
  }

  :host([disabled]) .ui5-textarea-wrapper,
  :host([readonly][disabled]) .ui5-textarea-wrapper,
  :host([value-state][disabled]) .ui5-textarea-wrapper {
    background: none;
    background-color: var(--sapField_Background);
    box-shadow: none;
    border: ${DISABLED_BORDER};
  }
`)

const STEP_INPUT_DISABLED = scopeToCustomTheme(`
  :host([disabled]) {
    opacity: 1;
    background-color: var(--sapField_Background);
    box-shadow: none;
    border: ${DISABLED_BORDER};
    color: var(--sapContent_LabelColor);
    --sapField_TextColor: var(--sapContent_LabelColor);
  }

  :host([disabled])::after {
    border-width: 0;
  }

  :host([disabled]) .ui5-step-icon [ui5-icon] {
    color: var(--sapContent_LabelColor);
  }
`)

const CHECKBOX_DISABLED = scopeToCustomTheme(`
  :host([disabled]) {
    --_ui5_checkbox_disabled_opacity: 1;
    --_ui5_checkbox_inner_disabled_border_color: var(--sapContent_LabelColor);
    --_ui5_checkbox_disabled_label_color: var(--sapContent_LabelColor);
    color: var(--sapContent_LabelColor);
  }

  :host([disabled]) .ui5-checkbox-root {
    opacity: 1;
  }

  :host([disabled]) .ui5-checkbox-inner,
  :host([disabled][checked]) .ui5-checkbox-inner,
  :host([disabled][checked][value-state="None"]) .ui5-checkbox-inner {
    background: var(--sapButton_Background);
    background-color: var(--sapButton_Background);
    border: ${DISABLED_BORDER};
    color: var(--sapContent_LabelColor);
  }

  :host([disabled]) .ui5-checkbox-label {
    color: var(--sapContent_LabelColor);
  }
`)

const RADIO_DISABLED = scopeToCustomTheme(`
  :host([disabled]) .ui5-radio-root {
    opacity: 1;
    color: var(--sapContent_LabelColor);
  }

  :host([disabled]) .ui5-radio-label {
    color: var(--sapContent_LabelColor);
  }

  :host([disabled]) .ui5-radio-svg-outer,
  :host([disabled][checked]) .ui5-radio-svg-outer {
    stroke: var(--sapContent_LabelColor);
    fill: var(--sapButton_Background);
    stroke-dasharray: var(--_ui5_radio_button_read_only_border_type);
  }

  :host([disabled][checked]) .ui5-radio-svg-inner {
    fill: var(--sapContent_LabelColor);
  }
`)

/** Opacity is on the host; handle/scale colors inherit via custom properties. */
const SLIDER_DISABLED = scopeToCustomTheme(`
  :host([disabled]) {
    opacity: 1;
    --_ui5_slider_disabled_opacity: 1;
    --_ui5_slider_handle_background: var(--sapButton_Background);
    --_ui5_slider_handle_border: ${DISABLED_BORDER};
    --_ui5_slider_scale_background: var(--sapHoverColor);
    --_ui5_slider_scale_progress_background: var(--sapContent_LabelColor);
  }
`)

const INPUT_TAGS = [
  'ui5-input',
  'ui5-select',
  'ui5-combobox',
  'ui5-multi-combobox',
  'ui5-multi-input',
  'ui5-date-picker',
  'ui5-date-range-picker',
  'ui5-datetime-picker',
  'ui5-time-picker',
  'ui5-file-uploader',
] as const

for (const tag of INPUT_TAGS) {
  addCustomCSS(tag, INPUT_HOST_DISABLED)
}

addCustomCSS('ui5-textarea', TEXTAREA_DISABLED)
addCustomCSS('ui5-step-input', STEP_INPUT_DISABLED)
addCustomCSS('ui5-checkbox', CHECKBOX_DISABLED)
addCustomCSS('ui5-radio-button', RADIO_DISABLED)
addCustomCSS('ui5-slider', SLIDER_DISABLED)
addCustomCSS('ui5-range-slider', SLIDER_DISABLED)
