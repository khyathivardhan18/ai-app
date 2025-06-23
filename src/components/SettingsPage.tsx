import type React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sliders, Save, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ParticleBackground from './ParticleBackground'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { state, updateSettings } = useApp()
  const [settings, setSettingsState] = useState(state.settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const hasSettingsChanges = JSON.stringify(settings) !== JSON.stringify(state.settings)
    setHasChanges(hasSettingsChanges)
  }, [settings, state.settings])

  const saveSettings = async () => {
    updateSettings(settings)
    setHasChanges(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <ParticleBackground density={40} />

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold">Settings</h1>
            <p className="text-sm text-slate-400">Configure your Edith AI experience</p>
          </div>

          {hasChanges && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Save Changes
            </motion.button>
          )}
        </div>
      </motion.header>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Ultra-Premium Status Section */}
        <motion.div
          className="bg-gradient-to-br from-black/60 via-zinc-900/80 to-black/60 border border-yellow-500/20 rounded-xl p-8 mb-8 backdrop-blur-md"
          variants={itemVariants}
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl">
              <CheckCircle className="text-yellow-400" size={28} style={{
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.3))'
              }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-100">Ultra-Premium Access</h2>
              <p className="text-amber-200/70 text-lg">Unlimited AI conversations included</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-black/50 via-zinc-900/60 to-black/50 rounded-xl p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-100">Premium Service Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg" style={{
                    boxShadow: '0 0 15px rgba(34,197,94,0.4)'
                  }} />
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">∞</div>
                  <div className="text-amber-200/60 text-sm">Daily Limit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{state.chats.length}</div>
                  <div className="text-amber-200/60 text-sm">Total Chats</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">24/7</div>
                  <div className="text-amber-200/60 text-sm">Availability</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-900/10 via-yellow-900/10 to-amber-900/10 rounded-xl p-6 border border-yellow-500/15">
              <h4 className="font-semibold text-amber-100 mb-3">Premium Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">Unlimited AI conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">Advanced Gemini models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">Priority response times</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">Ultra-premium interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">No usage restrictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-yellow-400" />
                  <span className="text-amber-200/80">Instant AI responses</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ultra-Premium AI Settings Section */}
        <motion.div
          className="bg-gradient-to-br from-black/60 via-zinc-900/80 to-black/60 border border-yellow-500/20 rounded-xl p-8 backdrop-blur-md"
          variants={itemVariants}
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,215,0,0.1)'
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl">
              <Sliders className="text-yellow-400" size={28} style={{
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.3))'
              }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-100">AI Preferences</h2>
              <p className="text-amber-200/70 text-lg">Customize your luxury AI experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-amber-100 mb-3">
                AI Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => setSettingsState({...settings, model: e.target.value})}
                className="w-full bg-gradient-to-r from-black/80 via-zinc-900/90 to-black/80 border border-yellow-500/30 rounded-xl px-5 py-4 text-amber-100 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-500/20 backdrop-blur-sm"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.1)'
                }}
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-amber-100 mb-3">
                Creativity Level: <span className="text-yellow-400">{settings.temperature}</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettingsState({...settings, temperature: Number.parseFloat(e.target.value)})}
                  className="w-full h-3 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ffd700 0%, #e6c200 ${settings.temperature * 100}%, #27272a ${settings.temperature * 100}%, #18181b 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-amber-200/70 mt-2">
                <span className="font-medium">Focused</span>
                <span className="font-medium">Creative</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-amber-100 mb-3">
                Response Length: <span className="text-yellow-400">{settings.maxTokens}</span> tokens
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="512"
                  max="4096"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => setSettingsState({...settings, maxTokens: Number.parseInt(e.target.value)})}
                  className="w-full h-3 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ffd700 0%, #e6c200 ${((settings.maxTokens - 512) / (4096 - 512)) * 100}%, #27272a ${((settings.maxTokens - 512) / (4096 - 512)) * 100}%, #18181b 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-amber-200/70 mt-2">
                <span className="font-medium">Concise</span>
                <span className="font-medium">Detailed</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-amber-900/10 via-yellow-900/10 to-amber-900/10 rounded-xl p-6 border border-yellow-500/15">
            <h4 className="font-semibold text-amber-100 mb-4 text-lg">Premium Settings Guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-yellow-400">AI Model</div>
                <div className="text-amber-200/80 leading-relaxed">Choose between lightning-fast responses or advanced reasoning capabilities</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-yellow-400">Creativity Level</div>
                <div className="text-amber-200/80 leading-relaxed">Balance between precise answers and creative, innovative responses</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-yellow-400">Response Length</div>
                <div className="text-amber-200/80 leading-relaxed">Control the depth and detail of AI-generated responses</div>
              </div>
            </div>
          </div>
        </motion.div>

        {hasChanges && (
          <motion.div
            className="fixed bottom-6 right-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(255,215,0,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={saveSettings}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full shadow-2xl hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 text-black font-bold"
              style={{
                boxShadow: '0 10px 40px rgba(255,215,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
              }}
            >
              <Save size={20} />
              Save Changes
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SettingsPage
