// Browser compatibility utilities for cross-browser support

export interface BrowserCapabilities {
  hasFileSystemAccess: boolean
  hasFileApi: boolean
  hasDirectoryUpload: boolean
  supportsDragDrop: boolean
}

export const detectBrowserCapabilities = (): BrowserCapabilities => {
  const hasFileSystemAccess = 'showDirectoryPicker' in window
  const hasFileApi = 'File' in window && 'FileReader' in window
  const hasDirectoryUpload = 'webkitdirectory' in document.createElement('input')
  const supportsDragDrop = 'ondrop' in window

  return {
    hasFileSystemAccess,
    hasFileApi,
    hasDirectoryUpload,
    supportsDragDrop
  }
}

export const getBrowserName = (): string => {
  const userAgent = navigator.userAgent

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome'
  if (userAgent.includes('Edg')) return 'Edge'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Opera')) return 'Opera'

  return 'Unknown'
}

export const getOptimalProjectUploadMethod = (): 'filesystem' | 'directory' | 'files' | 'description' => {
  const capabilities = detectBrowserCapabilities()

  if (capabilities.hasFileSystemAccess) return 'filesystem'
  if (capabilities.hasDirectoryUpload) return 'directory'
  if (capabilities.hasFileApi) return 'files'
  return 'description'
}

export const isModernBrowser = (): boolean => {
  const capabilities = detectBrowserCapabilities()
  return capabilities.hasFileApi && capabilities.supportsDragDrop
}

// Browser compatibility utilities
export interface BrowserInfo {
  name: string
  version: string
  isSupported: boolean
  features: {
    fileSystemAccess: boolean
    clipboard: boolean
    webWorkers: boolean
    serviceWorkers: boolean
    indexedDB: boolean
    localStorage: boolean
    sessionStorage: boolean
  }
}

export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Edg')) {
    name = 'Edge'
    const match = userAgent.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    name = 'Internet Explorer'
    const match = userAgent.match(/MSIE (\d+)/) || userAgent.match(/Trident\/\d+\.\d+; rv:(\d+)/)
    version = match ? match[1] : 'Unknown'
  }

  // Check feature support
  const features = {
    fileSystemAccess: 'showDirectoryPicker' in window && 'FileSystemDirectoryHandle' in window,
    clipboard: 'clipboard' in navigator && 'writeText' in navigator.clipboard,
    webWorkers: typeof Worker !== 'undefined',
    serviceWorkers: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window
  }

  // Determine if browser is supported
  const isSupported = features.localStorage && features.sessionStorage && 
                     (features.fileSystemAccess || name === 'Firefox' || name === 'Safari')

  return {
    name,
    version,
    isSupported,
    features
  }
}

export function showBrowserWarning(): boolean {
  const browser = detectBrowser()
  
  // Show warning for unsupported browsers
  if (!browser.isSupported) {
    return true
  }
  
  // Show warning for browsers without File System Access API
  if (!browser.features.fileSystemAccess) {
    return true
  }
  
  return false
}

export function getBrowserRecommendations(): string[] {
  const browser = detectBrowser()
  const recommendations: string[] = []

  // Only show recommendations if there are actual limitations
  if (!browser.features.fileSystemAccess && browser.name !== 'Chrome' && browser.name !== 'Edge') {
    recommendations.push('Switch to Chrome or Edge for real file system access')
  }

  if (!browser.features.clipboard && browser.name !== 'Chrome' && browser.name !== 'Edge') {
    recommendations.push('Use Chrome or Edge for better copy/paste support')
  }

  // Add positive recommendations for supported browsers
  if (browser.features.fileSystemAccess) {
    recommendations.push('✅ Full file system access available')
  }

  if (browser.features.clipboard) {
    recommendations.push('✅ Copy/paste functionality available')
  }

  return recommendations
}

// Feature detection utilities
export function isFeatureSupported(feature: keyof BrowserInfo['features']): boolean {
  const browser = detectBrowser()
  return browser.features[feature]
}

// Fallback implementations
export async function safeClipboardWrite(text: string): Promise<boolean> {
  try {
    if (isFeatureSupported('clipboard')) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (error) {
    console.error('Clipboard write failed:', error)
    return false
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('localStorage get failed:', error)
    return null
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error('localStorage set failed:', error)
    return false
  }
}

// Browser-specific workarounds
export function applyBrowserWorkarounds(): void {
  const browser = detectBrowser()
  
  // Safari-specific fixes
  if (browser.name === 'Safari') {
    // Fix for Safari flexbox issues
    const style = document.createElement('style')
    style.textContent = `
      .flex { display: -webkit-flex; display: flex; }
      .flex-1 { -webkit-flex: 1; flex: 1; }
      .flex-col { -webkit-flex-direction: column; flex-direction: column; }
      .flex-row { -webkit-flex-direction: row; flex-direction: row; }
    `
    document.head.appendChild(style)
  }
  
  // Firefox-specific fixes
  if (browser.name === 'Firefox') {
    // Fix for Firefox scrollbar styling
    const style = document.createElement('style')
    style.textContent = `
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #374151; }
      ::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
    `
    document.head.appendChild(style)
  }
}
