import React, { useState } from 'react';

interface InventoryItemProps {
  title: string;
  description: string;
  rarity?: string;
  uses?: number;
  showUseButton?: boolean;
  onUse?: () => void;
  children?: React.ReactNode;
}

export const InventoryItem: React.FC<InventoryItemProps> = ({ 
  title, 
  description, 
  rarity, 
  uses, 
  showUseButton = false,
  onUse,
  children 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{ 
          padding: '8px', 
          border: '1px solid #ddd', 
          margin: '4px 0',
          borderRadius: '4px',
          cursor: showUseButton ? 'default' : 'help'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <strong>{title}</strong>
          {uses !== undefined && (
            <span> ({uses} uses)</span>
          )}
        </div>
        
        {showUseButton && onUse && (
          <button 
            onClick={onUse}
            style={{
              marginTop: '4px',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            Use
          </button>
        )}
        
        {children}
      </div>
      
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          <div><strong>{title}</strong></div>
          <div>{description}</div>
          {rarity && (
            <div style={{ color: '#ccc', marginTop: '4px' }}>
              Rarity: {rarity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 