import React, { useState, useEffect } from 'react';
import { MultiplayerLobby, MultiplayerGame } from './';
import io from 'socket.io-client';

interface Player {
  id: string;
  username: string;
  socketId: string;
  gameScore: number;
  currentRound: number;
  hotDiceCounterRound: number;
  roundPoints: number;
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

interface MultiplayerRoomProps {
  onBackToMenu: () => void;
}

export const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
  onBackToMenu
}) => {
  const [socket, setSocket] = useState<any>(null);
  const [username, setUsername] = useState(`Player${Math.floor(Math.random() * 100000)}`);
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>([]);

  useEffect(() => {
    // Connect to WebSocket server
    const connectToServer = () => {
          const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.REACT_APP_BACKEND_URL || 'https://rollio-backend.onrender.com'
      : 'http://localhost:5173';
      
      const newSocket = io(serverUrl);
      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('player_joined', (player: Player) => {
        console.log('Player joined:', player);
        setCurrentRoom(prev => {
          if (prev) {
            const playerExists = prev.players.some(p => p.id === player.id);
            if (!playerExists) {
              return {
                ...prev,
                players: [...prev.players, player]
              };
            }
          }
          return prev;
        });
      });

      newSocket.on('player_left', (player: Player) => {
        console.log('Player left:', player);
        setCurrentRoom(prev => {
          if (prev) {
            return {
              ...prev,
              players: prev.players.filter(p => p.id !== player.id)
            };
          }
          return prev;
        });
      });

      newSocket.on('player_state_updated', (player: Player) => {
        console.log('Player state updated:', player);
        setCurrentRoom(prev => {
          if (prev) {
            return {
              ...prev,
              players: prev.players.map(p => p.id === player.id ? player : p)
            };
          }
          return prev;
        });
      });

      newSocket.on('game_started', (data: { roomCode: string; activePlayerIds: string[]; gameState: string }) => {
        console.log('Game started:', data);
        setGameStarted(true);
        setActivePlayerIds(data.activePlayerIds);
      });

      return () => {
        newSocket.close();
      };
    };

    connectToServer();
  }, []);

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsCreating(true);
    setError('');

    socket?.emit('create_room', username, (response: any) => {
      setIsCreating(false);
      if (response.success) {
        setCurrentRoom({
          id: response.roomCode,
          players: [response.player],
          gameState: 'waiting',
          activePlayerIds: [],
          hostId: response.player.id,
          createdAt: new Date()
        });
        setCurrentPlayer(response.player);
        setRoomCode(response.roomCode);
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    socket?.emit('join_room', roomCode.toUpperCase(), username, (response: any) => {
      setIsJoining(false);
      if (response.success) {
        setCurrentRoom(response.room);
        setCurrentPlayer(response.player);
      } else {
        setError(response.error || 'Failed to join room');
      }
    });
  };

  const handleStartGame = () => {
    if (currentRoom && currentPlayer) {
      socket?.emit('start_game', currentRoom.id, (response: any) => {
        if (response.success) {
          console.log('Game started successfully');
        } else {
          setError(response.error || 'Failed to start game');
        }
      });
    }
  };
  const canPlay = currentPlayer && activePlayerIds.includes(currentPlayer.id);

  // Show game if started
  if (gameStarted && currentRoom && currentPlayer) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <MultiplayerGame
          currentRoom={currentRoom}
          currentPlayer={currentPlayer}
          activePlayerIds={activePlayerIds}
          socket={socket}
          onBackToLobby={() => setGameStarted(false)}
        />
      </div>
    );
  }

    // Show lobby
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <MultiplayerLobby
        username={username}
        roomCode={roomCode}
        currentRoom={currentRoom}
        currentPlayer={currentPlayer}
        error={error}
        isCreating={isCreating}
        isJoining={isJoining}
        onUsernameChange={setUsername}
        onRoomCodeChange={setRoomCode}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartGame={handleStartGame}
        onBackToMenu={onBackToMenu}
      />
    </div>
  );
}; 