import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  onBackToMenu: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToMenu }) => {
  const [tab, setTab] = useState<'normal' | 'endless'>('normal');
  const [endlessSort, setEndlessSort] = useState<'wave' | 'score'>('wave');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const orderBy = tab === 'endless' ? endlessSort : undefined;
    fetchLeaderboard(tab, orderBy).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [tab, endlessSort]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden font-mono">
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

      <div className="max-w-2xl w-full relative z-10">
        {/* Back Button */}
        <button
          onClick={onBackToMenu}
          className="mb-3 px-3 py-1.5 bg-[#1a1a2e] border-2 border-[#00ffc8] text-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f] transition-all duration-200 font-mono text-sm uppercase tracking-wider"
          style={{ boxShadow: '4px 4px 0 #00ffc8', imageRendering: 'pixelated' }}
        >
          &larr; BACK
        </button>

        {/* Title */}
        <h2
          className="text-3xl font-bold mb-4 text-[#00ffc8] uppercase tracking-widest text-center"
          style={{
            textShadow: '3px 3px 0 #ff0066, -1px -1px 0 #00ffff',
            fontFamily: '"Press Start 2P", monospace'
          }}
        >
          LEADERBOARD
        </h2>

        {/* Tabs */}
        <div className="flex gap-3 mb-3 justify-center">
          <button
            onClick={() => setTab('normal')}
            className={`px-5 py-2 border-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              tab === 'normal'
                ? 'bg-[#00ffc8] text-[#0a0a0f] border-[#00ffc8]'
                : 'bg-[#1a1a2e] text-[#00ffc8] border-[#00ffc8] hover:bg-[#00ffc8] hover:text-[#0a0a0f]'
            }`}
            style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '3px 3px 0 rgba(0, 255, 200, 0.3)', imageRendering: 'pixelated' }}
          >
            NORMAL
          </button>
          <button
            onClick={() => setTab('endless')}
            className={`px-5 py-2 border-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              tab === 'endless'
                ? 'bg-[#ff00ff] text-[#0a0a0f] border-[#ff00ff]'
                : 'bg-[#1a1a2e] text-[#ff00ff] border-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#0a0a0f]'
            }`}
            style={{ fontFamily: '"Press Start 2P", monospace', boxShadow: '3px 3px 0 rgba(255, 0, 255, 0.3)', imageRendering: 'pixelated' }}
          >
            ENDLESS
          </button>
        </div>

        {/* Endless Sub-tabs */}
        {tab === 'endless' && (
          <div className="flex gap-2 mb-3 justify-center">
            <button
              onClick={() => setEndlessSort('wave')}
              className={`px-3 py-1.5 border text-[8px] font-bold uppercase tracking-widest transition-all duration-200 ${
                endlessSort === 'wave'
                  ? 'bg-[#ff00ff] text-[#0a0a0f] border-[#ff00ff]'
                  : 'bg-transparent text-[#ff00ff] border-[#ff00ff]/50 hover:bg-[#ff00ff]/20'
              }`}
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              BY WAVE
            </button>
            <button
              onClick={() => setEndlessSort('score')}
              className={`px-3 py-1.5 border text-[8px] font-bold uppercase tracking-widest transition-all duration-200 ${
                endlessSort === 'score'
                  ? 'bg-[#ff00ff] text-[#0a0a0f] border-[#ff00ff]'
                  : 'bg-transparent text-[#ff00ff] border-[#ff00ff]/50 hover:bg-[#ff00ff]/20'
              }`}
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              BY SCORE
            </button>
          </div>
        )}

        {/* Table */}
        <div
          className="bg-[#1a1a2e] border-2 px-4 py-3"
          style={{
            borderColor: tab === 'normal' ? '#00ffc8' : '#ff00ff',
            boxShadow: `6px 6px 0 ${tab === 'normal' ? 'rgba(0, 255, 200, 0.3)' : 'rgba(255, 0, 255, 0.3)'}`,
            imageRendering: 'pixelated'
          }}
        >
          {loading ? (
            <p
              className="text-center text-gray-400 py-6 text-xs uppercase tracking-wider"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              LOADING...
            </p>
          ) : entries.length === 0 ? (
            <p
              className="text-center text-gray-400 py-6 text-xs uppercase tracking-wider"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              NO SCORES YET
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="text-left pb-2 pr-2">#</th>
                  <th className="text-left pb-2">NAME</th>
                  {tab === 'normal' ? (
                    <>
                      <th className="text-right pb-2">SCORE</th>
                      <th className="text-right pb-2">GRAZE</th>
                    </>
                  ) : (
                    <>
                      <th className="text-right pb-2">SCORE</th>
                      <th className="text-right pb-2">WAVE</th>
                      <th className="text-right pb-2">TIME</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const rankColor = i === 0 ? '#ffff00' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#ffffff';
                  return (
                    <tr key={entry.id} className="border-t border-gray-700/50">
                      <td
                        className="py-1.5 pr-2 font-bold text-xs"
                        style={{ color: rankColor, fontFamily: '"Press Start 2P", monospace' }}
                      >
                        {i + 1}
                      </td>
                      <td
                        className="py-1.5 text-white text-[10px] uppercase"
                        style={{ fontFamily: '"Press Start 2P", monospace' }}
                      >
                        {entry.player_name}
                      </td>
                      {tab === 'normal' ? (
                        <>
                          <td
                            className="py-1.5 text-right text-[#00ffc8] text-[10px]"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                          >
                            {entry.score.toLocaleString()}
                          </td>
                          <td
                            className="py-1.5 text-right text-[#ff00ff] text-[10px]"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                          >
                            {entry.graze_count}
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            className="py-1.5 text-right text-[#00ffc8] text-[10px]"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                          >
                            {entry.score.toLocaleString()}
                          </td>
                          <td
                            className="py-1.5 text-right text-[#ff00ff] text-[10px]"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                          >
                            {entry.wave}
                          </td>
                          <td
                            className="py-1.5 text-right text-[#ffff00] text-[10px]"
                            style={{ fontFamily: '"Press Start 2P", monospace' }}
                          >
                            {formatTime(entry.time_ms)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CSS for font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
};

export default Leaderboard;
