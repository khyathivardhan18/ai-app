import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Code,
  FileText,
  Image,
  Settings,
  Database,
  Package
} from 'lucide-react'

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileItem[]
  content?: string
  size?: number
  lastModified?: number
  handle?: any // For File System Access API handle
}

interface FileTreeProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
  onFileOpen: (file: FileItem) => void
  selectedFile?: string
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  onFileOpen,
  selectedFile,
  expandedDirs,
  onToggleDir
}) => {
  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedDirs.has(fileName) ? FolderOpen : Folder
    }

    const ext = fileName.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'cs':
        return Code
      case 'md':
      case 'txt':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
        return FileText
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return Image
      case 'sql':
      case 'db':
      case 'sqlite':
        return Database
      case 'package':
      case 'lock':
        return Package
      case 'config':
      case 'conf':
      case 'env':
        return Settings
      default:
        return File
    }
  }

  const getFileColor = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return 'text-blue-400'

    const ext = fileName.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'js':
      case 'jsx':
        return 'text-yellow-400'
      case 'ts':
      case 'tsx':
        return 'text-blue-500'
      case 'py':
        return 'text-green-400'
      case 'java':
        return 'text-orange-500'
      case 'cpp':
      case 'c':
        return 'text-blue-600'
      case 'cs':
        return 'text-purple-500'
      case 'json':
        return 'text-green-300'
      case 'md':
        return 'text-gray-300'
      case 'css':
      case 'scss':
        return 'text-pink-400'
      case 'html':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const renderFileItem = (item: FileItem, depth = 0) => {
    const isExpanded = expandedDirs.has(item.path)
    const Icon = getFileIcon(item.name, item.type === 'directory')
    const color = getFileColor(item.name, item.type === 'directory')
    const isSelected = selectedFile === item.path

    return (
      <div key={item.path}>
        <motion.div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-zinc-800/50 transition-colors ${
            isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'directory') {
              onToggleDir(item.path)
            } else {
              onFileSelect(item)
            }
          }}
          onDoubleClick={() => {
            if (item.type === 'file') {
              onFileOpen(item)
            }
          }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {item.type === 'directory' && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-gray-500" />
            </motion.div>
          )}

          {item.type === 'file' && (
            <div style={{ width: 14 }} />
          )}

          <Icon size={16} className={color} />

          <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'} truncate`}>
            {item.name}
          </span>

          {item.type === 'file' && item.size && (
            <span className="text-xs text-gray-500 ml-auto">
              {formatFileSize(item.size)}
            </span>
          )}
        </motion.div>

        <AnimatePresence>
          {item.type === 'directory' && isExpanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {item.children
                .sort((a, b) => {
                  // Directories first, then files, both alphabetically
                  if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1
                  }
                  return a.name.localeCompare(b.name)
                })
                .map(child => renderFileItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="h-full overflow-y-auto">
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <Folder size={32} className="mb-2 opacity-50" />
          <span className="text-sm">No files to display</span>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {files
            .sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })
            .map(item => renderFileItem(item))}
        </div>
      )}
    </div>
  )
}

export default FileTree
