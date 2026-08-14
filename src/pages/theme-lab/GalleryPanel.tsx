import type { ReactNode } from 'react'
import { Panel } from '@ui5/webcomponents-react/Panel'

export function GalleryPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Panel headerText={title} collapsed={false}>
      {children}
    </Panel>
  )
}
