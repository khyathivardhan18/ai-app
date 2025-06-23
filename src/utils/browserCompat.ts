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
