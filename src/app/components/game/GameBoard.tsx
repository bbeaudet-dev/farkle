import React from 'react';
import { DiceDisplay } from './dice/DiceDisplay';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { CharmInventory, ConsumableInventory } from './inventory/';
import { PreviewScoring } from './score/PreviewScoring';
import { Button } from '../ui/Button';
import { useGameState } from '../../hooks/useGameState';

// Intermediary interfaces for logical groups
interface RollActions {
  handleDiceSelect: (index: number) => void;
  handleRollDice: () => void;
  scoreSelectedDice: () => void;
}

interface GameActions {
  handleBank: () => void;
  startNewGame: (diceSetIndex: number, selectedCharms: number[], selectedConsumables: number[]) => void;
}

interface InventoryActions {
  handleConsumableUse: (index: number) => void;
}

interface GameBoardData {
  dice: any[];
  selectedDice: number[];
  previewScoring: any;
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  canSelectDice: boolean;
  justBanked: boolean;
  justFlopped: boolean;
}

interface GameBoardProps {
  rollActions: RollActions;
  gameActions: GameActions;
  inventoryActions: InventoryActions;
  board: GameBoardData;
  status: any;
  inventory: any;
  canPlay?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  rollActions, 
  gameActions, 
  inventoryActions, 
  board, 
  status, 
  inventory, 
  canPlay = true 
}) => {
  // Calculate last roll points from rollHistory
  const lastRollPoints = 0; // TODO: Get from roundState if needed

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    }}>
      {/* Left Column - Game Area */}
      <div>
        <GameStatus 
          status={status}
        />
        
        {/* Scoring Section */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '15px'
        }}>
          
          <DiceDisplay 
            dice={board.dice}
            selectedIndices={board.selectedDice}
            onDiceSelect={rollActions.handleDiceSelect}
            canSelect={board.canSelectDice && canPlay}
            isHotDice={status.isHotDice}
            hotDiceCount={status.hotDiceCount}
            roundNumber={status.roundNumber}
            rollNumber={status.rollNumber}
          />

          {/* Flop Notification */}
          {board.justFlopped && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#c62828'
            }}>
              🎲 FLOP! 🎲
              <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 'normal' }}>
                No valid scoring combinations found
              </div>
            </div>
          )}
          
          {/* Score Selected Dice Button */}
          {(board.canSelectDice && canPlay) && board.selectedDice.length > 0 && (
            <div style={{ marginTop: '15px', marginBottom: '15px', textAlign: 'center' }}>
              <Button 
                onClick={rollActions.scoreSelectedDice}
                disabled={!board.previewScoring?.isValid}
              >
                Score Selected Dice ({board.selectedDice.length})
                {board.previewScoring?.isValid && ` - ${board.previewScoring.points} pts`}
              </Button>
            </div>
          )}
          
          <PreviewScoring previewScoring={board.previewScoring} />
          
          <div style={{ marginTop: '10px' }}>
            {/* Roll Points - GREEN when just scored dice */}
            {lastRollPoints > 0 && (board.canReroll && canPlay) && !board.justBanked && (
              <div style={{ 
                marginBottom: '5px',
                color: '#28a745' // Green when showing roll points
              }}>
                Roll points: +{lastRollPoints}
              </div>
            )}
            
            {/* Round Points - GREEN only when just banked points, BLACK otherwise */}
            <div style={{ 
              color: board.justBanked ? '#28a745' : '#000'
            }}>
              Round points: {board.justBanked ? '+' : ''}{status.roundPoints}
            </div>
            
            {/* Game Score - show only when just banked points */}
            {board.justBanked && (
              <div style={{ 
                marginTop: '5px',
                color: '#000', // Keep black, not green
                fontWeight: 'bold'
              }}>
                Game score: {status.gameScore}
              </div>
            )}
          </div>

          {/* Game Controls - now integrated into scoring section */}
          <GameControls 
            onRoll={rollActions.handleRollDice}
            onBank={gameActions.handleBank}
            canRoll={board.canRoll && canPlay}
            canBank={board.canBank && canPlay}
            diceToReroll={board.dice.length}
            canReroll={board.canReroll && canPlay}
            gameState={null} // TODO: Pass gameState if needed
          />
          
          {/* Hot Dice Information */}
          {(status.isHotDice || status.hotDiceCount > 0) && !board.justFlopped && (
            <div style={{ 
              marginTop: '15px', 
              padding: '8px', 
              backgroundColor: '#ffe6e6',
              border: '1px solid #ff9999',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {'🔥'.repeat(Math.max(status.hotDiceCount, 1))} Hot dice! x{status.hotDiceCount} {'🔥'.repeat(Math.max(status.hotDiceCount, 1))}
            </div>
          )}
          
          {/* Flop Information */}
          {status.consecutiveFlops > 0 && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ⚠️ Consecutive flops: {status.consecutiveFlops}/3
              {status.consecutiveFlops >= 3 && (board.canRoll && canPlay) && (
                <div style={{ color: '#d63031', fontWeight: 'bold' }}>
                  Flop penalty: -1000 points
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
      
      {/* Right Column - Inventory */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '15px'
      }}>        
        <CharmInventory 
          charms={inventory.charms}
        />
        
        <ConsumableInventory 
          consumables={inventory.consumables}
          onConsumableUse={inventoryActions.handleConsumableUse}
        />
      </div>
    </div>
  );
}; 