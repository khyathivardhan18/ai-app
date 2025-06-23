import type React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Folder,
  FolderOpen,
  X,
  Plus,
  Search,
  Settings,
  Terminal,
  Bot,
  MessageSquare,
  Code,
  Save,
  Play,
  GitBranch,
  Zap
} from 'lucide-react'
import FileTree from './FileTree'
import CodeEditor from './CodeEditor'
import AIChat from './AIChat'
import TerminalPanel from './TerminalPanel'
import { useApp } from '../context/AppContext'
import { fileSystemManager } from '../utils/fileSystem'
import type { FileItem } from './FileTree'

interface OpenTab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
}

interface IDELayoutProps {
  projectData?: {
    name: string
    files: FileItem[]
    totalFiles: number
  }
}

const IDELayout: React.FC<IDELayoutProps> = ({ projectData }) => {
  const { state } = useApp()
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [showAIChat, setShowAIChat] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [aiChatWidth, setAIChatWidth] = useState(350)

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql'
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file.path)
  }

  const handleFileOpen = async (file: FileItem) => {
    if (file.type === 'directory') return

    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.path === file.path)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // Get file content
    let content = file.content || ''
    if (!content && projectData) {
      // Try to get content from fileSystemManager or session storage
      content = await fileSystemManager.getFileContent(file.path) ||
                sessionStorage.getItem(`file_${file.path}`) ||
                '// File content could not be loaded'
    }

    const newTab: OpenTab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      path: file.path,
      content,
      language: getLanguageFromExtension(file.name),
      isDirty: false
    }

    setOpenTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const handleTabClose = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId)
    if (tab?.isDirty) {
      const shouldClose = window.confirm(`${tab.name} has unsaved changes. Close anyway?`)
      if (!shouldClose) return
    }

    setOpenTabs(prev => prev.filter(t => t.id !== tabId))

    if (activeTabId === tabId) {
      const remainingTabs = openTabs.filter(t => t.id !== tabId)
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
    }
  }

  const handleContentChange = (tabId: string, newContent: string) => {
    setOpenTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content: newContent, isDirty: true }
        : tab
    ))
  }

  const handleSaveFile = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId)
    if (tab) {
      // Save to session storage for now (in a real IDE, this would save to filesystem)
      sessionStorage.setItem(`file_${tab.path}`, tab.content)
      setOpenTabs(prev => prev.map(t =>
        t.id === tabId ? { ...t, isDirty: false } : t
      ))
    }
  }

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const activeTab = openTabs.find(tab => tab.id === activeTabId)

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="h-8 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 font-medium">
            {projectData?.name || 'Gemini AI'} - AI-Powered IDE
          </span>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 text-sm">
        <div className="flex items-center gap-6">
          <span className="font-medium">File</span>
          <span className="font-medium">Edit</span>
          <span className="font-medium">View</span>
          <span className="font-medium">AI</span>
          <span className="font-medium">Help</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={`p-1 rounded ${showAIChat ? 'bg-blue-600' : 'hover:bg-zinc-700'} transition-colors`}
            title="Toggle AI Assistant"
          >
            <Bot size={16} />
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-1 rounded ${showTerminal ? 'bg-blue-600' : 'hover:bg-zinc-700'} transition-colors`}
            title="Toggle Terminal"
          >
            <Terminal size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-zinc-800 border-r border-zinc-700 flex flex-col"
          style={{ width: sidebarWidth }}
        >
          {/* Sidebar Header */}
          <div className="h-10 border-b border-zinc-700 flex items-center px-3 text-sm font-medium">
            <Folder size={16} className="mr-2" />
            Explorer
          </div>

          {/* Project Info */}
          {projectData && (
            <div className="p-3 border-b border-zinc-700">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                Project
              </div>
              <div className="text-sm font-medium">{projectData.name}</div>
              <div className="text-xs text-zinc-500">{projectData.totalFiles} files</div>
            </div>
          )}

          {/* File Tree */}
          <div className="flex-1 overflow-y-auto">
            {projectData?.files ? (
              <FileTree
                files={projectData.files}
                onFileSelect={handleFileSelect}
                onFileOpen={handleFileOpen}
                selectedFile={selectedFile}
                expandedDirs={expandedDirs}
                onToggleDir={toggleDirectory}
              />
            ) : (
              <div className="p-4 text-center text-zinc-500">
                <Folder size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No project opened</p>
                <p className="text-xs mt-1">Open a project to browse files</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center overflow-x-auto">
            {openTabs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                <Code size={16} className="mr-2" />
                Open a file to start editing
              </div>
            ) : (
              <div className="flex items-center">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center px-3 py-2 border-r border-zinc-700 cursor-pointer group min-w-0 ${
                      activeTabId === tab.id
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <FileText size={14} className="mr-2 flex-shrink-0" />
                    <span className="text-sm truncate pr-2">
                      {tab.name}
                      {tab.isDirty && <span className="ml-1">•</span>}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTabClose(tab.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-zinc-700 rounded p-1 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className={`flex-1 ${showAIChat ? '' : 'w-full'}`}>
              {activeTab ? (
                <CodeEditor
                  content={activeTab.content}
                  language={activeTab.language}
                  filename={activeTab.name}
                  onChange={(content) => handleContentChange(activeTab.id, content)}
                  onSave={() => handleSaveFile(activeTab.id)}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                  <div className="text-center">
                    <Code size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Welcome to Gemini AI</h3>
                    <p className="text-sm">Select a file from the explorer to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Chat Panel */}
            {showAIChat && (
              <div
                className="bg-zinc-800 border-l border-zinc-700 flex flex-col"
                style={{ width: aiChatWidth }}
              >
                <div className="h-10 border-b border-zinc-700 flex items-center px-3 text-sm font-medium">
                  <Bot size={16} className="mr-2" />
                  AI Assistant
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="ml-auto p-1 hover:bg-zinc-700 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1">
                  <AIChat
                    projectName={projectData?.name}
                    currentFile={activeTab?.path}
                    fileContent={activeTab?.content}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <div className="h-64 border-t border-zinc-700">
              <TerminalPanel onClose={() => setShowTerminal(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          {activeTab && (
            <>
              <span>Line 1, Column 1</span>
              <span>{activeTab.language}</span>
              <span>UTF-8</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch size={12} />
            main
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} />
            AI Ready
          </span>
        </div>
      </div>
    </div>
  )
}

export default IDELayout
