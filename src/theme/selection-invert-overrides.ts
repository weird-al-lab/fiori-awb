/**
 * Dark list/selection hover backgrounds come from sapList_* tokens (awb_custom.less).
 * UI5 keeps sapList_TextColor / sapLinkColor / Lite button text on hover/selected —
 * invert via addCustomCSS.
 *
 * SAP gap: no public token pairs dark sapList_Hover/Selection backgrounds with contrast text
 * (only Active uses sapList_Active_TextColor). Scoped to awb_custom — Horizon stays default.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents/dist/ListItem.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/ComboBoxItem.js'
import '@ui5/webcomponents/dist/MultiComboBoxItem.js'
import '@ui5/webcomponents/dist/TreeItem.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/MenuItem.js'
import '@ui5/webcomponents/dist/Link.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/ToggleButton.js'
import '@ui5/webcomponents-fiori/dist/UploadCollectionItem.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationItem.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js'
import '@ui5/webcomponents-fiori/dist/ProductSwitchItem.js'
import '@ui5/webcomponents-fiori/dist/NotificationListItem.js'
import '@ui5/webcomponents-fiori/dist/SearchItem.js'
import { CUSTOM_THEME_HOST, scopeToCustomTheme } from './custom-theme-scope'

const INVERT = 'var(--sapContent_ContrastTextColor)'

/** Transparent/Lite buttons inherit these from hovered/selected list-like hosts. */
const LITE_INVERT_VARS = `
  --sapButton_Lite_TextColor: ${INVERT};
  --sapButton_Lite_Hover_TextColor: ${INVERT};
  --sapButton_Lite_Active_TextColor: ${INVERT};
`

/** Shared list-item-base selectors (ui5-li, option, combobox items). */
const LIST_ITEM_INVERT = scopeToCustomTheme(`
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover),
  :host([selected]),
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) {
    ${LITE_INVERT_VARS}
  }

  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-title,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-desc,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-additional-text,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-content,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-icon,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) ::slotted([ui5-icon][slot="image"]) {
    color: ${INVERT};
    text-shadow: none;
  }

  :host([selected]) .ui5-li-title,
  :host([selected]) .ui5-li-desc,
  :host([selected]) .ui5-li-additional-text,
  :host([selected]) .ui5-li-content,
  :host([selected]) .ui5-li-icon,
  :host([selected]) ::slotted([ui5-icon][slot="image"]) {
    color: ${INVERT};
    text-shadow: none;
  }

  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-li-title,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-li-desc,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-li-additional-text,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-li-content,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-li-icon,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) ::slotted([ui5-icon][slot="image"]) {
    color: ${INVERT};
    text-shadow: none;
  }
`)

/** UploadCollectionItem uses ui5-uci-* classes (not ui5-li-title). */
const UPLOAD_COLLECTION_ITEM_INVERT = scopeToCustomTheme(`
  :host([actionable]:not([active]):not(:active):not([selected]):hover),
  :host([selected]),
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover),
  :host([active][actionable]) {
    ${LITE_INVERT_VARS}
  }

  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-uci-file-name,
  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-uci-file-name-text,
  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-uci-description,
  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-uci-file-extension,
  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-uci-progress-box [ui5-label],
  :host([actionable]:not([active]):not(:active):not([selected]):hover) ::slotted([ui5-icon][slot="thumbnail"]),
  :host([selected]) .ui5-uci-file-name,
  :host([selected]) .ui5-uci-file-name-text,
  :host([selected]) .ui5-uci-description,
  :host([selected]) .ui5-uci-file-extension,
  :host([selected]) .ui5-uci-progress-box [ui5-label],
  :host([selected]) ::slotted([ui5-icon][slot="thumbnail"]),
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-uci-file-name,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-uci-file-name-text,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-uci-description,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-uci-file-extension,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-uci-progress-box [ui5-label],
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) ::slotted([ui5-icon][slot="thumbnail"]) {
    color: ${INVERT};
    text-shadow: none;
  }
`)

const TREE_ITEM_INVERT = scopeToCustomTheme(`
  :host([selected]) {
    ${LITE_INVERT_VARS}
  }

  :host([_toggle-button-end]:not([selected])) .ui5-li-root-tree:hover .ui5-li-title,
  :host([_toggle-button-end]:not([selected])) .ui5-li-root-tree:hover .ui5-li-content,
  :host([_toggle-button-end]:not([selected])) .ui5-li-root-tree:hover .ui5-li-additional-text,
  :host([_toggle-button-end]:not([selected])) .ui5-li-root-tree:hover .ui5-li-icon,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active]):not([selected])) .ui5-li-root-tree:hover .ui5-li-title,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active]):not([selected])) .ui5-li-root-tree:hover .ui5-li-content,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active]):not([selected])) .ui5-li-root-tree:hover .ui5-li-additional-text,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active]):not([selected])) .ui5-li-root-tree:hover .ui5-li-icon {
    color: ${INVERT};
    text-shadow: none;
  }

  :host([selected]) .ui5-li-root .ui5-li-title,
  :host([selected]) .ui5-li-root .ui5-li-content,
  :host([selected]) .ui5-li-root .ui5-li-additional-text,
  :host([selected]) .ui5-li-root .ui5-li-icon,
  :host([_toggle-button-end][selected]:not([level="1"])) .ui5-li-root-tree .ui5-li-title,
  :host([_toggle-button-end][selected]:not([level="1"])) .ui5-li-root-tree .ui5-li-content,
  :host([_toggle-button-end][selected]:not([level="1"])) .ui5-li-root-tree .ui5-li-additional-text,
  :host([_toggle-button-end][selected]:not([level="1"])) .ui5-li-root-tree .ui5-li-icon {
    color: ${INVERT};
    text-shadow: none;
  }

  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active])[selected]) .ui5-li-root-tree:hover .ui5-li-title,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active])[selected]) .ui5-li-root-tree:hover .ui5-li-content,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active])[selected]) .ui5-li-root-tree:hover .ui5-li-additional-text,
  :host(:not([_selection-mode="None"]):not([_selection-mode="Delete"]):not([active])[selected]) .ui5-li-root-tree:hover .ui5-li-icon {
    color: ${INVERT};
    text-shadow: none;
  }
`)

const TABLE_ROW_INVERT = scopeToCustomTheme(`
  :host([aria-selected="true"]) {
    color: ${INVERT};
    ${LITE_INVERT_VARS}
  }

  @media (hover: hover) {
    :host([_interactive]:hover) {
      color: ${INVERT};
      ${LITE_INVERT_VARS}
    }
    :host([_interactive][aria-selected="true"]:hover) {
      color: ${INVERT};
      ${LITE_INVERT_VARS}
    }
  }
`)

const MENU_ITEM_INVERT = scopeToCustomTheme(`
  :host(:not([active]):not([selected]):not([disabled]):hover),
  :host([focused]:not([active]):not([disabled])) {
    ${LITE_INVERT_VARS}
  }

  :host(:not([active]):not([selected]):not([disabled]):hover)::part(content),
  :host(:not([active]):not([selected]):not([disabled]):hover)::part(additional-text),
  :host(:not([active]):not([selected]):not([disabled]):hover) .ui5-li-icon {
    color: ${INVERT};
  }

  :host([focused]:not([active]):not([disabled]))::part(content),
  :host([focused]:not([active]):not([disabled]))::part(additional-text),
  :host([focused]:not([active]):not([disabled])) .ui5-li-icon {
    color: ${INVERT};
  }
`)

const SIDE_NAV_INVERT = scopeToCustomTheme(`
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover {
    color: ${INVERT};
    ${LITE_INVERT_VARS}
  }

  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover .ui5-sn-item-text,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover .ui5-sn-item-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover [ui5-icon],
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover .ui5-sn-item-toggle-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover .ui5-sn-item-external-link-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected .ui5-sn-item-text,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected .ui5-sn-item-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected [ui5-icon],
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected .ui5-sn-item-toggle-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected .ui5-sn-item-external-link-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover .ui5-sn-item-text,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover .ui5-sn-item-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover [ui5-icon],
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover .ui5-sn-item-toggle-icon,
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover .ui5-sn-item-external-link-icon {
    color: ${INVERT};
    text-shadow: none;
  }

  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled):not(.ui5-sn-item-selected):hover .ui5-sn-item-toggle-icon::part(root),
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected .ui5-sn-item-toggle-icon::part(root),
  :host(:not([design="Action"])) .ui5-sn-item:not(.ui5-sn-item-disabled).ui5-sn-item-selected:hover .ui5-sn-item-toggle-icon::part(root) {
    border-inline-start-color: ${INVERT};
  }
`)

const PRODUCT_SWITCH_INVERT = scopeToCustomTheme(`
  :host(:hover:not([active])),
  :host([selected]:not([active])) {
    ${LITE_INVERT_VARS}
  }

  :host(:hover:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-icon,
  :host(:hover:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-title,
  :host(:hover:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle,
  :host([selected]:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-icon,
  :host([selected]:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-title,
  :host([selected]:not([active])) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle {
    color: ${INVERT};
    text-shadow: none;
  }
`)

const SEARCH_ITEM_INVERT = scopeToCustomTheme(`
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover),
  :host([selected]),
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover),
  :host([active][actionable]:not([data-moving])) {
    ${LITE_INVERT_VARS}
  }

  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-search-item-text,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-search-item-description,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-search-item-icon,
  :host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-search-item-begin-content [ui5-icon],
  :host([selected]) .ui5-search-item-text,
  :host([selected]) .ui5-search-item-description,
  :host([selected]) .ui5-search-item-icon,
  :host([selected]) .ui5-search-item-begin-content [ui5-icon],
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-search-item-text,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-search-item-description,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-search-item-icon,
  :host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover) .ui5-search-item-begin-content [ui5-icon],
  :host([active][actionable]:not([data-moving])) .ui5-search-item-text,
  :host([active][actionable]:not([data-moving])) .ui5-search-item-description,
  :host([active][actionable]:not([data-moving])) .ui5-search-item-icon,
  :host([active][actionable]:not([data-moving])) .ui5-search-item-begin-content [ui5-icon] {
    color: ${INVERT};
    text-shadow: none;
  }

  :host([actionable]:not([active]):not(:active):not([selected]):hover) .ui5-search-item-selected-delete,
  :host([selected]) .ui5-search-item-selected-delete,
  :host([actionable][selected]:not([active]):not(:active):hover) .ui5-search-item-selected-delete,
  :host([active][actionable]) .ui5-search-item-selected-delete {
    color: ${INVERT};
  }
`)

const NOTIFICATION_HOVER_INVERT = `
  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover {
    ${LITE_INVERT_VARS}
  }

  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover .ui5-nli-title-text,
  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover .ui5-nli-description,
  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover .ui5-nli-footer,
  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover ::slotted([slot^="footnotes"]),
  ${CUSTOM_THEME_HOST} .ui5-nli-root:hover .ui5-state-icon {
    color: ${INVERT};
    text-shadow: none;
  }
`

/**
 * Force Lite text/icons white when Transparent buttons sit on dark hover/selected
 * hosts. Inheritance of LITE_INVERT_VARS covers most slotted cases; host-context
 * catches shadow nesting (e.g. notification actions). Default/Emphasized untouched.
 */
const LITE_BUTTON_CONTEXTS = [
  'ui5-li[actionable]:not([active]):not(:active):not([selected]):hover',
  'ui5-li[selected]',
  'ui5-li[actionable][selected]:not([active]):not(:active):hover',
  'ui5-upload-collection-item[actionable]:not([active]):not(:active):not([selected]):hover',
  'ui5-upload-collection-item[selected]',
  'ui5-upload-collection-item[actionable][selected]:not([active]):not(:active):hover',
  'ui5-upload-collection-item[active][actionable]',
  'ui5-tree-item[selected]',
  'ui5-table-row[_interactive]:hover',
  'ui5-table-row[aria-selected="true"]',
  'ui5-table-row[_interactive][aria-selected="true"]:hover',
  'ui5-table-row[_interactive][_active]',
  'ui5-menu-item:hover',
  'ui5-search-item[actionable]:not([selected]):hover',
  'ui5-search-item[selected]',
  '.ui5-nli-root:hover',
] as const

const LITE_BUTTON_HOST = LITE_BUTTON_CONTEXTS.map(
  (ctx) => `:host([design="Transparent"]):host-context(${ctx})`,
).join(',\n  ')

const LITE_BUTTON_INVERT = scopeToCustomTheme(`
  ${LITE_BUTTON_HOST} {
    ${LITE_INVERT_VARS}
    color: ${INVERT};
    text-shadow: none;
  }

  ${LITE_BUTTON_HOST} .ui5-button-root,
  ${LITE_BUTTON_HOST} [ui5-icon] {
    color: ${INVERT};
    text-shadow: none;
  }
`)

const LIST_ITEM_TAGS = [
  'ui5-li',
  'ui5-option',
  'ui5-cb-item',
  'ui5-mcb-item',
] as const

for (const tag of LIST_ITEM_TAGS) {
  addCustomCSS(tag, LIST_ITEM_INVERT)
}

addCustomCSS('ui5-upload-collection-item', UPLOAD_COLLECTION_ITEM_INVERT)
addCustomCSS('ui5-tree-item', LIST_ITEM_INVERT + TREE_ITEM_INVERT)
addCustomCSS('ui5-table-row', TABLE_ROW_INVERT)
addCustomCSS('ui5-menu-item', MENU_ITEM_INVERT)
addCustomCSS('ui5-side-navigation-item', SIDE_NAV_INVERT)
addCustomCSS('ui5-side-navigation-sub-item', SIDE_NAV_INVERT)
addCustomCSS('ui5-product-switch-item', PRODUCT_SWITCH_INVERT)
addCustomCSS('ui5-search-item', SEARCH_ITEM_INVERT)
addCustomCSS('ui5-li-notification', NOTIFICATION_HOVER_INVERT)

/** Links keep sapLinkColor — invert inside hovered/selected list-like hosts. */
addCustomCSS(
  'ui5-link',
  scopeToCustomTheme(`
  :host-context(ui5-upload-collection-item[actionable]:not([active]):not(:active):not([selected]):hover),
  :host-context(ui5-upload-collection-item[selected]),
  :host-context(ui5-upload-collection-item[actionable][selected]:not([active]):not(:active):hover),
  :host-context(ui5-upload-collection-item[active][actionable]),
  :host-context(ui5-table-row[_interactive]:hover),
  :host-context(ui5-table-row[aria-selected="true"]),
  :host-context(ui5-table-row[_interactive][aria-selected="true"]:hover),
  :host-context(ui5-table-row[_interactive][_active]),
  :host-context(.ui5-nli-root:hover) {
    color: ${INVERT};
    text-shadow: none;
  }
`),
)

addCustomCSS('ui5-button', LITE_BUTTON_INVERT)
addCustomCSS('ui5-toggle-button', LITE_BUTTON_INVERT)
