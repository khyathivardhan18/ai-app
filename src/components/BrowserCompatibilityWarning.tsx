import React from 'react'
import { AlertTriangle, Chrome, Globe, Info, CheckCircle, X } from 'lucide-react'
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
  
  // Don't show warning if browser is fully supported
  if (!show || (browser.isSupported && browser.features.fileSystemAccess)) {
    return null
  }

  // Only show warning if there are actual limitations
  const hasLimitations = !browser.features.fileSystemAccess || !browser.features.clipboard
  if (!hasLimitations) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Browser Information
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            You're using <strong>{browser.name} {browser.version}</strong>. 
            {browser.features.fileSystemAccess 
              ? ' Your browser supports all features! 🎉'
              : ' You can still use all AI features with demo files.'
            }
          </p>
          
          <div className="bg-white dark:bg-zinc-800 rounded p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Available Features:
              </span>
            </div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                AI chat and code assistance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                File editing and syntax highlighting
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Code analysis and suggestions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Demo project files (HTML, CSS, JS, etc.)
              </li>
            </ul>
          </div>

          {recommendations.length > 0 && recommendations.some(rec => !rec.startsWith('✅')) && (
            <div className="bg-white dark:bg-zinc-800 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  For Enhanced Experience:
                </span>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {recommendations
                  .filter(rec => !rec.startsWith('✅'))
                  .map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Chrome className="w-3 h-3 text-blue-500" />
                      {rec}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrowserCompatibilityWarning 