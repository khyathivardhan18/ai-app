# 🚀 Edith AI - AI-Powered Development Assistant

<div align="center">

![Edith AI Logo](https://img.shields.io/badge/Edith%20AI-Powered%20Development%20Assistant-blue?style=for-the-badge&logo=ai)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite)

**Your intelligent coding companion with real-time AI assistance, file system access, and a modern IDE experience.**

[Live Demo](https://your-username.github.io/ai-app/) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## ✨ Features

### 🤖 **AI-Powered Development**
- **Real-time AI Chat**: Get instant help with coding questions, debugging, and project analysis
- **Gemini AI Integration**: Powered by Google's Gemini 1.5 Flash model for intelligent responses
- **Context-Aware**: AI understands your project structure and codebase
- **Code Suggestions**: Receive intelligent code recommendations and improvements

### 🗂️ **File System Integration**
- **Real File Access**: Open and edit your actual project files (Chrome/Edge)
- **File Tree Navigation**: Intuitive dropdown file tree with smooth animations
- **Multi-file Support**: Work with entire project directories
- **Demo Mode**: Fallback support for browsers without File System Access API

### 💻 **Modern IDE Experience**
- **Code Editor**: Syntax highlighting for multiple languages
- **Terminal Integration**: Built-in terminal for command execution
- **Resizable Panels**: Customizable layout with drag-and-drop resizing
- **Tab Management**: Multi-file editing with tabbed interface

### 🎨 **Beautiful UI/UX**
- **Dark/Light Themes**: Toggle between themes with smooth transitions
- **Particle Background**: Animated particle effects for premium feel
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Smooth Animations**: Framer Motion powered interactions

### 🔧 **Developer Tools**
- **Project Analysis**: AI-powered codebase understanding
- **File Search**: Quick file navigation and search
- **Code Formatting**: Automatic code formatting and linting
- **Error Detection**: Real-time error highlighting and suggestions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome/Edge recommended for full features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-app.git
   cd ai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173/ai-app/
   ```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📖 Usage Guide

### 🆕 **Starting a New Chat**
1. Click "New Chat" on the welcome page
2. Type your coding questions or requests
3. Get instant AI assistance with your development tasks

### 📁 **Opening a Project**
1. Click "Open File/Project" on the welcome page
2. Select your project directory (Chrome/Edge) or describe your project
3. The IDE will load with your project files
4. Use the file tree to navigate and edit files
5. Chat with AI about your specific codebase

### 🎯 **IDE Features**

#### **File Tree Navigation**
- **Dropdown Animation**: Smooth expand/collapse with chevron indicators
- **File Icons**: Color-coded icons for different file types
- **File Sizes**: Display file sizes for better project overview
- **Scrollable**: Proper scrollbars for large project structures

#### **Code Editor**
- **Syntax Highlighting**: Support for JavaScript, TypeScript, Python, Java, and more
- **Line Numbers**: Easy code navigation
- **Auto-save**: Automatic file saving
- **Error Highlighting**: Real-time error detection

#### **Terminal Panel**
- **Command Execution**: Run terminal commands directly in the IDE
- **Output Display**: Real-time command output
- **History**: Command history for easy re-execution

#### **AI Chat Integration**
- **Context-Aware**: AI understands your current project
- **File References**: Ask about specific files in your project
- **Code Analysis**: Get suggestions for code improvements
- **Debugging Help**: AI assistance with troubleshooting

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.6.3** - Type-safe development
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions

### **AI Integration**
- **Google Gemini API** - Advanced AI model for intelligent responses
- **Real-time Streaming** - Live AI response streaming
- **Context Management** - Project-aware AI conversations

### **File System**
- **File System Access API** - Modern browser API for file access
- **Fallback Support** - Demo mode for unsupported browsers
- **File Tree Management** - Hierarchical file organization

### **Development Tools**
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Biome** - Fast formatter and linter
- **GitHub Pages** - Easy deployment

---

## 🌐 Browser Support

| Browser | File System Access | Clipboard API | Status |
|---------|-------------------|---------------|---------|
| Chrome 86+ | ✅ Full Support | ✅ Full Support | 🟢 Recommended |
| Edge 86+ | ✅ Full Support | ✅ Full Support | 🟢 Recommended |
| Firefox 100+ | ❌ Demo Mode | ✅ Full Support | 🟡 Good |
| Safari 15+ | ❌ Demo Mode | ✅ Full Support | 🟡 Good |

### **Feature Matrix**
- **🟢 Full Access**: Real file system, clipboard, all features
- **🟡 Demo Mode**: AI features, demo files, limited file access
- **🔴 Basic**: Core functionality only

---

## 🎨 Customization

### **Themes**
The app supports both dark and light themes. Toggle using the theme button in the top-right corner.

### **Styling**
Customize the appearance by modifying:
- `src/index.css` - Global styles and Tailwind configuration
- `src/components/*.tsx` - Component-specific styling
- `tailwind.config.js` - Tailwind CSS configuration

### **AI Configuration**
Configure AI settings in:
- `src/services/gemini.ts` - Gemini API configuration
- `src/context/AppContext.tsx` - AI model settings

---

## 🚀 Deployment

### **GitHub Pages**
1. Build the project: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`
3. Configure GitHub Pages in repository settings

### **Netlify**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

### **Vercel**
1. Import your GitHub repository to Vercel
2. Vercel will auto-detect the Vite configuration
3. Deploy with zero configuration

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for providing the AI capabilities
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-app/discussions)
- **Email**: support@edith-ai.com

---

<div align="center">

**Made with ❤️ by the Edith AI Team**

[![GitHub stars](https://img.shields.io/github/stars/your-username/ai-app?style=social)](https://github.com/your-username/ai-app)
[![GitHub forks](https://img.shields.io/github/forks/your-username/ai-app?style=social)](https://github.com/your-username/ai-app)
[![GitHub issues](https://img.shields.io/github/issues/your-username/ai-app)](https://github.com/your-username/ai-app/issues)

</div>
