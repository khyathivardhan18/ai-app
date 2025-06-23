import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'
import EnhancedWelcomePage from './components/EnhancedWelcomePage'
import IDELayout from './components/IDELayout'
import SettingsPage from './components/SettingsPage'

const AppContent: React.FC = () => {
  const { state } = useApp()

  return (
    <div className={state.theme}>
      <Routes>
        <Route path="/" element={<EnhancedWelcomePage />} />
        <Route path="/chat/:chatId" element={<IDELayout />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Fallback route */}
        <Route path="*" element={<EnhancedWelcomePage />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
