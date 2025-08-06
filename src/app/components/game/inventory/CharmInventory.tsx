import React from 'react';
import { CharmInventoryProps } from '../../../types/inventory';
import { InventoryItem } from '../../ui/InventoryItem';

export const CharmInventory: React.FC<CharmInventoryProps> = ({ charms }) => {
  return (
    <div>
      <h3>Charms:</h3>
      {charms.length === 0 ? (
        <p>No charms</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {charms.map(charm => (
            <li key={charm.id}>
              <InventoryItem
                title={charm.name}
                description={charm.description}
                rarity={(charm as any).rarity || 'Common'}
                uses={charm.uses}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 