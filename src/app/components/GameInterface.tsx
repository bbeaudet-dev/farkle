import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../../game/gameEngine';
import { GameInterface as IGameInterface } from '../../game/interfaces';
import {
  GameStatus,
  DiceDisplay,
  GameOutput,
  GameInput,
  GameButton
} from './ui';

// React implementation of the GameInterface
class ReactGameInterface implements IGameInterface {
  private outputCallback: (text: string) => void;
  private inputCallback: (question: string) => Promise<string>;
  private updateGameState: (state: any) => void;
  private hasShownWelcome: boolean = false;

  constructor(
    outputCallback: (text: string) => void,
    inputCallback: (question: string) => Promise<string>,
    updateGameState: (state: any) => void
  ) {
    this.outputCallback = outputCallback;
    this.inputCallback = inputCallback;
    this.updateGameState = updateGameState;
  }

  // Input methods
  async ask(question: string): Promise<string> {
    return this.inputCallback(question);
  }

  async askYesNo(question: string): Promise<boolean> {
    const answer = await this.inputCallback(question);
    return answer.toLowerCase().startsWith('y');
  }

  async askDiceSelection(question: string): Promise<string> {
    return this.inputCallback(question);
  }

  async askAction(question: string): Promise<string> {
    return this.inputCallback(question);
  }

  // Display methods
  async displayRoll(rollNumber: number, dice: number[]): Promise<void> {
    this.outputCallback(`Roll #${rollNumber}:\n${dice.join(' ')}`);
    this.updateGameState({ rollNumber, currentDice: dice, selectedIndices: [] });
  }

  async displayScoringResult(selectedIndices: number[], dice: number[], combinations: any[], points: number): Promise<void> {
    const selectedDice = selectedIndices.map(i => dice[i]);
    this.outputCallback(`You selected dice: ${selectedDice.join(', ')}`);
    this.outputCallback(`Points for this roll: ${points}`);
    this.updateGameState({ selectedIndices });
  }

  async displayRoundPoints(points: number): Promise<void> {
    this.outputCallback(`Round points so far: ${points}`);
    this.updateGameState({ roundPoints: points });
  }

  async displayGameScore(score: number): Promise<void> {
    this.outputCallback(`Game score: ${score}`);
    this.updateGameState({ gameScore: score });
  }

  async displayRoundNumber(roundNumber: number): Promise<void> {
    this.outputCallback(`--- Round ${roundNumber} ---`);
    this.updateGameState({ roundNumber });
  }

  async displayDiceToReroll(count: number): Promise<void> {
    this.outputCallback(`Reroll ${count} dice (r) or bank points (b)?`);
  }

  async displayFlopMessage(forfeitedPoints: number, consecutiveFlops: number, gameScore: number, penalty: number): Promise<void> {
    this.outputCallback(`No scoring combinations, you flopped! Round points forfeited: ${forfeitedPoints}`);
    if (consecutiveFlops === 2) {
      this.outputCallback(`(2 consecutive flops - one more and you lose ${penalty} points!)`);
    } else if (consecutiveFlops >= 3) {
      this.outputCallback(`(3 consecutive flops - you lose ${penalty} points! Game score: ${gameScore})`);
    }
  }

  async displayHotDice(): Promise<void> {
    this.outputCallback('🎉 Hot dice! You can reroll all 6 dice!');
  }

  async displayWinMessage(finalScore: number): Promise<void> {
    this.outputCallback(`🎉 Congratulations! You won with ${finalScore} points!`);
  }

  async displayGameStats(stats: any): Promise<void> {
    this.outputCallback(`\n📊 Game Statistics:`);
    this.outputCallback(`Total rounds: ${stats.totalRounds}`);
    this.outputCallback(`Total rolls: ${stats.totalRolls}`);
    this.outputCallback(`Hot dice: ${stats.hotDiceTotal}`);
    this.outputCallback(`Forfeited points: ${stats.forfeitedPointsTotal}`);
    this.outputCallback(`Final score: ${stats.finalScore}`);
  }

  async displayGameEnd(finalScore: number): Promise<void> {
    this.outputCallback(`🎉 Game Over! Final score: ${finalScore}`);
  }

  async displayBankedPoints(points: number): Promise<void> {
    this.outputCallback(`💰 You banked ${points} points!`);
  }

  async displayRoundStart(roundNumber: number): Promise<void> {
    this.outputCallback(`\n--- Round ${roundNumber} ---`);
  }

  async displayWinCondition(): Promise<void> {
    this.outputCallback(`🎉 Congratulations! You won!`);
  }

  async askForDiceSelection(dice: number[]): Promise<string> {
    return this.inputCallback(`Select dice values to score: `);
  }

  async askForBankOrReroll(diceToReroll: number): Promise<string> {
    return this.inputCallback(`Bank points (b) or reroll ${diceToReroll} dice (r)? `);
  }

  async askForNewGame(): Promise<string> {
    return this.inputCallback(`Start New Game? (y/n): `);
  }

  async askForNextRound(): Promise<string> {
    return this.inputCallback(`Continue to next round? (y/n): `);
  }

  async displayWelcome(): Promise<void> {
    // Welcome message is already shown in initial state
    this.hasShownWelcome = true;
  }

  async displayGoodbye(): Promise<void> {
    this.outputCallback('Thanks for playing Farkle!');
  }

  async displayInvalidInput(): Promise<void> {
    this.outputCallback('Invalid input. Please try again.');
  }

  async displayInvalidDiceSelection(): Promise<void> {
    this.outputCallback('Invalid dice selection. Please select valid dice values.');
  }

  async log(message: string, delayBefore?: number, delayAfter?: number): Promise<void> {
    if (delayBefore) await this.sleep(delayBefore);
    this.outputCallback(message);
    if (delayAfter) await this.sleep(delayAfter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const GameInterface: React.FC = () => {
  const [gameOutput, setGameOutput] = useState('🎲 Welcome to Farkle!\n\nClick "Start New Game" to begin.');
  const [inputValue, setInputValue] = useState('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [gameState, setGameState] = useState({
    isActive: false,
    gameScore: 0,
    roundNumber: 1,
    rollNumber: 1,
    roundPoints: 0,
    currentDice: [] as number[],
    selectedIndices: [] as number[]
  });

  const gameEngineRef = useRef<GameEngine | null>(null);
  const resolveInputRef = useRef<((value: string) => void) | null>(null);

  const appendToOutput = (text: string) => {
    setGameOutput(prev => prev + '\n' + text);
  };

  const handleInput = async (question: string): Promise<string> => {
    setIsWaitingForInput(true);
    setCurrentQuestion(question);
    
    return new Promise((resolve) => {
      resolveInputRef.current = resolve;
    });
  };

  const handleSubmit = () => {
    if (inputValue.trim() && isWaitingForInput) {
      resolveInputRef.current?.(inputValue.trim());
      setInputValue('');
      // Focus will be restored by the autoFocus prop when isWaitingForInput changes
    }
  };

  const startNewGame = async () => {
    if (gameEngineRef.current) return;

    const updateGameStateCallback = (state: any) => {
      setGameState(prev => ({ ...prev, ...state }));
    };

    const gameInterface = new ReactGameInterface(appendToOutput, handleInput, updateGameStateCallback);
    gameEngineRef.current = new GameEngine(gameInterface);
    
    setGameState(prev => ({ ...prev, isActive: true }));
    
    try {
      await gameEngineRef.current.run();
    } catch (error) {
      console.error('Game error:', error);
    } finally {
      gameEngineRef.current = null;
      setGameState(prev => ({ ...prev, isActive: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isWaitingForInput) {
      handleSubmit();
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
      <h1 className="text-4xl text-center mb-8 text-green-500">🎲 Farkle Game</h1>
      
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
      
      {isWaitingForInput && (
        <div className="mb-2 p-2 bg-blue-900 border border-blue-500 text-blue-200 font-mono text-sm">
          💬 {currentQuestion}
        </div>
      )}
      
              <div className="flex gap-2">
          <GameInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            placeholder="Enter dice values (e.g., 125)..."
            disabled={!isWaitingForInput}
            autoFocus={isWaitingForInput}
          />
          <GameButton
            onClick={handleSubmit}
            disabled={!isWaitingForInput || !inputValue.trim()}
            variant="primary"
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
      </div>
    </div>
  );
}; 