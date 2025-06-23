import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Terminal, Play, Square, RefreshCw, Zap } from 'lucide-react'

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error' | 'ai-suggestion'
  content: string
  timestamp: Date
}

interface TerminalPanelProps {
  onClose: () => void
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ onClose }) => {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeLine: TerminalLine = {
      id: `line_${Date.now()}`,
      type: 'output',
      content: 'Gemini AI Terminal - AI-powered command assistant',
      timestamp: new Date()
    }
    setLines([welcomeLine])
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date()
    }
    setLines(prev => [...prev, newLine])
  }

  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    // Add command to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Add command line
    addLine('command', `$ ${command}`)
    setIsRunning(true)

    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // Handle special commands
      if (command === 'clear') {
        setLines([])
        setIsRunning(false)
        return
      }

      if (command === 'help') {
        addLine('output', 'Available commands:')
        addLine('output', '  clear    - Clear terminal')
        addLine('output', '  help     - Show this help')
        addLine('output', '  ls       - List files')
        addLine('output', '  pwd      - Print working directory')
        addLine('output', '  npm      - Node package manager')
        addLine('output', '  git      - Git version control')
        addLine('output', '  echo     - Display text')
        addLine('ai-suggestion', '💡 Tip: Ask AI to suggest commands for your task!')
        setIsRunning(false)
        return
      }

      if (command.startsWith('echo ')) {
        const text = command.substring(5)
        addLine('output', text)
        setIsRunning(false)
        return
      }

      if (command === 'pwd') {
        addLine('output', '/workspace/current-project')
        setIsRunning(false)
        return
      }

      if (command === 'ls' || command === 'ls -la') {
        addLine('output', 'src/')
        addLine('output', 'package.json')
        addLine('output', 'README.md')
        addLine('output', 'node_modules/')
        addLine('output', '.git/')
        addLine('output', '.gitignore')
        setIsRunning(false)
        return
      }

      if (command.startsWith('npm ')) {
        addLine('output', 'npm WARN This is a simulated terminal')
        addLine('output', 'npm info Using npm@9.0.0')
        addLine('output', `npm info Command: ${command}`)
        addLine('ai-suggestion', '💡 Ask AI for help with npm commands and package management!')
        setIsRunning(false)
        return
      }

      if (command.startsWith('git ')) {
        addLine('output', `git: simulated command '${command}'`)
        addLine('output', 'On branch main')
        addLine('output', 'Your branch is up to date with \'origin/main\'.')
        addLine('ai-suggestion', '💡 Need help with Git? Ask AI for Git workflows and commands!')
        setIsRunning(false)
        return
      }

      // Default response for unknown commands
      addLine('error', `Command not found: ${command}`)
      addLine('ai-suggestion', '💡 Ask AI: "What command should I use to..."')

    } catch (error) {
      addLine('error', `Error executing command: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentCommand.trim() && !isRunning) {
        executeCommand(currentCommand.trim())
        setCurrentCommand('')
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCurrentCommand(commandHistory[newIndex])
        }
      }
    }
  }

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-cyan-400'
      case 'output':
        return 'text-gray-300'
      case 'error':
        return 'text-red-400'
      case 'ai-suggestion':
        return 'text-blue-400'
      default:
        return 'text-gray-300'
    }
  }

  const clearTerminal = () => {
    setLines([])
  }

  const suggestCommand = () => {
    addLine('ai-suggestion', '💡 AI Suggestions: Try "npm install", "git status", "ls -la", or ask AI for specific help!')
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 text-white">
      {/* Terminal Header */}
      <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <Terminal size={16} />
          <span className="font-medium">Terminal</span>
          {isRunning && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Running...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={suggestCommand}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Get AI Suggestions"
          >
            <Zap size={14} />
          </button>
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Clear Terminal"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Close Terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-zinc-900"
        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-1 ${getLineColor(line.type)}`}
          >
            {line.type === 'ai-suggestion' ? (
              <div className="flex items-start gap-2 bg-blue-900/20 p-2 rounded border-l-2 border-blue-400">
                <Zap size={12} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{line.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{line.content}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Command Input */}
      <div className="border-t border-zinc-700 p-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-cyan-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Type a command... (try 'help' or ask AI)"
            className="flex-1 bg-transparent text-white focus:outline-none disabled:opacity-50"
            autoFocus
          />
          {isRunning && (
            <div className="text-zinc-500 text-xs">
              <Square size={12} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
          <span>Press Enter to execute, ↑↓ for history</span>
          <span className="flex items-center gap-1">
            <Zap size={10} />
            AI-assisted
          </span>
        </div>
      </div>
    </div>
  )
}

export default TerminalPanel
