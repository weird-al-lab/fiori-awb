import '@ui5/webcomponents-react/dist/Assets.js'
import '@ui5/webcomponents-icons/dist/AllIcons.js'
import './themes/awb_custom.css'
import './theme/shellbar-search-overrides'
import './theme/button-radius-overrides'
import './theme/calendar-overrides'
import './theme/step-input-overrides'
import './theme/checkbox-overrides'
import './theme/selection-invert-overrides'
import './theme/field-disabled-overrides'
import './theme/breadcrumbs-overrides'
import './theme/panel-overrides'
import './theme/tag-overrides'
import './theme/token-overrides'
import { ThemeProvider } from '@ui5/webcomponents-react/ThemeProvider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './layout/page-layout.css'
import './layout/dialog-content.css'
import { PrototypeThemeProvider } from './context/PrototypeThemeContext'
import { ensureDemoAntraege } from './data/antrag/demoSeed'
import App from './App.tsx'

ensureDemoAntraege()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PrototypeThemeProvider>
        <App />
      </PrototypeThemeProvider>
    </ThemeProvider>
  </StrictMode>,
)
