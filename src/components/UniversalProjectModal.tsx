import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Folder, Upload, FileText, Globe, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { detectBrowserCapabilities, getBrowserName, getOptimalProjectUploadMethod } from '../utils/browserCompat'
import { fileSystemManager } from '../utils/fileSystem'

// Type declaration for webkitdirectory attribute
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string
    directory?: string
  }
}

interface Project {
  id: string
  name: string
  path: string
  lastOpened: Date
}

interface UniversalProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (project: Project) => void
  onBrowseProject: () => void
}

const UniversalProjectModal: React.FC<UniversalProjectModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onBrowseProject
}) => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [uploadMethod, setUploadMethod] = useState<'filesystem' | 'directory' | 'files' | 'description'>('filesystem')
  const [browserCapabilities, setBrowserCapabilities] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const directoryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const capabilities = detectBrowserCapabilities()
      setBrowserCapabilities(capabilities)
      setUploadMethod(getOptimalProjectUploadMethod())

      // Load recent projects from localStorage
      const saved = localStorage.getItem('edith-recent-projects')
      if (saved) {
        try {
          const projects = JSON.parse(saved).map((p: { id: string; name: string; path: string; lastOpened: string }) => ({
            ...p,
            lastOpened: new Date(p.lastOpened)
          }))
          setRecentProjects(projects)
        } catch (error) {
          console.error('Failed to load recent projects:', error)
        }
      } else {
        // Default recent projects for demo
        setRecentProjects([
          {
            id: '1',
            name: 'react-dashboard',
            path: '~/Documents/Projects/react-dashboard',
            lastOpened: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: '2',
            name: 'api-backend',
            path: '~/Downloads/api-backend',
            lastOpened: new Date(Date.now() - 1000 * 60 * 60 * 2)
          }
        ])
      }
    }
  }, [isOpen])

  const handleFileSystemAccess = async () => {
    try {
      setIsUploading(true)
      const project = await fileSystemManager.openProject()

      if (project) {
        const modalProject = {
          id: `fs_${Date.now()}`,
          name: project.name,
          path: project.path || `~/${project.name}`,
          lastOpened: new Date()
        }

        saveToRecentProjects(modalProject)
        onSelectProject(modalProject)
        onClose()
      }
    } catch (error) {
      console.error('Error opening project:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDirectoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      processUploadedFiles(files)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      processUploadedFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      setIsUploading(true)
      processUploadedFiles(files)
    }
  }

  const processUploadedFiles = async (files: FileList) => {
    try {
      // Extract project name from first file path
      const firstFile = files[0]
      const pathParts = firstFile.webkitRelativePath ? firstFile.webkitRelativePath.split('/') : firstFile.name.split('/')
      const projectName = pathParts[0] || 'Uploaded Project'

      // Process files and create project structure
      const fileContents: { [key: string]: string } = {}
      const validFiles: string[] = []

      for (let i = 0; i < Math.min(files.length, 100); i++) { // Limit to 100 files for performance
        const file = files[i]
        if (file.size < 1024 * 1024 && isTextFile(file.name)) { // Only process small text files
          try {
            const content = await file.text()
            const relativePath = file.webkitRelativePath || file.name
            fileContents[relativePath] = content
            validFiles.push(relativePath)
          } catch (error) {
            console.warn(`Failed to read file ${file.name}:`, error)
          }
        }
      }

      const modalProject = {
        id: `upload_${Date.now()}`,
        name: projectName,
        path: `~/uploaded/${projectName}`,
        lastOpened: new Date()
      }

      // Store file contents in session storage for AI analysis
      sessionStorage.setItem(`project_${modalProject.id}`, JSON.stringify({
        files: fileContents,
        structure: validFiles
      }))

      saveToRecentProjects(modalProject)
      onSelectProject(modalProject)
      onClose()
    } catch (error) {
      console.error('Error processing uploaded files:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const isTextFile = (filename: string): boolean => {
    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.css', '.html', '.json', '.md', '.txt', '.yml', '.yaml', '.xml', '.sql']
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  const saveToRecentProjects = (project: Project) => {
    const savedProjects = localStorage.getItem('edith-recent-projects')
    const existingProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = [project, ...existingProjects.filter((p: { name: string }) => p.name !== project.name)].slice(0, 10)
    localStorage.setItem('edith-recent-projects', JSON.stringify(updatedProjects))
  }

  const handleDescriptionFallback = () => {
    onBrowseProject()
    onClose()
  }

  const formatLastOpened = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`
    }
    return `${diffDays} days ago`
  }

  const getUploadMethodInfo = () => {
    const browserName = getBrowserName()

    switch (uploadMethod) {
      case 'filesystem':
        return {
          title: 'Browse Project Folder',
          description: 'Select any folder on your system (Chrome/Edge)',
          icon: Folder,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20'
        }
      case 'directory':
        return {
          title: 'Upload Project Folder',
          description: `Upload folder contents (${browserName})`,
          icon: Upload,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20'
        }
      case 'files':
        return {
          title: 'Upload Project Files',
          description: 'Upload individual files from your project',
          icon: FileText,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20'
        }
      case 'description':
        return {
          title: 'Describe Your Project',
          description: 'Tell me about your project instead',
          icon: Globe,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20'
        }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div
              className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
                <div>
                  <h2 className="text-xl font-semibold text-white">Open Project</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Browser: {getBrowserName()} • Method: {getUploadMethodInfo().title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Upload Area */}
              <div className="p-6">
                {/* Browser Compatibility Info */}
                {browserCapabilities && (
                  <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-sm font-medium text-zinc-300">Browser Capabilities</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {browserCapabilities.hasFileSystemAccess ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <AlertCircle size={12} className="text-red-400" />
                        )}
                        <span className="text-zinc-400">File System Access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {browserCapabilities.hasDirectoryUpload ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <AlertCircle size={12} className="text-red-400" />
                        )}
                        <span className="text-zinc-400">Directory Upload</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {browserCapabilities.supportsDragDrop ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <AlertCircle size={12} className="text-red-400" />
                        )}
                        <span className="text-zinc-400">Drag & Drop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {browserCapabilities.hasFileApi ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <AlertCircle size={12} className="text-red-400" />
                        )}
                        <span className="text-zinc-400">File API</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-zinc-600 hover:border-zinc-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-zinc-400">Processing project files...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      {(() => {
                        const uploadInfo = getUploadMethodInfo()
                        const IconComponent = uploadInfo.icon
                        return (
                          <>
                            <div className={`w-16 h-16 ${uploadInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                              <IconComponent size={32} className={uploadInfo.color} />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">
                              {uploadInfo.title}
                            </h3>
                            <p className="text-zinc-400 mb-6">
                              {uploadInfo.description}
                            </p>
                          </>
                        )
                      })()}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* File System Access (Chrome/Edge) */}
                        {browserCapabilities?.hasFileSystemAccess && (
                          <button
                            onClick={handleFileSystemAccess}
                            className="flex flex-col items-center gap-2 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all"
                          >
                            <Folder size={20} className="text-green-400" />
                            <span className="text-sm text-green-300 font-medium">Browse Folder</span>
                            <span className="text-xs text-green-400/70">Full access</span>
                          </button>
                        )}

                        {/* Directory Upload (Firefox, Safari) */}
                        {browserCapabilities?.hasDirectoryUpload && (
                          <>
                            <input
                              ref={directoryInputRef}
                              type="file"
                              webkitdirectory=""
                              directory=""
                              multiple
                              onChange={handleDirectoryUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => directoryInputRef.current?.click()}
                              className="flex flex-col items-center gap-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all"
                            >
                              <Upload size={20} className="text-blue-400" />
                              <span className="text-sm text-blue-300 font-medium">Upload Folder</span>
                              <span className="text-xs text-blue-400/70">Select folder</span>
                            </button>
                          </>
                        )}

                        {/* File Upload (All browsers) */}
                        {browserCapabilities?.hasFileApi && (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.css,.html,.json,.md,.txt,.yml,.yaml,.xml,.sql"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex flex-col items-center gap-2 p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all"
                            >
                              <FileText size={20} className="text-purple-400" />
                              <span className="text-sm text-purple-300 font-medium">Upload Files</span>
                              <span className="text-xs text-purple-400/70">Multiple files</span>
                            </button>
                          </>
                        )}

                        {/* Description Fallback (All browsers) */}
                        <button
                          onClick={handleDescriptionFallback}
                          className="flex flex-col items-center gap-2 p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg transition-all"
                        >
                          <Globe size={20} className="text-orange-400" />
                          <span className="text-sm text-orange-300 font-medium">Describe Project</span>
                          <span className="text-xs text-orange-400/70">Text input</span>
                        </button>
                      </div>

                      {browserCapabilities?.supportsDragDrop && (
                        <p className="text-xs text-zinc-500 mt-4">
                          💡 Tip: You can also drag and drop files or folders here
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Projects */}
                {recentProjects.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-zinc-400">Recent projects</h3>
                      <button className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
                        View all ({recentProjects.length})
                      </button>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {recentProjects.map((project) => (
                        <motion.button
                          key={project.id}
                          onClick={() => onSelectProject(project)}
                          className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-all duration-200 text-left group"
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm group-hover:text-zinc-100 transition-colors">
                              {project.name}
                            </div>
                            <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                              {formatLastOpened(project.lastOpened)}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors ml-4 shrink-0">
                            {project.path}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UniversalProjectModal
