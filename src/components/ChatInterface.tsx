import React, { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, ArrowLeft, Settings, Sun, Moon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { geminiService } from '../services/gemini'
import MetallicLogo from './MetallicLogo'
import ParticleBackground from './ParticleBackground'

const ChatInterface: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, addMessage, toggleTheme } = useApp()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chat = state.chats.find(c => c.id === chatId)
  const initialPrompt = searchParams.get('prompt')

  useEffect(() => {
    if (initialPrompt && chat && chat.messages.length === 0) {
      // Auto-send initial prompt
      handleSendMessage(decodeURIComponent(initialPrompt))
    }
  }, [initialPrompt, chat])

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim() || !chatId) return

    setIsLoading(true)
    setInputValue('')

    try {
      // Add user message
      addMessage(chatId, {
        text: message,
        sender: 'user',
        timestamp: new Date()
      })

      // Initialize Gemini service if not already done
      if (!geminiService.isInitialized()) {
        geminiService.initializeAPI(state.apiKey)
      }

      // Get AI response using Gemini
      const response = await geminiService.sendMessage(message)
      
      addMessage(chatId, {
        text: response,
        sender: 'ai',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
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
      handleSendMessage()
    }
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chat not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background text-foreground overflow-hidden relative">
      <ParticleBackground density={60} />

      {/* Header */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-r from-background/90 via-background/95 to-background/90 border-b border-primary/20 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-foreground" />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <MetallicLogo size={32} />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{chat.title || 'New Chat'}</h1>
                <p className="text-sm text-muted-foreground">AI Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={20} className="text-foreground" />
            </motion.button>
            
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {state.theme === 'dark' ? (
                <Sun size={20} className="text-amber-200" />
              ) : (
                <Moon size={20} className="text-blue-200" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto">
        <div className="space-y-6">
          {chat.messages.length === 0 && !initialPrompt && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <MetallicLogo size={80} />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">
                Welcome to Edith AI
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm your AI development assistant. Ask me anything about coding, debugging, or project development.
              </p>
            </motion.div>
          )}

          {chat.messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-gradient-to-r from-background/80 to-background/60 border border-primary/20 text-foreground'
                } backdrop-blur-sm`}
                style={{
                  boxShadow: message.sender === 'user' 
                    ? '0 8px 32px rgba(59, 130, 246, 0.3)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-r from-background/80 to-background/60 border border-primary/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">Edith is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-background/90 via-background/95 to-background/90 border-t border-primary/20 backdrop-blur-md"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Edith anything about coding, debugging, or development..."
                className="w-full p-4 pr-12 bg-background/50 border border-primary/20 rounded-xl resize-none focus:border-primary/40 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                rows={1}
                style={{
                  minHeight: '56px',
                  maxHeight: '200px'
                }}
                disabled={isLoading}
              />
              <motion.button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatInterface
