import { useState, useEffect } from 'react';
import type { GameStats } from './GameScene';
import { fetchRankPreview, type RankDisplayRow } from '../lib/supabase';

interface RankContext {
  rows: RankDisplayRow[];
  playerRank: number;
}

interface GameUIProps {
  stats: GameStats;
  isGameOver: boolean;
  isVictory: boolean;
  isPaused: boolean;
  onRestart: () => void;
  onPause: () => void;
  onResume: () => void;
  showUpgrade: boolean;
  onUpgrade: (type: string) => void;
  onBackToMenu?: () => void;
  onSubmitScore?: (name: string) => Promise<boolean>;
  showHealEffect?: boolean;
  mode?: 'normal' | 'endless';
  wave?: number;
}

const UPGRADES = [
  { id: 'dash-cooldown', name: 'DASH SPD', description: 'Cooldown -20%', icon: '⚡' },
  { id: 'dash-distance', name: 'DASH DST', description: 'Distance +30%', icon: '🚀' },
  { id: 'speed-up', name: 'SPEED UP', description: 'Move +20%', icon: '>' },
  { id: 'life-steal', name: 'LIFE STEAL', description: 'Heal on hit', icon: '💚' }
];

export const GameUI: React.FC<GameUIProps> = ({
  stats,
  isGameOver,
  isVictory,
  isPaused,
  onRestart,
  onPause,
  onResume,
  showUpgrade,
  onUpgrade,
  onBackToMenu,
  onSubmitScore,
  showHealEffect,
  mode,
  wave
}) => {
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rankContext, setRankContext] = useState<RankContext | null>(null);

  // 结算界面出现时立即加载排名预览
  useEffect(() => {
    const showEndScreen = isVictory || isGameOver;
    if (!showEndScreen || !mode) return;
    // normal 模式只有 victory 才显示排名, endless 模式 game over 显示
    const shouldPreview = (mode === 'normal' && isVictory) || (mode !== 'normal' && isGameOver);
    if (!shouldPreview) return;

    fetchRankPreview(mode, stats.score, wave ?? 1).then(result => {
      if (result) setRankContext(result);
    });
  }, [isVictory, isGameOver, mode, stats.score, wave]);

  const handleSubmit = async () => {
    if (!nickname.trim() || !onSubmitScore || submitting) return;
    setSubmitting(true);
    const success = await onSubmitScore(nickname.trim());
    if (success) setSubmitted(true);
    setSubmitting(false);
  };

  const renderRankContext = () => {
    if (!rankContext) return null;
    const isEndless = mode !== 'normal';
    return (
      <div
        className="bg-[#1a1a2e] border-2 border-[#ffff00] p-4 mb-6"
        style={{ boxShadow: '4px 4px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
      >
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 text-center">
          YOU PLACED <span className="text-[#ffff00]">#{rankContext.playerRank}</span>
        </p>
        <table className="w-full">
          <tbody>
            {rankContext.rows.map((row, i) => {
              if (row.isEllipsis) {
                return (
                  <tr key={`ellipsis-${i}`}>
                    <td colSpan={4} className="py-1 text-center text-gray-500 text-xs">...</td>
                  </tr>
                );
              }
              const isYou = row.isPlayer;
              const rankColor = row.rank === 1 ? '#ffff00' : row.rank === 2 ? '#c0c0c0' : row.rank === 3 ? '#cd7f32' : '#ffffff';
              return (
                <tr
                  key={row.rank}
                  className={`border-t border-gray-700/50 ${isYou ? 'bg-[#ffff00]/10' : ''}`}
                >
                  <td
                    className="py-1.5 pr-2 font-bold text-[10px] w-8"
                    style={{ color: isYou ? '#ffff00' : rankColor, fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {row.rank}
                  </td>
                  <td
                    className={`py-1.5 text-[10px] uppercase ${isYou ? 'text-[#ffff00] font-bold' : 'text-white'}`}
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {isYou ? 'YOU' : row.player_name}
                  </td>
                  <td
                    className="py-1.5 text-right text-[#00ffc8] text-[10px]"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {row.score.toLocaleString()}
                  </td>
                  {isEndless && (
                    <td
                      className="py-1.5 text-right text-[#ff00ff] text-[10px] pl-2"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                    >
                      W{row.wave}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getPhaseName = (phase: number) => {
    switch (phase) {
      case 1: return 'PHASE 1';
      case 2: return 'PHASE 2';
      case 3: return 'PHASE 3';
      default: return 'UNKNOWN';
    }
  };

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return '#00ff88';
      case 2: return '#ffaa00';
      case 3: return '#ff0066';
      default: return '#ffffff';
    }
  };

  if (isVictory) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/95 z-50 font-mono">
        <div className="text-center">
          <h1
            className="text-5xl font-bold mb-6 text-[#00ffc8] uppercase tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '4px 4px 0 #000, 6px 6px 0 rgba(0,255,200,0.5)' }}
          >
            VICTORY!
          </h1>

          <div
            className="bg-[#1a1a2e] border-2 border-[#00ffc8] p-6 mb-8"
            style={{ boxShadow: '6px 6px 0 rgba(0, 255, 200, 0.3)', imageRendering: 'pixelated' }}
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Score</p>
                <p className="text-2xl font-bold text-[#00ffc8]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {stats.score.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Time</p>
                <p className="text-2xl font-bold text-[#ffff00]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {formatTime(stats.time)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Graze</p>
                <p className="text-2xl font-bold text-[#ff00ff]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {stats.grazeCount}
                </p>
              </div>
            </div>
          </div>

          {/* Rank Preview */}
          {renderRankContext()}

          {/* Score Submission */}
          {onSubmitScore && !submitted ? (
            <div
              className="bg-[#1a1a2e] border-2 border-[#ffff00] p-4 mb-6"
              style={{ boxShadow: '4px 4px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 text-center">SUBMIT TO LEADERBOARD</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                  placeholder="NICKNAME"
                  maxLength={12}
                  className="flex-1 bg-[#0a0a0f] border-2 border-gray-600 text-white px-3 py-2 text-xs font-mono uppercase tracking-wider placeholder-gray-600 focus:border-[#ffff00] focus:outline-none"
                  style={{ imageRendering: 'pixelated' }}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleSubmit(); }}
                  onKeyUp={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!nickname.trim() || submitting}
                  className="px-4 py-2 bg-[#1a1a2e] border-2 border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '3px 3px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
                >
                  {submitting ? '...' : 'SUBMIT'}
                </button>
              </div>
            </div>
          ) : submitted ? (
            <div className="mb-6 text-center">
              <p className="text-[#ffff00] text-xs uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                SCORE SUBMITTED!
              </p>
            </div>
          ) : null}

          <div className="flex flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-5 py-3 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #00ffc8',
                imageRendering: 'pixelated'
              }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={onBackToMenu}
              className="px-5 py-3 bg-[#1a1a2e] border-2 border-[#ff0066] text-[#ff0066] hover:bg-[#ff0066] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #ff0066',
                imageRendering: 'pixelated'
              }}
            >
              MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUpgrade) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/95 z-50 font-mono">
        <div 
          className="bg-[#1a1a2e] border-2 border-[#00ffc8] p-8 max-w-2xl w-full mx-4"
          style={{ boxShadow: '8px 8px 0 rgba(0, 255, 200, 0.3)', imageRendering: 'pixelated' }}
        >
          <h2 
            className="text-2xl font-bold text-center mb-2 text-[#00ffc8] uppercase tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '3px 3px 0 #ff0066' }}
          >
            LEVEL UP!
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-wider">Choose upgrade</p>
          
          <div className="grid grid-cols-2 gap-4">
            {UPGRADES.map((upgrade) => (
              <button
                key={upgrade.id}
                onClick={() => onUpgrade(upgrade.id)}
                className="group relative bg-[#0a0a0f] border-2 border-gray-600 hover:border-[#00ffc8] p-4 transition-all duration-200 hover:translate-x-1 hover:translate-y-1"
                style={{ boxShadow: '4px 4px 0 #333', imageRendering: 'pixelated' }}
              >
                <div className="text-2xl mb-2">{upgrade.icon}</div>
                <h3 
                  className="text-xs font-bold text-white mb-1 uppercase"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {upgrade.name}
                </h3>
                <p className="text-xs text-gray-400">{upgrade.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/95 z-50 font-mono">
        <div className="text-center">
          <h1 
            className="text-5xl font-bold mb-6 text-[#ff0066] uppercase tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '4px 4px 0 #000, 6px 6px 0 rgba(255,0,102,0.5)' }}
          >
            GAME OVER
          </h1>
          
          <div 
            className="bg-[#1a1a2e] border-2 border-[#ff0066] p-6 mb-8"
            style={{ boxShadow: '6px 6px 0 rgba(255, 0, 102, 0.3)', imageRendering: 'pixelated' }}
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Score</p>
                <p className="text-2xl font-bold text-[#00ffc8]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {stats.score.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Time</p>
                <p className="text-2xl font-bold text-[#ffff00]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {formatTime(stats.time)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Graze</p>
                <p className="text-2xl font-bold text-[#ff00ff]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                  {stats.grazeCount}
                </p>
              </div>
            </div>
          </div>
          
          {/* Rank Preview - only for endless mode on game over */}
          {mode !== 'normal' && renderRankContext()}

          {/* Score Submission - only for endless mode on game over */}
          {mode !== 'normal' && onSubmitScore && !submitted ? (
            <div
              className="bg-[#1a1a2e] border-2 border-[#ffff00] p-4 mb-6"
              style={{ boxShadow: '4px 4px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 text-center">SUBMIT TO LEADERBOARD</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                  placeholder="NICKNAME"
                  maxLength={12}
                  className="flex-1 bg-[#0a0a0f] border-2 border-gray-600 text-white px-3 py-2 text-xs font-mono uppercase tracking-wider placeholder-gray-600 focus:border-[#ffff00] focus:outline-none"
                  style={{ imageRendering: 'pixelated' }}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleSubmit(); }}
                  onKeyUp={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!nickname.trim() || submitting}
                  className="px-4 py-2 bg-[#1a1a2e] border-2 border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '3px 3px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
                >
                  {submitting ? '...' : 'SUBMIT'}
                </button>
              </div>
            </div>
          ) : mode !== 'normal' && submitted ? (
            <div className="mb-6 text-center">
              <p className="text-[#ffff00] text-xs uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                SCORE SUBMITTED!
              </p>
            </div>
          ) : null}

          <div className="flex flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-5 py-3 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #00ffc8',
                imageRendering: 'pixelated'
              }}
            >
              TRY AGAIN
            </button>
            <button
              onClick={onBackToMenu}
              className="px-5 py-3 bg-[#1a1a2e] border-2 border-[#ff0066] text-[#ff0066] hover:bg-[#ff0066] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #ff0066',
                imageRendering: 'pixelated'
              }}
            >
              MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/90 z-50 font-mono">
        <div className="text-center">
          <h2
            className="text-4xl font-bold mb-8 text-[#ffff00] uppercase tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '3px 3px 0 #000' }}
          >
            PAUSED
          </h2>
          <div className="flex flex-row gap-4">
            <button
              onClick={onResume}
              className="px-8 py-4 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #00ffc8',
                imageRendering: 'pixelated'
              }}
            >
              RESUME
            </button>
            <button
              onClick={onBackToMenu}
              className="px-5 py-3 bg-[#1a1a2e] border-2 border-[#ff0066] text-[#ff0066] hover:bg-[#ff0066] hover:text-[#0a0a0f] font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                boxShadow: '4px 4px 0 #ff0066',
                imageRendering: 'pixelated'
              }}
            >
              MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Boss Health Bar - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none font-mono z-10">
        <div
          className="bg-[#1a1a2e]/90 border-2 border-gray-600 px-4 py-2"
          style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.5)', imageRendering: 'pixelated' }}
        >
          <div className="flex items-center justify-between mb-1 gap-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Boss</p>
            <p
              className="text-xs font-bold uppercase"
              style={{ color: getPhaseColor(stats.bossPhase), fontFamily: '"Press Start 2P", monospace' }}
            >
              {getPhaseName(stats.bossPhase)}
            </p>
          </div>
          <div
            className="w-64 h-4 bg-[#0a0a0f] border border-gray-600 overflow-hidden"
            style={{ imageRendering: 'pixelated' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.max(0, stats.bossHealth)}%`,
                backgroundColor: getPhaseColor(stats.bossPhase)
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Left HUD - Score & Time & Graze */}
      <div className="absolute top-4 left-4 flex gap-3 pointer-events-none font-mono">
        <div
          className="bg-[#1a1a2e]/90 border-2 border-[#00ffc8] px-3 py-2"
          style={{ boxShadow: '3px 3px 0 rgba(0, 255, 200, 0.3)', imageRendering: 'pixelated' }}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score</p>
          <p className="text-lg font-bold text-[#00ffc8]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {stats.score.toLocaleString()}
          </p>
        </div>
        <div
          className="bg-[#1a1a2e]/90 border-2 border-[#ffff00] px-3 py-2"
          style={{ boxShadow: '3px 3px 0 rgba(255, 255, 0, 0.3)', imageRendering: 'pixelated' }}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Time</p>
          <p className="text-lg font-bold text-[#ffff00]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {formatTime(stats.time)}
          </p>
        </div>
        <div
          className="bg-[#1a1a2e]/90 border-2 border-[#ff00ff] px-3 py-2"
          style={{ boxShadow: '3px 3px 0 rgba(255, 0, 255, 0.3)', imageRendering: 'pixelated' }}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Graze</p>
          <p className="text-lg font-bold text-[#ff00ff]" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {stats.grazeCount}
          </p>
        </div>
      </div>
      
      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none font-mono">
        {/* Player Health */}
        <div className="flex items-end gap-3">
          {/* Player Health - Pixel Hearts */}
          <div className="flex items-center gap-2 relative">
            <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">HP</span>
            {[...Array(3)].map((_, i) => {
              const full = stats.health >= i + 1;
              const half = !full && stats.health >= i + 0.5;
              return (
                <div
                  key={i}
                  className={`w-6 h-6 border-2 transition-all duration-200 ${
                    full
                      ? 'bg-[#00ffc8] border-[#00ffff]'
                      : half
                        ? 'border-[#00ffff]'
                        : 'bg-[#1a1a2e] border-gray-600'
                  }`}
                  style={{
                    background: half ? 'linear-gradient(90deg, #00ffc8 50%, #1a1a2e 50%)' : undefined,
                    boxShadow: full || half ? '2px 2px 0 rgba(0, 255, 200, 0.5)' : 'none',
                    imageRendering: 'pixelated'
                  }}
                />
              );
            })}
            {showHealEffect && (
              <span
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#00ff66] font-bold text-sm pointer-events-none"
                style={{
                  animation: 'healArrow 0.8s ease-out forwards',
                  textShadow: '0 0 6px #00ff66, 0 0 12px #00ff66'
                }}
              >
                +HP
              </span>
            )}
            <style>{`
              @keyframes healArrow {
                0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-16px); }
              }
            `}</style>
          </div>
        </div>
        
        {/* Controls Hint */}
        <div 
          className="bg-[#1a1a2e]/70 border border-gray-600 px-3 py-2 text-xs text-gray-400"
          style={{ imageRendering: 'pixelated' }}
        >
          <span className="text-[#00ffc8] font-bold">[WASD]</span> Move · 
          <span className="text-[#ff0066] font-bold"> [SPACE]</span> Dash
        </div>
      </div>
      
      {/* Pause Button - Top Right Corner */}
      <button
        onClick={onPause}
        className="absolute top-4 right-4 w-10 h-10 bg-[#1a1a2e] border-2 border-gray-600 hover:border-[#00ffc8] flex items-center justify-center transition-all duration-200 z-20"
        style={{ boxShadow: '3px 3px 0 #333', imageRendering: 'pixelated' }}
      >
        <div className="flex gap-1">
          <div className="w-2 h-5 bg-white" />
          <div className="w-2 h-5 bg-white" />
        </div>
      </button>
    </>
  );
};

export default GameUI;
