/**
 * SAP gap: DayPicker range middles use sapList_Selection* (dark AWB list tokens).
 * Private --_ui5_daypicker_* control pill radius / between fill. Match AWB range:
 * black circular start/end, shell-yellow mid bar with black block borders.
 *
 * Applied via addCustomCSS when awb_custom is active. :host-context scoping is
 * unreliable in shadow DOM, so CSS is toggled on theme change instead.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import { attachBoot } from '@ui5/webcomponents-base/dist/Boot.js'
import { getTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import '@ui5/webcomponents/dist/DayPicker.js'
import '@ui5/webcomponents/dist/MonthPicker.js'
import '@ui5/webcomponents/dist/YearPicker.js'
import { AWB_CUSTOM_THEME_ID } from './custom-theme-scope'

const ENDPOINT =
  '.ui5-dp-item.ui5-dp-item--selected:not(.ui5-dp-item--selected-between)'
const MID = '.ui5-dp-item.ui5-dp-item--selected-between'
const SINGLE = ENDPOINT

const DAY_CELL_SIZE = 'var(--_ui5_day_picker_item_width)'

const CIRCLE_DAYTEXT = `
  width: ${DAY_CELL_SIZE};
  height: ${DAY_CELL_SIZE};
  min-width: ${DAY_CELL_SIZE};
  min-height: ${DAY_CELL_SIZE};
  max-width: ${DAY_CELL_SIZE};
  max-height: ${DAY_CELL_SIZE};
  aspect-ratio: 1;
  flex: 0 0 ${DAY_CELL_SIZE};
  align-self: center;
  border-radius: 50%;
  box-sizing: border-box;
`

const CENTERED_CIRCLE = `
  width: ${DAY_CELL_SIZE};
  height: ${DAY_CELL_SIZE};
  inset: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-sizing: border-box;
`

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

const AWB_DAY_PICKER_CSS = `
  :host {
    --_ui5_day_picker_item_height: var(--_ui5_day_picker_item_width);
    --_ui5_daypicker_daynames_container_height: var(--_ui5_day_picker_item_width);
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
    --_ui5_daypicker_item_selected_between_background: var(--sapShellColor);
    --_ui5_daypicker_item_selected_between_hover_background: var(--sapShellColor);
    --_ui5_daypicker_item_selected_between_border: 0;
    --_ui5_daypicker_item_select_between_border: none;
    --_ui5_daypicker_item_selected_hover: transparent;
  }

  :host .ui5-dp-item:hover {
    background: var(--sapHoverColor);
  }

  :host .ui5-dp-item.ui5-dp-item--now::before {
    ${CENTERED_CIRCLE}
  }

  :host .ui5-dp-item:focus::after {
    ${CENTERED_CIRCLE}
  }

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

  :host ${SINGLE} {
    background: transparent;
    color: var(--sapContent_ContrastTextColor);
    border-radius: 0;
  }

  :host ${SINGLE} .ui5-dp-daytext {
    background: var(--sapHighlightColor);
    color: var(--sapContent_ContrastTextColor);
    border: none;
    outline: none;
    ${CIRCLE_DAYTEXT}
    font-family: var(--sapFontFamily);
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  :host ${SINGLE} .ui5-dp-daytext::after {
    border: none;
    content: none;
    display: none;
  }

  :host ${SINGLE}.ui5-dp-item--now {
    box-shadow: none;
  }

  :host ${SINGLE}:hover {
    background: transparent;
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${SINGLE}:hover .ui5-dp-daytext {
    background: var(--sapButton_Emphasized_Hover_Background);
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${SINGLE}.ui5-dp-item--now .ui5-dp-daytext {
    background: var(--sapHighlightColor);
    border: none;
    outline: none;
    color: var(--sapContent_ContrastTextColor);
    ${CIRCLE_DAYTEXT}
  }

  :host ${SINGLE}.ui5-dp-item--now:hover .ui5-dp-daytext {
    background: var(--sapButton_Emphasized_Hover_Background);
    color: var(--sapContent_ContrastTextColor);
  }

  :host ${SINGLE}:has(+ ${MID}),
  :host ${SINGLE}:has(+ ${SINGLE}) {
    background: ${YELLOW_HALF_START};
  }

  :host ${SINGLE}:has(+ ${MID}):hover,
  :host ${SINGLE}:has(+ ${SINGLE}):hover {
    background: ${YELLOW_HALF_START};
  }

  :host ${MID} + ${SINGLE},
  :host ${SINGLE} + ${SINGLE} {
    background: ${YELLOW_HALF_END};
  }

  :host ${MID} + ${SINGLE}:hover,
  :host ${SINGLE} + ${SINGLE}:hover {
    background: ${YELLOW_HALF_END};
  }
`

/** Reverts AWB structural rules — appended after AWB layer when switching to Horizon. */
const HORIZON_DAY_PICKER_RESET_CSS = `
  :host {
    --_ui5_day_picker_item_height: 2.875rem;
    --_ui5_daypicker_daynames_container_height: 2.875rem;
  }

  :host ${MID} {
    background: var(--_ui5_daypicker_item_selected_between_background);
    color: var(--sapContent_Selected_TextColor);
    border: var(--_ui5_daypicker_item_select_between_border);
    border-block: unset;
    border-radius: var(--_ui5_daypicker_item_selected_between_border);
  }

  :host ${MID}:hover {
    background: var(--_ui5_daypicker_item_selected_between_hover_background);
    color: var(--sapContent_Selected_TextColor);
  }

  :host ${MID} .ui5-dp-daytext {
    background: var(--_ui5_daypicker_item_selected_background);
    color: var(--sapContent_Selected_TextColor);
    border-radius: var(--_ui5_daypicker_item_border_radius);
    font-family: var(--_ui5_daypicker_item_selected_text_font);
  }

  :host ${MID}:not(.ui5-dp-item--now) .ui5-dp-daytext::after {
    content: "";
  }

  :host ${ENDPOINT} {
    background: var(--sapContent_Selected_Background);
    color: var(--sapContent_Selected_TextColor);
    border-radius: var(--_ui5_daypicker_item_border_radius);
  }

  :host ${ENDPOINT} .ui5-dp-daytext {
    background: var(--_ui5_daypicker_item_selected_daytext_hover_background);
    color: var(--sapContent_Selected_TextColor);
    border-radius: var(--_ui5_daypicker_item_border_radius_item);
    font-family: var(--_ui5_daypicker_item_selected_text_font);
    position: static;
    z-index: auto;
  }

  :host ${ENDPOINT}:hover .ui5-dp-daytext {
    background: var(--_ui5_daypicker_item_selected_daytext_hover_background);
    color: var(--sapContent_Selected_TextColor);
  }

  :host ${ENDPOINT}:has(+ ${MID}),
  :host ${ENDPOINT}:has(+ ${ENDPOINT}),
  :host ${MID} + ${ENDPOINT},
  :host ${ENDPOINT} + ${ENDPOINT} {
    background: var(--sapContent_Selected_Background);
  }
`

const AWB_MONTH_CSS = `
  :host {
    --_ui5_monthpicker_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
  }

  :host .ui5-mp-item {
    aspect-ratio: 1;
    height: auto;
  }
`

const HORIZON_MONTH_RESET_CSS = `
  :host {
    --_ui5_monthpicker_item_border_radius: 0.5rem;
  }

  :host .ui5-mp-item {
    aspect-ratio: auto;
    height: var(--_ui5_month_picker_item_height);
  }
`

const AWB_YEAR_CSS = `
  :host {
    --_ui5_yearpicker_item_border_radius: var(--awbDayPicker_Item_BorderRadius);
  }

  :host .ui5-yp-item:not(.ui5-yp-item-secondary-type) {
    aspect-ratio: 1;
    height: auto;
  }
`

const HORIZON_YEAR_RESET_CSS = `
  :host {
    --_ui5_yearpicker_item_border_radius: 0.5rem;
  }

  :host .ui5-yp-item:not(.ui5-yp-item-secondary-type) {
    aspect-ratio: auto;
    height: var(--_ui5_year_picker_item_height);
  }
`

export async function syncCalendarOverrides(themeId: string) {
  const layer = themeId === AWB_CUSTOM_THEME_ID ? 'awb' : 'horizon'

  const isAwb = layer === 'awb'
  const dayCss = isAwb ? AWB_DAY_PICKER_CSS : HORIZON_DAY_PICKER_RESET_CSS
  const monthCss = isAwb ? AWB_MONTH_CSS : HORIZON_MONTH_RESET_CSS
  const yearCss = isAwb ? AWB_YEAR_CSS : HORIZON_YEAR_RESET_CSS

  await addCustomCSS('ui5-daypicker', dayCss)
  await addCustomCSS('ui5-monthpicker', monthCss)
  await addCustomCSS('ui5-yearpicker', yearCss)
}

attachBoot(() => {
  void syncCalendarOverrides(getTheme())
})
