import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrototypePersonaProvider } from './context/PrototypePersonaContext'
import { AusbildungAntragReviewPage } from './pages/AusbildungAntragReviewPage'
import {
  AusbildungAntragWizardPage,
  AusbildungAntragWizardRedirect,
} from './pages/AusbildungAntragWizardPage'
import { MitarbeitendePage } from './pages/MitarbeitendePage'
import { PrototypeIndexPage } from './pages/PrototypeIndexPage'
import { ThemeLabCategoryPage } from './pages/theme-lab/ThemeLabCategoryPage'
import { ThemeLabIndexPage } from './pages/theme-lab/ThemeLabIndexPage'
import { WeiterbildungEmployeeListPage } from './pages/WeiterbildungEmployeeListPage'
import { WeiterbildungEmployeeObjectPage } from './pages/WeiterbildungEmployeeObjectPage'
import { AusbildungAntragReviewPage as AusbildungAntragReviewPageV2 } from './pages/v2/AusbildungAntragReviewPage'
import {
  AusbildungAntragPage as AusbildungAntragPageV2,
  AusbildungAntragStepRedirect as AusbildungAntragStepRedirectV2,
} from './pages/v2/AusbildungAntragPage'
import { MitarbeitendePage as MitarbeitendePageV2 } from './pages/v2/MitarbeitendePage'
import { WeiterbildungEmployeeListPage as WeiterbildungEmployeeListPageV2 } from './pages/v2/WeiterbildungEmployeeListPage'
import { WeiterbildungEmployeeObjectPage as WeiterbildungEmployeeObjectPageV2 } from './pages/v2/WeiterbildungEmployeeObjectPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <PrototypePersonaProvider>
      <Routes>
        <Route path="/" element={<PrototypeIndexPage />} />
        <Route path="/home" element={<MitarbeitendePage />} />
        <Route path="/weiterbildung" element={<WeiterbildungEmployeeListPage />} />
        <Route
          path="/weiterbildung/:employeeId"
          element={<WeiterbildungEmployeeObjectPage />}
        />
        <Route
          path="/weiterbildung/:employeeId/antrag/neu"
          element={<AusbildungAntragWizardRedirect />}
        />
        <Route
          path="/weiterbildung/:employeeId/antrag/neu/:step"
          element={<AusbildungAntragWizardPage />}
        />
        <Route
          path="/weiterbildung/:employeeId/antrag/:antragId/bearbeiten"
          element={<AusbildungAntragWizardRedirect />}
        />
        <Route
          path="/weiterbildung/:employeeId/antrag/:antragId/bearbeiten/:step"
          element={<AusbildungAntragWizardPage />}
        />
        <Route
          path="/weiterbildung/:employeeId/antrag/:antragId"
          element={<AusbildungAntragReviewPage />}
        />
        <Route path="/v2" element={<MitarbeitendePageV2 />} />
        <Route path="/v2/weiterbildung" element={<WeiterbildungEmployeeListPageV2 />} />
        <Route
          path="/v2/weiterbildung/:employeeId"
          element={<WeiterbildungEmployeeObjectPageV2 />}
        />
        <Route
          path="/v2/weiterbildung/:employeeId/antrag/neu"
          element={<AusbildungAntragPageV2 />}
        />
        <Route
          path="/v2/weiterbildung/:employeeId/antrag/neu/:step"
          element={<AusbildungAntragStepRedirectV2 />}
        />
        <Route
          path="/v2/weiterbildung/:employeeId/antrag/:antragId/bearbeiten"
          element={<AusbildungAntragPageV2 />}
        />
        <Route
          path="/v2/weiterbildung/:employeeId/antrag/:antragId/bearbeiten/:step"
          element={<AusbildungAntragStepRedirectV2 />}
        />
        <Route
          path="/v2/weiterbildung/:employeeId/antrag/:antragId"
          element={<AusbildungAntragReviewPageV2 />}
        />
        <Route path="/theme-lab" element={<ThemeLabIndexPage />} />
        <Route path="/theme-lab/:category" element={<ThemeLabCategoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </PrototypePersonaProvider>
    </BrowserRouter>
  )
}

export default App
