import React from 'react';
import { Dice } from './Dice';

interface DiceDisplayProps {
  dice: number[];
  selectedIndices?: number[];
  onDiceClick?: (index: number) => void;
  className?: string;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ 
  dice, 
  selectedIndices = [], 
  onDiceClick,
  className = ''
}) => {
  return (
    <div className={`mb-6 p-4 border-2 border-green-500 bg-black ${className}`}>
      <h3 className="text-lg mb-2">Current Roll:</h3>
      <div className="flex justify-center">
        {dice.map((value, index) => (
          <Dice
            key={index}
            value={value}
            selected={selectedIndices.includes(index)}
            onClick={onDiceClick ? () => onDiceClick(index) : undefined}
          />
        ))}
      </div>
    </div>
  );
}; 