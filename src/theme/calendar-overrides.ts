/**
 * SAP gap: DayPicker range middles use sapList_Selection* (dark AWB list tokens).
 * Private --_ui5_daypicker_* control pill radius / between fill. Match AWB range:
 * black circular start/end, shell-yellow mid bar with black block borders.
 * Scoped to awb_custom — Horizon stays stock.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/DayPicker.js'
import '@ui5/webcomponents/dist/MonthPicker.js'
import '@ui5/webcomponents/dist/YearPicker.js'
import { scopeToCustomTheme } from './custom-theme-scope'

const ENDPOINT =
  '.ui5-dp-item.ui5-dp-item--selected:not(.ui5-dp-item--selected-between)'
const MID = '.ui5-dp-item.ui5-dp-item--selected-between'

const YELLOW_HALF_START = `
  linear-gradient(var(--sapTextColor), var(--sapTextColor)) right top / 50% var(--sapContent_FocusWidth) no-repeat,
  linear-gradient(var(--sapTextColor), var(--sapTextColor)) right bottom / 50% var(--sapContent_FocusWidth) no-repeat,
  linear-gradient(to right, transparent 50%, var(--sapShellColor) 50%)
`

const YELLOW_HALF_END = `
  linear-gradient(var(--sapTextColor), var(--sapTextColor)) left top / 50% var(--sapContent_FocusWidth) no-repeat,
  linear-gradient(var(--sapTextColor), var(--sapTextColor)) left bottom / 50% var(--sapContent_FocusWidth) no-repeat,
  linear-gradient(to right, var(--sapShellColor) 50%, transparent 50%)
`

const DAY_PICKER = scopeToCustomTheme(`
  :host {
    --_ui5_daypicker_item_margin: 0;
    --_ui5_daypicker_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_item_border_radius_item: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_item_border_radius_focus_after: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_item_now_border_radius_focus_after: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_day_picker_item_selected_now_border_radius_focus: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_item_now_selected_between_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_two_calendar_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_two_calendar_item_border_focus_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_two_calendar_item_no_select_focus_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5-daypicker_item_selected_now_border_radius: var(--awbDayPicker_Item_BorderRadius);
    --_ui5_daypicker_two_calendar_item_selected_now_border_radius_focus: var(--awbDayPicker_Item_BorderRadius);

    /* Middles: shell yellow (not dark list selection) */
    --_ui5_daypicker_item_selected_between_background: var(--sapShellColor);
    --_ui5_daypicker_item_selected_between_hover_background: var(--sapShellColor);
    /* Private var is border-radius despite the name */
    --_ui5_daypicker_item_selected_between_border: 0;
    --_ui5_daypicker_item_select_between_border: none;

    /* Soften selected hover (list hover is dark #504F4B) */
    --_ui5_daypicker_item_selected_hover: transparent;
  }

  :host .ui5-dp-item:hover {
    background: var(--sapHoverColor);
  }

  /* —— Range middles: yellow bar, black text, top/bottom rules —— */
  :host ${MID} {
    background: var(--sapShellColor);
    color: var(--sapTextColor);
    border: none;
    border-block: var(--sapContent_FocusWidth) solid var(--sapTextColor);
    border-radius: 0;
  }

  :host ${MID}:hover {
    background: var(--sapShellColor);
    color: var(--sapTextColor);
  }

  :host ${MID} .ui5-dp-daytext {
    background: transparent;
    color: var(--sapTextColor);
    border: none;
    border-radius: 0;
    font-family: var(--sapFontFamily);
  }

  :host ${MID}:not(.ui5-dp-item--now) .ui5-dp-daytext::after {
    border: none;
    content: none;
  }

  /* —— Endpoints / single date: black circle, white numeral —— */
  :host ${ENDPOINT} {
    background: transparent;
    color: var(--sapContent_ContrastTextColor);
    border-radius: 0;
  }

  :host ${ENDPOINT} .ui5-dp-daytext {
    background: var(--sapHighlightColor);
    color: var(--sapContent_ContrastTextColor);
    border: none;
    border-radius: var(--awbDayPicker_Item_BorderRadius);
    font-family: var(--sapFontFamily);
    position: relative;
    z-index: 1;
  }

  :host ${ENDPOINT}:hover {
    background: transparent;
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${ENDPOINT}:hover .ui5-dp-daytext {
    background: var(--sapButton_Emphasized_Hover_Background);
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${ENDPOINT}:not(.ui5-dp-item--now) .ui5-dp-daytext::after {
    border: none;
  }

  :host ${ENDPOINT}.ui5-dp-item--now .ui5-dp-daytext {
    background: var(--sapHighlightColor);
    border: none;
    outline: none;
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${ENDPOINT}.ui5-dp-item--now:hover .ui5-dp-daytext {
    background: var(--sapButton_Emphasized_Hover_Background);
    color: var(--sapContent_ContrastTextColor);
  }

  /*
   * Continuous yellow under start/end (inner half only), with matching
   * top/bottom rules. Single-day selection has no yellow half.
   */
  :host ${ENDPOINT}:has(+ ${MID}),
  :host ${ENDPOINT}:has(+ ${ENDPOINT}) {
    background: ${YELLOW_HALF_START};
  }

  :host ${ENDPOINT}:has(+ ${MID}):hover,
  :host ${ENDPOINT}:has(+ ${ENDPOINT}):hover {
    background: ${YELLOW_HALF_START};
  }

  :host ${MID} + ${ENDPOINT},
  :host ${ENDPOINT} + ${ENDPOINT} {
    background: ${YELLOW_HALF_END};
  }

  :host ${MID} + ${ENDPOINT}:hover,
  :host ${ENDPOINT} + ${ENDPOINT}:hover {
    background: ${YELLOW_HALF_END};
  }
`)

addCustomCSS('ui5-day-picker', DAY_PICKER)

addCustomCSS(
  'ui5-month-picker',
  scopeToCustomTheme(`
  :host {
    --_ui5_monthpicker_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
  }
`),
)

addCustomCSS(
  'ui5-year-picker',
  scopeToCustomTheme(`
  :host {
    --_ui5_yearpicker_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
  }
`),
)
