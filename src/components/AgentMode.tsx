import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, Play, Square, FileText, FolderOpen, CheckCircle, AlertCircle, Clock, Diff } from 'lucide-react'

interface FileChange {
  path: string
  action: 'create' | 'modify' | 'delete'
  content?: string
  diff?: string
  status: 'pending' | 'applied' | 'rejected'
}

interface AgentTask {
  id: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  files: FileChange[]
  createdAt: Date
  completedAt?: Date
}

interface AgentModeProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (task: AgentTask) => void
  projectPath?: string
}

const AgentMode: React.FC<AgentModeProps> = ({
  isOpen,
  onClose,
  onComplete,
  projectPath
}) => {
  const [instruction, setInstruction] = useState('')
  const [currentTask, setCurrentTask] = useState<AgentTask | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRunning) {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isRunning) {
        handleStartTask()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isRunning, onClose])

  const handleStartTask = async () => {
    if (!instruction.trim() || isRunning) return

    setIsRunning(true)
    setProgress('Analyzing project structure...')

    const task: AgentTask = {
      id: `task_${Date.now()}`,
      description: instruction.trim(),
      status: 'running',
      files: [],
      createdAt: new Date()
    }

    setCurrentTask(task)

    // Simulate agent processing with realistic steps
    const steps = [
      { message: 'Analyzing project structure...', duration: 1500 },
      { message: 'Reading relevant files...', duration: 2000 },
      { message: 'Planning changes...', duration: 1000 },
      { message: 'Generating code modifications...', duration: 3000 },
      { message: 'Preparing diff review...', duration: 1000 }
    ]

    for (const step of steps) {
      setProgress(step.message)
      await new Promise(resolve => setTimeout(resolve, step.duration))
    }

    // Generate mock file changes
    const mockFiles: FileChange[] = [
      {
        path: 'src/components/NewComponent.tsx',
        action: 'create',
        content: '// Generated component code...',
        status: 'pending'
      },
      {
        path: 'src/App.tsx',
        action: 'modify',
        diff: '+ import NewComponent from "./components/NewComponent"\n+ <NewComponent />',
        status: 'pending'
      }
    ]

    const completedTask: AgentTask = {
      ...task,
      status: 'completed',
      files: mockFiles,
      completedAt: new Date()
    }

    setCurrentTask(completedTask)
    setIsRunning(false)
    setProgress('')
  }

  const handleApplyChanges = () => {
    if (currentTask) {
      const updatedTask = {
        ...currentTask,
        files: currentTask.files.map(f => ({ ...f, status: 'applied' as const }))
      }
      setCurrentTask(updatedTask)
      onComplete(updatedTask)
      setTimeout(() => {
        onClose()
        setCurrentTask(null)
        setInstruction('')
      }, 1000)
    }
  }

  const handleRejectChanges = () => {
    if (currentTask) {
      setCurrentTask({
        ...currentTask,
        files: currentTask.files.map(f => ({ ...f, status: 'rejected' as const }))
      })
    }
  }

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />
      case 'running':
        return <Play size={16} className="text-blue-400 animate-pulse" />
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />
      case 'failed':
        return <AlertCircle size={16} className="text-red-400" />
    }
  }

  const getActionIcon = (action: FileChange['action']) => {
    switch (action) {
      case 'create':
        return <FileText size={14} className="text-green-400" />
      case 'modify':
        return <Diff size={14} className="text-blue-400" />
      case 'delete':
        return <X size={14} className="text-red-400" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isRunning ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div
              className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <Bot size={20} className="text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Agent Mode</h3>
                    <p className="text-xs text-zinc-400">
                      {projectPath ? `Project: ${projectPath}` : 'Multi-file editing assistant'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={!isRunning ? onClose : undefined}
                  disabled={isRunning}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? <Square size={16} /> : <X size={16} />}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {!currentTask ? (
                  /* Input Phase */
                  <div className="p-6 flex-1">
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">What would you like me to do?</h4>
                      <p className="text-zinc-400 text-sm">
                        I can help you create, modify, or refactor code across multiple files.
                      </p>
                    </div>

                    <textarea
                      ref={inputRef}
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Example: Create a new React component for user authentication with form validation, and integrate it into the main app..."
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-zinc-400 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                      rows={6}
                      disabled={isRunning}
                    />

                    <div className="flex items-center justify-between mt-6">
                      <div className="text-xs text-zinc-500">
                        ⌘+Enter to start • The agent will create a plan and show you all changes before applying
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          disabled={isRunning}
                          className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStartTask}
                          disabled={!instruction.trim() || isRunning}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isRunning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Bot size={16} />
                              Start Agent
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Task Progress & Results */
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Task Header */}
                    <div className="p-4 border-b border-zinc-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(currentTask.status)}
                        <h4 className="text-white font-medium">
                          {currentTask.status === 'running' ? 'Working...' : 'Task Complete'}
                        </h4>
                      </div>
                      <p className="text-zinc-400 text-sm">{currentTask.description}</p>
                      {progress && (
                        <p className="text-blue-400 text-sm mt-2 flex items-center gap-2">
                          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                          {progress}
                        </p>
                      )}
                    </div>

                    {/* File Changes */}
                    {currentTask.files.length > 0 && (
                      <div className="flex-1 overflow-y-auto p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <FolderOpen size={16} />
                          Proposed Changes ({currentTask.files.length} files)
                        </h5>

                        <div className="space-y-3">
                          {currentTask.files.map((file, index) => (
                            <motion.div
                              key={`${file.path}-${file.action}`}
                              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                {getActionIcon(file.action)}
                                <span className="text-white font-mono text-sm">{file.path}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  file.action === 'create' ? 'bg-green-500/20 text-green-400' :
                                  file.action === 'modify' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {file.action}
                                </span>
                              </div>

                              {file.diff && (
                                <pre className="text-xs text-zinc-300 bg-zinc-900/50 p-3 rounded border overflow-x-auto">
                                  {file.diff}
                                </pre>
                              )}

                              {file.content && (
                                <div className="text-xs text-zinc-400 mt-2">
                                  New file • {file.content.length} characters
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {currentTask.status === 'completed' && (
                      <div className="p-4 border-t border-zinc-700/50">
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={handleRejectChanges}
                            className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                          >
                            Reject All
                          </button>
                          <button
                            onClick={handleApplyChanges}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Apply Changes
                          </button>
                        </div>
                      </div>
                    )}
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

export default AgentMode
