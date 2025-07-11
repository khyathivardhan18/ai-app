import type React from 'react'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  context?: string[]
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface AppState {
  apiKey: string
  chats: Chat[]
  currentChatId: string | null
  theme: 'dark' | 'light'
  settings: {
    model: string
    temperature: number
    maxTokens: number
  }
}

interface AppContextType {
  state: AppState
  getChat: (chatId: string) => Chat | undefined
  createChat: (title?: string) => string
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => void
  deleteChat: (chatId: string) => void
  setCurrentChatId: (chatId: string | null) => void
  updateSettings: (settings: Partial<AppState['settings']>) => void
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultSettings = {
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 2048
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('edith-ai-state')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          apiKey: API_KEY, // Use API key from environment variable
          chats: parsed.chats?.map((chat: {
            id: string;
            title: string;
            createdAt: string;
            messages: Array<{
              id: string;
              text: string;
              sender: string;
              timestamp: string;
              context?: string[];
            }>
          }) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            messages: chat.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          })) || [],
          currentChatId: parsed.currentChatId || null,
          theme: parsed.theme || 'dark',
          settings: { ...defaultSettings, ...parsed.settings }
        }
      } catch (error) {
        console.error('Failed to parse saved state:', error)
      }
    }

    return {
      apiKey: API_KEY, // Use API key from environment variable
      chats: [],
      currentChatId: null,
      theme: 'dark',
      settings: defaultSettings
    }
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('edith-ai-state', JSON.stringify(state))
  }, [state])

  const getChat = (chatId: string) => {
    return state.chats.find(chat => chat.id === chatId);
  };

  const createChat = (title = 'New Chat'): string => {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newChat: Chat = {
      id: chatId,
      title,
      messages: [],
      createdAt: new Date()
    }

    setState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats],
      currentChatId: chatId
    }))

    return chatId
  }

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(chat =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    }))
  }

  const addMessage = (chatId: string, message: Omit<Message, 'id'>) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullMessage: Message = {
      ...message,
      id: messageId,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      chats: prev.chats.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, fullMessage] }
          : chat
      )
    }))
  }

  const deleteChat = (chatId: string) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.filter(chat => chat.id !== chatId),
      currentChatId: prev.currentChatId === chatId ? null : prev.currentChatId
    }))
  }

  const setCurrentChatId = (chatId: string | null) => {
    setState(prev => ({ ...prev, currentChatId: chatId }))
  }

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }))
  }

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const contextValue: AppContextType = {
    state,
    getChat,
    createChat,
    updateChat,
    addMessage,
    deleteChat,
    setCurrentChatId,
    updateSettings,
    toggleTheme,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export type { Message, Chat, AppState }
