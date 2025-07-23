import React, { useState, useEffect } from 'react';
import {
  GameStatus,
  DiceDisplay,
  GameOutput,
  GameInput,
  GameButton
} from './ui';

interface GameState {
  isActive: boolean;
  gameScore: number;
  roundNumber: number;
  rollNumber: number;
  roundPoints: number;
  currentDice: number[];
  selectedIndices: number[];
}

export const GameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    gameScore: 0,
    roundNumber: 1,
    rollNumber: 1,
    roundPoints: 0,
    currentDice: [],
    selectedIndices: []
  });

  const [inputValue, setInputValue] = useState('');
  const [gameOutput, setGameOutput] = useState('Welcome to Farkle!\nClick "Start New Game" to begin.');

  // Simulate dice roll
  const rollDice = (count: number = 6): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  };

  const appendToOutput = (text: string) => {
    setGameOutput(prev => prev + '\n' + text);
  };

  const startNewGame = () => {
    const newDice = rollDice();
    setGameState({
      isActive: true,
      gameScore: 0,
      roundNumber: 1,
      rollNumber: 1,
      roundPoints: 0,
      currentDice: newDice,
      selectedIndices: []
    });
    setGameOutput('--- Round 1 ---\nRoll #1:\n' + newDice.join(' '));
  };

  const processDiceSelection = (input: string) => {
    if (!input.trim()) return;

    appendToOutput(`> ${input}`);

    // Simple validation - just check if all characters are 1-6
    const diceValues = input.split('').map(Number);
    const isValid = diceValues.every(v => v >= 1 && v <= 6);

    if (isValid) {
      const selectedDice = diceValues.filter(v => gameState.currentDice.includes(v));
      if (selectedDice.length > 0) {
        appendToOutput(`You selected dice: ${selectedDice.join(', ')}`);
        appendToOutput(`Points for this roll: ${selectedDice.length * 100}`);
        setGameState(prev => ({
          ...prev,
          roundPoints: prev.roundPoints + selectedDice.length * 100
        }));
      } else {
        appendToOutput('Invalid selection. Please select valid dice values.');
      }
    } else {
      appendToOutput('Invalid input. Please enter numbers 1-6.');
    }

    setInputValue('');
  };

  const bankPoints = () => {
    if (gameState.roundPoints > 0) {
      const newGameScore = gameState.gameScore + gameState.roundPoints;
      const newRoundNumber = gameState.roundNumber + 1;
      const newDice = rollDice();
      
      appendToOutput(`You banked ${gameState.roundPoints} points!`);
      appendToOutput(`Game score: ${newGameScore}`);
      
      setGameState({
        ...gameState,
        gameScore: newGameScore,
        roundNumber: newRoundNumber,
        rollNumber: 1,
        roundPoints: 0,
        currentDice: newDice,
        selectedIndices: []
      });
      
      appendToOutput(`--- Round ${newRoundNumber} ---`);
      appendToOutput(`Roll #1:\n${newDice.join(' ')}`);
    }
  };

  const rerollDice = () => {
    const newRollNumber = gameState.rollNumber + 1;
    const newDice = rollDice();
    
    setGameState({
      ...gameState,
      rollNumber: newRollNumber,
      currentDice: newDice,
      selectedIndices: []
    });
    
    appendToOutput(`Roll #${newRollNumber}:\n${newDice.join(' ')}`);
  };

  const flop = () => {
    const newRoundNumber = gameState.roundNumber + 1;
    const newDice = rollDice();
    
    appendToOutput('You flopped! Round points forfeited.');
    
    setGameState({
      ...gameState,
      roundNumber: newRoundNumber,
      rollNumber: 1,
      roundPoints: 0,
      currentDice: newDice,
      selectedIndices: []
    });
    
    appendToOutput(`--- Round ${newRoundNumber} ---`);
    appendToOutput(`Roll #1:\n${newDice.join(' ')}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processDiceSelection(inputValue);
    }
  };

  // Auto-scroll to bottom of output
  useEffect(() => {
    const outputElement = document.getElementById('gameOutput');
    if (outputElement) {
      outputElement.scrollTop = outputElement.scrollHeight;
    }
  }, [gameOutput]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl text-center mb-8">🎲 Farkle Game</h1>
      
      <GameStatus
        gameScore={gameState.gameScore}
        roundNumber={gameState.roundNumber}
        rollNumber={gameState.rollNumber}
        roundPoints={gameState.roundPoints}
      />
      
      <DiceDisplay
        dice={gameState.currentDice}
        selectedIndices={gameState.selectedIndices}
      />
      
      <GameOutput id="gameOutput">
        {gameOutput}
      </GameOutput>
      
      <div className="flex gap-4 mb-4">
        <GameInput
          value={inputValue}
          onChange={setInputValue}
          onKeyPress={handleKeyPress}
          disabled={!gameState.isActive}
        />
        <GameButton
          onClick={() => processDiceSelection(inputValue)}
          disabled={!gameState.isActive}
        >
          Submit
        </GameButton>
      </div>
      
      <div className="flex gap-4 justify-center">
        <GameButton
          onClick={startNewGame}
          disabled={gameState.isActive}
        >
          Start New Game
        </GameButton>
        <GameButton
          onClick={bankPoints}
          disabled={!gameState.isActive || gameState.roundPoints === 0}
        >
          Bank Points
        </GameButton>
        <GameButton
          onClick={rerollDice}
          disabled={!gameState.isActive}
        >
          Reroll Dice
        </GameButton>
        <GameButton
          onClick={flop}
          disabled={!gameState.isActive}
          variant="danger"
        >
          Flop
        </GameButton>
      </div>
    </div>
  );
}; 