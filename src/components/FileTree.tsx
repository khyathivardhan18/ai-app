import React, { useState } from 'react'
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
  projectName?: string
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  onFileOpen,
  selectedFile,
  expandedDirs,
  onToggleDir,
  projectName
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
    const isSelected = selectedFile === item.path
    const isDirectory = item.type === 'directory'
    const IconComponent = getFileIcon(item.name, isDirectory)
    const fileColor = getFileColor(item.name, isDirectory)

    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: depth * 0.05 }}
      >
        <motion.div
          className={`flex items-center px-3 py-2 cursor-pointer hover:bg-zinc-700/50 transition-all duration-200 rounded-md mx-2 ${
            isSelected ? 'bg-blue-600/20 border border-blue-500/30' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => {
            if (isDirectory) {
              onToggleDir(item.path)
            } else {
              onFileSelect(item)
            }
          }}
          whileHover={{ 
            backgroundColor: 'rgba(63, 63, 70, 0.5)',
            scale: 1.02
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Chevron for directories */}
          {isDirectory && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="mr-1"
            >
              <ChevronRight size={14} className="text-gray-400" />
            </motion.div>
          )}
          
          {/* File/Directory icon */}
          <IconComponent size={16} className={`mr-2 ${fileColor}`} />
          
          {/* File name */}
          <span className={`text-sm truncate flex-1 ${isSelected ? 'text-blue-300 font-medium' : 'text-gray-300'}`}>
            {item.name}
          </span>
          
          {/* File size for files */}
          {!isDirectory && item.size && (
            <span className="text-xs text-gray-500 ml-2">
              {formatFileSize(item.size)}
            </span>
          )}
        </motion.div>

        {/* Directory children with smooth dropdown animation */}
        {isDirectory && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="overflow-hidden"
              >
                <div className="border-l border-zinc-700/50 ml-4">
                  {item.children?.map(child => renderFileItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
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
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700">
      {/* Header */}
      <div className="p-3 border-b border-zinc-700 bg-zinc-800/50">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Folder size={16} className="text-blue-400" />
          {projectName ? projectName : 'Project Files'}
        </h3>
      </div>
      
      {/* File tree with scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-2">
          {files.length === 0 ? (
            <motion.div
              className="text-center py-12 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Folder size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No files loaded</p>
              <p className="text-xs">Open a project to get started</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {files.map(item => renderFileItem(item))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Footer with file count */}
      {files.length > 0 && (
        <div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
          <p className="text-xs text-gray-500 text-center">
            {files.length} item{files.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default FileTree
