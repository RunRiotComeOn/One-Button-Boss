import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameStats } from './GameScene';
import { GameUI } from './GameUI';
import { submitScore } from '../lib/supabase';

interface GameContainerProps {
  mode: 'normal' | 'endless';
  onBackToMenu?: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ mode, onBackToMenu }) => {
  const gameRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    grazeCount: 0,
    time: 0,
    health: 3,
    bossHealth: 100,
    bossPhase: 1
  });
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [wave, setWave] = useState(1);
  const waveRef = useRef(1);

  useEffect(() => {
    if (!containerRef.current || !(window as any).Phaser) return;

    const Phaser = (window as any).Phaser;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#0a0a0f',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: true,
        antialias: false
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // 动态导入 GameScene
    import('./GameScene').then(({ GameScene }) => {
      game.scene.add('GameScene', GameScene);
      game.scene.start('GameScene');
      
      // 等待场景创建完成
      const checkScene = setInterval(() => {
        const scene = game.scene.getScene('GameScene') as any;
        if (scene) {
          clearInterval(checkScene);
          sceneRef.current = scene;
          
          // 设置回调
          scene.onStatsUpdate = (newStats: GameStats) => {
            setStats(newStats);
          };
          
          scene.onGameOver = () => {
            setIsGameOver(true);
            scene.input?.keyboard?.clearCaptures();
          };

          scene.onBossDefeated = () => {
            if (mode === 'normal' && waveRef.current >= 3) {
              setIsVictory(true);
              scene.input?.keyboard?.clearCaptures();
            } else {
              setShowUpgrade(true);
            }
          };
        }
      }, 100);
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  const handleRestart = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.restart();
    }
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setShowUpgrade(false);
    setWave(1);
    waveRef.current = 1;
  }, []);

  const handlePause = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.pause();
    }
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.resume();
    }
    setIsPaused(false);
  }, []);

  const handleSubmitScore = useCallback(async (playerName: string): Promise<boolean> => {
    return submitScore({
      player_name: playerName,
      mode,
      score: stats.score,
      graze_count: stats.grazeCount,
      wave: waveRef.current,
      time_ms: Math.round(stats.time)
    });
  }, [mode, stats]);

  const handleUpgrade = useCallback((type: string) => {
    if (sceneRef.current) {
      sceneRef.current.applyUpgrade(type);

      // 重置 Boss
      sceneRef.current.boss.health = Math.min(
        sceneRef.current.boss.maxHealth + 50,
        300
      );
      sceneRef.current.boss.maxHealth = sceneRef.current.boss.health;

      // 恢复游戏
      sceneRef.current.resume();
    }
    setShowUpgrade(false);
    setWave(w => w + 1);
    waveRef.current += 1;
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0f] overflow-hidden font-mono crt-overlay crt-vignette">
      {/* Pixel Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 200, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 200, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Game Canvas Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 flex items-center justify-center pixelated"
      />
      
      {/* CRT Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />
      
      {/* Game UI Overlay */}
      <GameUI
        stats={stats}
        isGameOver={isGameOver}
        isVictory={isVictory}
        isPaused={isPaused}
        onRestart={handleRestart}
        onPause={handlePause}
        onResume={handleResume}
        showUpgrade={showUpgrade}
        onUpgrade={handleUpgrade}
        onBackToMenu={onBackToMenu}
        onSubmitScore={handleSubmitScore}
      />
      
      {/* Wave Indicator - Pixel Style */}
      {!isGameOver && !isVictory && !showUpgrade && (
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border-2 border-[#ff00ff] px-3 py-2"
          style={{ boxShadow: '3px 3px 0 rgba(255, 0, 255, 0.3)', imageRendering: 'pixelated' }}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Wave</p>
          <p 
            className="text-lg font-bold text-[#ff00ff]"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            {wave}
          </p>
        </div>
      )}
      
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ffc8] opacity-50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ffc8] opacity-50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ffc8] opacity-50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ffc8] opacity-50" />
    </div>
  );
};

export default GameContainer;
