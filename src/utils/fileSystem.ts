import type { FileItem } from '../components/FileTree'

// Type declarations for File System Access API
declare global {
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>
  }
}

// File extensions to ignore
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff',
  'mp4', 'avi', 'mov', 'wmv', 'mp3', 'wav', 'flac', 'ogg',
  'zip', 'rar', '7z', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'woff', 'woff2', 'ttf', 'eot', 'otf'
])

// Directories to ignore
const IGNORED_DIRECTORIES = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.cache', '.tmp', 'temp', '.vscode', '.idea',
  '__pycache__', '.pytest_cache', 'venv', 'env', '.env'
])

// Files to ignore
const IGNORED_FILES = new Set([
  '.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitkeep',
  'package-lock.json', 'yarn.lock', 'bun.lockb', 'pnpm-lock.yaml'
])

export interface ProjectStructure {
  name: string
  path: string
  files: FileItem[]
  totalFiles: number
  totalSize: number
}

export class FileSystemManager {
  private static instance: FileSystemManager
  private directoryHandle: FileSystemDirectoryHandle | null = null
  private fileCache = new Map<string, string>()

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager()
    }
    return FileSystemManager.instance
  }

  async openProject(): Promise<ProjectStructure | null> {
    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API not supported in this browser')
      }

      // Open directory picker
      this.directoryHandle = await (window as Window & {
        showDirectoryPicker: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>
      }).showDirectoryPicker({
        mode: 'read'
      })

      if (!this.directoryHandle) {
        return null
      }

      // Read project structure
      const files = await this.readDirectory(this.directoryHandle, '')
      const stats = this.calculateStats(files)

      return {
        name: this.directoryHandle.name,
        path: '',
        files,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize
      }
    } catch (error) {
      console.error('Error opening project:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        return null // User cancelled
      }
      throw error
    }
  }

  private async readDirectory(
    dirHandle: FileSystemDirectoryHandle,
    relativePath: string
  ): Promise<FileItem[]> {
    const items: FileItem[] = []

    try {
      for await (const [name, handle] of dirHandle.entries()) {
        // Skip ignored files and directories
        if (IGNORED_FILES.has(name) || IGNORED_DIRECTORIES.has(name)) {
          continue
        }

        const itemPath = relativePath ? `${relativePath}/${name}` : name

        if (handle.kind === 'directory') {
          // Recursively read subdirectory
          const children = await this.readDirectory(handle as FileSystemDirectoryHandle, itemPath)

          items.push({
            name,
            path: itemPath,
            type: 'directory',
            children
          })
        } else if (handle.kind === 'file') {
          const file = await (handle as FileSystemFileHandle).getFile()

          // Skip binary files (but include them in tree for display)
          const ext = name.split('.').pop()?.toLowerCase()
          const isBinary = ext ? BINARY_EXTENSIONS.has(ext) : false

          items.push({
            name,
            path: itemPath,
            type: 'file',
            size: file.size,
            lastModified: file.lastModified,
            content: isBinary ? undefined : await this.readFileContent(handle as FileSystemFileHandle)
          })
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${relativePath}:`, error)
    }

    return items
  }

  private async readFileContent(fileHandle: FileSystemFileHandle): Promise<string | undefined> {
    try {
      const file = await fileHandle.getFile()

      // Skip large files (> 1MB)
      if (file.size > 1024 * 1024) {
        return undefined
      }

      // Check if it's a text file
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && BINARY_EXTENSIONS.has(ext)) {
        return undefined
      }

      const content = await file.text()

      // Cache the content
      this.fileCache.set(fileHandle.name, content)

      return content
    } catch (error) {
      console.error(`Error reading file ${fileHandle.name}:`, error)
      return undefined
    }
  }

  private calculateStats(files: FileItem[]): { totalFiles: number; totalSize: number } {
    let totalFiles = 0
    let totalSize = 0

    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          totalFiles++
          totalSize += item.size || 0
        } else if (item.children) {
          traverse(item.children)
        }
      }
    }

    traverse(files)
    return { totalFiles, totalSize }
  }

  async getFileContent(path: string): Promise<string | null> {
    if (!this.directoryHandle) {
      return null
    }

    try {
      const pathParts = path.split('/').filter(Boolean)
      let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = this.directoryHandle

      // Navigate to the file
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(pathParts[i])
      }

      const fileName = pathParts[pathParts.length - 1]
      const fileHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(fileName)
      const file = await fileHandle.getFile()

      return await file.text()
    } catch (error) {
      console.error(`Error reading file ${path}:`, error)
      return null
    }
  }

  findFilesByPattern(files: FileItem[], pattern: string): FileItem[] {
    const results: FileItem[] = []
    const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i')

    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && regex.test(item.name)) {
          results.push(item)
        } else if (item.children) {
          traverse(item.children)
        }
      }
    }

    traverse(files)
    return results
  }

  getAllFiles(files: FileItem[]): FileItem[] {
    const allFiles: FileItem[] = []

    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          allFiles.push(item)
        } else if (item.children) {
          traverse(item.children)
        }
      }
    }

    traverse(files)
    return allFiles
  }

  searchInFiles(files: FileItem[], searchTerm: string): Array<{
    file: FileItem
    matches: Array<{ line: number; content: string }>
  }> {
    const results: Array<{
      file: FileItem
      matches: Array<{ line: number; content: string }>
    }> = []

    const allFiles = this.getAllFiles(files)

    for (const file of allFiles) {
      if (!file.content) continue

      const lines = file.content.split('\n')
      const matches: Array<{ line: number; content: string }> = []

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push({
            line: index + 1,
            content: line.trim()
          })
        }
      })

      if (matches.length > 0) {
        results.push({ file, matches })
      }
    }

    return results
  }

  generateProjectContext(files: FileItem[]): string {
    const allFiles = this.getAllFiles(files)
    const fileTree = this.generateFileTreeString(files)

    const importantFiles = allFiles.filter(file => {
      const name = file.name.toLowerCase()
      return name.includes('readme') ||
             name.includes('package.json') ||
             name.includes('config') ||
             name.includes('env') ||
             name.endsWith('.md')
    })

    let context = `Project Structure:\n${fileTree}\n\n`

    if (importantFiles.length > 0) {
      context += "Important Files:\n"
      for (const file of importantFiles) {
        if (file.content && file.content.length < 5000) {
          context += `\n--- ${file.path} ---\n${file.content}\n`
        }
      }
    }

    return context
  }

  private generateFileTreeString(files: FileItem[], depth = 0): string {
    let result = ''
    const indent = '  '.repeat(depth)

    for (const file of files) {
      result += `${indent}${file.type === 'directory' ? '📁' : '📄'} ${file.name}\n`

      if (file.children && file.children.length > 0) {
        result += this.generateFileTreeString(file.children, depth + 1)
      }
    }

    return result
  }
}

export const fileSystemManager = FileSystemManager.getInstance()
