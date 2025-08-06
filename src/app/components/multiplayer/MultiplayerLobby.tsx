import React, { useState } from 'react';

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

interface MultiplayerLobbyProps {
  username: string;
  roomCode: string;
  currentRoom: Room | null;
  currentPlayer: Player | null;
  error: string;
  isCreating: boolean;
  isJoining: boolean;
  onUsernameChange: (username: string) => void;
  onRoomCodeChange: (roomCode: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onStartGame: () => void;
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  username,
  roomCode,
  currentRoom,
  currentPlayer,
  error,
  isCreating,
  isJoining,
  onUsernameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onBackToMenu
}) => {
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
    }
  };

  const isHost = currentPlayer && currentRoom && currentRoom.hostId === currentPlayer.id;

  // Show room lobby if in a room
  if (currentRoom && currentPlayer) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Room: {currentRoom.id}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <p>Share this room code with friends:</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <input
              type="text"
              value={roomCode}
              readOnly
              style={{
                padding: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '2px solid #007bff',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            />
            <button
              onClick={copyRoomCode}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Players ({currentRoom.players.length}/4):</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: '10px',
                  backgroundColor: player.id === currentPlayer.id ? '#e3f2fd' : '#fff',
                  border: player.id === currentPlayer.id ? '2px solid #2196f3' : '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  {player.username} {player.id === currentPlayer.id ? '(You)' : ''}
                  {isHost && player.id === currentPlayer.id && ' (Host)'}
                </span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    player.status === 'lobby' ? '#28a745' :
                    player.status === 'in_game' ? '#007bff' :
                    '#6c757d',
                  color: '#fff'
                }}>
                  {player.status === 'lobby' ? 'LOBBY' :
                   player.status === 'in_game' ? 'IN GAME' :
                   'SPECTATING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={currentRoom.players.length < 1}
              style={{
                padding: '12px 24px',
                backgroundColor: currentRoom.players.length >= 1 ? '#28a745' : '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: currentRoom.players.length >= 1 ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}
            >
              Start Game ({currentRoom.players.length} players)
            </button>
          )}
          
          <button
            onClick={onBackToMenu}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // Show room creation/joining interface
  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h1>Multiplayer Lobby</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
          Your Username:
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter your username"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Create Room Section */}
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h3>Create a New Room</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Create a new game and invite friends to join.
          </p>
          <button
            onClick={onCreateRoom}
            disabled={isCreating || !username.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreating || !username.trim() ? 'not-allowed' : 'pointer',
              opacity: isCreating || !username.trim() ? 0.6 : 1
            }}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        {/* Join Room Section */}
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h3>Join an Existing Room</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Enter a room code to join a friend's game.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <button
            onClick={onJoinRoom}
            disabled={isJoining || !username.trim() || !roomCode.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isJoining || !username.trim() || !roomCode.trim() ? 'not-allowed' : 'pointer',
              opacity: isJoining || !username.trim() || !roomCode.trim() ? 0.6 : 1
            }}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={onBackToMenu}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}; 