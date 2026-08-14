/** Session flag after a successful gate login (client-side obscurity only). */
export const GATE_SESSION_KEY = 'fiori-prototype-gate'

const gatePassword = import.meta.env.VITE_PROTOTYPE_GATE_PASSWORD ?? ''

/** Gate is active when a non-empty password is baked in at build time. */
export function isPrototypeGateEnabled(): boolean {
  return gatePassword.length > 0
}

export function isPrototypeGateUnlocked(): boolean {
  if (!isPrototypeGateEnabled()) return true
  try {
    return sessionStorage.getItem(GATE_SESSION_KEY) === gatePassword
  } catch {
    return false
  }
}

export function unlockPrototypeGate(password: string): boolean {
  if (!isPrototypeGateEnabled()) return true
  if (password !== gatePassword) return false
  try {
    sessionStorage.setItem(GATE_SESSION_KEY, gatePassword)
  } catch {
    // Private browsing / blocked storage — still allow this session via caller state.
  }
  return true
}
