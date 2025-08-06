import React from 'react';
import { DiceDisplay } from './dice/DiceDisplay';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { CharmInventory, ConsumableInventory } from './inventory/';
import { PreviewScoring } from './score/PreviewScoring';
import { Button } from '../ui/Button';

interface GameBoardProps {
  dice: any[];
  selectedDice: number[];
  onDiceSelect: (index: number) => void;
  onScoreSelectedDice: () => void;
  onRoll: () => void;
  onBank: () => void;
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  diceToReroll: number;
  roundNumber: number;
  rollNumber: number;
  roundPoints: number;
  gameScore: number;
  consecutiveFlops: number;
  isHotDice: boolean;
  hotDiceCount: number;
  totalRolls: number;
  money: number;
  forfeitedPoints: number;
  charms: any[];
  consumables: any[];
  onConsumableUse: (index: number) => void;
  previewScoring: { isValid: boolean; points: number; combinations: string[] } | null;
  canSelectDice: boolean;
  materialLogs: string[];
  charmLogs: string[];
  gameState: any;
  roundState: any;
  justBanked: boolean;
  justFlopped?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  dice,
  selectedDice,
  onDiceSelect,
  onScoreSelectedDice,
  onRoll,
  onBank,
  canRoll,
  canBank,
  canReroll,
  diceToReroll,
  roundNumber,
  rollNumber,
  roundPoints,
  gameScore,
  consecutiveFlops,
  isHotDice,
  hotDiceCount,
  totalRolls,
  money,
  forfeitedPoints,
  charms,
  consumables,
  onConsumableUse,
  previewScoring,
  canSelectDice,
  materialLogs,
  charmLogs,
  gameState,
  roundState,
  justBanked,
  justFlopped = false,
}) => {
  // Calculate last roll points from rollHistory
  const lastRollPoints = roundState?.rollHistory && roundState.rollHistory.length > 0 
    ? roundState.rollHistory[roundState.rollHistory.length - 1]?.rollPoints || 0 
    : 0;

  // Debug roll points
  console.log('Debug - rollHistory length:', roundState?.rollHistory?.length);
  console.log('Debug - lastRollPoints:', lastRollPoints);
  console.log('Debug - rollHistory:', roundState?.rollHistory);
  console.log('Debug - roundState exists:', !!roundState);
  console.log('Debug - roundState:', roundState);

  // Determine if points were just banked (round complete but can start new round)
  // const justBanked = canRoll && gameState?.roundState && !gameState.roundState.isActive;

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
          roundNumber={roundNumber}
          rollNumber={rollNumber}
          roundPoints={roundPoints}
          gameScore={gameScore}
          consecutiveFlops={consecutiveFlops}
          hotDiceCount={hotDiceCount}
          totalRolls={totalRolls}
          money={money}
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
            dice={dice}
            selectedIndices={selectedDice}
            onDiceSelect={onDiceSelect}
            canSelect={canSelectDice}
            isHotDice={isHotDice}
            hotDiceCount={hotDiceCount}
            roundNumber={roundNumber}
            rollNumber={rollNumber}
          />

          {/* Flop Notification */}
          {justFlopped && (
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
          {canSelectDice && selectedDice.length > 0 && (
            <div style={{ marginTop: '15px', marginBottom: '15px', textAlign: 'center' }}>
              <Button 
                onClick={onScoreSelectedDice}
                disabled={!previewScoring?.isValid}
              >
                Score Selected Dice ({selectedDice.length})
                {previewScoring?.isValid && ` - ${previewScoring.points} pts`}
              </Button>
            </div>
          )}
          
          <PreviewScoring previewScoring={previewScoring} />
          
          <div style={{ marginTop: '10px' }}>
            {/* Roll Points - GREEN when just scored dice */}
            {lastRollPoints > 0 && canReroll && !justBanked && (
              <div style={{ 
                marginBottom: '5px',
                color: '#28a745' // Green when showing roll points
              }}>
                Roll points: +{lastRollPoints}
              </div>
            )}
            
            {/* Round Points - GREEN only when just banked points, BLACK otherwise */}
            <div style={{ 
              color: justBanked ? '#28a745' : '#000'
            }}>
              Round points: {justBanked ? '+' : ''}{roundPoints}
            </div>
            
            {/* Game Score - show only when just banked points */}
            {justBanked && (
              <div style={{ 
                marginTop: '5px',
                color: '#000', // Keep black, not green
                fontWeight: 'bold'
              }}>
                Game score: {gameScore}
              </div>
            )}
          </div>

          {/* Game Controls - now integrated into scoring section */}
          <GameControls 
            onRoll={onRoll}
            onBank={onBank}
            canRoll={canRoll}
            canBank={canBank}
            diceToReroll={diceToReroll}
            canReroll={canReroll}
            gameState={gameState}
          />
          
          {/* Hot Dice Information */}
          {(isHotDice || hotDiceCount > 0) && !justFlopped && (
            <div style={{ 
              marginTop: '15px', 
              padding: '8px', 
              backgroundColor: '#ffe6e6',
              border: '1px solid #ff9999',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {'🔥'.repeat(Math.max(hotDiceCount, 1))} Hot dice! x{hotDiceCount} {'🔥'.repeat(Math.max(hotDiceCount, 1))}
            </div>
          )}
          
          {/* Flop Information */}
          {consecutiveFlops > 0 && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ⚠️ Consecutive flops: {consecutiveFlops}/3
              {consecutiveFlops >= 3 && canRoll && (
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
          charms={charms}
        />
        
        <ConsumableInventory 
          consumables={consumables}
          onConsumableUse={onConsumableUse}
        />
      </div>
    </div>
  );
}; 