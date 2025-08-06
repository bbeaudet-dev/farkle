import React, { useState } from 'react';
import { GameBoard, GameConfigSelector } from './components/game';
import { useGameState } from './hooks/useGameState';

function App() {
  const [showConfigSelector, setShowConfigSelector] = useState(false);
  const [selectedDiceSetIndex, setSelectedDiceSetIndex] = useState(0);
  const [selectedCharms, setSelectedCharms] = useState<number[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<number[]>([]);

  const {
    gameState,
    roundState,
    currentDice,
    selectedDice,
    previewScoring,
    debug,
    materialLogs,
    charmLogs,
    isGameStarted,
    isLoading,
    messages,
    canSelectDice,
    justBanked,
    justFlopped,
    startNewGame,
    handleDiceSelect,
    handleRollDice,
    handleBank,
    handleConsumableUse,
    scoreSelectedDice,
    canRoll,
    canRollDice,
    canBank,
    canReroll,
  } = useGameState();

  // Debug
  console.log('App.tsx Debug:', debug);
  console.log('App.tsx roundState:', roundState);

  // Root container with consistent font
  const rootStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const handleConfigComplete = (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
  }) => {
    setSelectedDiceSetIndex(config.diceSetIndex);
    setSelectedCharms(config.selectedCharms);
    setSelectedConsumables(config.selectedConsumables);
    setShowConfigSelector(false);
    startNewGame(config.diceSetIndex, config.selectedCharms, config.selectedConsumables);
  };

  const handleStartGame = () => {
    setShowConfigSelector(true);
  };

  // Show config selector first
  if (showConfigSelector) {
    return (
      <div style={rootStyle}>
        <GameConfigSelector onConfigComplete={handleConfigComplete} />
      </div>
    );
  }

  if (!isGameStarted) {
    return (
      <div style={{ 
        ...rootStyle,
        maxWidth: '600px', 
        margin: '100px auto', 
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>Rollio</h1>
        <p>The multiplayer dice-rolling roguelike</p>
        <button 
          onClick={handleStartGame} 
          disabled={isLoading}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Starting...' : 'Start New Game'}
        </button>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <GameBoard
        dice={roundState?.diceHand || []}
        selectedDice={selectedDice}
        onDiceSelect={handleDiceSelect}
        onScoreSelectedDice={scoreSelectedDice}
        onRoll={handleRollDice}
        onBank={handleBank}
        canRoll={canRoll}
        canBank={canBank}
        diceToReroll={roundState?.diceHand?.length || 0}
        roundNumber={roundState?.roundNumber || 0}
        rollNumber={roundState?.rollNumber || 0}
        roundPoints={roundState?.roundPoints || 0}
        gameScore={gameState?.gameScore || 0}
        consecutiveFlops={gameState?.consecutiveFlops || 0}
        charms={gameState?.charms || []}
        consumables={gameState?.consumables || []}
        onConsumableUse={handleConsumableUse}
        previewScoring={previewScoring}
        canSelectDice={canSelectDice}
        materialLogs={materialLogs}
        charmLogs={charmLogs}
        money={gameState?.money || 0}
        hotDiceCount={roundState?.hotDiceCounterRound || 0}
        totalRolls={gameState?.rollCount || 0}
        forfeitedPoints={gameState?.forfeitedPointsTotal || 0}
        isHotDice={!!(roundState && roundState.diceHand.length === 0 && roundState.rollHistory.length > 0)}
        canReroll={canReroll}
        gameState={gameState}
        roundState={roundState}
        justBanked={justBanked}
        justFlopped={justFlopped}
      />
      
      {/* Game Log */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '20px auto', 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <h3>Game Log</h3>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto',
          fontSize: '14px'
        }}>
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App; 