import type React from 'react'

const MetallicLogo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="drop-shadow-2xl"
      >
        <defs>
          {/* Ultra premium platinum-black metallic gradient */}
          <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="15%" stopColor="#0f0f0f" />
            <stop offset="30%" stopColor="#080808" />
            <stop offset="50%" stopColor="#030303" />
            <stop offset="70%" stopColor="#010101" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Ultra deep void metallic for extreme depth */}
          <linearGradient id="darkMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="50%" stopColor="#020202" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Platinum highlight with golden accents */}
          <linearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#e6c200" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#c4a000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b7000" stopOpacity="0.2" />
          </linearGradient>

          {/* Luxury glow filter */}
          <filter id="luxuryGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Premium shadow */}
          <filter id="premiumShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#ffd700" floodOpacity="0.3"/>
          </filter>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ultra premium background aura */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#metallic)"
          opacity="0.05"
          filter="url(#luxuryGlow)"
        />

        {/* Main ultra-luxury 3D hexagon shape */}
        <path
          d="M 50 8 L 78 23 L 78 57 L 50 72 L 22 57 L 22 23 Z"
          fill="url(#metallic)"
          stroke="url(#highlight)"
          strokeWidth="2"
          filter="url(#premiumShadow)"
        />

        {/* Premium top face with golden highlight */}
        <path
          d="M 50 8 L 78 23 L 50 33 L 22 23 Z"
          fill="url(#highlight)"
          opacity="0.9"
        />

        {/* Ultra-dark depth face */}
        <path
          d="M 78 23 L 78 57 L 50 67 L 50 33 Z"
          fill="url(#darkMetallic)"
          opacity="0.95"
        />

        {/* Luxury AI neural network pattern */}
        <g opacity="0.9" filter="url(#luxuryGlow)">
          <circle cx="38" cy="33" r="2.5" fill="#ffd700" />
          <circle cx="62" cy="43" r="2.5" fill="#e6c200" />
          <circle cx="50" cy="57" r="2.5" fill="#d4af37" />
          <circle cx="42" cy="48" r="2" fill="#ffd700" />
          <circle cx="58" cy="35" r="2" fill="#e6c200" />

          <line x1="38" y1="33" x2="62" y2="43" stroke="#ffd700" strokeWidth="2" opacity="0.8" />
          <line x1="62" y1="43" x2="50" y2="57" stroke="#e6c200" strokeWidth="2" opacity="0.8" />
          <line x1="50" y1="57" x2="38" y2="33" stroke="#d4af37" strokeWidth="2" opacity="0.8" />
          <line x1="42" y1="48" x2="58" y2="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
          <line x1="38" y1="33" x2="42" y2="48" stroke="#e6c200" strokeWidth="1.5" opacity="0.6" />
          <line x1="62" y1="43" x2="58" y2="35" stroke="#d4af37" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* Ultra-premium central AI core */}
        <circle
          cx="50"
          cy="45"
          r="10"
          fill="url(#metallic)"
          stroke="#ffd700"
          strokeWidth="3"
          opacity="1"
          filter="url(#premiumShadow)"
        />

        {/* Golden core highlight */}
        <circle
          cx="46"
          cy="41"
          r="4"
          fill="url(#highlight)"
          opacity="0.95"
        />

        {/* Micro luxury detail ring */}
        <circle
          cx="50"
          cy="45"
          r="6"
          fill="none"
          stroke="#ffd700"
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>

      {/* Ultra-luxury animated aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/40 via-amber-500/30 to-yellow-600/40 blur-2xl animate-pulse" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-yellow-300/20 via-gold/25 to-amber-400/20 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute inset-4 rounded-full bg-yellow-400/10 blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}

export default MetallicLogo
