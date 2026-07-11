import '@ui5/webcomponents-react/dist/Assets.js'
import { ThemeProvider } from '@ui5/webcomponents-react/ThemeProvider'
import { Theme } from '@ui5/webcomponents-react/enums/Theme'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

setTheme(Theme.sap_horizon)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
