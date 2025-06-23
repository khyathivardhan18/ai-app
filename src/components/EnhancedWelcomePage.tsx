import type React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, FolderOpen, GitBranch, Settings, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react'
import MetallicLogo from './MetallicLogo'
import ParticleBackground from './ParticleBackground'
import UniversalProjectModal from './UniversalProjectModal'
import { useApp } from '../context/AppContext'
import { fileSystemManager } from '../utils/fileSystem'
import { detectBrowserCapabilities, getBrowserName } from '../utils/browserCompat'

const EnhancedWelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const { createChat, state, setCurrentChatId, toggleTheme } = useApp()
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [browserCapabilities] = useState(detectBrowserCapabilities())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setCurrentChatId(null)
  }, [])

  const handleOpenProject = () => {
    setIsProjectModalOpen(true)
  }

  const handleProjectSelect = async (project: { id: string; name: string; path: string }) => {
    setIsLoading(true)
    try {
      const chatId = createChat(`Project: ${project.name}`)

      // Check if this is an uploaded project with stored data
      const storedProjectData = sessionStorage.getItem(`project_${project.id}`)
      let prompt = ''

      if (storedProjectData) {
        try {
          const projectData = JSON.parse(storedProjectData)
          const fileStructure = projectData.structure.join('\n')
          const importantFiles = Object.keys(projectData.files).slice(0, 5) // Show first 5 files

          prompt = encodeURIComponent(`I've uploaded a project called "${project.name}" with the following structure:

File structure:
${fileStructure}

Sample files: ${importantFiles.join(', ')}

Please help me understand this codebase and suggest how I can:
• Analyze the project architecture
• Identify key components and files
• Find potential improvements
• Debug any issues
• Add new features

What aspects of this project would you like to explore first?`)
        } catch (error) {
          console.error('Error parsing stored project data:', error)
        }
      }

      if (!prompt) {
        prompt = encodeURIComponent(`I'm working on a project called "${project.name}" located at ${project.path}.

This is a development project that I need help with. Can you assist me with:
• Understanding the project structure
• Code analysis and improvements
• Debugging issues
• Adding new features
• Best practices and optimization

What would you like to know about this project?`)
      }

      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300))
      navigate(`/ide/${chatId}?prompt=${prompt}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBrowseProject = async () => {
    setIsLoading(true)
    try {
      const project = await fileSystemManager.openProject()

      if (project) {
        // Generate project context for AI analysis
        const projectContext = fileSystemManager.generateProjectContext(project.files)

        const chatId = createChat(`Project: ${project.name}`)
        
        // Add a small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300))
        navigate(`/ide/${chatId}?prompt=${encodeURIComponent(`I've opened a project called "${project.name}" with ${project.totalFiles} files.\n\nProject structure and key files:\n${projectContext}\n\nPlease help me understand this codebase and suggest how I can:\n• Analyze the project architecture\n• Identify key components and files\n• Find potential improvements\n• Debug any issues\n• Add new features\n\nWhat aspects of this project would you like to explore first?`)}`)
      }
    } catch (error) {
      console.error('Error opening project:', error)

      // Fallback to description-based approach if File System Access API is not supported
      const projectInfo = prompt(
        'Your browser doesn\'t support file system access. Please describe your project:\n\n' +
        '• Project name and type (e.g., "React web app", "Python API", "Node.js backend")\n' +
        '• Main technologies used\n' +
        '• What you need help with\n\n' +
        'Example: "React TypeScript app with Express backend. Need help with authentication setup."'
      )

      if (projectInfo?.trim()) {
        const projectLines = projectInfo.trim().split('\n')
        const projectName = projectLines[0].split(/[,.-]/)[0].trim() || 'Project'
        const chatId = createChat(`Project: ${projectName}`)
        
        // Add a small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300))
        navigate(`/ide/${chatId}?prompt=${encodeURIComponent(`I'm working on a project: ${projectInfo}\n\nCan you help me analyze this project and suggest next steps? Please ask me any clarifying questions about the codebase, architecture, or specific issues I'm facing.`)}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const actionButtons = [
    {
      icon: MessageCircle,
      title: "New Chat",
      description: "Start a conversation with Edith AI",
      action: async () => {
        setIsLoading(true)
        try {
          const chatId = createChat()
          // Add a small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 300))
          navigate(`/chat/${chatId}`)
        } finally {
          setIsLoading(false)
        }
      },
      color: "from-blue-600 to-cyan-700",
      delay: 0.1
    },
    {
      icon: FolderOpen,
      title: "Open File/Project",
      description: "Open IDE with file system access",
      action: handleOpenProject,
      color: "from-green-600 to-emerald-700",
      delay: 0.2
    }
  ]

  const recentChats = state.chats.slice(0, 4).map(chat => {
    const lastMessage = chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1].text.slice(0, 50) + '...'
      : 'No messages yet';

    return {
      id: chat.id,
      name: chat.title,
      path: `~/ai-projects/${chat.title.toLowerCase().replace(/\s+/g, '-')}`,
      lastMessage: lastMessage
    };
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background text-foreground overflow-hidden relative">
      <ParticleBackground density={80} />

      {/* Theme toggle button in top-right corner */}
      <motion.button
        className="fixed top-6 right-6 z-20 p-3 bg-gradient-to-r from-background/60 via-background/80 to-background/60 border border-primary/30 rounded-lg backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
        }}
      >
        {state.theme === 'dark' ? (
          <Sun size={20} className="text-amber-200/80 hover:text-yellow-300 transition-colors" />
        ) : (
          <Moon size={20} className="text-blue-200/80 hover:text-blue-300 transition-colors" />
        )}
      </motion.button>

      {/* Ultra-premium background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,215,0,0.03)_45deg,transparent_90deg,rgba(230,194,0,0.02)_135deg,transparent_180deg)] animate-spin" style={{ animationDuration: '120s' }} />

      {/* Luxury texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,215,0,0.02) 1px, transparent 1px),
                          radial-gradient(circle at 80% 80%, rgba(255,215,0,0.02) 1px, transparent 1px)`,
        backgroundSize: '100px 100px, 150px 150px'
      }} />

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and branding */}
        <motion.div
          className="flex flex-col items-center mb-12"
          variants={itemVariants}
        >
          <motion.div variants={logoVariants}>
            <MetallicLogo size={120} />
          </motion.div>

          <motion.h1
            className="text-6xl font-black mt-8 bg-gradient-to-r from-yellow-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent tracking-tight"
            variants={itemVariants}
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.3))',
              textShadow: '0 0 60px rgba(255,215,0,0.2)'
            }}
          >
            Edith AI
          </motion.h1>

          <motion.p
            className="text-amber-200/80 mt-3 text-xl font-light tracking-wide"
            style={{
              textShadow: '0 0 20px rgba(255,215,0,0.2)'
            }}
            variants={itemVariants}
          >
            AI-Powered Development Assistant
          </motion.p>

          <motion.div
            className="mt-6 px-6 py-3 bg-gradient-to-r from-black/60 via-zinc-900/80 to-black/60 rounded-full border border-yellow-500/30 backdrop-blur-sm"
            variants={itemVariants}
            style={{
              boxShadow: '0 0 30px rgba(255,215,0,0.1), inset 0 1px 1px rgba(255,215,0,0.1)'
            }}
          >
            <div className="flex items-center gap-3 text-sm text-amber-200/90">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg"
                   style={{
                     boxShadow: '0 0 15px rgba(34,197,94,0.4)'
                   }} />
              <span>Premium • Ready to Code</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex gap-6 mb-16"
          variants={itemVariants}
        >
          {actionButtons.map((button, index) => (
            <motion.div
              key={button.title}
              className="group relative"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                   style={{ backgroundImage: `linear-gradient(135deg, ${button.color.split(' ')[1]}, ${button.color.split(' ')[3]})` }} />

              <motion.div
                className={`relative bg-gradient-to-br from-background/70 via-background/80 to-background/70 border border-primary/20 rounded-xl p-8 w-56 hover:border-primary/40 transition-all duration-500 cursor-pointer backdrop-blur-md ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={button.action}
                whileHover={!isLoading ? {
                  boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 30px rgba(255,215,0,0.1)",
                  y: -8
                } : {}}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(24,24,27,0.9) 50%, rgba(0,0,0,0.8) 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
                }}
              >
                {/* Loading spinner */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}

                <motion.div
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: button.delay, duration: 0.6 }}
                >
                  <motion.div
                    className={`p-4 rounded-full mb-4 bg-gradient-to-r ${button.color} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <button.icon size={32} className="text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2 text-foreground">{button.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{button.description}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent chats section */}
        <motion.div
          className="w-full max-w-4xl"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-400 text-sm font-medium">Recent sessions</h2>
            <span className="text-slate-500 text-sm">
              {state.chats.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentChats.length > 0 ? recentChats.map((chat) => (
              <motion.div
                key={chat.id}
                className="group flex flex-col bg-gradient-to-br from-black/40 via-zinc-900/50 to-black/40 border border-yellow-500/15 rounded-xl p-5 hover:border-yellow-400/30 transition-all duration-500 cursor-pointer backdrop-blur-md"
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.05)'
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Navigate to IDE for project chats, chat for regular chats
                  const isProjectChat = chat.name.startsWith('Project:') || chat.name.startsWith('Repo:')
                  navigate(isProjectChat ? `/ide/${chat.id}` : `/chat/${chat.id}`)
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 group-hover:from-yellow-300 group-hover:to-amber-400 transition-all duration-300 shadow-lg" style={{
                    boxShadow: '0 0 10px rgba(255,215,0,0.4)'
                  }} />
                  <span className="text-amber-100/90 group-hover:text-amber-50 transition-colors font-semibold">
                    {chat.name}
                  </span>
                </div>
                <p className="text-amber-200/60 text-xs group-hover:text-amber-200/80 transition-colors mb-2 leading-relaxed">
                  {chat.lastMessage}
                </p>
                <span className="text-amber-300/40 text-xs group-hover:text-amber-300/60 transition-colors font-mono">
                  {chat.path}
                </span>
              </motion.div>
            )) : (
              <motion.div
                className="col-span-2 text-center py-12 text-amber-200/60"
                variants={itemVariants}
              >
                <MessageCircle size={40} className="mx-auto mb-4 opacity-60 text-yellow-400" style={{
                  filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.3))'
                }} />
                <p className="text-lg font-light">No recent sessions. Start coding with AI assistance!</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Ultra-Premium Footer */}
        <motion.div
          className="absolute bottom-8 left-8 text-amber-200/50 text-sm flex items-center gap-4 font-light tracking-wide"
          variants={itemVariants}
          style={{
            textShadow: '0 0 10px rgba(255,215,0,0.1)'
          }}
        >
          <span className="font-medium">Edith AI</span>
          <div className="w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg" />
          <span>v1.0.0</span>
          <div className="w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg" />
          <span className="text-xs opacity-80">Powered by Edith AI</span>
        </motion.div>

        {/* Browser Compatibility Status */}
        <motion.div
          className="absolute bottom-8 right-8 text-amber-200/50 text-xs flex items-center gap-2 group"
          variants={itemVariants}
          style={{
            textShadow: '0 0 10px rgba(255,215,0,0.1)'
          }}
          title={browserCapabilities.hasFileSystemAccess 
            ? "Your browser supports full file system access! 🎉" 
            : "Demo mode: You can still use all AI features with sample files"
          }
        >
          <span className="font-medium">{getBrowserName()}</span>
          <div className="flex items-center gap-1">
            {browserCapabilities.hasFileSystemAccess ? (
              <CheckCircle size={12} className="text-green-400" />
            ) : browserCapabilities.hasDirectoryUpload ? (
              <CheckCircle size={12} className="text-yellow-400" />
            ) : browserCapabilities.hasFileApi ? (
              <CheckCircle size={12} className="text-blue-400" />
            ) : (
              <CheckCircle size={12} className="text-green-400" />
            )}
            <span className="opacity-80">
              {browserCapabilities.hasFileSystemAccess ? 'Full Access' :
               browserCapabilities.hasDirectoryUpload ? 'Demo Mode' :
               browserCapabilities.hasFileApi ? 'Demo Mode' : 'Demo Mode'}
            </span>
          </div>
        </motion.div>
      </motion.div>

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

export default EnhancedWelcomePage
