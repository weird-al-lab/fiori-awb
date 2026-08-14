import type { ReactNode } from 'react'
import { Label } from '@ui5/webcomponents-react/Label'
import { Link } from '@ui5/webcomponents-react/Link'
import { Text } from '@ui5/webcomponents-react/Text'
import { Title } from '@ui5/webcomponents-react/Title'
import { GalleryPanel } from '../GalleryPanel'

type Specimen = {
  name: string
  tokens: string
  awb?: string
  sample: ReactNode
}

function SpecimenTable({ rows }: { rows: Specimen[] }) {
  return (
    <div className="theme-lab-type-table" role="table">
      <div className="theme-lab-type-row theme-lab-type-row--head" role="row">
        <span role="columnheader">Style</span>
        <span role="columnheader">Tokens</span>
        <span role="columnheader">Sample</span>
      </div>
      {rows.map((row) => (
        <div className="theme-lab-type-row" role="row" key={row.name}>
          <div role="cell">
            <strong>{row.name}</strong>
            {row.awb ? (
              <code className="theme-lab-type-awb">{row.awb}</code>
            ) : null}
          </div>
          <code className="theme-lab-type-tokens" role="cell">
            {row.tokens}
          </code>
          <div className="theme-lab-type-sample" role="cell">
            {row.sample}
          </div>
        </div>
      ))}
    </div>
  )
}

const HEADINGS: Specimen[] = [
  {
    name: 'Title H1',
    tokens: 'font: --sapFontHeaderFamily (= --sapFontBlackFamily) · size: --sapFontHeader1Size · color: --sapGroup_TitleTextColor',
    awb: 'Header2 overridden in LESS; H1 inherits Horizon 3rem',
    sample: <Title size="H1">Header 1</Title>,
  },
  {
    name: 'Title H2',
    tokens: 'font: --sapFontHeaderFamily (= --sapFontBlackFamily) · size: --sapFontHeader2Size · color: --sapGroup_TitleTextColor',
    awb: '@sapFontHeaderFamily: @sapFontBlackFamily · @sapFontHeader2Size: 2rem',
    sample: <Title size="H2">Header 2</Title>,
  },
  {
    name: 'Title H3',
    tokens: 'font: --sapFontHeaderFamily · size: --sapFontHeader3Size · color: --sapGroup_TitleTextColor',
    sample: <Title size="H3">Header 3</Title>,
  },
  {
    name: 'Title H4',
    tokens: 'font: --sapFontHeaderFamily · size: --sapFontHeader4Size · color: --sapGroup_TitleTextColor',
    sample: <Title size="H4">Header 4</Title>,
  },
  {
    name: 'Title H5 (default Title)',
    tokens: 'font: --sapFontHeaderFamily · size: --sapFontHeader5Size · color: --sapGroup_TitleTextColor',
    sample: <Title size="H5">Header 5</Title>,
  },
  {
    name: 'Title H6',
    tokens: 'font: --sapFontHeaderFamily · size: --sapFontHeader6Size · color: --sapGroup_TitleTextColor',
    sample: <Title size="H6">Header 6</Title>,
  },
]

const BODY: Specimen[] = [
  {
    name: 'Body / Text',
    tokens: 'font: --sapFontFamily · size: --sapFontSize · color: --sapTextColor',
    awb: '@sapFontSize: 0.875rem · @sapTextColor: #050400',
    sample: <Text>Body text — primary reading style for content.</Text>,
  },
  {
    name: 'Small',
    tokens: 'font: --sapFontFamily · size: --sapFontSmallSize · color: --sapTextColor',
    awb: '@sapFontSmallSize: 0.75rem',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>
        Small text — captions, meta, helper copy.
      </span>
    ),
  },
  {
    name: 'Large',
    tokens: 'font: --sapFontFamily · size: --sapFontLargeSize · color: --sapTextColor',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontLargeSize)', color: 'var(--sapTextColor)' }}>
        Large text — emphasized body / Label large.
      </span>
    ),
  },
  {
    name: 'Label',
    tokens: 'font: --sapFontFamily · size: --sapFontSize · color: --sapContent_LabelColor',
    awb: '@sapContent_LabelColor: #696864',
    sample: (
      <Label showColon>Form label</Label>
    ),
  },
  {
    name: 'Label (large)',
    tokens: 'font: --sapFontFamily · size: --sapFontLargeSize · color: --sapContent_LabelColor',
    sample: (
      <Label wrappingType="Normal" style={{ fontSize: 'var(--sapFontLargeSize)' }}>
        Large label
      </Label>
    ),
  },
]

const FAMILIES: Specimen[] = [
  {
    name: 'Regular',
    tokens: '--sapFontFamily',
    awb: '@sapFontFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontLargeSize)' }}>
        72 Regular — The quick brown fox
      </span>
    ),
  },
  {
    name: 'Light',
    tokens: '--sapFontLightFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontLightFamily)', fontSize: 'var(--sapFontLargeSize)' }}>
        72 Light — The quick brown fox
      </span>
    ),
  },
  {
    name: 'Semibold',
    tokens: '--sapFontSemiboldFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontSemiboldFamily)', fontSize: 'var(--sapFontLargeSize)' }}>
        72 Semibold — The quick brown fox
      </span>
    ),
  },
  {
    name: 'Bold / Header',
    tokens: '--sapFontBoldFamily · --sapFontHeaderFamily (= --sapFontBlackFamily)',
    awb: '@sapFontHeaderFamily: @sapFontBlackFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontHeaderFamily)', fontSize: 'var(--sapFontLargeSize)' }}>
        72 Bold — The quick brown fox
      </span>
    ),
  },
  {
    name: 'Black',
    tokens: '--sapFontBlackFamily · ObjectHeader title',
    sample: (
      <span style={{ fontFamily: 'var(--sapFontBlackFamily)', fontSize: 'var(--sapFontLargeSize)' }}>
        72 Black — The quick brown fox
      </span>
    ),
  },
  {
    name: 'Monospace',
    tokens: '--sapContent_MonospaceFontFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapContent_MonospaceFontFamily)', fontSize: 'var(--sapFontSize)' }}>
        72Mono — const token = "awb_custom"
      </span>
    ),
  },
  {
    name: 'Monospace Bold',
    tokens: '--sapContent_MonospaceBoldFontFamily',
    sample: (
      <span style={{ fontFamily: 'var(--sapContent_MonospaceBoldFontFamily)', fontSize: 'var(--sapFontSize)' }}>
        72Mono-Bold — ERROR_CODE_42
      </span>
    ),
  },
]

const COLORS: Specimen[] = [
  {
    name: 'Text',
    tokens: '--sapTextColor',
    awb: '@sapTextColor → #050400',
    sample: <span style={{ color: 'var(--sapTextColor)' }}>Primary text</span>,
  },
  {
    name: 'Title',
    tokens: '--sapTitleColor',
    awb: '@sapTitleColor → #050400',
    sample: <span style={{ color: 'var(--sapTitleColor)', fontFamily: 'var(--sapFontHeaderFamily)' }}>Title color</span>,
  },
  {
    name: 'Label',
    tokens: '--sapContent_LabelColor',
    awb: '@sapContent_LabelColor → #696864',
    sample: <span style={{ color: 'var(--sapContent_LabelColor)' }}>Secondary / label</span>,
  },
  {
    name: 'Disabled text',
    tokens: '--sapContent_DisabledTextColor',
    sample: <span style={{ color: 'var(--sapContent_DisabledTextColor)' }}>Disabled text</span>,
  },
  {
    name: 'Contrast text',
    tokens: '--sapContent_ContrastTextColor',
    awb: '@sapContent_ContrastTextColor → #ffffff',
    sample: (
      <span
        style={{
          color: 'var(--sapContent_ContrastTextColor)',
          background: 'var(--sapHighlightColor)',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
        }}
      >
        Contrast on dark
      </span>
    ),
  },
  {
    name: 'Link',
    tokens: '--sapLinkColor · hover --sapLink_Hover_Color',
    awb: '@sapLinkColor → #050400',
    sample: <Link href="#typography">Inline link</Link>,
  },
  {
    name: 'Link subtle',
    tokens: '--sapLink_SubtleColor',
    sample: (
      <Link href="#typography" design="Subtle">
        Subtle link
      </Link>
    ),
  },
  {
    name: 'Link disabled',
    tokens: 'opacity --sapContent_DisabledOpacity',
    sample: (
      <Link href="#typography" disabled>
        Disabled link
      </Link>
    ),
  },
  {
    name: 'Positive text',
    tokens: '--sapPositiveTextColor',
    sample: <span style={{ color: 'var(--sapPositiveTextColor)' }}>Positive / success text</span>,
  },
  {
    name: 'Critical text',
    tokens: '--sapCriticalTextColor',
    sample: <span style={{ color: 'var(--sapCriticalTextColor)' }}>Critical / warning text</span>,
  },
  {
    name: 'Negative text',
    tokens: '--sapNegativeTextColor',
    sample: <span style={{ color: 'var(--sapNegativeTextColor)' }}>Negative / error text</span>,
  },
  {
    name: 'Neutral text',
    tokens: '--sapNeutralTextColor',
    sample: <span style={{ color: 'var(--sapNeutralTextColor)' }}>Neutral text</span>,
  },
]

const CONTEXT: Specimen[] = [
  {
    name: 'Field value',
    tokens: '--sapField_TextColor',
    sample: <span style={{ color: 'var(--sapField_TextColor)' }}>Input value text</span>,
  },
  {
    name: 'Field placeholder',
    tokens: '--sapField_PlaceholderTextColor',
    awb: '→ --sapContent_LabelColor',
    sample: (
      <span style={{ color: 'var(--sapField_PlaceholderTextColor)' }}>
        Placeholder text…
      </span>
    ),
  },
  {
    name: 'List item',
    tokens: '--sapList_TextColor',
    sample: <span style={{ color: 'var(--sapList_TextColor)' }}>List item text</span>,
  },
  {
    name: 'Shell / ShellBar',
    tokens: '--sapShell_TextColor · --sapShell_InteractiveTextColor',
    sample: (
      <span
        style={{
          color: 'var(--sapShell_TextColor)',
          background: 'var(--sapShellColor)',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
        }}
      >
        Shell text on brand bar
      </span>
    ),
  },
  {
    name: 'Tile title / text',
    tokens: '--sapTile_TitleTextColor · --sapTile_TextColor',
    sample: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <span style={{ color: 'var(--sapTile_TitleTextColor)', fontFamily: 'var(--sapFontHeaderFamily)' }}>
          Tile title
        </span>
        <span style={{ color: 'var(--sapTile_TextColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Tile subtitle / description
        </span>
      </span>
    ),
  },
  {
    name: 'Object Header title',
    tokens: '--sapObjectHeader_Title_TextColor · --sapObjectHeader_Title_FontSize · --sapObjectHeader_Title_FontFamily',
    sample: (
      <span
        style={{
          color: 'var(--sapObjectHeader_Title_TextColor)',
          fontSize: 'var(--sapObjectHeader_Title_FontSize)',
          fontFamily: 'var(--sapObjectHeader_Title_FontFamily)',
        }}
      >
        Object page title
      </span>
    ),
  },
  {
    name: 'Page header / footer',
    tokens: '--sapPageHeader_TextColor · --sapPageFooter_TextColor',
    sample: <span style={{ color: 'var(--sapPageHeader_TextColor)' }}>Page header text</span>,
  },
  {
    name: 'Marker text',
    tokens: '--sapContent_MarkerTextColor',
    sample: <span style={{ color: 'var(--sapContent_MarkerTextColor)' }}>Marker / highlight text</span>,
  },
]

export function TypographyGallery() {
  return (
    <>
      <p className="theme-lab-note" style={{ marginTop: 0 }}>
        Specimens bind to live CSS variables from <code>awb_custom</code> /
        Horizon. Toggle Custom-Theme to compare. Values marked AWB are set in{' '}
        <code>awb_custom.less</code>; others inherit Morning Horizon defaults.
      </p>

      <GalleryPanel title="Headings (ui5-title)">
        <SpecimenTable rows={HEADINGS} />
      </GalleryPanel>

      <GalleryPanel title="Body & labels">
        <SpecimenTable rows={BODY} />
      </GalleryPanel>

      <GalleryPanel title="Font families">
        <SpecimenTable rows={FAMILIES} />
      </GalleryPanel>

      <GalleryPanel title="Text colors">
        <SpecimenTable rows={COLORS} />
      </GalleryPanel>

      <GalleryPanel title="Contextual text (controls)">
        <SpecimenTable rows={CONTEXT} />
      </GalleryPanel>
    </>
  )
}
