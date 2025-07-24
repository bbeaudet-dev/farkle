import { CHARMS } from './content/charms';

export async function applyConsumableEffect(idx: number, gameState: any, roundState: any, gameInterface: any, charmManager: any): Promise<void> {
  const consumable = gameState.consumables[idx];
  if (!consumable) return;
  let shouldRemove = true;
  switch (consumable.id) {
    case 'moneyDoubler':
      gameState.money *= 2;
      await gameInterface.log('💰 Money Doubler used! Your money has been doubled.');
      break;
    case 'extraDie': {
      // Add a new default die to the dice set
      const newDieId = `d${gameState.diceSet.length + 1}`;
      const newDie = {
        id: newDieId,
        sides: 6,
        allowedValues: [1, 2, 3, 4, 5, 6],
        material: 'plastic'
      };
      gameState.diceSet.push(newDie);
      await gameInterface.log('🎲 Extra Die added! You will have an extra die next round.');
      break;
    }
    case 'materialEnchanter':
      // TODO (Phase 5): Implement material change logic once material system is complete
      await gameInterface.log('🔮 Material Enchanter effect not yet implemented. (Requires material system)');
      break;
    case 'charmGiver': {
      const maxCharms = gameState.charmSlots;
      if (gameState.charms.length >= maxCharms) {
        await gameInterface.log('🎁 Charm Giver: No open charm slots!');
        shouldRemove = false;
        break;
      }
      // Find available charms not already owned
      const ownedIds = new Set(gameState.charms.map((c: any) => c.id));
      const available = CHARMS.filter(c => !ownedIds.has(c.id));
      if (available.length === 0) {
        await gameInterface.log('🎁 Charm Giver: No new charms available!');
        shouldRemove = false;
        break;
      }
      const randomIdx = Math.floor(Math.random() * available.length);
      const newCharm = { ...available[randomIdx], active: true };
      gameState.charms.push(newCharm);
      charmManager.addCharm(newCharm);
      await gameInterface.log(`🎁 Charm Giver: You gained a new charm: ${newCharm.name}!`);
      break;
    }
    case 'slotExpander':
      gameState.charmSlots = (gameState.charmSlots || 3) + 1;
      await gameInterface.log('🧳 Slot Expander used! You now have an extra charm slot.');
      break;
    case 'chisel':
      // TODO (Phase 5): Implement downgrade die logic once material system is complete
      await gameInterface.log('🪓 Chisel effect not yet implemented. (Requires material system)');
      break;
    case 'potteryWheel':
      // TODO (Phase 5): Implement upgrade die logic once material system is complete
      await gameInterface.log('🧱 Pottery Wheel effect not yet implemented. (Requires material system)');
      break;
    case 'forfeitRecovery':
      const lastForfeit = gameState.lastForfeitedPoints || 0;
      const recovered = Math.floor(lastForfeit * 0.5);
      gameState.roundState.roundPoints += recovered;
      await gameInterface.log(`🩹 Forfeit Recovery used! Recovered ${recovered} points.`);
      break;
    default:
      await gameInterface.log('Unknown consumable effect.');
  }
  // Remove the used consumable only if it was actually used
  if (shouldRemove) {
    gameState.consumables.splice(idx, 1);
  }
} 