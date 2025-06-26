# Edith AI IDE

A modern, AI-powered web-based IDE with file explorer, code editor, terminal, and integrated Gemini AI chat assistant.

## ✨ Features
- **Open any local project** (via File System Access API or folder upload)
- **File tree** with dropdowns, icons, and custom scrollbars
- **Tabbed code editor** with syntax highlighting
- **Integrated terminal** (AI-powered command assistant)
- **AI chat panel** (Gemini AI, context-aware)
- **Resizable panels** for a true IDE experience
- **Browser compatibility warnings** and graceful fallbacks
- **GitHub Pages** deployment ready

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/khyathivardhan18/ai-app.git
cd ai-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:5174/ai-app/](http://localhost:5174/ai-app/) in your browser.

## 🌐 GitHub Pages Deployment
- The app is configured to deploy to GitHub Pages under `/ai-app/`.
- To deploy:
```bash
git add .
git commit -m "Update"
git push origin main
npm run build
npm run deploy
```
- The deployed app will be available at: (https://khyathivardhan18.github.io/ai-app/)

## 🖥️ Browser Support
- **Best experience:** Chrome, Edge (full file system access)
- **Fallback:** Firefox, Safari (folder upload, demo mode)

## 🤖 AI Assistant
- Powered by Gemini AI
- Ask coding, debugging, or project questions in the right panel

## 📂 Project Structure
- `src/components/` — All UI components (IDE, FileTree, Editor, Chat, Terminal)
- `src/context/` — App context and state
- `src/services/` — Gemini AI integration
- `src/utils/` — File system and browser compatibility helpers

## 🙌 Contributing
Pull requests welcome! For major changes, open an issue first to discuss what you'd like to change.

## 📄 License
MIT
