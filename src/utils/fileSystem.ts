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

// Browser compatibility check
export function isFileSystemAPISupported(): boolean {
  return 'showDirectoryPicker' in window && 'FileSystemDirectoryHandle' in window
}

// Fallback file system for unsupported browsers
class FallbackFileSystem {
  private files = new Map<string, { content: string; type: string; size: number }>()
  private projectName = 'Demo Project'

  async openProject(): Promise<ProjectStructure | null> {
    // Create some demo files for unsupported browsers
    this.createDemoFiles()
    
    const files = this.convertToFileItems()
    const stats = this.calculateStats(files)

    return {
      name: this.projectName,
      path: '',
      files,
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize
    }
  }

  private createDemoFiles() {
    this.files.clear()
    
    // Create demo project structure
    this.files.set('index.html', {
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Project</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        #app {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            text-align: center;
        }
        
        p {
            color: #666;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>Welcome to Demo Project</h1>
        <p>This is a demo project for browsers that don't support File System Access API.</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      type: 'text/html',
      size: 300
    })

    this.files.set('script.js', {
      content: `// Demo JavaScript file
console.log('Demo project loaded!');

function greetUser(name) {
    return \`Hello, \${name}! Welcome to the demo project.\`;
}

// Example function
function calculateSum(a, b) {
    return a + b;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { greetUser, calculateSum };
}`,
      type: 'text/javascript',
      size: 200
    })

    this.files.set('package.json', {
      content: `{
  "name": "demo-project",
  "version": "1.0.0",
  "description": "A demo project for browser compatibility testing",
  "main": "script.js",
  "scripts": {
    "start": "node script.js",
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "vite": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0"
  }
}`,
      type: 'application/json',
      size: 350
    })

    this.files.set('README.md', {
      content: `# Demo Project

This is a demo project that shows how the Edith AI IDE works in browsers that don't support the File System Access API.

## Features

- HTML file with basic structure
- CSS styling
- JavaScript functionality
- Package configuration
- Documentation

## Usage

This project is automatically loaded when using Edith AI in browsers like Safari or Firefox that don't support the File System Access API.

## Browser Compatibility

- **Chrome/Edge**: Full file system access
- **Safari/Firefox**: Demo files only (this is what you're seeing)

To get full file system access, please use Chrome or Edge.`,
      type: 'text/markdown',
      size: 400
    })
  }

  private convertToFileItems(): FileItem[] {
    const items: FileItem[] = []
    
    for (const [name, fileData] of this.files) {
      items.push({
        name,
        path: name,
        type: 'file',
        size: fileData.size,
        lastModified: Date.now(),
        content: fileData.content,
        handle: null // No real handle in fallback mode
      })
    }

    return items.sort((a, b) => a.name.localeCompare(b.name))
  }

  private calculateStats(files: FileItem[]): { totalFiles: number; totalSize: number } {
    let totalFiles = 0
    let totalSize = 0

    for (const item of files) {
      if (item.type === 'file') {
        totalFiles++
        totalSize += item.size || 0
      }
    }

    return { totalFiles, totalSize }
  }

  async getFileContent(path: string): Promise<string | null> {
    const file = this.files.get(path)
    return file ? file.content : null
  }

  async saveFileContent(path: string, content: string): Promise<boolean> {
    try {
      this.files.set(path, {
        content,
        type: this.getFileType(path),
        size: content.length
      })
      return true
    } catch (error) {
      console.error('Error saving file:', error)
      return false
    }
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return 'text/html'
      case 'css': return 'text/css'
      case 'js': return 'text/javascript'
      case 'json': return 'application/json'
      case 'md': return 'text/markdown'
      default: return 'text/plain'
    }
  }
}

export class FileSystemManager {
  private static instance: FileSystemManager
  private directoryHandle: FileSystemDirectoryHandle | null = null
  private fileCache = new Map<string, string>()
  private fallbackSystem: FallbackFileSystem

  constructor() {
    this.fallbackSystem = new FallbackFileSystem()
  }

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager()
    }
    return FileSystemManager.instance
  }

  async openProject(): Promise<ProjectStructure | null> {
    try {
      // Check if File System Access API is supported
      if (!isFileSystemAPISupported()) {
        console.log('File System Access API not supported, using fallback')
        return await this.fallbackSystem.openProject()
      }

      // Open directory picker
      this.directoryHandle = await (window as any).showDirectoryPicker({
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
      
      // Fallback to demo files if there's an error
      console.log('Falling back to demo files due to error')
      return await this.fallbackSystem.openProject()
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
            content: isBinary ? undefined : await this.readFileContent(handle as FileSystemFileHandle),
            handle: handle as FileSystemFileHandle
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
    // If using fallback system
    if (!this.directoryHandle) {
      return await this.fallbackSystem.getFileContent(path)
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
      console.error(`Error getting file content for ${path}:`, error)
      return null
    }
  }

  async saveFileContent(path: string, content: string): Promise<boolean> {
    // If using fallback system
    if (!this.directoryHandle) {
      return await this.fallbackSystem.saveFileContent(path, content)
    }

    try {
      const pathParts = path.split('/').filter(Boolean)
      let currentHandle: FileSystemDirectoryHandle = this.directoryHandle

      // Navigate to the directory containing the file
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(pathParts[i])
      }

      const fileName = pathParts[pathParts.length - 1]
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch (error) {
      console.error(`Error saving file content for ${path}:`, error)
      return false
    }
  }

  findFilesByPattern(files: FileItem[], pattern: string): FileItem[] {
    const regex = new RegExp(pattern, 'i')
    const results: FileItem[] = []

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

    const regex = new RegExp(searchTerm, 'gi')

    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && item.content) {
          const lines = item.content.split('\n')
          const matches: Array<{ line: number; content: string }> = []

          lines.forEach((line, index) => {
            if (regex.test(line)) {
              matches.push({
                line: index + 1,
                content: line.trim()
              })
            }
          })

          if (matches.length > 0) {
            results.push({ file: item, matches })
          }
        } else if (item.children) {
          traverse(item.children)
        }
      }
    }

    traverse(files)
    return results
  }

  generateProjectContext(files: FileItem[]): string {
    const allFiles = this.getAllFiles(files)
    const textFiles = allFiles.filter(file => 
      file.content && 
      !BINARY_EXTENSIONS.has(file.name.split('.').pop()?.toLowerCase() || '')
    )

    let context = `Project Structure:\n${this.generateFileTreeString(files)}\n\n`

    // Add content from important files (limit to first 10 files to avoid token limits)
    const importantFiles = textFiles.slice(0, 10)
    for (const file of importantFiles) {
      if (file.content) {
        context += `\n--- ${file.name} ---\n${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n`
      }
    }

    return context
  }

  private generateFileTreeString(files: FileItem[], depth = 0): string {
    let result = ''
    const indent = '  '.repeat(depth)

    for (const file of files) {
      const icon = file.type === 'directory' ? '📁' : '📄'
      result += `${indent}${icon} ${file.name}\n`

      if (file.type === 'directory' && file.children) {
        result += this.generateFileTreeString(file.children, depth + 1)
      }
    }

    return result
  }
}

export const fileSystemManager = FileSystemManager.getInstance()
