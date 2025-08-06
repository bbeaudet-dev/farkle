import React, { useState, useEffect } from 'react';

interface GameConfigSelectorProps {
  onConfigComplete: (config: {
    diceSetIndex: number;
    selectedCharms: number[];
    selectedConsumables: number[];
  }) => void;
}

interface GameConfig {
  diceSetIndex: number;
  selectedCharms: number[];
  selectedConsumables: number[];
}

export const GameConfigSelector: React.FC<GameConfigSelectorProps> = ({ onConfigComplete }) => {
  const [config, setConfig] = useState<GameConfig>({
    diceSetIndex: 0,
    selectedCharms: [],
    selectedConsumables: []
  });
  
  const [diceSets, setDiceSets] = useState<any[]>([]);
  const [charms, setCharms] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'dice' | 'charms' | 'consumables'>('dice');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ALL_DICE_SETS } = await import('../../../game/content/diceSets');
        const { CHARMS } = await import('../../../game/content/charms');
        const { CONSUMABLES } = await import('../../../game/content/consumables');
        
        setDiceSets(ALL_DICE_SETS);
        setCharms(CHARMS);
        setConsumables(CONSUMABLES);
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    };
    
    loadData();
  }, []);

  const getCurrentDiceSet = () => {
    if (diceSets.length === 0) return null;
    const diceSet = diceSets[config.diceSetIndex];
    return typeof diceSet === 'function' ? diceSet() : diceSet;
  };

  const handleDiceSetSelect = (index: number) => {
    setConfig(prev => ({ 
      ...prev, 
      diceSetIndex: index,
      selectedCharms: [], // Reset selections when dice set changes
      selectedConsumables: []
    }));
    setCurrentStep('charms');
  };

  const handleCharmSelect = (index: number) => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return;

    setConfig(prev => {
      const newCharms = prev.selectedCharms.includes(index)
        ? prev.selectedCharms.filter(i => i !== index)
        : prev.selectedCharms.length < diceSet.charmSlots
          ? [...prev.selectedCharms, index]
          : prev.selectedCharms;
      return { ...prev, selectedCharms: newCharms };
    });
  };

  const handleConsumableSelect = (index: number) => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return;

    setConfig(prev => {
      const newConsumables = prev.selectedConsumables.includes(index)
        ? prev.selectedConsumables.filter(i => i !== index)
        : prev.selectedConsumables.length < diceSet.consumableSlots
          ? [...prev.selectedConsumables, index]
          : prev.selectedConsumables;
      return { ...prev, selectedConsumables: newConsumables };
    });
  };

  const handleNext = () => {
    if (currentStep === 'dice') {
      setCurrentStep('charms');
    } else if (currentStep === 'charms') {
      setCurrentStep('consumables');
    } else {
      onConfigComplete(config);
    }
  };

  const handleBack = () => {
    if (currentStep === 'charms') {
      setCurrentStep('dice');
    } else if (currentStep === 'consumables') {
      setCurrentStep('charms');
    }
  };

  const renderDiceSetSelection = () => {
    const diceSet = getCurrentDiceSet();
    return (
      <div>
        <h2>Choose Your Dice Set</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {diceSets.map((diceSet, index) => {
            const diceSetConfig = typeof diceSet === 'function' ? diceSet() : diceSet;
            return (
              <div
                key={index}
                style={{
                  border: config.diceSetIndex === index ? '2px solid #007bff' : '1px solid #ddd',
                  padding: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => handleDiceSetSelect(index)}
              >
                <div style={{ fontWeight: 'bold' }}>{diceSetConfig.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Money: ${diceSetConfig.startingMoney}</div>
                  <div>Charms: {diceSetConfig.charmSlots}</div>
                  <div>Consumables: {diceSetConfig.consumableSlots}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCharmSelection = () => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return null;

    return (
      <div>
        <h2>Choose Your Charms ({config.selectedCharms.length}/{diceSet.charmSlots})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {charms.map((charm, index) => (
            <div
              key={index}
              style={{
                border: config.selectedCharms.includes(index) ? '2px solid #28a745' : '1px solid #ddd',
                padding: '10px',
                cursor: config.selectedCharms.includes(index) || config.selectedCharms.length < diceSet.charmSlots ? 'pointer' : 'not-allowed',
                opacity: config.selectedCharms.includes(index) || config.selectedCharms.length < diceSet.charmSlots ? 1 : 0.5
              }}
              onClick={() => handleCharmSelect(index)}
            >
              <div style={{ fontWeight: 'bold' }}>{charm.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{charm.description}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>{charm.rarity}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConsumableSelection = () => {
    const diceSet = getCurrentDiceSet();
    if (!diceSet) return null;

    return (
      <div>
        <h2>Choose Your Consumables ({config.selectedConsumables.length}/{diceSet.consumableSlots})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {consumables.map((consumable, index) => (
            <div
              key={index}
              style={{
                border: config.selectedConsumables.includes(index) ? '2px solid #17a2b8' : '1px solid #ddd',
                padding: '10px',
                cursor: config.selectedConsumables.includes(index) || config.selectedConsumables.length < diceSet.consumableSlots ? 'pointer' : 'not-allowed',
                opacity: config.selectedConsumables.includes(index) || config.selectedConsumables.length < diceSet.consumableSlots ? 1 : 0.5
              }}
              onClick={() => handleConsumableSelect(index)}
            >
              <div style={{ fontWeight: 'bold' }}>{consumable.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{consumable.description}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>{consumable.rarity}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      {/* Progress indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <div style={{ padding: '5px 10px', backgroundColor: currentStep === 'dice' ? '#007bff' : '#e9ecef', color: currentStep === 'dice' ? '#fff' : '#666' }}>
          Dice Set
        </div>
        <div style={{ padding: '5px 10px', backgroundColor: currentStep === 'charms' ? '#28a745' : '#e9ecef', color: currentStep === 'charms' ? '#fff' : '#666' }}>
          Charms
        </div>
        <div style={{ padding: '5px 10px', backgroundColor: currentStep === 'consumables' ? '#17a2b8' : '#e9ecef', color: currentStep === 'consumables' ? '#fff' : '#666' }}>
          Consumables
        </div>
      </div>

      {/* Current step content */}
      {currentStep === 'dice' && renderDiceSetSelection()}
      {currentStep === 'charms' && renderCharmSelection()}
      {currentStep === 'consumables' && renderConsumableSelection()}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button onClick={handleBack} disabled={currentStep === 'dice'}>
          Back
        </button>
        <button onClick={handleNext}>
          {currentStep === 'consumables' ? 'Start Game' : 'Next'}
        </button>
      </div>
    </div>
  );
}; 