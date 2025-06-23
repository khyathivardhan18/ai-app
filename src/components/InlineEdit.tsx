import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3, Wand2, Terminal, Code2 } from 'lucide-react'

interface InlineEditProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (instruction: string, mode: 'edit' | 'generate' | 'terminal') => void
  selectedText?: string
  cursorPosition?: { line: number; column: number }
}

const InlineEdit: React.FC<InlineEditProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedText,
  cursorPosition
}) => {
  const [instruction, setInstruction] = useState('')
  const [mode, setMode] = useState<'edit' | 'generate' | 'terminal'>('edit')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSubmit = () => {
    if (instruction.trim()) {
      onSubmit(instruction.trim(), mode)
      setInstruction('')
      onClose()
    }
  }

  const modes = [
    {
      id: 'edit' as const,
      label: 'Edit',
      icon: Edit3,
      description: selectedText ? 'Modify selected code' : 'Edit at cursor',
      placeholder: selectedText
        ? 'Describe how to modify the selected code...'
        : 'Describe what to generate at cursor...'
    },
    {
      id: 'generate' as const,
      label: 'Generate',
      icon: Wand2,
      description: 'Generate new code',
      placeholder: 'Describe what code to generate...'
    },
    {
      id: 'terminal' as const,
      label: 'Terminal',
      icon: Terminal,
      description: 'AI terminal command',
      placeholder: 'Describe what you want to do in terminal...'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div
              className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-[600px] max-w-[90vw]"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <Code2 size={20} className="text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Inline Edit</h3>
                    {selectedText && (
                      <p className="text-xs text-zinc-400">
                        {selectedText.length} characters selected
                      </p>
                    )}
                    {cursorPosition && !selectedText && (
                      <p className="text-xs text-zinc-400">
                        Line {cursorPosition.line}, Column {cursorPosition.column}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Selection */}
              <div className="p-4 border-b border-zinc-700/50">
                <div className="flex gap-2">
                  {modes.map((modeOption) => (
                    <button
                      key={modeOption.id}
                      onClick={() => setMode(modeOption.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        mode === modeOption.id
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                      }`}
                    >
                      <modeOption.icon size={14} />
                      {modeOption.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {modes.find(m => m.id === mode)?.description}
                </p>
              </div>

              {/* Input */}
              <div className="p-4">
                <textarea
                  ref={inputRef}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder={modes.find(m => m.id === mode)?.placeholder}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-zinc-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  rows={3}
                  style={{ minHeight: '80px' }}
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-zinc-500">
                    {mode === 'terminal' ? 'Commands will be reviewed before execution' : '⌘+Enter to apply'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!instruction.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InlineEdit
