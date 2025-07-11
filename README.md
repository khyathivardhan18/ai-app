<div align="center">
  <img src="https://raw.githubusercontent.com/khyathivardhan18/ai-app/main/src/components/MetallicLogo.tsx" alt="Edith AI Logo" width="120"/>
  
  # Edith AI App
  
  <em>🚀 Next-Generation AI-Powered Web IDE with Gemini Integration</em>
  
  [![Deploy to GitHub Pages](https://github.com/khyathivardhan18/ai-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/khyathivardhan18/ai-app/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Made with Vite](https://img.shields.io/badge/Vite-6.3.5-blueviolet?logo=vite)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![GitHub Stars](https://img.shields.io/github/stars/khyathivardhan18/ai-app?style=social)](https://github.com/khyathivardhan18/ai-app)
  [![GitHub Forks](https://img.shields.io/github/forks/khyathivardhan18/ai-app?style=social)](https://github.com/khyathivardhan18/ai-app)
</div>

---

## 🌟 What Makes This Special?

**Edith AI App** is a cutting-edge, AI-powered web IDE that brings the power of Google's Gemini AI directly into your development workflow. Built with modern web technologies, it provides a seamless coding experience with intelligent assistance, file management, and real-time collaboration capabilities.

### 🎯 Key Highlights
- **AI-First Development**: Integrated Gemini AI for intelligent code assistance
- **Modern Web Stack**: Built with React 18, Vite 6, and TypeScript
- **Professional IDE Features**: File explorer, syntax highlighting, terminal integration
- **Secure by Design**: Environment-based API key management
- **Deployment Ready**: Automated GitHub Actions deployment to Pages

---

## ✨ Features

### 🗂️ **Advanced File Management**
- Intuitive file tree with drag-and-drop support
- Multi-file editing with tabbed interface
- Real-time file system integration

### 📝 **Intelligent Code Editor**
- Syntax highlighting for multiple languages
- Auto-completion and error detection
- Context-aware AI suggestions

### 🤖 **AI-Powered Assistant**
- Gemini AI integration for coding assistance
- Context-aware code suggestions
- Natural language code explanations
- Debugging and optimization tips

### 💻 **Integrated Development Environment**
- Built-in terminal with command history
- AI-powered command suggestions
- Real-time project status monitoring

### 🎨 **Modern UI/UX**
- Dark/Light theme switching
- Responsive design for all devices
- Smooth animations and transitions
- Professional IDE-like interface

### 🔒 **Enterprise-Grade Security**
- Secure API key management
- Environment-based configuration
- No sensitive data in repository
- Automated secure deployment

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/khyathivardhan18/ai-app.git
cd ai-app

# Install dependencies
npm install

# Set up your API key (create .env file)
echo "VITE_API_KEY=your_gemini_api_key_here" > .env

# Start development server
npm run dev
```

**Open [http://localhost:5173/ai-app/](http://localhost:5173/ai-app/) in your browser**

---

## 🛡️ Security & Configuration

### Local Development
```env
# .env file (never commit this!)
VITE_API_KEY=your_actual_gemini_api_key_here
```

### Production Deployment
1. Go to **Settings → Secrets and variables → Actions**
2. Add repository secret: `VITE_API_KEY`
3. Push to `main` branch for automatic deployment

**🔐 Security Best Practices:**
- API keys are never committed to the repository
- Environment variables are injected at build time
- All sensitive data is encrypted in GitHub Secrets
- Regular security audits and updates

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18.3.1 | UI Framework |
| [Vite](https://vitejs.dev/) | 6.3.5 | Build Tool |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.3 | Type Safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | Styling |
| [Google Gemini AI](https://ai.google.dev/) | Latest | AI Integration |
| [GitHub Actions](https://github.com/features/actions) | - | CI/CD |

---

## 📦 Architecture

```
ai-app/
├── src/
│   ├── components/          # React components
│   │   ├── IDELayout.tsx   # Main IDE layout
│   │   ├── FileTree.tsx    # File explorer
│   │   ├── CodeEditor.tsx  # Code editor
│   │   ├── AIChat.tsx      # AI chat interface
│   │   └── TerminalPanel.tsx # Terminal component
│   ├── context/            # React context & state
│   ├── services/           # External services (Gemini AI)
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
├── .github/workflows/      # GitHub Actions
├── public/                 # Static assets
└── dist/                   # Build output
```

---

## 🌐 Live Demo

**Experience Edith AI App live:** [https://khyathivardhan18.github.io/ai-app/](https://khyathivardhan18.github.io/ai-app/)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/khyathivardhan18/ai-app/issues) page
- Provide detailed reproduction steps
- Include browser/OS information

### 💡 Feature Requests
- Open a new issue with the "enhancement" label
- Describe the feature and its benefits
- Consider implementation complexity

### 🔧 Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📋 Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📈 Roadmap

- [ ] **Multi-language Support**: Enhanced syntax highlighting
- [ ] **Real-time Collaboration**: Live coding with multiple users
- [ ] **Plugin System**: Extensible architecture for custom features
- [ ] **Advanced AI Features**: Code generation and refactoring
- [ ] **Cloud Integration**: GitHub, GitLab, and Bitbucket sync
- [ ] **Mobile Support**: Responsive design for mobile devices

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/khyathivardhan18">khyathivardhan18</a> and contributors</sub>
  
  <sub>⭐ Star this repository if you find it helpful!</sub>
</div>
