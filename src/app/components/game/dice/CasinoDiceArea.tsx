import React, { useState, useEffect } from 'react';
import { DiceFace } from './DiceFace';

interface CasinoDiceAreaProps {
  dice: any[];
  selectedIndices: number[];
  onDiceSelect: (index: number) => void;
  canSelect: boolean;
  roundNumber?: number;
  rollNumber?: number;
  hotDiceCount?: number;
  consecutiveFlops?: number;
}

interface DicePosition {
  x: number;
  y: number;
}

export const CasinoDiceArea: React.FC<CasinoDiceAreaProps> = ({
  dice,
  selectedIndices,
  onDiceSelect,
  canSelect,
  roundNumber = 0,
  rollNumber = 0,
  hotDiceCount = 0,
  consecutiveFlops = 0
}) => {
  const [dicePositions, setDicePositions] = useState<DicePosition[]>([]);
  const [lastRollNumber, setLastRollNumber] = useState<number>(0);
  const [lastDiceCount, setLastDiceCount] = useState<number>(0);

  // Generate random positions for dice, ensuring no overlap
  const generateRandomPositions = (diceCount: number) => {
    const positions: DicePosition[] = [];
    const diceSize = 70; // 10% bigger dice (was 64)
    const padding = 20; // Padding from edges
    const minDistance = diceSize + 10; // Minimum distance between dice centers
    
    for (let i = 0; i < diceCount; i++) {
      let attempts = 0;
      let position: DicePosition;
      
      do {
        // Generate random position within safe bounds
        position = {
          x: Math.random() * (100 - 2 * (diceSize / 2 + padding) / 3.6) + (diceSize / 2 + padding) / 3.6,
          y: Math.random() * (100 - 2 * (diceSize / 2 + padding) / 3.6) + (diceSize / 2 + padding) / 3.6
        };
        attempts++;
      } while (
        attempts < 100 && 
        positions.some(existing => {
          const distance = Math.sqrt(
            Math.pow(position.x - existing.x, 2) + 
            Math.pow(position.y - existing.y, 2)
          );
          return distance < minDistance / 3.6; // Convert to percentage
        })
      );
      
      positions.push(position);
    }
    
    return positions;
  };

  // Regenerate positions when roll number increases OR dice count changes significantly
  useEffect(() => {
    const shouldRegenerate = 
      rollNumber > lastRollNumber || // New roll or reroll
      (dice.length > 0 && dicePositions.length === 0); // Initial load
    
    if (shouldRegenerate) {
      // Generate new positions for all dice
      setDicePositions(generateRandomPositions(dice.length));
      setLastRollNumber(rollNumber);
      setLastDiceCount(dice.length);
    } else if (dice.length < lastDiceCount) {
      // Scoring dice - keep existing positions but remove scored dice positions
      setDicePositions(prev => prev.slice(0, dice.length));
      setLastDiceCount(dice.length);
    }
  }, [rollNumber, lastRollNumber, dice.length, lastDiceCount]);

  return (
    <div style={{ 
      backgroundColor: '#2d5a2d', // Casino green
      border: '3px solid #1a3d1a',
      borderRadius: '12px',
      padding: '20px',
      height: '350px', // Bigger area with more vertical space
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Round and Roll numbers overlay */}
      <div style={{
        position: 'absolute',
        top: '15px', // More margin from top
        left: '15px', // More margin from left
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        <div>Round {roundNumber}</div>
        <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Roll {rollNumber}</div>
      </div>

      {/* Consecutive Flops warning - bottom left */}
      {consecutiveFlops > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '15px', // More margin from bottom
          left: '15px', // More margin from left
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          maxWidth: '150px'
        }}>
          ⚠️ Consecutive flops: {consecutiveFlops}/3
          {consecutiveFlops >= 3 && (
            <div style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '12px' }}>
              Flop penalty: -1000
            </div>
          )}
        </div>
      )}

      {/* Hot Dice counter - bottom right */}
      {hotDiceCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '15px', // More margin from bottom
          right: '15px', // More margin from right
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {'🔥'.repeat(Math.min(hotDiceCount, 3))} Hot dice! x{hotDiceCount}
        </div>
      )}

      {dice.map((die, index) => {
        const isSelected = selectedIndices.includes(index);
        const material = die.material || 'standard';
        const position = dicePositions[index] || { x: 50, y: 50 }; // Fallback to center
        
        return (
          <button
            key={index}
            onClick={() => canSelect && onDiceSelect(index)}
            disabled={!canSelect}
            style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '70px', // 10% bigger
              height: '70px', // 10% bigger
              border: isSelected ? '3px solid #007bff' : '3px solid transparent',
              borderRadius: '8px',
              backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
              cursor: !canSelect ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canSelect ? 0.6 : 1,
              padding: '2px',
              zIndex: isSelected ? 10 : 1
            }}
          >
            <DiceFace 
              value={die.rolledValue || 0} 
              size={55} // 10% bigger face
              material={material}
            />
          </button>
        );
      })}
    </div>
  );
}; 