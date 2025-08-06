import React from 'react';
import { Button } from '../ui/Button';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'charm' | 'consumable';
}

interface ShopDisplayProps {
  items: ShopItem[];
  playerMoney: number;
  onPurchase: (itemId: string) => void;
  onClose: () => void;
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ 
  items, 
  playerMoney, 
  onPurchase, 
  onClose 
}) => {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Shop</h2>
        <div><strong>Money:</strong> ${playerMoney}</div>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} style={{
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.name}</strong> - ${item.price}
              </div>
              <Button 
                onClick={() => onPurchase(item.id)}
                disabled={playerMoney < item.price}
              >
                Buy
              </Button>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Button onClick={onClose}>
          Close Shop
        </Button>
      </div>
    </div>
  );
}; 