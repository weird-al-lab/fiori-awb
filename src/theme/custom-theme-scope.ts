/**
 * Scopes addCustomCSS rules to the custom prototype theme only.
 * Horizon keeps UI5 defaults; invert/selection overrides apply under awb_custom.
 *
 * Set document.documentElement[data-awb-theme] from PrototypeThemeContext.
 */
export const AWB_THEME_ATTR = 'data-awb-theme'
export const AWB_CUSTOM_THEME_ID = 'awb_custom'

/** Use as prefix for :host / descendant rules inside shadow DOM. */
export const CUSTOM_THEME_HOST = `:host-context(html[${AWB_THEME_ATTR}="${AWB_CUSTOM_THEME_ID}"])`

/** Prefix every :host / :host-context rule so it only matches under awb_custom. */
export function scopeToCustomTheme(css: string): string {
  return css
    .replaceAll(':host-context(', `${CUSTOM_THEME_HOST}:host-context(`)
    .replace(/(?<![\w-]):host(?!-context)/g, `${CUSTOM_THEME_HOST}:host`)
}

export function syncDocumentThemeAttr(themeId: string) {
  document.documentElement.setAttribute(AWB_THEME_ATTR, themeId)
}
