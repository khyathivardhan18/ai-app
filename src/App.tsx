import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import EnhancedWelcomePage from './components/EnhancedWelcomePage'
import ChatInterface from './components/ChatInterface'
import SettingsPage from './components/SettingsPage'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<EnhancedWelcomePage />} />
          <Route path="/chat/:chatId" element={<ChatInterface />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Fallback route */}
          <Route path="*" element={<EnhancedWelcomePage />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
