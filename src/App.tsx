import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { NewPatientFlowScreen } from './screens/NewPatientFlowScreen'
import { ProcedureModeScreen } from './screens/ProcedureModeScreen'
import { TraySetupScreen } from './screens/TraySetupScreen'
import { VoiceOverlayScreen } from './screens/VoiceOverlayScreen'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ProcedureModeScreen />} />
        <Route path="/tray-setup" element={<TraySetupScreen />} />
        <Route path="/procedure-mode" element={<ProcedureModeScreen />} />
        <Route path="/voice-overlay" element={<VoiceOverlayScreen />} />
        <Route path="/new-patient" element={<NewPatientFlowScreen />} />
        <Route path="*" element={<Navigate to="/procedure-mode" replace />} />
      </Route>
    </Routes>
  )
}

export default App
