import express from 'express';
import path from 'path';
import { WebInterface } from '../app/webInterface';
import { GameEngine } from '../game/gameEngine';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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

// Start server
app.listen(PORT, () => {
  console.log(`🎲 Farkle server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, '../public')}`);
});

export default app; 