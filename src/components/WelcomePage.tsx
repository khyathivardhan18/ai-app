import type React from 'react'
import MetallicLogo from './MetallicLogo'

const WelcomePage: React.FC = () => {
  const actionButtons = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Start Chat",
      description: "Begin conversation with Edith AI"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Quick Actions",
      description: "Generate content, code, or analysis"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Settings",
      description: "Configure API and preferences"
    }
  ]

  const recentChats = [
    { name: "Code Review Assistant", path: "~/ai-projects/code-review" },
    { name: "Content Generator", path: "~/ai-projects/content-gen" },
    { name: "Data Analysis Helper", path: "~/ai-projects/data-analysis" },
    { name: "Creative Writing", path: "~/ai-projects/creative-writing" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-12">
          <MetallicLogo size={120} />
          <h1 className="text-4xl font-bold mt-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Edith AI
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Pro • <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Settings</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 mb-16">
          {actionButtons.map((button) => (
            <div
              key={button.title}
              className="group relative bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 w-48 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              {/* Metallic border effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-slate-600/20 via-slate-500/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="text-slate-300 group-hover:text-blue-400 transition-colors duration-300 mb-3">
                  {button.icon}
                </div>
                <h3 className="text-slate-200 font-semibold mb-2">{button.title}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                  {button.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent chats section */}
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-400 text-sm font-medium">Recent chats</h2>
            <button className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              View all (8)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentChats.map((chat) => (
              <div
                key={chat.name}
                className="group flex items-center justify-between bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 hover:bg-slate-700/30 hover:border-slate-600/30 transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500/60 group-hover:bg-blue-400/80 transition-colors" />
                  <span className="text-slate-300 group-hover:text-slate-200 transition-colors">
                    {chat.name}
                  </span>
                </div>
                <span className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
                  {chat.path}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 text-slate-500 text-sm flex items-center gap-4">
          <span>Edith AI</span>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
