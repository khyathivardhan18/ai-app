import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'

interface ConversationHistory {
  role: string
  parts: string
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: GenerativeModel | null = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initializeAPI(apiKey)
    }
  }

  initializeAPI(apiKey: string) {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
    } catch (error: unknown) {
      console.error('Failed to initialize Gemini API:', error)
      throw new Error('Failed to initialize AI service. Please check your API key.')
    }
  }

  isInitialized(): boolean {
    return this.model !== null
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const tempGenAI = new GoogleGenerativeAI(apiKey)
      const tempModel = tempGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      // Test with a simple prompt
      const result = await tempModel.generateContent('Hello')
      return Boolean(result.response.text())
    } catch (error: unknown) {
      console.error('API key validation failed:', error)
      return false
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error = new Error('No attempts made')

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const delay = baseDelay * 2 ** attempt
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.model) {
      throw new Error('AI service not initialized. Please check your configuration.')
    }

    try {
      const result = await this.retryWithBackoff(async () => {
        if (!this.model) {
          throw new Error('Model not initialized')
        }
        const response = await this.model.generateContent(message)
        return response.response.text()
      })

      return result
    } catch (error: unknown) {
      console.error('Gemini API error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key.')
      }
      if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('quota')) {
        throw new Error('API quota exceeded. Please check your usage limits.')
      }
      if (errorMessage.includes('RATE_LIMIT_EXCEEDED') || errorMessage.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      if (errorMessage.includes('Load failed') || errorMessage.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.')
      }

      throw new Error(`AI service error: ${errorMessage}`)
    }
  }

  async* streamMessage(message: string, conversationHistory: ConversationHistory[] = []) {
    if (!this.model) {
      throw new Error('AI service not initialized. Please check your configuration.')
    }

    try {
      if (conversationHistory && conversationHistory.length > 0) {
        // Use chat session for conversation history
        const chat = this.model.startChat({
          history: conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.parts }]
          }))
        })
        const result = await chat.sendMessageStream(message)

        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          if (chunkText) {
            yield chunkText
          }
        }
      } else {
        // Single message
        const result = await this.model.generateContentStream(message)

        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          if (chunkText) {
            yield chunkText
          }
        }
      }
    } catch (error: unknown) {
      console.error('Gemini streaming error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Load failed') || errorMessage.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.')
      }
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
        throw new Error('Invalid API key. Please check your configuration.')
      }
      if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.')
      }

      throw new Error(`Streaming error: ${errorMessage}`)
    }
  }
}

export const geminiService = new GeminiService()
