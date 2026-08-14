export type ThemeLabCategoryId =
  | 'shell'
  | 'buttons'
  | 'forms'
  | 'lists-tables'
  | 'navigation'
  | 'layout'
  | 'feedback'
  | 'display'
  | 'typography'
  | 'charts'
  | 'wizard-object'
  | 'misc'

export type ThemeLabCategory = {
  id: ThemeLabCategoryId
  title: string
  description: string
}

export const THEME_LAB_CATEGORIES: ThemeLabCategory[] = [
  {
    id: 'shell',
    title: 'Shell',
    description: 'ShellBar, branding, items, search, avatar, menu',
  },
  {
    id: 'buttons',
    title: 'Buttons',
    description: 'Button designs, toggle, split, segmented, badge',
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Inputs, selects, dates, switches, sliders, Form',
  },
  {
    id: 'lists-tables',
    title: 'Lists & Tables',
    description: 'List, Table, Tree, UploadCollection',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'SideNavigation, Breadcrumbs, Tabs, Toolbar, ProductSwitch',
  },
  {
    id: 'layout',
    title: 'Layout',
    description: 'Page, Panel, Card, Bar, Carousel, FlexBox, Grid',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'MessageStrip, Toast, Busy, Dialog, Popover, Tag',
  },
  {
    id: 'display',
    title: 'Display',
    description: 'Title, Text, Link, Icon, Avatar, Timeline, Notifications',
  },
  {
    id: 'typography',
    title: 'Typography',
    description: 'Font sizes, families, text colors, and token map',
  },
  {
    id: 'charts',
    title: 'Charts',
    description: 'sapChart_* ordered, semantic, sequence, and IBCS tokens',
  },
  {
    id: 'wizard-object',
    title: 'Wizard & ObjectPage',
    description: 'Wizard steps and ObjectPage structure',
  },
  {
    id: 'misc',
    title: 'Misc',
    description: 'Color, rating, tokenizer, search, notes for skipped APIs',
  },
]

export function isThemeLabCategoryId(value: string): value is ThemeLabCategoryId {
  return THEME_LAB_CATEGORIES.some((category) => category.id === value)
}

export function getThemeLabCategory(id: string): ThemeLabCategory | undefined {
  return THEME_LAB_CATEGORIES.find((category) => category.id === id)
}
