import { useCallback, useState, type ReactNode } from 'react'
import {
  isPrototypeGateEnabled,
  isPrototypeGateUnlocked,
  unlockPrototypeGate,
} from '../config/prototype-gate'
import { PrototypeGateScreen } from './PrototypeGateScreen'

type PrototypeGateProps = {
  children: ReactNode
}

export function PrototypeGate({ children }: PrototypeGateProps) {
  const [unlocked, setUnlocked] = useState(() => isPrototypeGateUnlocked())

  const handleUnlock = useCallback((password: string) => {
    const ok = unlockPrototypeGate(password)
    if (ok) setUnlocked(true)
    return ok
  }, [])

  if (isPrototypeGateEnabled() && !unlocked) {
    return <PrototypeGateScreen onUnlock={handleUnlock} />
  }

  return children
}
