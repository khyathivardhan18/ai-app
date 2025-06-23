import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'
import EnhancedWelcomePage from './components/EnhancedWelcomePage'
import IDELayout from './components/IDELayout'
import ChatInterface from './components/ChatInterface'
import SettingsPage from './components/SettingsPage'

const AppContent: React.FC = () => {
  const { state } = useApp()

  // Apply theme to document body
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(state.theme)
  }, [state.theme])

  return (
    <div className={state.theme}>
      <Routes>
        <Route path="/" element={<EnhancedWelcomePage />} />
        <Route path="/chat/:chatId" element={<ChatInterface />} />
        <Route path="/ide/:chatId" element={<IDELayout />} />
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
