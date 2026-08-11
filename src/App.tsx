import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrototypePersonaProvider } from './context/PrototypePersonaContext'
import { AusbildungAntragReviewPage } from './pages/AusbildungAntragReviewPage'
import {
  AusbildungAntragWizardPage,
  AusbildungAntragWizardRedirect,
} from './pages/AusbildungAntragWizardPage'
import { MitarbeitendePage } from './pages/MitarbeitendePage'
import { WeiterbildungEmployeeListPage } from './pages/WeiterbildungEmployeeListPage'
import { WeiterbildungEmployeeObjectPage } from './pages/WeiterbildungEmployeeObjectPage'

function App() {
  return (
    <BrowserRouter>
      <PrototypePersonaProvider>
      <Routes>
        <Route path="/" element={<MitarbeitendePage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </PrototypePersonaProvider>
    </BrowserRouter>
  )
}

export default App
