import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-app-name.vercel.app", "https://your-app-name.netlify.app"] 
      : ["http://localhost:3000"], 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5173;

// Middleware
app.use(express.json());

// Serve static files from the built frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
} else {
  app.use(express.static('public'));
}

// Room management
interface Room {
  id: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  activePlayerIds: string[]; // Players who were in the room when game started
  hostId: string; // Who can start the game
  createdAt: Date;
}

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

const rooms = new Map<string, Room>();

// Generate room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Serve the main page
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Handle client-side routing in production
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  }
});

// API endpoint to start a new game
app.post('/api/game/start', (req, res) => {
  try {
    // Initialize game state
    res.json({ success: true, message: 'Game started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
});

// API endpoint to process game action
app.post('/api/game/action', (req, res) => {
  try {
    const { action, data } = req.body;
    // Process game action
    res.json({ success: true, message: 'Action processed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process action' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create_room', (username: string, callback) => {
    console.log('Creating room for:', username, 'socket:', socket.id);
    
    const roomCode = generateRoomCode();
    const player: Player = {
      id: socket.id,
      username,
      socketId: socket.id,
      gameScore: 0,
      currentRound: 0,
      hotDiceCounterRound: 0,
      roundPoints: 0,
      isActive: true,
      lastAction: 'joined',
      status: 'lobby'
    };

    const room: Room = {
      id: roomCode,
      players: [player],
      gameState: 'waiting',
      activePlayerIds: [],
      hostId: socket.id,
      createdAt: new Date()
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    
    console.log(`Room ${roomCode} created by ${username}`);
    console.log('Sending callback with:', { success: true, roomCode, player });
    callback({ success: true, roomCode, player });
  });

  // Join an existing room
  socket.on('join_room', (roomCode: string, username: string, callback) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.length >= 4) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    const player: Player = {
      id: socket.id,
      username,
      socketId: socket.id,
      gameScore: 0,
      currentRound: 0,
      hotDiceCounterRound: 0,
      roundPoints: 0,
      isActive: true,
      lastAction: 'joined',
      status: 'lobby'
    };

    room.players.push(player);
    socket.join(roomCode);
    
    // Notify all players in the room
    io.to(roomCode).emit('player_joined', player);
    
    console.log(`${username} joined room ${roomCode}`);
    callback({ success: true, room, player });
  });

  // Update player state (score, round, etc.)
  socket.on('update_player_state', (roomCode: string, playerState: Partial<Player>) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    // Update player state
    room.players[playerIndex] = { ...room.players[playerIndex], ...playerState };
    
    // Broadcast to all players in the room
    io.to(roomCode).emit('player_state_updated', room.players[playerIndex]);
  });

  // Start game (only host can do this)
  socket.on('start_game', (roomCode: string, callback) => {
    const room = rooms.get(roomCode);
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    // Check if this player is the host
    if (room.hostId !== socket.id) {
      callback({ success: false, error: 'Only the host can start the game' });
      return;
    }

    // Log current player IDs as active players
    room.activePlayerIds = room.players.map(p => p.id);
    room.gameState = 'playing';

    console.log(`Game started in room ${roomCode} with ${room.activePlayerIds.length} active players`);

    // Notify all players in the room that the game has started
    io.to(roomCode).emit('game_started', {
      roomCode,
      activePlayerIds: room.activePlayerIds,
      gameState: room.gameState
    });

    callback({ success: true, room });
  });



  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all rooms they're in
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Notify remaining players
        io.to(roomCode).emit('player_left', player);
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        }
        
        break;
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 