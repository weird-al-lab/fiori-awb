import { useEffect, type RefObject } from 'react'
import type { ObjectPageDomRef } from '@ui5/webcomponents-react/ObjectPage'

/** Expands the Object Page header area on mount (snapped=false → expanded). */
export function useObjectPageHeaderExpanded(
  objectPageRef: RefObject<ObjectPageDomRef | null>,
  resetKey?: unknown,
) {
  useEffect(() => {
    objectPageRef.current?.toggleHeaderArea(false)
  }, [objectPageRef, resetKey])
}
