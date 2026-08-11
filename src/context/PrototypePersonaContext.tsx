import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_PERSONA_ID,
  getPersonaById,
  PERSONA_STORAGE_KEY,
  type PrototypePersona,
} from '../data/personas'

type PrototypePersonaContextValue = {
  persona: PrototypePersona
  setPersonaId: (id: string) => void
  isVg: boolean
  isMa: boolean
  ownsEmployee: (employeeId: string) => boolean
}

const PrototypePersonaContext =
  createContext<PrototypePersonaContextValue | null>(null)

function readStoredPersonaId(): string {
  try {
    const stored = localStorage.getItem(PERSONA_STORAGE_KEY)
    if (stored) {
      return getPersonaById(stored).id
    }
  } catch {
    // ignore
  }
  return DEFAULT_PERSONA_ID
}

export function PrototypePersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState(readStoredPersonaId)

  const setPersonaId = useCallback((id: string) => {
    const next = getPersonaById(id)
    setPersonaIdState(next.id)
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, next.id)
    } catch {
      // ignore
    }
  }, [])

  const persona = useMemo(() => getPersonaById(personaId), [personaId])

  const value = useMemo<PrototypePersonaContextValue>(
    () => ({
      persona,
      setPersonaId,
      isVg: persona.role === 'Vorgesetzter',
      isMa: persona.role === 'Mitarbeitender',
      ownsEmployee: (employeeId: string) =>
        persona.role === 'Vorgesetzter' || persona.employeeId === employeeId,
    }),
    [persona, setPersonaId],
  )

  return (
    <PrototypePersonaContext.Provider value={value}>
      {children}
    </PrototypePersonaContext.Provider>
  )
}

export function usePrototypePersona(): PrototypePersonaContextValue {
  const ctx = useContext(PrototypePersonaContext)
  if (!ctx) {
    throw new Error(
      'usePrototypePersona must be used within PrototypePersonaProvider',
    )
  }
  return ctx
}
