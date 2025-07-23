import React from 'react';

interface GameButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = "border-none px-4 py-2 font-mono text-lg cursor-pointer transition-colors";
  
  const variantClasses = {
    primary: "bg-green-500 text-black hover:bg-green-400",
    secondary: "bg-gray-600 text-white hover:bg-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-500"
  };
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : variantClasses[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}; 