import React from 'react';
import { GameBoard } from '../game';
import { GameHeader, LiveScoreboard } from './';
import { useGameState } from '../../hooks/useGameState';

interface Player {
  id: string;
  username: string;
  socketId: string;
  gameScore: number;
  currentRound: number;
  isActive: boolean;
  lastAction: string;
  status: 'lobby' | 'in_game' | 'spectating';
}

interface Room {
  id: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  activePlayerIds: string[];
  hostId: string;
  createdAt: Date;
}

interface MultiplayerGameProps {
  currentRoom: Room;
  currentPlayer: Player;
  activePlayerIds: string[];
  onBackToLobby: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  currentRoom,
  currentPlayer,
  activePlayerIds,
  onBackToLobby
}) => {
  const {
    gameState,
    roundState,
    selectedDice,
    previewScoring,
    materialLogs,
    charmLogs,
    messages,
    canSelectDice,
    justBanked,
    justFlopped,
    handleDiceSelect,
    handleRollDice,
    handleBank,
    handleConsumableUse,
    scoreSelectedDice,
    canRoll,
    canRollDice,
    canBank,
    canReroll,
  } = useGameState();

  const canPlay = currentPlayer && activePlayerIds.includes(currentPlayer.id);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <GameHeader
        roomId={currentRoom.id}
        username={currentPlayer.username}
        canPlay={!!canPlay}
        onBackToLobby={onBackToLobby}
      />

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Main Game Area */}
        <div style={{ flex: 1 }}>
          <GameBoard
            dice={roundState?.diceHand || []}
            selectedDice={selectedDice}
            onDiceSelect={handleDiceSelect}
            onScoreSelectedDice={scoreSelectedDice}
            onRoll={handleRollDice}
            onBank={handleBank}
            canRoll={!!(canRoll && canPlay)}
            canBank={!!(canBank && canPlay)}
            diceToReroll={roundState?.diceHand?.length || 0}
            roundNumber={roundState?.roundNumber || 0}
            rollNumber={roundState?.rollNumber || 0}
            roundPoints={roundState?.roundPoints || 0}
            gameScore={gameState?.gameScore || 0}
            consecutiveFlops={gameState?.consecutiveFlops || 0}
            charms={gameState?.charms || []}
            consumables={gameState?.consumables || []}
            onConsumableUse={handleConsumableUse}
            previewScoring={previewScoring}
            canSelectDice={!!(canSelectDice && canPlay)}
            materialLogs={materialLogs}
            charmLogs={charmLogs}
            money={gameState?.money || 0}
            hotDiceCount={roundState?.hotDiceCounterRound || 0}
            totalRolls={gameState?.rollCount || 0}
            forfeitedPoints={gameState?.forfeitedPointsTotal || 0}
            isHotDice={!!(roundState && roundState.diceHand.length === 0 && roundState.rollHistory.length > 0)}
            canReroll={!!(canReroll && canPlay)}
            gameState={gameState}
            roundState={roundState}
            justBanked={justBanked}
            justFlopped={justFlopped}
          />
        </div>

        {/* Live Scoreboard */}
        <div style={{ width: '300px' }}>
          <LiveScoreboard
            players={currentRoom.players}
            currentPlayerId={currentPlayer.id}
            activePlayerIds={activePlayerIds}
          />
        </div>
      </div>
    </div>
  );
}; 