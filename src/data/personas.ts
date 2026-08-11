export type PrototypeRole = 'Vorgesetzter' | 'Mitarbeitender'

export type PrototypePersona = {
  id: string
  role: PrototypeRole
  name: string
  initials: string
  /** Linked employee for MA personas; null for VG */
  employeeId: string | null
  aktuellBeiLabel: string
}

export const PERSONA_STORAGE_KEY = 'awb-prototype-persona'

/** Extensible list — append new prototype users here */
export const PROTOTYPE_PERSONAS: readonly PrototypePersona[] = [
  {
    id: 'vg-markus',
    role: 'Vorgesetzter',
    name: 'Markus Mettler',
    initials: 'MM',
    employeeId: null,
    aktuellBeiLabel: 'Mettler Markus, PN',
  },
  {
    id: 'emp-006',
    role: 'Mitarbeitender',
    name: 'Fankhauser Fabian',
    initials: 'FF',
    employeeId: 'emp-006',
    aktuellBeiLabel: 'Fankhauser Fabian',
  },
] as const

export const DEFAULT_PERSONA_ID = PROTOTYPE_PERSONAS[0].id

export function getPersonaById(id: string): PrototypePersona {
  return (
    PROTOTYPE_PERSONAS.find((persona) => persona.id === id) ??
    PROTOTYPE_PERSONAS[0]
  )
}

export function roleLabel(role: PrototypeRole): string {
  return role === 'Vorgesetzter' ? 'Vorgesetzte/r' : 'Mitarbeitende/r'
}
