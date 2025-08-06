import React, { useState } from 'react';
import { GameBoard } from './components/game/GameBoard';
import { Button } from './components/ui/Button';
import { DiceSetSelector } from './components/game/DiceSetSelector';
import { useGameState } from './hooks/useGameState';

function App() {
  const [showDiceSetSelector, setShowDiceSetSelector] = useState(false); // Don't auto-open
  const [selectedDiceSetIndex, setSelectedDiceSetIndex] = useState<number>(0); // Default to basic set (index 0)
  
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  // Handle dice set selection
  const handleDiceSetSelect = (index: number) => {
    setSelectedDiceSetIndex(index);
    setShowDiceSetSelector(false);
  };

  // Handle start game with selected dice set
  const handleStartGame = () => {
    startNewGame(selectedDiceSetIndex);
  };

  // Show dice set selector first
  if (showDiceSetSelector) {
    return (
      <div style={rootStyle}>
        <DiceSetSelector onDiceSetSelect={handleDiceSetSelect} />
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
        <Button 
          onClick={handleStartGame} 
          disabled={isLoading}
        >
          {isLoading ? 'Starting...' : 'Start New Game'}
        </Button>
        <div style={{ marginTop: '15px' }}>
          <Button 
            onClick={() => setShowDiceSetSelector(true)}
            disabled={isLoading}
          >
            Dice Set
          </Button>
        </div>
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