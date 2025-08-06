import React from 'react';
import { ConsumableInventoryProps } from '../../types/inventory';
import { InventoryItem } from '../ui/InventoryItem';

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ 
  consumables, 
  onConsumableUse 
}) => {
  return (
    <div>
      <h3>Consumables:</h3>
      {consumables.length === 0 ? (
        <p>No consumables</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {consumables.map((consumable, index) => (
            <li key={index}>
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