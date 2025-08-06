import React, { useState } from 'react';
import { GameBoard, GameConfigSelector, GameLog } from '../game';
import { useGameState } from '../../hooks/useGameState';

interface SinglePlayerGameProps {
  onBackToMenu: () => void;
}

export const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({ onBackToMenu }) => {
  const [showConfigSelector, setShowConfigSelector] = useState(true);
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

  const handleBackToConfig = () => {
    setShowConfigSelector(true);
  };

  // Root container with consistent font
  const rootStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  if (showConfigSelector) {
    return (
      <div style={rootStyle}>
        <GameConfigSelector onConfigComplete={handleConfigComplete} />
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
      
      <GameLog messages={messages} />
    </div>
  );
}; 