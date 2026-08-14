import type { ReactNode } from 'react'

type DemoBlockProps = {
  label: string
  wide?: boolean
  children: ReactNode
}

export function DemoBlock({ label, wide, children }: DemoBlockProps) {
  return (
    <div className={`theme-lab-demo${wide ? ' theme-lab-demo--wide' : ''}`}>
      <span className="theme-lab-demo-label">{label}</span>
      {children}
    </div>
  )
}

type DemoGridProps = {
  children: ReactNode
}

export function DemoGrid({ children }: DemoGridProps) {
  return <div className="theme-lab-demo-grid">{children}</div>
}
