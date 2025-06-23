import type React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  Folder,
  Upload,
  FileText,
  Globe
} from 'lucide-react'
import MetallicLogo from './MetallicLogo'
import ParticleBackground from './ParticleBackground'
import UniversalProjectModal from './UniversalProjectModal'
import { detectBrowserCapabilities, getBrowserName } from '../utils/browserCompat'
import { fileSystemManager } from '../utils/fileSystem'
import type { FileItem } from './FileTree'

interface ProjectStarterProps {
  onProjectOpen: (projectData: {
    name: string
    files: FileItem[]
    totalFiles: number
  }) => void
}

const ProjectStarter: React.FC<ProjectStarterProps> = ({ onProjectOpen }) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [browserCapabilities] = useState(detectBrowserCapabilities())

  const handleProjectSelect = async (project: { id: string; name: string; path: string }) => {
    // Check if this is an uploaded project with stored data
    const storedProjectData = sessionStorage.getItem(`project_${project.id}`)

    if (storedProjectData) {
      try {
        const projectData = JSON.parse(storedProjectData)

        // Convert stored project data to FileItem format
        const files: FileItem[] = []

        for (const [filePath, content] of Object.entries(projectData.files)) {
          const pathParts = filePath.split('/')
          const fileName = pathParts[pathParts.length - 1]

          files.push({
            name: fileName,
            path: filePath,
            type: 'file',
            content: content as string,
            size: (content as string).length,
            lastModified: Date.now()
          })
        }

        onProjectOpen({
          name: project.name,
          files,
          totalFiles: files.length
        })

      } catch (error) {
        console.error('Error parsing stored project data:', error)
        handleSimpleProject(project)
      }
    } else {
      handleSimpleProject(project)
    }
  }

  const handleSimpleProject = (project: { id: string; name: string; path: string }) => {
    // Create a simple project structure for description-based projects
    const sampleFiles: FileItem[] = [
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        content: `# ${project.name}\n\nProject description and setup instructions.\n\n## Getting Started\n\n1. Open the file explorer to browse project files\n2. Use the AI assistant for code help and suggestions\n3. Use the terminal for running commands\n\nAsk the AI assistant about this project!`,
        size: 200,
        lastModified: Date.now()
      },
      {
        name: 'src',
        path: 'src',
        type: 'directory',
        children: [
          {
            name: 'main.js',
            path: 'src/main.js',
            type: 'file',
            content: `// Main entry point for ${project.name}\nconsole.log("Hello from ${project.name}!");`,
            size: 80,
            lastModified: Date.now()
          }
        ]
      }
    ]

    onProjectOpen({
      name: project.name,
      files: sampleFiles,
      totalFiles: 2
    })
  }

  const handleBrowseProject = async () => {
    try {
      const project = await fileSystemManager.openProject()

      if (project) {
        onProjectOpen({
          name: project.name,
          files: project.files,
          totalFiles: project.totalFiles
        })
      }
    } catch (error) {
      console.error('Error opening project:', error)

      // Fallback to description-based approach
      const projectInfo = prompt(
        'Describe your project:\n\n' +
        '• Project name and type\n' +
        '• Main technologies used\n' +
        '• What you need help with\n\n' +
        'Example: "React TypeScript app with Express backend"'
      )

      if (projectInfo?.trim()) {
        const projectLines = projectInfo.trim().split('\n')
        const projectName = projectLines[0].split(/[,.-]/)[0].trim() || 'My Project'

        handleSimpleProject({
          id: `desc_${Date.now()}`,
          name: projectName,
          path: `~/${projectName}`
        })
      }
    }
  }

  const quickStartProjects = [
    {
      name: 'React App',
      description: 'Modern React application with TypeScript',
      icon: '⚛️',
      action: () => handleSimpleProject({
        id: 'react_quickstart',
        name: 'React App',
        path: '~/react-app'
      })
    },
    {
      name: 'Node.js API',
      description: 'Express.js REST API backend',
      icon: '🚀',
      action: () => handleSimpleProject({
        id: 'node_quickstart',
        name: 'Node.js API',
        path: '~/node-api'
      })
    },
    {
      name: 'Python Project',
      description: 'Python application with packages',
      icon: '🐍',
      action: () => handleSimpleProject({
        id: 'python_quickstart',
        name: 'Python Project',
        path: '~/python-project'
      })
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white overflow-hidden relative">
      <ParticleBackground density={60} />

      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.06),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo and Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <MetallicLogo size={80} />
          <h1 className="text-4xl font-black mt-6 bg-gradient-to-r from-yellow-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
            Edith AI IDE
          </h1>
          <p className="text-amber-200/80 mt-2 text-lg">
            AI-Powered Development Environment
          </p>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Open Existing Project */}
          <motion.div
            className="bg-gradient-to-br from-black/60 via-zinc-900/80 to-black/60 border border-yellow-500/20 rounded-xl p-8 backdrop-blur-md cursor-pointer group"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProjectModalOpen(true)}
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FolderOpen size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-100 mb-2">Open Project</h3>
              <p className="text-amber-200/70 text-sm leading-relaxed">
                Browse and open existing projects from your file system or upload project files
              </p>
            </div>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            className="bg-gradient-to-br from-black/60 via-zinc-900/80 to-black/60 border border-yellow-500/20 rounded-xl p-8 backdrop-blur-md"
            whileHover={{ scale: 1.02, y: -4 }}
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-100 mb-2">Quick Start</h3>
              <p className="text-amber-200/70 text-sm">
                Start with a template project
              </p>
            </div>

            <div className="space-y-3">
              {quickStartProjects.map((project) => (
                <button
                  key={project.name}
                  onClick={project.action}
                  className="w-full p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{project.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-amber-100">
                        {project.name}
                      </div>
                      <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                        {project.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Browser Compatibility */}
        <motion.div
          className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 backdrop-blur-sm max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-zinc-300">
              {getBrowserName()} Compatibility
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              {browserCapabilities.hasFileSystemAccess ? (
                <CheckCircle size={12} className="text-green-400" />
              ) : (
                <AlertCircle size={12} className="text-red-400" />
              )}
              <span className="text-zinc-400">File System</span>
            </div>
            <div className="flex items-center gap-2">
              {browserCapabilities.hasDirectoryUpload ? (
                <CheckCircle size={12} className="text-green-400" />
              ) : (
                <AlertCircle size={12} className="text-red-400" />
              )}
              <span className="text-zinc-400">Folder Upload</span>
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
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-zinc-400">AI Assistant</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-amber-200/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>Powered by Gemini AI • Built for Developers</p>
        </motion.div>
      </div>

      {/* Universal Project Modal */}
      <UniversalProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSelectProject={handleProjectSelect}
        onBrowseProject={handleBrowseProject}
      />
    </div>
  )
}

export default ProjectStarter
