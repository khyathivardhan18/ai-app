import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Copy, Check, FileText, Code, Zap, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { geminiService } from '../services/gemini'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  fileContext?: string
}

interface AIChatProps {
  projectName?: string
  currentFile?: string
  fileContent?: string
}

const AIChat: React.FC<AIChatProps> = ({ projectName, currentFile, fileContent }) => {
  const { state, addMessage, createChat } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  useEffect(() => {
    if (state.apiKey && !geminiService.isInitialized()) {
      geminiService.initializeAPI(state.apiKey)
    }
  }, [state.apiKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  // Initialize a new chat session for the IDE
  useEffect(() => {
    if (!currentChatId && projectName) {
      const chatId = createChat(`IDE: ${projectName}`)
      setCurrentChatId(chatId)

      // Send initial context message
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}`,
        text: `Hello! I'm your AI coding assistant integrated into the IDE. I can help you with:

• Code review and suggestions
• Debugging and error analysis
• Explaining code functionality
• Writing new code snippets
• Refactoring and optimization
• Documentation and comments

${currentFile ? `Currently viewing: ${currentFile}` : 'Open a file to get started with context-aware assistance!'}`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [projectName, createChat, currentChatId, currentFile])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
      fileContext: currentFile
    }
    setMessages(prev => [...prev, userMsg])

    try {
      if (!geminiService.isInitialized()) {
        geminiService.initializeAPI(state.apiKey)
      }

      // Build context-aware prompt
      let contextualPrompt = userMessage

      if (currentFile && fileContent) {
        contextualPrompt = `Context: Currently working on file "${currentFile}" ${projectName ? `in project "${projectName}"` : ''}

File content:
\`\`\`
${fileContent}
\`\`\`

User question: ${userMessage}

Please provide context-aware assistance based on the current file and project.`
      } else if (projectName) {
        contextualPrompt = `Context: Working on project "${projectName}"

User question: ${userMessage}

Please provide development assistance for this project.`
      }

      setIsStreaming(true)
      setStreamingMessage('')

      let fullResponse = ''
      for await (const chunk of geminiService.streamMessage(contextualPrompt, [])) {
        fullResponse += chunk
        setStreamingMessage(fullResponse)
      }

      setIsStreaming(false)
      setStreamingMessage('')

      // Add AI response
      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        text: fullResponse,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])

      // Also add to app context for persistence
      if (currentChatId) {
        addMessage(currentChatId, {
          text: userMessage,
          sender: 'user',
          timestamp: new Date()
        })
        addMessage(currentChatId, {
          text: fullResponse,
          sender: 'ai',
          timestamp: new Date()
        })
      }

    } catch (error: unknown) {
      console.error('Chat error:', error)
      setIsStreaming(false)
      setStreamingMessage('')

      const errorMsg: Message = {
        id: `msg_${Date.now()}_error`,
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
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

  const copyMessage = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const clearChat = () => {
    setMessages([])
    if (projectName) {
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}`,
        text: `Chat cleared. I'm ready to help with your ${projectName} project!`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  const getQuickActions = () => [
    "Explain this code",
    "Find potential bugs",
    "Suggest improvements",
    "Add comments",
    "Refactor this function",
    "Write unit tests"
  ]

  return (
    <div className="h-full flex flex-col bg-zinc-800">
      {/* Chat Header */}
      <div className="p-3 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Clear Chat"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {currentFile && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <FileText size={12} />
            <span className="truncate">{currentFile}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-3 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-700 text-zinc-100'
                }`}>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  {message.fileContext && (
                    <div className="mt-2 pt-2 border-t border-zinc-600 text-xs opacity-70">
                      Context: {message.fileContext}
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 mt-1 text-xs text-zinc-500 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => copyMessage(message.text)}
                      className="p-1 hover:bg-zinc-700 rounded"
                      title="Copy message"
                    >
                      <Copy size={10} />
                    </button>
                  )}
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white order-1'
                  : 'bg-zinc-700 text-zinc-300 order-2'
              }`}>
                {message.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="max-w-[85%]">
              <div className="p-3 bg-zinc-700 text-zinc-100 rounded-lg text-sm">
                <div className="whitespace-pre-wrap">{streamingMessage}</div>
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-2 h-4 bg-blue-400 ml-1"
                />
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs">
              <Bot size={12} />
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-start"
          >
            <div className="max-w-[85%]">
              <div className="p-3 bg-zinc-700 text-zinc-100 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs">
              <Bot size={12} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {currentFile && (
        <div className="p-3 border-t border-zinc-700">
          <div className="text-xs text-zinc-400 mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-1">
            {getQuickActions().map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-zinc-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your code..."
            disabled={isLoading}
            className="flex-1 bg-zinc-700 text-white px-3 py-2 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            rows={1}
            style={{ minHeight: '36px', maxHeight: '100px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <Zap size={10} />
            Context-aware
          </span>
        </div>
      </div>
    </div>
  )
}

export default AIChat
