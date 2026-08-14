import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import { Theme } from '@ui5/webcomponents-react/enums/Theme'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { syncDocumentThemeAttr } from '../theme/custom-theme-scope'

export const THEME_STORAGE_KEY = 'awb-prototype-theme'
export const HORIZON_THEME = Theme.sap_horizon
export const CUSTOM_THEME = 'awb_custom'

export type PrototypeThemeId = typeof HORIZON_THEME | typeof CUSTOM_THEME

type PrototypeThemeContextValue = {
  themeId: PrototypeThemeId
  isCustomTheme: boolean
  setThemeId: (id: PrototypeThemeId) => void
  toggleTheme: () => void
}

const PrototypeThemeContext = createContext<PrototypeThemeContextValue | null>(
  null,
)

function isPrototypeThemeId(value: string): value is PrototypeThemeId {
  return value === HORIZON_THEME || value === CUSTOM_THEME
}

function readStoredThemeId(): PrototypeThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && isPrototypeThemeId(stored)) {
      return stored
    }
  } catch {
    // ignore
  }
  return HORIZON_THEME
}

async function applyTheme(themeId: PrototypeThemeId) {
  syncDocumentThemeAttr(themeId)
  await setTheme(themeId)
}

export function PrototypeThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<PrototypeThemeId>(() => {
    const stored = readStoredThemeId()
    syncDocumentThemeAttr(stored)
    void applyTheme(stored)
    return stored
  })

  const setThemeId = useCallback((id: PrototypeThemeId) => {
    void applyTheme(id).then(() => {
      setThemeIdState(id)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id)
      } catch {
        // ignore
      }
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeId(themeId === HORIZON_THEME ? CUSTOM_THEME : HORIZON_THEME)
  }, [themeId, setThemeId])

  const value = useMemo<PrototypeThemeContextValue>(
    () => ({
      themeId,
      isCustomTheme: themeId === CUSTOM_THEME,
      setThemeId,
      toggleTheme,
    }),
    [themeId, setThemeId, toggleTheme],
  )

  return (
    <PrototypeThemeContext.Provider value={value}>
      {children}
    </PrototypeThemeContext.Provider>
  )
}

export function usePrototypeTheme(): PrototypeThemeContextValue {
  const ctx = useContext(PrototypeThemeContext)
  if (!ctx) {
    throw new Error(
      'usePrototypeTheme must be used within PrototypeThemeProvider',
    )
  }
  return ctx
}
