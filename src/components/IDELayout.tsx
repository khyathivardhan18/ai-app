import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { Folder, Terminal, X, FolderOpen, ArrowLeft } from 'lucide-react';
import FileTree, { type FileItem } from './FileTree';
import CodeEditor from './CodeEditor';
import TerminalPanel from './TerminalPanel';
import ChatInterface from './ChatInterface';
import BrowserCompatibilityWarning from './BrowserCompatibilityWarning';
import { useApp } from '../context/AppContext';
import { FileSystemManager, isFileSystemAPISupported } from '../utils/fileSystem';

// This is the new, functional IDELayout component.
const IDELayout = () => {
  const { state, getChat, updateChat } = useApp();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showTerminal, setShowTerminal] = useState(true);
  const [showBrowserWarning, setShowBrowserWarning] = useState(true);
  const [projectName, setProjectName] = useState<string>('');

  // Effect to load the current chat session
  useEffect(() => {
    if (!chatId) {
      navigate('/'); // Go home if no chat ID
      return;
    }
    const currentChat = getChat(chatId);
    if (!currentChat) {
      // Maybe create a new chat or navigate away
      navigate('/');
    }
  }, [chatId, getChat, navigate]);

  // Auto-load demo project for unsupported browsers
  useEffect(() => {
    if (!isFileSystemAPISupported() && projectFiles.length === 0) {
      handleOpenProject();
    }
  }, [projectFiles.length]);

  // Handler for the "Open Project" button inside the IDE
  const handleOpenProject = async () => {
    try {
      const fileSystemManager = FileSystemManager.getInstance();
      const project = await fileSystemManager.openProject();
      
      if (project) {
        setProjectFiles(project.files);
        setProjectName(project.name);
        
        // Automatically expand root directories
        const rootDirs = project.files.filter(f => f.type === 'directory').map(f => f.path);
        setExpandedDirs(new Set(rootDirs));
        
        // Auto-open first file if it's a demo project
        if (project.name === 'Demo Project' && project.files.length > 0) {
          const firstFile = project.files.find(f => f.type === 'file');
          if (firstFile) {
            handleFileOpen(firstFile);
          }
        }
      }
    } catch (error) {
      console.error('Error opening project:', error);
      alert('Could not open project. Please try again.');
    }
  };

  const handleFileOpen = async (file: FileItem) => {
    if (file.type !== 'file') return;
  
    const isAlreadyOpen = openTabs.some(tab => tab.path === file.path);
    if (isAlreadyOpen) {
      setActiveTabPath(file.path);
      return;
    }
  
    try {
      let content = file.content;
      let language = 'text';
      
      // If content is not loaded, try to get it from the file system
      if (!content) {
        const fileSystemManager = FileSystemManager.getInstance();
        content = await fileSystemManager.getFileContent(file.path) || '';
      }
      
      // Determine language from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          language = 'javascript';
          break;
        case 'html':
          language = 'html';
          break;
        case 'css':
          language = 'css';
          break;
        case 'json':
          language = 'json';
          break;
        case 'md':
          language = 'markdown';
          break;
        case 'py':
          language = 'python';
          break;
        case 'java':
          language = 'java';
          break;
        case 'cpp':
        case 'cc':
        case 'cxx':
          language = 'cpp';
          break;
        case 'c':
          language = 'c';
          break;
        case 'php':
          language = 'php';
          break;
        case 'rb':
          language = 'ruby';
          break;
        case 'go':
          language = 'go';
          break;
        case 'rs':
          language = 'rust';
          break;
        case 'swift':
          language = 'swift';
          break;
        case 'kt':
          language = 'kotlin';
          break;
        case 'scala':
          language = 'scala';
          break;
        case 'sh':
        case 'bash':
          language = 'bash';
          break;
        case 'sql':
          language = 'sql';
          break;
        case 'xml':
          language = 'xml';
          break;
        case 'yaml':
        case 'yml':
          language = 'yaml';
          break;
        case 'toml':
          language = 'toml';
          break;
        case 'ini':
          language = 'ini';
          break;
        default:
          language = 'text';
      }
  
      setOpenTabs([...openTabs, { 
        path: file.path, 
        name: file.name, 
        content: content || '', 
        language, 
        handle: file.handle 
      }]);
      setActiveTabPath(file.path);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const handleTabClose = (tabPath: string) => {
    const newTabs = openTabs.filter(tab => tab.path !== tabPath);
    setOpenTabs(newTabs);
    if (activeTabPath === tabPath) {
      setActiveTabPath(newTabs.length > 0 ? newTabs[0].path : null);
    }
  };

  const handleContentChange = (path: string, newContent: string) => {
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.path === path ? { ...tab, content: newContent, isDirty: true } : tab
      )
    );
  };

  const handleSave = async (path: string) => {
    const tab = openTabs.find(tab => tab.path === path);
    if (tab && tab.isDirty) {
      try {
        const fileSystemManager = FileSystemManager.getInstance();
        const success = await fileSystemManager.saveFileContent(path, tab.content);
        
        if (success) {
          setOpenTabs(tabs =>
            tabs.map(t => (t.path === path ? { ...t, isDirty: false } : t))
          );
        } else {
          alert('Failed to save file. This might be because you\'re using a browser that doesn\'t support file saving.');
        }
      } catch (error) {
        console.error('Error saving file:', error);
        alert('Error saving file. Please try again.');
      }
    }
  };

  const activeTab = openTabs.find(tab => tab.path === activeTabPath);

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden">
      <header className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 text-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-zinc-700 rounded" title="Back to Welcome">
            <ArrowLeft size={16} />
          </button>
          <span>Edith AI IDE</span>
          {projectName && (
            <span className="text-zinc-400">- {projectName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="p-1 hover:bg-zinc-700 rounded"
            title="Toggle Terminal"
          >
            <Terminal size={16} />
          </button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15}>
          <div className="p-2 border-b border-zinc-800">
            <button
              onClick={handleOpenProject}
              className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-zinc-800"
            >
              <FolderOpen size={16} />
              {isFileSystemAPISupported() ? 'Open Project' : 'Load Demo Project'}
            </button>
          </div>
          
          {showBrowserWarning && (
            <div className="p-2">
              <BrowserCompatibilityWarning 
                onDismiss={() => setShowBrowserWarning(false)}
              />
            </div>
          )}
          
          <FileTree
            files={projectFiles}
            onFileSelect={handleFileOpen}
            onFileOpen={handleFileOpen}
            selectedFile={activeTabPath || ''}
            expandedDirs={expandedDirs}
            onToggleDir={(path) =>
              setExpandedDirs(prev => {
                const newSet = new Set(prev);
                if (newSet.has(path)) newSet.delete(path);
                else newSet.add(path);
                return newSet;
              })
            }
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-600 transition-colors" />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel>
              <div className="flex flex-col h-full">
                <div className="h-10 bg-zinc-800 border-b border-zinc-700 flex items-center flex-shrink-0">
                  {openTabs.map(tab => (
                    <div
                      key={tab.path}
                      onClick={() => setActiveTabPath(tab.path)}
                      className={`flex items-center px-3 py-2 border-r border-zinc-700 cursor-pointer group ${
                        activeTabPath === tab.path ? 'bg-zinc-900' : ''
                      }`}
                    >
                      <span className="truncate">{tab.name}{tab.isDirty ? '*' : ''}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTabClose(tab.path);
                        }}
                        className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {activeTab ? (
                    <CodeEditor
                      content={activeTab.content}
                      language={activeTab.language}
                      filename={activeTab.name}
                      onChange={(value) => handleContentChange(activeTab.path, value)}
                      onSave={() => handleSave(activeTab.path)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                      <div className="text-center">
                        <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No file selected</p>
                        <p className="text-sm">Open a file from the file tree to start editing</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
            {showTerminal && (
              <>
                <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-blue-600 transition-colors" />
                <Panel defaultSize={25} minSize={15}>
                  <TerminalPanel onClose={() => setShowTerminal(false)} />
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-600 transition-colors" />
        <Panel defaultSize={30} minSize={20}>
          <ChatInterface chatId={chatId!} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  handle?: any; // FileSystemFileHandle
  isDirty?: boolean;
}

export default IDELayout;
