import React from 'react';

interface DiceProps {
  value: number;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const Dice: React.FC<DiceProps> = ({ 
  value, 
  onClick, 
  selected = false, 
  className = '' 
}) => {
  const baseClasses = "inline-block w-8 h-8 border-2 text-center leading-6 mx-1 font-mono transition-colors";
  const selectedClasses = selected 
    ? "border-green-400 bg-green-400 text-black" 
    : "border-terminal-border bg-terminal-input text-terminal-text hover:border-green-400";
  
  return (
    <div 
      className={`${baseClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {value}
    </div>
  );
}; 