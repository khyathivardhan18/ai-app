import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Send, ArrowLeft, Bot, User, Loader2, Copy, Check, FileText, Folder, Hash, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { geminiService } from '../services/gemini'
import ParticleBackground from './ParticleBackground'
import InlineEdit from './InlineEdit'
import AgentMode from './AgentMode'

interface MessageComponentProps {
  message: {
    id: string
    text: string
    sender: 'user' | 'ai'
    timestamp: Date
    context?: string[]
  }
  isStreaming?: boolean
}

interface ChatMode {
  id: 'ask' | 'agent'
  name: string
  shortcut: string
  icon: React.ElementType
  description: string
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, isStreaming = false }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 rounded-lg ${
        message.sender === 'user'
          ? 'bg-blue-600/20 border border-blue-500/30 ml-12'
          : 'bg-slate-800/50 border border-slate-700/50 mr-12'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-700'
      }`}>
        {message.sender === 'user' ?
          <User size={16} className="text-white" /> :
          <Bot size={16} className="text-blue-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-300">
            {message.sender === 'user' ? 'You' : 'Edith AI'}
          </span>
          <span className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.context && message.context.length > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              {message.context.length} references
            </span>
          )}
        </div>

        {message.context && message.context.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {message.context.map((ref) => (
              <span key={ref} className="text-xs bg-zinc-700/50 text-zinc-300 px-2 py-1 rounded">
                @{ref}
              </span>
            ))}
          </div>
        )}

        <div className="text-slate-200 whitespace-pre-wrap break-words">
          {message.text}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block w-2 h-5 bg-blue-400 ml-1"
            />
          )}
        </div>

        {message.sender === 'ai' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={copyToClipboard}
            className="mt-2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

const ChatInterface: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, addMessage, setCurrentChat, createChat } = useApp()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentMode, setCurrentMode] = useState<'ask' | 'agent'>('ask')
  const [isInlineEditOpen, setIsInlineEditOpen] = useState(false)
  const [isAgentModeOpen, setIsAgentModeOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = state.chats.find(chat => chat.id === chatId)

  const modes: ChatMode[] = [
    {
      id: 'ask',
      name: 'Ask',
      shortcut: '⌘T',
      icon: Hash,
      description: 'Conversational help with automatic context'
    },
    {
      id: 'agent',
      name: 'Agent',
      shortcut: '⌘I',
      icon: Bot,
      description: 'Multi-file edits with diff preview'
    }
  ]

  // Get project-specific suggestions if available
  const getProjectSuggestions = () => {
    const projectId = currentChat?.title.includes('Project:')
      ? currentChat.title.replace('Project: ', '').toLowerCase().replace(/\s+/g, '_')
      : null

    if (projectId) {
      // Try to find stored project data
      const storedProjectData = sessionStorage.getItem(`project_upload_${Date.now()}`) ||
                               sessionStorage.getItem(`project_fs_${Date.now()}`)

      if (storedProjectData) {
        try {
          const projectData = JSON.parse(storedProjectData)
          return Object.keys(projectData.files || {}).slice(0, 10).map(filePath => ({
            type: 'file',
            name: filePath.split('/').pop() || filePath,
            icon: FileText
          }))
        } catch (error) {
          console.error('Error parsing project suggestions:', error)
        }
      }
    }

    // Default suggestions
    return [
      { type: 'file', name: 'App.tsx', icon: FileText },
      { type: 'file', name: 'components/', icon: Folder },
      { type: 'file', name: 'utils/api.ts', icon: FileText },
      { type: 'symbol', name: 'useState', icon: Hash },
      { type: 'symbol', name: 'useEffect', icon: Hash },
      { type: 'folder', name: 'src/', icon: Folder },
    ]
  }

  const suggestions = getProjectSuggestions()

  useEffect(() => {
    if (chatId) {
      setCurrentChat(chatId)
    }
  }, [chatId, setCurrentChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages.length, isStreaming])

  useEffect(() => {
    if (state.apiKey && !geminiService.isInitialized()) {
      geminiService.initializeAPI(state.apiKey)
    }
  }, [state.apiKey])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setIsInlineEditOpen(true)
            break
          case 'i':
            e.preventDefault()
            if (currentMode === 'ask') {
              setCurrentMode('agent')
            } else {
              setIsAgentModeOpen(true)
            }
            break
          case 't':
            e.preventDefault()
            setCurrentMode('ask')
            inputRef.current?.focus()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentMode])

  // Handle input changes and @-symbol detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const position = e.target.selectionStart

    setInput(value)
    setCursorPosition(position)

    // Check for @-symbol trigger
    const beforeCursor = value.slice(0, position)
    const atIndex = beforeCursor.lastIndexOf('@')

    if (atIndex !== -1 && atIndex === position - 1) {
      setShowSuggestions(true)
    } else if (atIndex !== -1 && !/\s/.test(beforeCursor.slice(atIndex + 1))) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Extract @-references from input
  const extractReferences = (text: string): string[] => {
    const regex = /@(\w+(?:\/\w+)*(?:\.\w+)?)/g
    const matches = text.match(regex)
    return matches ? matches.map(match => match.slice(1)) : []
  }

  // Handle initial prompt from Quick Actions
  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt && chatId && currentChat && currentChat.messages.length === 0 && !isLoading) {
      handleQuickActionPrompt(prompt)
      navigate(`/chat/${chatId}`, { replace: true })
    }
  }, [searchParams, chatId, currentChat, isLoading, navigate])

  const handleQuickActionPrompt = async (prompt: string) => {
    if (!state.apiKey || !chatId) return

    setIsLoading(true)

    const references = extractReferences(prompt)
    addMessage(chatId, {
      text: prompt,
      sender: 'user',
      timestamp: new Date(),
      context: references
    })

    try {
      if (!geminiService.isInitialized()) {
        geminiService.initializeAPI(state.apiKey)
      }

      setIsStreaming(true)
      setStreamingMessage('')

      let fullResponse = ''
      for await (const chunk of geminiService.streamMessage(prompt, [])) {
        fullResponse += chunk
        setStreamingMessage(fullResponse)
      }

      setIsStreaming(false)
      setStreamingMessage('')

      addMessage(chatId, {
        text: fullResponse,
        sender: 'ai',
        timestamp: new Date()
      })

    } catch (error: unknown) {
      console.error('Chat error:', error)
      setIsStreaming(false)
      setStreamingMessage('')

      addMessage(chatId, {
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !chatId) return

    const userMessage = input.trim()
    const references = extractReferences(userMessage)
    setInput('')
    setIsLoading(true)

    addMessage(chatId, {
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
      context: references
    })

    try {
      if (!geminiService.isInitialized()) {
        geminiService.initializeAPI(state.apiKey)
      }

      const history = currentChat?.messages.map(msg => ({
        role: msg.sender,
        parts: msg.text
      })) || []

      setIsStreaming(true)
      setStreamingMessage('')

      let contextPrompt = userMessage
      if (references.length > 0) {
        contextPrompt = `Context: Referenced files/symbols: ${references.join(', ')}\n\nUser message: ${userMessage}`
      }

      let fullResponse = ''
      for await (const chunk of geminiService.streamMessage(contextPrompt, history)) {
        fullResponse += chunk
        setStreamingMessage(fullResponse)
      }

      setIsStreaming(false)
      setStreamingMessage('')

      addMessage(chatId, {
        text: fullResponse,
        sender: 'ai',
        timestamp: new Date()
      })

    } catch (error: unknown) {
      console.error('Chat error:', error)
      setIsStreaming(false)
      setStreamingMessage('')

      addMessage(chatId, {
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInlineEdit = (instruction: string, mode: 'edit' | 'generate' | 'terminal') => {
    const chatId = createChat(`Inline ${mode}: ${instruction.slice(0, 30)}...`)
    navigate(`/chat/${chatId}?prompt=${encodeURIComponent(`Inline ${mode} request: ${instruction}`)}`)
  }

  const handleAgentComplete = (task: { id: string; description: string; status: string }) => {
    console.log('Agent task completed:', task)
    // Handle agent task completion
  }

  const insertSuggestion = (suggestion: { name: string; type: string }) => {
    const beforeCursor = input.slice(0, cursorPosition)
    const afterCursor = input.slice(cursorPosition)
    const atIndex = beforeCursor.lastIndexOf('@')

    const newInput = `${beforeCursor.slice(0, atIndex + 1)}${suggestion.name} ${afterCursor}`
    setInput(newInput)
    setShowSuggestions(false)

    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = atIndex + suggestion.name.length + 2
        inputRef.current.setSelectionRange(newPosition, newPosition)
        inputRef.current.focus()
      }
    }, 0)
  }

  if (!currentChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chat not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <ParticleBackground density={30} />

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft size={20} />
            </motion.button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{currentChat.title}</h1>
                {currentChat.title.includes('Project:') && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                    File System
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">
                {currentChat.messages.length} messages • {modes.find(m => m.id === currentMode)?.name} Mode
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCurrentMode(mode.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${
                    currentMode === mode.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title={`${mode.description} (${mode.shortcut})`}
                >
                  <mode.icon size={14} />
                  {mode.name}
                </button>
              ))}
            </div>

            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsInlineEditOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Zap size={12} />
              Inline Edit (⌘K)
            </button>
            <button
              onClick={() => setIsAgentModeOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Bot size={12} />
              Agent Mode (⌘I)
            </button>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 min-h-[calc(100vh-140px)] flex flex-col">
        <div className="flex-1 space-y-4 mb-6">
          <AnimatePresence>
            {currentChat.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          {isStreaming && streamingMessage && (
            <MessageComponent
              message={{
                id: 'streaming',
                text: streamingMessage,
                sender: 'ai',
                timestamp: new Date()
              }}
              isStreaming={true}
            />
          )}

          {/* Loading indicator */}
          {isLoading && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Bot size={16} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span>Edith is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        className="relative z-10 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* @-symbol suggestions */}
          {showSuggestions && (
            <div className="mb-3 bg-zinc-800 border border-zinc-700 rounded-lg p-2 max-h-32 overflow-y-auto">
              <div className="text-xs text-zinc-400 mb-2">Reference files and symbols</div>
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.name}-${suggestion.type}`}
                  onClick={() => insertSuggestion(suggestion)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-zinc-700 rounded text-sm text-left"
                >
                  <suggestion.icon size={14} className="text-zinc-400" />
                  <span className="text-white">{suggestion.name}</span>
                  <span className="text-xs text-zinc-500 ml-auto">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Message Edith AI... Use @ to reference files"
                disabled={isLoading}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <div>
              {currentMode === 'agent' ? 'Agent mode • Multi-file editing' : 'Ask mode • Conversational help'}
            </div>
            <div>
              ⌘K for inline edit • ⌘I for agent mode
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <InlineEdit
        isOpen={isInlineEditOpen}
        onClose={() => setIsInlineEditOpen(false)}
        onSubmit={handleInlineEdit}
      />

      <AgentMode
        isOpen={isAgentModeOpen}
        onClose={() => setIsAgentModeOpen(false)}
        onComplete={handleAgentComplete}
        projectPath={currentChat.title.includes('Project:') ? currentChat.title : undefined}
      />
    </div>
  )
}

export default ChatInterface
