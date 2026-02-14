import { useState } from 'react';

interface MainMenuProps {
  onStartGame: (mode: 'normal' | 'endless') => void;
  onShowLeaderboard: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowLeaderboard }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<'normal' | 'endless' | null>(null);

  if (showCredits) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8 relative overflow-hidden font-mono">
        {/* Pixel Grid Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 200, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 200, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '8px 8px',
            imageRendering: 'pixelated'
          }}
        />

        {/* CRT Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />

        <div className="max-w-lg w-full relative z-10">
          <button
            onClick={() => setShowCredits(false)}
            className="mb-6 px-4 py-2 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] transition-all duration-200 font-mono text-sm uppercase tracking-wider"
            style={{ boxShadow: '4px 4px 0 #00ffc8', imageRendering: 'pixelated' }}
          >
            &larr; BACK
          </button>

          <h2
            className="text-3xl font-bold mb-8 text-[#ffff00] uppercase tracking-widest text-center"
            style={{
              textShadow: '3px 3px 0 #ff0066, -1px -1px 0 #00ffff',
              fontFamily: '"Press Start 2P", monospace'
            }}
          >
            CREDITS
          </h2>

          <div
            className="bg-[#1a1a2e] border-2 border-[#ffff00] p-8"
            style={{ boxShadow: '6px 6px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
          >
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-mono text-center">
              Special thanks to the following players for their testing, feedback, and suggestions that helped make this game better:
            </p>

            <div className="flex flex-col items-center gap-3 mb-6">
              {['Sir King', 'Miss Forit', 'Jerry', 'ymqs'].map((name) => (
                <span
                  key={name}
                  className="px-5 py-2 bg-[#0a0a0f] border-2 border-[#00ffc8] text-[#00ffc8] text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '3px 3px 0 rgba(0, 255, 200, 0.4)' }}
                >
                  {name}
                </span>
              ))}
            </div>

            <p className="text-gray-500 text-xs font-mono text-center uppercase tracking-wider">
              Your efforts made One Button Boss what it is today.
            </p>
          </div>
        </div>

        {/* CSS for font */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}</style>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8 relative overflow-hidden font-mono">
        {/* Pixel Grid Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 200, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 200, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '8px 8px',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* CRT Scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />
        
        <div className="max-w-4xl w-full relative z-10">
          <button
            onClick={() => setShowInstructions(false)}
            className="mb-6 px-4 py-2 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] transition-all duration-200 font-mono text-sm uppercase tracking-wider"
            style={{ boxShadow: '4px 4px 0 #00ffc8', imageRendering: 'pixelated' }}
          >
            ← BACK
          </button>
          
          <h2 
            className="text-4xl font-bold mb-8 text-[#00ffc8] uppercase tracking-widest"
            style={{ 
              textShadow: '3px 3px 0 #ff0066, -1px -1px 0 #00ffff',
              fontFamily: '"Press Start 2P", monospace'
            }}
          >
            HOW TO PLAY
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Controls */}
            <div
              className="bg-[#1a1a2e] border-2 border-[#00ffc8] p-6"
              style={{ boxShadow: '6px 6px 0 rgba(0, 255, 200, 0.3)', imageRendering: 'pixelated' }}
            >
              <h3
                className="text-lg font-bold text-[#00ffc8] mb-4 uppercase tracking-wider"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                CONTROLS
              </h3>
              <ul className="space-y-3 text-gray-300 font-mono text-sm">
                <li className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 bg-[#0a0a0f] border border-[#00ffc8] text-[#00ffc8]"
                    style={{ boxShadow: '2px 2px 0 #00ffc8' }}
                  >
                    WASD
                  </span>
                  <span>Move in 4 directions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 bg-[#0a0a0f] border border-[#00ffc8] text-[#00ffc8]"
                    style={{ boxShadow: '2px 2px 0 #00ffc8' }}
                  >
                    MOUSE
                  </span>
                  <span>Hold to move toward cursor</span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 bg-[#0a0a0f] border border-[#ff0066] text-[#ff0066]"
                    style={{ boxShadow: '2px 2px 0 #ff0066' }}
                  >
                    SPACE
                  </span>
                  <span><strong className="text-[#ff0066]">DASH</strong> - Invincible dodge!</span>
                </li>
              </ul>
              <div
                className="mt-4 p-3 bg-[#0a0a0f] border border-[#00ffc8]"
                style={{ boxShadow: '3px 3px 0 rgba(0, 255, 200, 0.5)' }}
              >
                <p className="text-xs text-[#00ffc8]">
                  Dash cooldown shown as a ring around your character
                </p>
              </div>
            </div>

            {/* Combat */}
            <div
              className="bg-[#1a1a2e] border-2 border-[#ff00ff] p-6"
              style={{ boxShadow: '6px 6px 0 rgba(255, 0, 255, 0.3)', imageRendering: 'pixelated' }}
            >
              <h3
                className="text-lg font-bold text-[#ff00ff] mb-4 uppercase tracking-wider"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                COMBAT
              </h3>
              <ul className="space-y-3 text-gray-300 font-mono text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#ff0066] font-bold">&gt;</span>
                  <div>
                    <strong className="text-[#ff0066]">Dash Attack</strong>
                    <p className="text-xs text-gray-400">Dash through the boss to deal damage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ffc8] font-bold">&gt;</span>
                  <div>
                    <strong className="text-[#00ffc8]">Graze</strong>
                    <p className="text-xs text-gray-400">Fly close to bullets for bonus score</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ffff00] font-bold">&gt;</span>
                  <div>
                    <strong className="text-[#ffff00]">I-Frames</strong>
                    <p className="text-xs text-gray-400">2s invincibility after taking damage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ff00ff] font-bold">&gt;</span>
                  <div>
                    <strong className="text-[#ff00ff]">Upgrades</strong>
                    <p className="text-xs text-gray-400">Choose a power-up between waves:</p>
                    <p className="text-xs text-gray-500 mt-1">Dash CD -20% / Dash Dist +30% / Move Speed +20% / Life Steal</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Boss Phases */}
            <div
              className="bg-[#1a1a2e] border-2 border-[#ff0066] p-6 md:col-span-2"
              style={{ boxShadow: '6px 6px 0 rgba(255, 0, 102, 0.3)', imageRendering: 'pixelated' }}
            >
              <h3
                className="text-lg font-bold text-[#ff0066] mb-4 uppercase tracking-wider"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                BOSS PHASES
              </h3>
              <p className="text-xs text-gray-400 mb-3 font-mono">Boss gains 3s shield when changing phase. Wave 2+ bullets deal 1.5x damage.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0a0a0f] border-2 border-[#00ff88]">
                  <h4
                    className="font-bold text-[#00ff88] mb-2 text-xs uppercase"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    PHASE 1
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1 font-mono">
                    <li>► Fan shots</li>
                    <li>► Circle burst</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#0a0a0f] border-2 border-[#ffaa00]">
                  <h4
                    className="font-bold text-[#ffaa00] mb-2 text-xs uppercase"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    PHASE 2
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1 font-mono">
                    <li>► Rotating bullets</li>
                    <li>► Delayed explosions</li>
                    <li>► Homing shots</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#0a0a0f] border-2 border-[#ff0066]">
                  <h4
                    className="font-bold text-[#ff0066] mb-2 text-xs uppercase"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    PHASE 3
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1 font-mono">
                    <li>► Cross barrage</li>
                    <li>► Fake bullets</li>
                    <li>► Slow zones</li>
                    <li>► Spiral storm</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden font-mono">
      {/* Pixel Grid Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 200, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 200, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Animated Pixel Blocks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#00ffc8] opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pixelFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* CRT Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />
      
      {/* Glow Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#00ffc8] opacity-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ff0066] opacity-10" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />

      {/* Credits Button - Top Right */}
      <button
        onClick={() => setShowCredits(true)}
        className="absolute top-4 right-4 z-20 px-4 py-2.5 bg-[#1a1a2e] border-2 border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-[#0a0a0f] transition-all duration-200 font-mono text-xs uppercase tracking-wider"
        style={{ boxShadow: '3px 3px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated', fontFamily: '"Press Start 2P", monospace' }}
      >
        CREDITS
      </button>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Pixel Art Title */}
        <div className="mb-8">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-2"
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '4px 4px 0 #ff0066, 8px 8px 0 rgba(255,0,102,0.3)',
              letterSpacing: '0.1em'
            }}
          >
            <span className="text-[#00ffc8]">ONE</span>
          </h1>
          <h1 
            className="text-5xl md:text-7xl font-bold mb-2"
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '4px 4px 0 #ff00ff, 8px 8px 0 rgba(255,0,255,0.3)',
              letterSpacing: '0.1em'
            }}
          >
            <span className="text-[#00ffff]">BUTTON</span>
          </h1>
          <h1 
            className="text-6xl md:text-8xl font-bold"
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '4px 4px 0 #ff0066, 8px 8px 0 rgba(255,0,102,0.3), 0 0 30px #ff0066',
              letterSpacing: '0.15em'
            }}
          >
            <span className="text-[#ff0066]">BOSS</span>
          </h1>
        </div>
        
        {/* Pixel Subtitle */}
        <p className="text-[#00ffc8] text-sm mb-12 max-w-md mx-auto font-mono uppercase tracking-widest">
          A Pixel Bullet Hell Experience
          <br />
          <span className="text-[#ff0066]">One Button. Infinite Challenge.</span>
        </p>
        
        {/* Game Mode Selection - Pixel Style */}
        <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
          <button
            onClick={() => onStartGame('normal')}
            onMouseEnter={() => setHoveredMode('normal')}
            onMouseLeave={() => setHoveredMode(null)}
            className="group relative px-8 py-6 bg-[#1a1a2e] border-2 border-[#00ffc8] transition-all duration-200 hover:translate-x-1 hover:translate-y-1"
            style={{ 
              boxShadow: hoveredMode === 'normal' ? '8px 8px 0 #00ffc8' : '4px 4px 0 #00ffc8',
              imageRendering: 'pixelated'
            }}
          >
            <div 
              className="text-xs font-bold text-[#00ffc8] mb-1 uppercase tracking-widest"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              ► NORMAL MODE
            </div>
            <p className="text-xs text-gray-400 font-mono">Defeat the boss</p>
          </button>
          
          <button
            onClick={() => onStartGame('endless')}
            onMouseEnter={() => setHoveredMode('endless')}
            onMouseLeave={() => setHoveredMode(null)}
            className="group relative px-8 py-6 bg-[#1a1a2e] border-2 border-[#ff00ff] transition-all duration-200 hover:translate-x-1 hover:translate-y-1"
            style={{ 
              boxShadow: hoveredMode === 'endless' ? '8px 8px 0 #ff00ff' : '4px 4px 0 #ff00ff',
              imageRendering: 'pixelated'
            }}
          >
            <div 
              className="text-xs font-bold text-[#ff00ff] mb-1 uppercase tracking-widest"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              ► ENDLESS MODE
            </div>
            <p className="text-xs text-gray-400 font-mono">Survive waves</p>
          </button>
        </div>
        
        {/* Instructions & Leaderboard Buttons */}
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowInstructions(true)}
            className="px-6 py-3 bg-[#1a1a2e] border-2 border-gray-600 text-gray-400 hover:text-[#00ffc8] hover:border-[#00ffc8] transition-all duration-200 font-mono text-xs uppercase tracking-wider"
            style={{ boxShadow: '3px 3px 0 #333' }}
          >
            ? HOW TO PLAY
          </button>
          <button
            onClick={onShowLeaderboard}
            className="px-6 py-3 bg-[#1a1a2e] border-2 border-gray-600 text-gray-400 hover:text-[#ffff00] hover:border-[#ffff00] transition-all duration-200 font-mono text-xs uppercase tracking-wider"
            style={{ boxShadow: '3px 3px 0 #333' }}
          >
            LEADERBOARD
          </button>
        </div>
      </div>
      
      {/* Footer - Pixel Style */}
      <div 
        className="absolute bottom-4 text-[#00ffc8] text-xs font-mono uppercase tracking-widest"
        style={{ textShadow: '2px 2px 0 #000' }}
      >
        Press <span className="text-[#ff0066]">[SPACE]</span> to Dash · Avoid <span className="text-[#ff0066]">■</span> Bullets
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes pixelFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
};

export default MainMenu;
