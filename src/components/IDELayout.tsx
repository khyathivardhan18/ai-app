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
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'
import FileTree, { type FileItem } from './FileTree'
import CodeEditor from './CodeEditor'
import AIChat from './AIChat'
import TerminalPanel from './TerminalPanel'
import ChatInterface from './ChatInterface'
import { useApp } from '../context/AppContext'
import { fileSystemManager } from '../utils/fileSystem'

// Mock project data for demonstration
const mockFiles: FileItem[] = [
  { name: 'package.json', path: 'package.json', type: 'file', content: '{ "name": "gemini-ai-app" }' },
  { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', content: 'import { defineConfig } from "vite"' },
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      { name: 'App.tsx', path: 'src/App.tsx', type: 'file', content: 'function App() { ... }' },
      { name: 'main.tsx', path: 'src/main.tsx', type: 'file', content: 'import React from "react"' },
      {
        name: 'components',
        path: 'src/components',
        type: 'directory',
        children: [
          { name: 'ChatInterface.tsx', path: 'src/components/ChatInterface.tsx', type: 'file', content: 'export default function ChatInterface() { ... }' },
          { name: 'IDELayout.tsx', path: 'src/components/IDELayout.tsx', type: 'file', content: 'export default function IDELayout() { ... }' },
        ],
      },
    ],
  },
];

interface OpenTab {
  path: string
  name: string
  content: string
  language: string
  isDirty?: boolean
}

const IDELayout = () => {
  const { state } = useApp()
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'src/components']))
  const [showTerminal, setShowTerminal] = useState(true);

  const handleFileOpen = (file: FileItem) => {
    if (file.type === 'file') {
      const isAlreadyOpen = openTabs.some(tab => tab.path === file.path)
      if (!isAlreadyOpen) {
        const language = file.name.split('.').pop() || 'typescript';
        const content = file.content ?? '';
        setOpenTabs([...openTabs, { ...file, content, language }])
      }
      setActiveTabPath(file.path)
    }
  }

  const handleTabClose = (tabPath: string) => {
    const newTabs = openTabs.filter(tab => tab.path !== tabPath)
    setOpenTabs(newTabs)
    if (activeTabPath === tabPath) {
      setActiveTabPath(newTabs.length > 0 ? newTabs[0].path : null)
    }
  }

  const handleContentChange = (path: string, newContent: string) => {
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.path === path ? { ...tab, content: newContent, isDirty: true } : tab
      )
    )
  }
  
  const handleSave = (path: string) => {
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.path === path ? { ...tab, isDirty: false } : tab
      )
    )
    console.log(`Saved ${path}`);
  }

  const activeTab = openTabs.find(tab => tab.path === activeTabPath);

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden">
      <header className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 text-sm">
        <div className="flex items-center gap-4">
          <Folder size={16} />
          <span>Edith AI IDE</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowTerminal(!showTerminal)} className="p-1 hover:bg-zinc-700 rounded" title="Toggle Terminal">
             <Terminal size={16} />
           </button>
         </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15}>
          <FileTree
            files={mockFiles}
            onFileSelect={handleFileOpen}
            onFileOpen={handleFileOpen}
            selectedFile={activeTabPath || ''}
            expandedDirs={expandedDirs}
            onToggleDir={(path) =>
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
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-600" />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel>
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center">
                  {openTabs.map(tab => (
                    <div
                      key={tab.path}
                      onClick={() => setActiveTabPath(tab.path)}
                      className={`flex items-center px-3 py-2 border-r border-zinc-700 cursor-pointer ${activeTabPath === tab.path ? 'bg-zinc-900' : ''}`}
                    >
                      <span>{tab.name}{tab.isDirty ? '*' : ''}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleTabClose(tab.path); }} className="ml-2 hover:bg-zinc-700 rounded p-1"><X size={12}/></button>
                    </div>
                  ))}
                </div>
                {/* Editor and Chat */}
                <PanelGroup direction="horizontal" className="flex-grow">
                  <Panel defaultSize={60}>
                    {activeTab ? (
                      <CodeEditor
                        filename={activeTab.name}
                        content={activeTab.content}
                        language={activeTab.language}
                        onChange={(newContent) => handleContentChange(activeTab.path, newContent)}
                        onSave={() => handleSave(activeTab.path)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">Select a file to open</div>
                    )}
                  </Panel>
                  <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-600" />
                  <Panel defaultSize={40}>
                    <ChatInterface />
                  </Panel>
                </PanelGroup>
              </div>
            </Panel>
            {showTerminal && (
              <>
                <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-blue-600" />
                <Panel defaultSize={30} minSize={10}>
                  <TerminalPanel onClose={() => setShowTerminal(false)} />
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default IDELayout
