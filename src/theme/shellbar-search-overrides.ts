/**
 * SAP gap: ShellBar search radii are private --_ui5_* vars; shell action /
 * branding hover fills and profile-avatar Accent10 hover need shadow-DOM CSS.
 * Lite button fills come from awb_custom.less (transparent) — not re-forced here.
 */
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js'
import '@ui5/webcomponents-fiori/dist/ShellBar.js'
import '@ui5/webcomponents-fiori/dist/ShellBarBranding.js'
import '@ui5/webcomponents-fiori/dist/ShellBarItem.js'
import '@ui5/webcomponents-fiori/dist/ShellBarSearch.js'

addCustomCSS(
  'ui5-shellbar-search',
  `
  :host(:not([collapsed])) {
    --_ui5_search_input_border_radius: var(--sapField_BorderCornerRadius);
    --_ui5_search_icon_border_radius: var(--sapField_BorderCornerRadius);
    --_ui5_search_filter_button_border_radius: var(--sapField_BorderCornerRadius);
    --_ui5_shellbar_button_border_radius: var(--sapField_BorderCornerRadius);
  }

  /* Square focus outline while typing — same as ui5-input (--_ui5_input_focus_border_radius: 0) */
  :host([focused-inner-input]:not([collapsed])) .ui5-search-field-root,
  :host([focused-inner-input]:not([collapsed])) .ui5-search-field-inner-input {
    border-radius: 0;
  }

  .ui5-shell-search-field-icon:focus::part(root) {
    border-radius: 0;
  }

  .ui5-shell-search-field-button[desktop]:not([active])::part(button):focus-visible:after,
  .ui5-shell-search-field-button:not([active])::part(button):focus-visible:after,
  .ui5-shell-search-field-button[desktop][active][design="Emphasized"]::part(button):focus-within:after,
  .ui5-shell-search-field-button[active][design="Emphasized"]::part(button):focus-visible:after,
  .ui5-shell-search-field-button[desktop][active]::part(button):focus-within:before,
  .ui5-shell-search-field-button[active]::part(button):focus-visible:before,
  .ui5-shell-search-field-button[design="Emphasized"][desktop]::part(button):focus-within:before,
  .ui5-shell-search-field-button[design="Emphasized"]::part(button):focus-visible:before {
    border-radius: 0;
  }
`,
)

// Shell hover/active chrome + profile avatar Accent10 hover.
addCustomCSS(
  'ui5-shellbar',
  `
  :host {
    --sapShell_Hover_Background: transparent;
    --sapShell_Active_Background: transparent;
  }

  .ui5-shellbar-action-button,
  .ui5-shellbar-action-button:hover,
  .ui5-shellbar-action-button[active],
  .ui5-shellbar-image-button,
  .ui5-shellbar-image-button:hover,
  .ui5-shellbar-image-button[active] {
    background: transparent;
    background-color: transparent;
  }

  :host(:has(.ui5-shellbar-image-button:hover)) ::slotted([ui5-avatar][slot="profile"]),
  :host(:has(.ui5-shellbar-image-button:active)) ::slotted([ui5-avatar][slot="profile"]) {
    --ui5-avatar-accent10: var(--sapAvatar_10_Hover_Background);
    --ui5-avatar-accent10-border-color: var(--sapAvatar_10_Hover_Background);
  }
`,
)

addCustomCSS(
  'ui5-shellbar-branding',
  `
  .ui5-shellbar-branding-root,
  .ui5-shellbar-branding-root:hover,
  .ui5-shellbar-branding-root:active,
  .ui5-shellbar-branding-root:active:focus,
  .ui5-shellbar-logo-area,
  .ui5-shellbar-logo-area:hover {
    background: transparent;
    background-color: transparent;
  }
`,
)

addCustomCSS(
  'ui5-shellbar-item',
  `
  .ui5-shellbar-action-button,
  .ui5-shellbar-action-button:hover,
  .ui5-shellbar-action-button[active] {
    background: transparent;
    background-color: transparent;
  }
`,
)
