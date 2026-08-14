import { Text } from '@ui5/webcomponents-react/Text'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

const ORDERED = Array.from({ length: 12 }, (_, i) => i + 1)

const SEMANTIC = [
  { token: 'Good', varName: '--sapChart_Good' },
  { token: 'Critical', varName: '--sapChart_Critical' },
  { token: 'Bad', varName: '--sapChart_Bad' },
  { token: 'Neutral', varName: '--sapChart_Neutral' },
] as const

const IBCS = [
  { label: 'Actual', varName: '--sapChart_IBCS_Actual', value: 72 },
  { label: 'Previous', varName: '--sapChart_IBCS_Previous', value: 58 },
  { label: 'Good', varName: '--sapChart_IBCS_Good', value: 80 },
  { label: 'Bad', varName: '--sapChart_IBCS_Bad', value: 45 },
] as const

const SEQUENCE_1 = [
  'Minus5',
  'Minus3',
  'Minus1',
  'base',
  'Plus1',
  'Plus3',
] as const

const BAR_GROUPS = [
  { label: 'Jan', values: [62, 48, 55] },
  { label: 'Feb', values: [74, 52, 61] },
  { label: 'Mar', values: [58, 65, 49] },
  { label: 'Apr', values: [81, 44, 70] },
]

const STACK_SEGMENTS = [
  { token: 1, share: 22 },
  { token: 2, share: 18 },
  { token: 3, share: 26 },
  { token: 8, share: 14 },
  { token: 6, share: 12 },
  { token: 5, share: 8 },
]

const DONUT = [
  { token: 1, value: 28 },
  { token: 2, value: 18 },
  { token: 3, value: 22 },
  { token: 4, value: 12 },
  { token: 6, value: 10 },
  { token: 8, value: 10 },
]

const LINE_SERIES = [
  { token: 1, points: '20,72 60,58 100,64 140,48 180,52 220,38 260,44' },
  { token: 2, points: '20,48 60,52 100,44 140,56 180,42 220,46 260,36' },
  { token: 3, points: '20,60 60,46 100,50 140,40 180,48 220,34 260,40' },
]

function orderedVar(index: number) {
  return `var(--sapChart_OrderedColor_${index})`
}

function sequenceVar(step: (typeof SEQUENCE_1)[number]) {
  if (step === 'base') return 'var(--sapChart_Sequence_1)'
  return `var(--sapChart_Sequence_1_${step})`
}

function ColorSwatch({ token }: { token: number | string }) {
  const varName =
    typeof token === 'number'
      ? `--sapChart_OrderedColor_${token}`
      : token
  return (
    <div className="theme-lab-chart-swatch">
      <span
        className="theme-lab-chart-swatch__chip"
        style={{ background: `var(${varName})` }}
      />
      <code className="theme-lab-chart-swatch__label">{varName}</code>
    </div>
  )
}

function DonutChart() {
  const total = DONUT.reduce((sum, s) => sum + s.value, 0)
  let offset = 0
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      className="theme-lab-chart-donut"
      viewBox="0 0 140 140"
      role="img"
      aria-label="Donut chart using sapChart_OrderedColor tokens"
    >
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="var(--sapChart_Background)"
        stroke="var(--sapChart_LineColor_1)"
        strokeWidth="1"
      />
      {DONUT.map((segment) => {
        const length = (segment.value / total) * circumference
        const dasharray = `${length} ${circumference - length}`
        const dashoffset = -offset
        offset += length
        return (
          <circle
            key={segment.token}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={orderedVar(segment.token)}
            strokeWidth="18"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 70 70)"
          />
        )
      })}
      <text
        x="70"
        y="74"
        textAnchor="middle"
        className="theme-lab-chart-donut__center"
        fill="var(--sapChart_Data_TextColor)"
      >
        100%
      </text>
    </svg>
  )
}

export function ChartsGallery() {
  const maxBar = Math.max(...BAR_GROUPS.flatMap((g) => g.values))

  return (
    <>
      <p className="theme-lab-note" style={{ marginTop: 0 }}>
        Lightweight SVG/CSS demos bound to live <code>sapChart_*</code> CSS
        variables from the active theme. Toggle Custom-Theme vs Horizon in the
        ShellBar — no chart library, tokens only.
      </p>

      <GalleryPanel title="Ordered palette (sapChart_OrderedColor_1–12)">
        <div className="theme-lab-chart-swatches">
          {ORDERED.map((n) => (
            <ColorSwatch key={n} token={n} />
          ))}
        </div>
      </GalleryPanel>

      <GalleryPanel title="Grouped bar chart">
        <DemoGrid>
          <DemoBlock label="3 series × 4 periods" wide>
            <div className="theme-lab-chart-plot theme-lab-chart-plot--grouped">
              <div className="theme-lab-chart-plot__y" aria-hidden="true">
                {[100, 75, 50, 25, 0].map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
              <div className="theme-lab-chart-plot__body">
                <div className="theme-lab-chart-grid" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      style={{ borderColor: 'var(--sapChart_LineColor_1)' }}
                    />
                  ))}
                </div>
                <div className="theme-lab-chart-bars theme-lab-chart-bars--grouped">
                  {BAR_GROUPS.map((group) => (
                    <div key={group.label} className="theme-lab-chart-bars__cluster">
                      {group.values.map((value, seriesIndex) => (
                        <span
                          key={seriesIndex}
                          className="theme-lab-chart-bars__bar"
                          style={{
                            height: `${(value / maxBar) * 100}%`,
                            background: orderedVar(seriesIndex + 1),
                          }}
                          title={`${group.label} S${seriesIndex + 1}: ${value}`}
                        />
                      ))}
                      <span className="theme-lab-chart-bars__x-label">{group.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="theme-lab-chart-legend">
              {[1, 2, 3].map((n) => (
                <span key={n} className="theme-lab-chart-legend__item">
                  <span
                    className="theme-lab-chart-legend__dot"
                    style={{ background: orderedVar(n) }}
                  />
                  OrderedColor_{n}
                </span>
              ))}
            </div>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Stacked bar · Line · Donut">
        <DemoGrid>
          <DemoBlock label="Stacked horizontal bar" wide>
            <div className="theme-lab-chart-stack">
              {STACK_SEGMENTS.map((seg) => (
                <span
                  key={seg.token}
                  className="theme-lab-chart-stack__seg"
                  style={{
                    flex: seg.share,
                    background: orderedVar(seg.token),
                  }}
                  title={`OrderedColor_${seg.token}: ${seg.share}%`}
                />
              ))}
            </div>
            <Text className="theme-lab-chart-caption">
              Segment widths use OrderedColor_1, 2, 3, 8, 6, 5
            </Text>
          </DemoBlock>

          <DemoBlock label="Multi-series line chart" wide>
            <svg
              className="theme-lab-chart-line"
              viewBox="0 0 280 100"
              role="img"
              aria-label="Line chart with three ordered color series"
            >
              {[20, 40, 60, 80].map((y) => (
                <line
                  key={y}
                  x1="16"
                  y1={y}
                  x2="268"
                  y2={y}
                  stroke="var(--sapChart_LineColor_1)"
                  strokeWidth="1"
                />
              ))}
              {LINE_SERIES.map((series) => (
                <polyline
                  key={series.token}
                  fill="none"
                  stroke={orderedVar(series.token)}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={series.points}
                />
              ))}
            </svg>
            <div className="theme-lab-chart-legend">
              {LINE_SERIES.map((s) => (
                <span key={s.token} className="theme-lab-chart-legend__item">
                  <span
                    className="theme-lab-chart-legend__dot"
                    style={{ background: orderedVar(s.token) }}
                  />
                  OrderedColor_{s.token}
                </span>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock label="Donut / pie">
            <DonutChart />
            <div className="theme-lab-chart-legend theme-lab-chart-legend--wrap">
              {DONUT.map((s) => (
                <span key={s.token} className="theme-lab-chart-legend__item">
                  <span
                    className="theme-lab-chart-legend__dot"
                    style={{ background: orderedVar(s.token) }}
                  />
                  {s.value}% · OC_{s.token}
                </span>
              ))}
            </div>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Semantic · IBCS · Sequence">
        <DemoGrid>
          <DemoBlock label="Semantic (Good / Critical / Bad / Neutral)" wide>
            <div className="theme-lab-chart-semantic">
              {SEMANTIC.map(({ token, varName }) => (
                <div key={token} className="theme-lab-chart-semantic__row">
                  <span className="theme-lab-chart-semantic__label">{token}</span>
                  <span
                    className="theme-lab-chart-semantic__bar"
                    style={{
                      width: token === 'Good' ? '88%' : token === 'Critical' ? '62%' : token === 'Bad' ? '38%' : '50%',
                      background: `var(${varName})`,
                    }}
                  />
                  <code>{varName}</code>
                </div>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock label="IBCS Actual / Previous / Good / Bad" wide>
            <div className="theme-lab-chart-ibcs">
              {IBCS.map(({ label, varName, value }) => (
                <div key={label} className="theme-lab-chart-ibcs__row">
                  <span className="theme-lab-chart-ibcs__label">{label}</span>
                  <span
                    className="theme-lab-chart-ibcs__bar"
                    style={{
                      width: `${value}%`,
                      background: `var(${varName})`,
                    }}
                  />
                  <code>{varName}</code>
                </div>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock label="Sequence_1 ramp (OrderedColor_1 base)" wide>
            <div className="theme-lab-chart-sequence">
              {SEQUENCE_1.map((step) => (
                <span
                  key={step}
                  className="theme-lab-chart-sequence__step"
                  style={{ background: sequenceVar(step) }}
                  title={
                    step === 'base'
                      ? '--sapChart_Sequence_1'
                      : `--sapChart_Sequence_1_${step}`
                  }
                />
              ))}
            </div>
            <Text className="theme-lab-chart-caption">
              Minus5 → Plus3 tints derived from information accent base
            </Text>
          </DemoBlock>

          <DemoBlock label="Choropleth tokens" wide>
            <div className="theme-lab-chart-choropleth">
              <span
                className="theme-lab-chart-choropleth__region"
                style={{ background: 'var(--sapChart_ChoroplethRegion_Background)' }}
              />
              <span
                className="theme-lab-chart-choropleth__region"
                style={{ background: 'var(--sapChart_ChoroplethRegion_Background)', opacity: 0.65 }}
              />
              <span
                className="theme-lab-chart-choropleth__region"
                style={{ background: 'var(--sapChart_ChoroplethRegion_Background)', opacity: 0.35 }}
              />
            </div>
            <code className="theme-lab-chart-caption">
              --sapChart_Choropleth_Background · --sapChart_ChoroplethRegion_Background
            </code>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>
    </>
  )
}
