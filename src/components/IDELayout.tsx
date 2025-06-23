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
import { useApp } from '../context/AppContext';

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


  // Handler for the "Open Project" button inside the IDE
  const handleOpenProject = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      await dirHandle.requestPermission({ mode: 'readwrite' });
      const files = await buildFileTree(dirHandle);
      setProjectFiles(files);
      // Automatically expand root directories
      const rootDirs = files.filter(f => f.type === 'directory').map(f => f.path);
      setExpandedDirs(new Set(rootDirs));
    } catch (error) {
      console.error('Error opening project:', error);
      alert('Could not open project. Please ensure your browser supports the File System Access API and that you have granted permissions.');
    }
  };

  // Helper to recursively build the file tree from the directory handle
  async function buildFileTree(directoryHandle: any, path = ''): Promise<FileItem[]> {
    const files: FileItem[] = [];
    for await (const handle of directoryHandle.values()) {
      const newPath = path ? `${path}/${handle.name}` : handle.name;
      if (handle.kind === 'file') {
        files.push({ name: handle.name, path: newPath, type: 'file', handle });
      } else if (handle.kind === 'directory') {
        files.push({
          name: handle.name,
          path: newPath,
          type: 'directory',
          children: await buildFileTree(handle, newPath),
          handle,
        });
      }
    }
    return files;
  }

  const handleFileOpen = async (file: FileItem) => {
    if (file.type !== 'file' || !file.handle) return;
  
    const isAlreadyOpen = openTabs.some(tab => tab.path === file.path);
    if (isAlreadyOpen) {
      setActiveTabPath(file.path);
      return;
    }
  
    try {
      const fileHandle = file.handle as any;
      const fileData = await fileHandle.getFile();
      const content = await fileData.text();
      const language = file.name.split('.').pop() || 'typescript';
  
      setOpenTabs([...openTabs, { path: file.path, name: file.name, content, language, handle: fileHandle }]);
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
    if (tab && tab.isDirty && tab.handle) {
      try {
        const writable = await (tab.handle as any).createWritable();
        await writable.write(tab.content);
        await writable.close();
        setOpenTabs(tabs =>
          tabs.map(t => (t.path === path ? { ...t, isDirty: false } : t))
        );
      } catch (error) {
        console.error('Error saving file:', error);
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
              Open Project
            </button>
          </div>
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
                      <div className="flex h-full items-center justify-center text-zinc-500">
                         {projectFiles.length === 0 ? "Click 'Open Project' to start" : "Select a file to open"}
                      </div>
                    )}
                  </Panel>
                  <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-600 transition-colors" />
                  <Panel defaultSize={40}>
                    {chatId ? <ChatInterface chatId={chatId} /> : <div className="p-4">No chat selected.</div>}
                  </Panel>
                </PanelGroup>
              </div>
            </Panel>
            {showTerminal && (
              <>
                <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-blue-600 transition-colors" />
                <Panel defaultSize={30} minSize={10}>
                  <TerminalPanel onClose={() => setShowTerminal(false)} />
                </Panel>
              </>
            )}
          </PanelGroup>
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
