import { useState } from 'react';
import { MainMenu } from './game/MainMenu';
import { GameContainer } from './game/GameContainer';
import './App.css';

type GameState = 'menu' | 'playing';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');

  const handleStartGame = () => {
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
        <GameContainer onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
