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
      className={`bg-black border-2 border-green-500 p-4 h-96 overflow-y-auto mb-4 whitespace-pre-wrap font-mono text-green-500 ${className}`}
    >
      {children}
    </div>
  );
}; 