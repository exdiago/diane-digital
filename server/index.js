import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for chat messages (in production, use a database)
let messages = [];

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'VideoChat Pro API Server', 
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: '/api/chat',
      health: '/api/health'
    }
  });
});

// Chat API endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message, username = 'Anonymous', timestamp } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Message cannot be empty' 
      });
    }

    const newMessage = {
      id: Date.now(),
      message: message.trim(),
      username,
      timestamp: timestamp || new Date().toISOString()
    };

    messages.push(newMessage);
    
    // Keep only last 100 messages to prevent memory issues
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    res.json({ 
      success: true, 
      message: newMessage,
      totalMessages: messages.length
    });
  } catch (error) {
    console.error('Error handling chat message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get all messages endpoint
app.get('/api/chat', (req, res) => {
  try {
    res.json({ 
      success: true, 
      messages,
      totalMessages: messages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VideoChat Pro API Server running on port ${PORT}`);
  console.log(`📡 Chat API available at http://localhost:${PORT}/api/chat`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`📋 Server info at http://localhost:${PORT}/`);
});