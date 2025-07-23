import React from 'react';

interface GameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  className?: string;
  disabled?: boolean;
}

export const GameInput: React.FC<GameInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter dice values (e.g., 125)...", 
  onKeyPress,
  className = '',
  disabled = false
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      className={`bg-terminal-input text-terminal-text border-2 border-terminal-border p-2 font-mono text-lg flex-1 focus:outline-none focus:border-green-400 ${className}`}
      autoComplete="off"
    />
  );
}; 