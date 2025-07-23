import React from 'react';

interface GameOutputProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const GameOutput: React.FC<GameOutputProps> = ({ 
  children, 
  className = '',
  id
}) => {
  return (
    <div 
      id={id}
      className={`bg-terminal-input border-2 border-terminal-border p-4 h-96 overflow-y-auto mb-4 whitespace-pre-wrap font-mono text-terminal-text ${className}`}
    >
      {children}
    </div>
  );
}; 