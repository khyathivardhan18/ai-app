import React, { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { geminiService } from '../services/gemini'

const IDEChatInterface: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const [searchParams] = useSearchParams()
  const { state, addMessage } = useApp()
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
      <div className="h-full flex items-center justify-center text-zinc-400">
        <div className="text-center">
          <p className="text-sm">Chat not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700">
      {/* Header */}
      <div className="p-3 border-b border-zinc-700 bg-zinc-800/50 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-300">AI Chat</h3>
        {chat.title && (
          <p className="text-xs text-gray-500 mt-1">{chat.title}</p>
        )}
      </div>
      
      {/* Messages Container with Scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-3">
          {chat.messages.length === 0 && !initialPrompt && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm mb-2">Welcome to Edith AI</p>
              <p className="text-xs">Ask me anything about your code!</p>
            </div>
          )}

          {chat.messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-gray-200 border border-zinc-700'
                }`}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="max-w-[85%] rounded-lg p-3 bg-zinc-800 border border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">Edith is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="p-3 border-t border-zinc-700 bg-zinc-800/50 flex-shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your code..."
              className="w-full p-2 pr-10 bg-zinc-800 border border-zinc-600 rounded text-sm resize-none focus:border-blue-500 focus:outline-none transition-colors"
              rows={1}
              style={{
                minHeight: '36px',
                maxHeight: '120px'
              }}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IDEChatInterface 