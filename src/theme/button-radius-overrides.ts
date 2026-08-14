/**
 * SAP gap: focus rings hardcode --_ui5_button_focused_* radii (.375rem), separate
 * from sapButton_BorderCornerRadius. Deprecated sapButton_Disabled_* are not
 * emitted — Default disabled must force white bg + LabelColor + dashed border.
 * Scoped to awb_custom — Horizon keeps stock focus radii / opacity fade.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'
import '@ui5/webcomponents/dist/SplitButton.js'
import '@ui5/webcomponents/dist/ToggleButton.js'
import { scopeToCustomTheme } from './custom-theme-scope'

const MATCH_BUTTON_RADIUS = scopeToCustomTheme(`
  :host {
    --_ui5_button_focused_border_radius: var(--sapButton_BorderCornerRadius);
    --_ui5_button_focused_inner_border_radius: var(--sapButton_BorderCornerRadius);
  }
`)

/** Default design only — Emphasized / semantic designs keep Horizon opacity fade.
 *  Toggle pressed+disabled must beat :host([pressed]) Selected styles. */
const DEFAULT_DISABLED = scopeToCustomTheme(`
  :host([disabled]:not([design])),
  :host([disabled][design="Default"]),
  :host([disabled][pressed]),
  :host([disabled][design="Default"][pressed]),
  :host([disabled][pressed]:not([active]):not([non-interactive]):not([_is-touch])),
  :host([disabled][design="Default"][pressed]:not([active]):not([non-interactive]):not([_is-touch])) {
    opacity: 1;
    background: var(--sapButton_Background);
    background-color: var(--sapButton_Background);
    border-color: var(--sapContent_LabelColor);
    border-style: var(--awbButton_Disabled_BorderStyle);
    color: var(--sapContent_LabelColor);
  }
`)

/** Dashed border on every disabled button design (Emphasized, semantic, etc.). */
const DISABLED_DASHED_BORDER = scopeToCustomTheme(`
  :host([disabled]) {
    border-style: var(--awbButton_Disabled_BorderStyle);
  }
`)

/** Segmented items inherit --_ui5_button_border_radius (= outer pill) on :host, which
 *  rounds every segment into its own pill at large radii. Zero it; parent slotted
 *  rules apply outer corners on first/last child only.
 *  Item borders overlap the container inset outline — remove them entirely. */
const SEGMENTED_ITEM = scopeToCustomTheme(`
  :host {
    --_ui5_button_border_radius: 0;
    --_ui5_button_focused_border_radius: var(--sapButton_BorderCornerRadius);
    --_ui5_button_focused_inner_border_radius: 0;
    border: none;
    border-width: 0;
    border-color: transparent;
  }
  :host(:hover),
  :host(.ui5_hovered),
  :host([selected]),
  :host([selected]:hover),
  :host([active]),
  :host([active]:hover) {
    border: none;
    border-width: 0;
    border-color: transparent;
  }
`) + DEFAULT_DISABLED

addCustomCSS('ui5-button', MATCH_BUTTON_RADIUS + DEFAULT_DISABLED + DISABLED_DASHED_BORDER)
addCustomCSS('ui5-toggle-button', MATCH_BUTTON_RADIUS + DEFAULT_DISABLED + DISABLED_DASHED_BORDER)
addCustomCSS('ui5-segmented-button-item', SEGMENTED_ITEM)
addCustomCSS(
  'ui5-segmented-button',
  scopeToCustomTheme(`
  .ui5-segmented-button-root {
    overflow: hidden;
    box-shadow: none;
    border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);
  }
  ::slotted([ui5-segmented-button-item]),
  ::slotted([ui5-segmented-button-item]:not(:first-child)),
  ::slotted([ui5-segmented-button-item]:not([disabled]):hover),
  ::slotted([ui5-segmented-button-item][selected]),
  ::slotted([ui5-segmented-button-item][selected]:hover),
  ::slotted([ui5-segmented-button-item][active]),
  ::slotted([ui5-segmented-button-item][active]:hover) {
    border: none;
    border-width: 0;
    border-color: transparent;
  }
  ::slotted([ui5-segmented-button-item][disabled]) {
    opacity: 1;
    background-color: var(--sapButton_Background);
    border: var(--sapButton_BorderWidth) var(--awbButton_Disabled_BorderStyle) var(--sapContent_LabelColor);
    color: var(--sapContent_LabelColor);
  }
`),
)
addCustomCSS(
  'ui5-split-button',
  scopeToCustomTheme(`
  :host {
    --_ui5_button_focused_border_radius: var(--sapButton_BorderCornerRadius);
    --_ui5_button_focused_inner_border_radius: var(--sapButton_BorderCornerRadius);
    --_ui5_split_button_focused_border_radius: var(--sapButton_BorderCornerRadius);
  }
  :host([disabled]) {
    box-shadow: none;
    border: var(--sapButton_BorderWidth) var(--awbButton_Disabled_BorderStyle) var(--sapContent_LabelColor);
  }
`),
)
