import React from 'react'
import { AlertTriangle, Chrome, Globe, Info, CheckCircle } from 'lucide-react'
import { detectBrowser, getBrowserRecommendations } from '../utils/browserCompat'

interface BrowserCompatibilityWarningProps {
  onDismiss?: () => void
  show?: boolean
}

const BrowserCompatibilityWarning: React.FC<BrowserCompatibilityWarningProps> = ({ 
  onDismiss, 
  show = true 
}) => {
  const browser = detectBrowser()
  const recommendations = getBrowserRecommendations()
  
  if (!show || (browser.isSupported && browser.features.fileSystemAccess)) {
    return null
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            Browser Compatibility Notice
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            You're using <strong>{browser.name} {browser.version}</strong>. 
            {!browser.features.fileSystemAccess 
              ? ' Your browser doesn\'t support the File System Access API, so file operations will be limited to demo files.'
              : ' Some features may be limited in your browser.'
            }
          </p>
          
          <div className="bg-white dark:bg-zinc-800 rounded p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                What's Available:
              </span>
            </div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Demo project files (HTML, CSS, JS, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                File editing and AI assistance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Chat functionality
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Code analysis and suggestions
              </li>
            </ul>
          </div>

          {recommendations.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recommendations:
                </span>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Chrome className="w-3 h-3 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium"
            >
              Dismiss this notice
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrowserCompatibilityWarning 