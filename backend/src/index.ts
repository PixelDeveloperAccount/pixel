import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';

// Initialize Redis Client
const redisClient = createClient({
  url: 'redis://redis:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  await redisClient.connect();
  console.log('✅ Connected to Redis successfully!');
}
connectRedis();


// Initialize Express Server and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(cors());
app.use(express.json());


// API Routes
app.get('/api/canvas', async (_req, res) => {
  if (!redisClient.isOpen) {
    res.status(503).send({ message: 'Service Unavailable: Redis not connected' });
    return;
  }
  try {
    const pixelKeys = await redisClient.keys('pixel:*');
    const pixels = [];
    if (pixelKeys.length > 0) {
      for (const key of pixelKeys) {
          const color = await redisClient.get(key);
          const parts = key.split(':');
          if (parts.length === 3 && color) {
            pixels.push({ x: parseInt(parts[1]), y: parseInt(parts[2]), color });
          }
      }
    }
    res.json({ pixels });
  } catch (err) {
    console.error('Error fetching canvas state:', err);
    res.status(500).send({ message: 'Error fetching canvas state' });
  }
});

app.post('/api/place-pixel', async (req, res) => {
  if (!redisClient.isOpen) {
    res.status(503).send({ message: 'Service Unavailable: Redis not connected' });
    return;
  }
  
  const { x, y, color } = req.body;

  if (x === undefined || y === undefined || color === undefined) {
    res.status(400).send({ message: 'Bad Request: Missing x, y, or color' });
    return;
  }

  try {
    const pixelKey = `pixel:${x}:${y}`;
    await redisClient.set(pixelKey, color);

    const newPixel = { x: Number(x), y: Number(y), color };
    io.emit('new_pixel', newPixel);
    console.log('Broadcasted new pixel:', newPixel);

    res.status(200).json({ success: true, message: 'Pixel placed' });
  } catch (err) {
    console.error('Error placing pixel:', err);
    res.status(500).send({ message: 'Error placing pixel' });
  }
});


// WebSocket Logic
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


// Start The Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});