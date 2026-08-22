import { Navigate, Route, Routes } from 'react-router-dom'
import { RoundScreen } from './features/game/RoundScreen'
import { SummaryScreen } from './features/results/SummaryScreen'
import { StartScreen } from './features/start/StartScreen'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/play" element={<RoundScreen />} />
      <Route path="/summary" element={<SummaryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
