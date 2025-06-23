import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Save, Search, Replace, Maximize2, Copy, FileText } from 'lucide-react'

interface CodeEditorProps {
  content: string
  language: string
  filename: string
  onChange: (content: string) => void
  onSave: () => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  language,
  filename,
  onChange,
  onSave
}) => {
  const [localContent, setLocalContent] = useState(content)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Update line numbers when content changes
  useEffect(() => {
    const lines = localContent.split('\n')
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1))
  }, [localContent])

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    onChange(newContent)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey)) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          onSave()
          break
        case 'f':
          e.preventDefault()
          setShowSearch(!showSearch)
          break
        case '/':
          e.preventDefault()
          setShowSearch(true)
          break
      }
    }

    // Handle tab indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = localContent.substring(0, start) + '  ' + localContent.substring(end)
      setLocalContent(newContent)
      onChange(newContent)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // Syntax highlighting classes based on language
  const getLanguageColor = (lang: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'text-yellow-400',
      'typescript': 'text-blue-400',
      'python': 'text-green-400',
      'java': 'text-orange-400',
      'cpp': 'text-purple-400',
      'c': 'text-purple-400',
      'css': 'text-pink-400',
      'html': 'text-orange-300',
      'json': 'text-green-300',
      'markdown': 'text-gray-300',
      'yaml': 'text-cyan-400',
      'sql': 'text-blue-300'
    }
    return colorMap[lang] || 'text-gray-400'
  }

  // Simple syntax highlighting for display (basic implementation)
  const highlightSyntax = (code: string, lang: string) => {
    if (!code) return ''

    let highlighted = code

    // Basic keyword highlighting for JavaScript/TypeScript
    if (lang === 'javascript' || lang === 'typescript') {
      const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'interface', 'type']
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g')
        highlighted = highlighted.replace(regex, `<span class="text-purple-400">${keyword}</span>`)
      })

      // String highlighting
      highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-green-300">$1$2$1</span>')

      // Comment highlighting
      highlighted = highlighted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="text-gray-500">$1</span>')
    }

    return highlighted
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(localContent)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Editor Header */}
      <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText size={14} className={getLanguageColor(language)} />
          <span className="font-medium">{filename}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-500 capitalize">{language}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Search (Ctrl+F)"
          >
            <Search size={14} />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Copy All"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onSave}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Save (Ctrl+S)"
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 gap-2">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in file..."
            className="flex-1 bg-zinc-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => setShowSearch(false)}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-zinc-800 border-r border-zinc-700 p-2 text-xs text-zinc-500 font-mono select-none overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num} className="h-5 leading-5 text-right pr-2">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-4 bg-zinc-900 text-white font-mono text-sm resize-none focus:outline-none leading-5"
            style={{
              tabSize: 2,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            }}
            spellCheck={false}
            placeholder={`Start coding in ${filename}...`}
          />

          {/* Syntax Highlighting Overlay (simplified) */}
          {localContent && (
            <div
              className="absolute inset-0 p-4 font-mono text-sm pointer-events-none leading-5 whitespace-pre-wrap opacity-0"
              style={{
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(localContent, language)
              }}
            />
          )}
        </div>
      </div>

      {/* Editor Footer */}
      <div className="h-6 bg-zinc-800 border-t border-zinc-700 flex items-center justify-between px-4 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>Lines: {lineNumbers.length}</span>
          <span>Characters: {localContent.length}</span>
          <span>Words: {localContent.split(/\s+/).filter(word => word.length > 0).length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
