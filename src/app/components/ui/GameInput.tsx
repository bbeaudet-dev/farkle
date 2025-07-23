import React, { useEffect, useRef } from 'react';

interface GameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const GameInput: React.FC<GameInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  disabled = false,
  className = '',
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when component mounts or when autoFocus prop changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      className={`bg-black text-green-500 border-2 border-green-500 px-4 py-3 font-mono text-lg flex-1 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 rounded-md ${className}`}
      autoComplete="off"
    />
  );
}; 