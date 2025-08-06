import { useState, useCallback, useRef } from 'react';
import { WebGameManager, WebGameState } from '../services/WebGameManager';

export function useGameState() {
  const [webState, setWebState] = useState<WebGameState | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const gameManagerRef = useRef<WebGameManager | null>(null);

  // Add a message to the display
  const addMessage = useCallback((message: string) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Initialize a new game
  const startNewGame = useCallback(async (diceSetIndex?: number, selectedCharms?: number[], selectedConsumables?: number[]) => {
    setIsLoading(true);
    try {
      gameManagerRef.current = new WebGameManager(addMessage);
      const initialState = await gameManagerRef.current.initializeGame(diceSetIndex, selectedCharms, selectedConsumables);
      setWebState(initialState);
      setMessages([]);
    } catch (error) {
      console.error('Failed to start game:', error);
      addMessage('Failed to start game');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  // Handle dice selection
  const handleDiceSelect = useCallback((index: number) => {
    if (!webState || !gameManagerRef.current) return;
    
    const currentSelected = webState.selectedDice;
    const newSelected = currentSelected.includes(index) 
      ? currentSelected.filter(i => i !== index)
      : [...currentSelected, index];
    
    const newState = gameManagerRef.current.updateDiceSelection(webState, newSelected);
    setWebState(newState);
  }, [webState]);

  // Unified roll/reroll action
  const handleRollDice = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    if (webState.canRoll) {
      // Starting a new round
      const newState = gameManagerRef.current.startRound(webState);
      setWebState(newState);
    } else if (webState.canReroll) {
      // Rerolling within current round
      const newState = gameManagerRef.current.rerollDice(webState);
      setWebState(newState);
    }
  }, [webState]);

  const scoreSelectedDice = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.scoreSelectedDice(webState);
    setWebState(newState);
  }, [webState]);

  const handleBank = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.bankPoints(webState);
    setWebState(newState);
  }, [webState]);

  const handleConsumableUse = useCallback((index: number) => {
    if (!webState || !gameManagerRef.current || !webState.gameState) return;
    
    const consumable = webState.gameState.consumables[index];
    if (!consumable || consumable.uses <= 0) {
      addMessage(`Cannot use consumable - no uses remaining`);
      return;
    }
    
    // Implement consumable effects based on ID
    const gameState = { ...webState.gameState };
    let message = '';
    
    switch (consumable.id) {
      case 'moneyDoubler':
        gameState.money *= 2;
        message = `Money doubled! You now have $${gameState.money}`;
        break;
      case 'extraDie':
        // Add an extra plastic die to the current dice set
        if (webState.roundState) {
          const extraDie = {
            id: 'extra-die',
            sides: 6,
            allowedValues: [1, 2, 3, 4, 5, 6],
            material: 'plastic' as const,
            scored: false,
            rolledValue: Math.floor(Math.random() * 6) + 1
          };
          webState.roundState.diceHand.push(extraDie);
          message = 'Extra die added to your hand!';
        }
        break;
      case 'charmGiver':
        // Add a random charm (simplified implementation)
        message = 'Random charm functionality not yet implemented';
        break;
      default:
        message = `${consumable.name} effect not yet implemented`;
        break;
    }
    
    // Reduce uses
    consumable.uses--;
    if (consumable.uses <= 0) {
      // Remove the consumable
      gameState.consumables = gameState.consumables.filter((_, i) => i !== index);
    }
    
    addMessage(message);
    
    // Update the web state
    const newWebState = { ...webState, gameState };
    setWebState(newWebState);
  }, [webState, addMessage]);

  return {
    // Game state
    gameState: webState?.gameState || null,
    roundState: webState?.roundState || null,
    currentDice: webState?.roundState?.diceHand || [],
    selectedDice: webState?.selectedDice || [],
    previewScoring: webState?.previewScoring || null,
    
    // Debug
    debug: {
      webStateExists: !!webState,
      roundStateExists: !!webState?.roundState,
      rollHistoryLength: webState?.roundState?.rollHistory?.length || 0
    },
    
    // Effect logs
    materialLogs: webState?.materialLogs || [],
    charmLogs: webState?.charmLogs || [],
    
    // UI state
    isGameStarted: !!webState,
    isLoading,
    messages,
    canSelectDice: webState?.roundState ? 
      webState.roundState.diceHand.length > 0 && !(webState.canBank && webState.canReroll) && !webState.justBanked && !webState.justFlopped : 
      false,
    justBanked: webState?.justBanked || false,
    justFlopped: webState?.justFlopped || false,
    
    // Actions
    startNewGame,
    handleDiceSelect,
    handleRollDice,
    handleBank,
    handleConsumableUse,
    scoreSelectedDice,
    
    // Button states
    canRoll: webState?.canRoll || false,
    canBank: webState?.canBank || false,
    canReroll: webState?.canReroll || false,
    canRollDice: (webState?.canRoll || webState?.canReroll) || false
  };
} 