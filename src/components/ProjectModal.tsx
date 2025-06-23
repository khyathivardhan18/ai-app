import type React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Folder, Clock, Plus } from 'lucide-react'
import { fileSystemManager } from '../utils/fileSystem'

interface Project {
  id: string
  name: string
  path: string
  lastOpened: Date
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (project: Project) => void
  onBrowseProject: () => void
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onBrowseProject
}) => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

  useEffect(() => {
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
          lastOpened: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          id: '2',
          name: 'api-backend',
          path: '~/Downloads/api-backend',
          lastOpened: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: '3',
          name: 'mobile-app',
          path: '~/Downloads/mobile-app',
          lastOpened: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
          id: '4',
          name: 'portfolio-site',
          path: '~/Desktop/portfolio-site',
          lastOpened: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
        },
        {
          id: '5',
          name: 'job-api',
          path: '~/Documents/icom-apple-CloudDocs/job-api',
          lastOpened: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
        }
      ])
    }
  }, [])

  const handleProjectSelect = (project: Project) => {
    onSelectProject(project)
    onClose()
  }

  const handleBrowseClick = async () => {
    try {
      const project = await fileSystemManager.openProject()

      if (project) {
        // Convert FileSystemManager project to ProjectModal project format
        const modalProject = {
          id: `fs_${Date.now()}`,
          name: project.name,
          path: project.path || `~/${project.name}`,
          lastOpened: new Date()
        }

        // Save to recent projects
        const savedProjects = localStorage.getItem('edith-recent-projects')
        const existingProjects = savedProjects ? JSON.parse(savedProjects) : []
        const updatedProjects = [modalProject, ...existingProjects.filter((p: { name: string }) => p.name !== project.name)].slice(0, 10)
        localStorage.setItem('edith-recent-projects', JSON.stringify(updatedProjects))

        onSelectProject(modalProject)
        onClose()
      }
    } catch (error) {
      console.error('Error opening project:', error)
      // Fallback to the original method
      onBrowseProject()
      onClose()
    }
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
              className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-2xl"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
                <div>
                  <h2 className="text-xl font-semibold text-white">Open Project</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Action Buttons - Similar to Cursor */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={handleBrowseClick}
                    className="flex flex-col items-center gap-3 p-6 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600/50 rounded-lg transition-all duration-200"
                  >
                    <Folder size={24} className="text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-300">Open project</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-3 p-6 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600/50 rounded-lg transition-all duration-200 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm font-medium text-zinc-300">Clone repo</span>
                  </button>

                  <button
                    className="flex flex-col items-center gap-3 p-6 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600/50 rounded-lg transition-all duration-200 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-sm font-medium text-zinc-300">Connect via SSH</span>
                  </button>
                </div>

                {/* Recent Projects */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-400">Recent projects</h3>
                    <button className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
                      View all ({recentProjects.length})
                    </button>
                  </div>

                  <div className="space-y-1">
                    {recentProjects.map((project) => (
                      <motion.button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg transition-all duration-200 text-left group"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm group-hover:text-zinc-100 transition-colors">
                            {project.name}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors ml-4 shrink-0">
                          {project.path}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {recentProjects.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      <Folder size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No recent projects found</p>
                      <p className="text-sm mt-1">Open a project to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProjectModal
