import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';
import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration for production
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  await redisClient.connect();
  console.log('✅ Connected to Redis successfully!');
}
connectRedis();

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-domain.vercel.app', // Replace with your actual domain
  process.env.FRONTEND_URL // Add this environment variable
].filter(Boolean) as string[];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const HELIUS_API_KEY = process.env.HELIUS_API_KEY; 


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
        const pixelData = await redisClient.get(key);
        const parts = key.split(':');
        if (parts.length === 3 && pixelData) {
          try {
            const parsedData = JSON.parse(pixelData);
            pixels.push({ 
              x: parseInt(parts[1]), 
              y: parseInt(parts[2]), 
              color: parsedData.color,
              walletAddress: parsedData.walletAddress,
              timestamp: parsedData.timestamp
            });
          } catch (parseError) {
            // Handle legacy pixels that only store color as string
            pixels.push({ 
              x: parseInt(parts[1]), 
              y: parseInt(parts[2]), 
              color: pixelData,
              walletAddress: null,
              timestamp: null
            });
          }
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

  const { x, y, color, walletAddress } = req.body;

  if (x === undefined || y === undefined || color === undefined || !walletAddress) {
    res.status(400).send({ message: 'Bad Request: Missing x, y, color, or wallet address' });
    return;
  }

  try {
    const pixelKey = `pixel:${x}:${y}`;
    const pixelData = JSON.stringify({ color, walletAddress, timestamp: Date.now() });
    await redisClient.set(pixelKey, pixelData);

    const newPixel = { x: Number(x), y: Number(y), color, walletAddress };
    io.emit('new_pixel', newPixel);
    console.log('Broadcasted new pixel:', newPixel);

    res.status(200).json({ success: true, message: 'Pixel placed' });
  } catch (err) {
    console.error('Error placing pixel:', err);
    res.status(500).send({ message: 'Error placing pixel' });
  }
});

app.get('/api/pixels-by-wallet/:wallet', async (req, res) => {
  const wallet = req.params.wallet;

  if (!wallet) {
    res.status(400).json({ error: 'Missing wallet address' });
    return;
  }

  if (!redisClient.isOpen) {
    res.status(503).send({ message: 'Service Unavailable: Redis not connected' });
    return;
  }

  try {
    const pixelKeys = await redisClient.keys('pixel:*');
    const pixels = [];
    
    if (pixelKeys.length > 0) {
      for (const key of pixelKeys) {
        const pixelData = await redisClient.get(key);
        const parts = key.split(':');
        if (parts.length === 3 && pixelData) {
          try {
            const parsedData = JSON.parse(pixelData);
            if (parsedData.walletAddress === wallet) {
              pixels.push({ 
                x: parseInt(parts[1]), 
                y: parseInt(parts[2]), 
                color: parsedData.color,
                timestamp: parsedData.timestamp
              });
            }
          } catch (parseError) {
            // Skip legacy pixels
            continue;
          }
        }
      }
    }
    
    res.json({ pixels, count: pixels.length });
  } catch (err) {
    console.error('Error fetching pixels by wallet:', err);
    res.status(500).send({ message: 'Error fetching pixels by wallet' });
  }
});

app.get('/api/owns-token/:wallet', async (req, res) => {
  const wallet = req.params.wallet;
  const mint = req.query.mint;

  if (!wallet || !mint || typeof mint !== 'string') {
    res.status(400).json({ error: 'Missing wallet or token mint' });
    return;
  }

  const heliusRpcUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  try {
    const response = await axios.post(heliusRpcUrl, {
      jsonrpc: '2.0',
      id: 'check-token',
      method: 'searchAssets',
      params: {
        ownerAddress: wallet,
        tokenType: 'fungible',
        displayOptions: {
          showCollectionMetadata: false,
        },
      },
    });

    const items = response.data?.result?.items || [];

    const token = items.find((t: any) => t.id === mint);

    if (!token) {
      console.log(`Wallet ${wallet} ❌ does NOT own token ${mint}`);
      res.json({ ownsToken: false, tokenBalance: 0 });
      return;
    }

    const rawBalance = token.token_info?.balance || 0;
    const decimals = token.token_info?.decimals || 0;
    const humanBalance = rawBalance / 10 ** decimals;

    console.log(`Wallet ${wallet} ✅ owns ${humanBalance} of token ${mint}`);
    res.json({ ownsToken: true, tokenBalance: humanBalance });
  } catch (err: any) {
    console.error('Error calling Helius:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard API endpoints
app.get('/api/leaderboard/:type', async (req, res) => {
  const type = req.params.type;
  
  if (!redisClient.isOpen) {
    res.status(503).send({ message: 'Service Unavailable: Redis not connected' });
    return;
  }

  try {
    const pixelKeys = await redisClient.keys('pixel:*');
    const walletStats: Record<string, any> = {};
    
    // Collect all pixel data
    for (const key of pixelKeys) {
      const pixelData = await redisClient.get(key);
      const parts = key.split(':');
      if (parts.length === 3 && pixelData) {
        try {
          const parsedData = JSON.parse(pixelData);
          const wallet = parsedData.walletAddress;
          if (!wallet) continue;
          
                     if (!walletStats[wallet]) {
             walletStats[wallet] = {
               pixels: 0,
               colors: new Set<string>(),
               firstPixel: parsedData.timestamp,
               lastPixel: parsedData.timestamp,
               positions: []
             };
           }
          
          walletStats[wallet].pixels++;
          walletStats[wallet].colors.add(parsedData.color);
          walletStats[wallet].positions.push({ x: parseInt(parts[1]), y: parseInt(parts[2]) });
          
          if (parsedData.timestamp < walletStats[wallet].firstPixel) {
            walletStats[wallet].firstPixel = parsedData.timestamp;
          }
          if (parsedData.timestamp > walletStats[wallet].lastPixel) {
            walletStats[wallet].lastPixel = parsedData.timestamp;
          }
        } catch (parseError) {
          continue;
        }
      }
    }
    
    // Calculate different leaderboard types
    let leaderboard: Array<{ walletAddress: string; value: number; rank: number }> = [];
    
    switch (type) {
      case 'pixels':
        leaderboard = Object.entries(walletStats)
          .map(([wallet, stats]) => ({ walletAddress: wallet, value: stats.pixels, rank: 0 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      case 'colors':
        // Count color usage across all pixels
        const colorCounts: Record<string, number> = {};
        for (const key of pixelKeys) {
          const pixelData = await redisClient.get(key);
          if (pixelData) {
            try {
              const parsedData = JSON.parse(pixelData);
              const color = parsedData.color;
              if (color) {
                colorCounts[color] = (colorCounts[color] || 0) + 1;
              }
            } catch (parseError) {
              // Handle legacy pixels that only store color as string
              if (pixelData && typeof pixelData === 'string') {
                colorCounts[pixelData] = (colorCounts[pixelData] || 0) + 1;
              }
            }
          }
        }
        
        // Convert to leaderboard format with color as walletAddress and count as value
        leaderboard = Object.entries(colorCounts)
          .map(([color, count]) => ({ walletAddress: color, value: count, rank: 0 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      case 'session':
        leaderboard = Object.entries(walletStats)
          .map(([wallet, stats]) => ({ 
            walletAddress: wallet, 
            value: Math.floor((stats.lastPixel - stats.firstPixel) / 1000), // Convert to seconds
            rank: 0 
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      case 'collaboration':
        // Calculate collaboration score based on pixels placed near other users
        leaderboard = Object.entries(walletStats)
          .map(([wallet, stats]) => {
            let collaborationScore = 0;
            for (const pos of stats.positions) {
              // Check if there are pixels within 2 units placed by other users
              for (const [otherWallet, otherStats] of Object.entries(walletStats)) {
                if (otherWallet === wallet) continue;
                for (const otherPos of otherStats.positions) {
                  const distance = Math.sqrt(
                    Math.pow(pos.x - otherPos.x, 2) + Math.pow(pos.y - otherPos.y, 2)
                  );
                  if (distance <= 2) {
                    collaborationScore++;
                    break;
                  }
                }
              }
            }
            return { walletAddress: wallet, value: collaborationScore, rank: 0 };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      case 'speed':
        // Calculate average time between pixel placements
        leaderboard = Object.entries(walletStats)
          .map(([wallet, stats]) => {
            if (stats.pixels <= 1) return { walletAddress: wallet, value: 999, rank: 0 };
            const avgTime = (stats.lastPixel - stats.firstPixel) / (stats.pixels - 1) / 1000; // seconds
            return { walletAddress: wallet, value: avgTime, rank: 0 };
          })
          .sort((a, b) => a.value - b.value) // Lower is better for speed
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      case 'territory':
        // Calculate largest contiguous area claimed
        leaderboard = Object.entries(walletStats)
          .map(([wallet, stats]) => {
            // Simple territory calculation - count pixels in largest connected component
            const visited = new Set<string>();
            let maxTerritory = 0;
            
            for (const pos of stats.positions) {
              const key = `${pos.x},${pos.y}`;
              if (visited.has(key)) continue;
              
              const territory = floodFill(stats.positions, pos, visited);
              maxTerritory = Math.max(maxTerritory, territory);
            }
            
            return { walletAddress: wallet, value: maxTerritory, rank: 0 };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
        break;
        
      default:
        res.status(400).json({ error: 'Invalid leaderboard type' });
        return;
    }
    
    res.json({ leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).send({ message: 'Error fetching leaderboard' });
  }
});

// Helper function for flood fill algorithm
function floodFill(positions: Array<{x: number, y: number}>, start: {x: number, y: number}, visited: Set<string>): number {
  const queue = [start];
  let count = 0;
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    count++;
    
    // Check adjacent positions
    const adjacent = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const adj of adjacent) {
      const adjKey = `${adj.x},${adj.y}`;
      if (!visited.has(adjKey) && positions.some(p => p.x === adj.x && p.y === adj.y)) {
        queue.push(adj);
      }
    }
  }
  
  return count;
}

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});