import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import EnhancedWelcomePage from './components/EnhancedWelcomePage'
import IDELayout from './components/IDELayout'
import SettingsPage from './components/SettingsPage'

const AppContent: React.FC = () => {
  const { state } = useApp()

  return (
    <div className={state.theme}>
      <Router>
        <Routes>
          <Route path="/" element={<EnhancedWelcomePage />} />
          <Route path="/chat/:chatId" element={<IDELayout />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Fallback route */}
          <Route path="*" element={<EnhancedWelcomePage />} />
        </Routes>
      </Router>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
