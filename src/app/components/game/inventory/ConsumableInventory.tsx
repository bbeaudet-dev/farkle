import React from 'react';
import { ConsumableInventoryProps } from '../../../types/inventory';
import { InventoryItem } from '../../ui/InventoryItem';

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse 
}) => {
  return (
    <div>
      <h3 style={{ 
        fontSize: '12px', 
        margin: '0 0 4px 0',
        fontWeight: 'bold'
      }}>Consumables:</h3>
      {consumables.length === 0 ? (
        <p style={{ 
          fontSize: '10px', 
          margin: '0',
          color: '#666'
        }}>No consumables</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {consumables.map((consumable, index) => (
            <li key={index} style={{ marginBottom: '2px' }}>
              <InventoryItem
                title={consumable.name}
                description={consumable.description}
                rarity={(consumable as any).rarity || 'Common'}
                uses={consumable.uses}
                showUseButton={true}
                onUse={() => onConsumableUse(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 