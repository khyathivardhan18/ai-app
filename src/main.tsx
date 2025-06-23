// Polyfills for browser compatibility
import 'core-js/stable'
import 'whatwg-fetch'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { applyBrowserWorkarounds } from './utils/browserCompat.ts'
import './index.css'

// Apply browser-specific workarounds
applyBrowserWorkarounds()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
