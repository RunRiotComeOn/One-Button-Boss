import { useState } from 'react';
import { MainMenu } from './game/MainMenu';
import { GameContainer } from './game/GameContainer';
import './App.css';

type GameState = 'menu' | 'playing';
type GameMode = 'normal' | 'endless';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('normal');

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {gameState === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} />
      ) : (
        <GameContainer mode={gameMode} onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
