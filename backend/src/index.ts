import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';
import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

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

// BSC Configuration
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// ERC-20 ABI for token balance checking
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
]; 


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

  if (!wallet) {
    res.status(400).json({ error: 'Missing wallet address' });
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    
    // If no token contract is specified, use BNB balance
    if (TOKEN_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      const bnbBalance = await provider.getBalance(wallet);
      const bnbFormatted = parseFloat(ethers.formatEther(bnbBalance));
      
      console.log(`Wallet ${wallet} ✅ has ${bnbFormatted} BNB`);
      res.json({ ownsToken: true, tokenBalance: bnbFormatted });
      return;
    }

    // Check ERC-20 token balance
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const tokenBalance = await tokenContract.balanceOf(wallet);
    const decimals = await tokenContract.decimals();
    const formattedBalance = parseFloat(ethers.formatUnits(tokenBalance, decimals));

    if (formattedBalance > 0) {
      console.log(`Wallet ${wallet} ✅ owns ${formattedBalance} of token ${TOKEN_CONTRACT_ADDRESS}`);
      res.json({ ownsToken: true, tokenBalance: formattedBalance });
    } else {
      console.log(`Wallet ${wallet} ❌ does NOT own token ${TOKEN_CONTRACT_ADDRESS}`);
      res.json({ ownsToken: false, tokenBalance: 0 });
    }
  } catch (err: any) {
    console.error('Error checking BSC token balance:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard API endpoints
app.get('/api/leaderboard/:type', async (req, res) => {
  const type = req.params.type;
  const timeframe = req.query.timeframe as string || 'alltime';
  
  if (!redisClient.isOpen) {
    res.status(503).send({ message: 'Service Unavailable: Redis not connected' });
    return;
  }

  try {
    const pixelKeys = await redisClient.keys('pixel:*');
    const now = Date.now();
    
    console.log(`Processing ${type} leaderboard:`, {
      totalPixelKeys: pixelKeys.length,
      currentTime: new Date(now).toISOString()
    });
    
    // Calculate all time thresholds
    const timeThresholds = {
      alltime: 0,
      today: now - (24 * 60 * 60 * 1000), // 24 hours ago
      week: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      month: now - (30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    // Process data for all timeframes
    const walletStatsByTimeframe: Record<string, Record<string, any>> = {
      alltime: {},
      today: {},
      week: {},
      month: {}
    };
    
    // Collect pixel data for all timeframes
    for (const key of pixelKeys) {
      const pixelData = await redisClient.get(key);
      const parts = key.split(':');
      if (parts.length === 3 && pixelData) {
        try {
          const parsedData = JSON.parse(pixelData);
          const wallet = parsedData.walletAddress;
          if (!wallet) continue;
          
          // Process for each timeframe
          Object.entries(timeThresholds).forEach(([tf, threshold]) => {
            // Skip if pixel is outside this timeframe
            if (threshold > 0 && parsedData.timestamp < threshold) {
              return;
            }
            
            if (!walletStatsByTimeframe[tf][wallet]) {
              walletStatsByTimeframe[tf][wallet] = {
                pixels: 0,
                colors: new Set<string>(),
                firstPixel: parsedData.timestamp,
                lastPixel: parsedData.timestamp,
                positions: []
              };
            }
            
            walletStatsByTimeframe[tf][wallet].pixels++;
            walletStatsByTimeframe[tf][wallet].colors.add(parsedData.color);
            walletStatsByTimeframe[tf][wallet].positions.push({ x: parseInt(parts[1]), y: parseInt(parts[2]) });
            
            if (parsedData.timestamp < walletStatsByTimeframe[tf][wallet].firstPixel) {
              walletStatsByTimeframe[tf][wallet].firstPixel = parsedData.timestamp;
            }
            if (parsedData.timestamp > walletStatsByTimeframe[tf][wallet].lastPixel) {
              walletStatsByTimeframe[tf][wallet].lastPixel = parsedData.timestamp;
            }
          });
        } catch (parseError) {
          // Handle legacy pixels (no timestamp) - only include in alltime
          if (pixelData && typeof pixelData === 'string') {
            // Legacy pixels don't have wallet info, skip for now
            continue;
          }
        }
      }
    }
    
    // Calculate different leaderboard types for all timeframes
    const calculateLeaderboard = (walletStats: Record<string, any>, type: string) => {
      switch (type) {
        case 'pixels':
          return Object.entries(walletStats)
            .map(([wallet, stats]) => ({ walletAddress: wallet, value: stats.pixels, rank: 0 }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
        case 'territory':
          return Object.entries(walletStats)
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
            .slice(0, 20)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
        case 'timeplayed':
          return Object.entries(walletStats)
            .map(([wallet, stats]) => ({ 
              walletAddress: wallet, 
              value: Math.floor((stats.lastPixel - stats.firstPixel) / 1000), // Convert to seconds
              rank: 0 
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
        default:
          return [];
      }
    };

    // Calculate colors leaderboard for all timeframes
    const calculateColorsLeaderboard = async () => {
      const colorCountsByTimeframe: Record<string, Record<string, number>> = {
        alltime: {},
        today: {},
        week: {},
        month: {}
      };

      for (const key of pixelKeys) {
        const pixelData = await redisClient.get(key);
        if (pixelData) {
          try {
            const parsedData = JSON.parse(pixelData);
            const color = parsedData.color;
            
            if (color) {
              Object.entries(timeThresholds).forEach(([tf, threshold]) => {
                if (threshold > 0 && parsedData.timestamp < threshold) {
                  return;
                }
                colorCountsByTimeframe[tf][color] = (colorCountsByTimeframe[tf][color] || 0) + 1;
              });
            }
          } catch (parseError) {
            // Handle legacy pixels - only include in alltime
            if (timeThresholds.alltime === 0 && pixelData && typeof pixelData === 'string') {
              colorCountsByTimeframe.alltime[pixelData] = (colorCountsByTimeframe.alltime[pixelData] || 0) + 1;
            }
          }
        }
      }

      return Object.fromEntries(
        Object.entries(colorCountsByTimeframe).map(([tf, colorCounts]) => [
          tf,
          Object.entries(colorCounts)
            .map(([color, count]) => ({ walletAddress: color, value: count, rank: 0 }))
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => ({ ...entry, rank: index + 1 }))
        ])
      );
    };

    let leaderboardsByTimeframe: Record<string, Array<{ walletAddress: string; value: number; rank: number }>> = {};
    
    if (type === 'colors' || type === 'colours') {
      leaderboardsByTimeframe = await calculateColorsLeaderboard();
    } else {
      Object.entries(walletStatsByTimeframe).forEach(([tf, stats]) => {
        leaderboardsByTimeframe[tf] = calculateLeaderboard(stats, type);
      });
    }
    
    // Debug: Log wallet stats summary
    console.log(`Wallet stats summary for ${type}:`, {
      alltime: Object.keys(walletStatsByTimeframe.alltime).length,
      today: Object.keys(walletStatsByTimeframe.today).length,
      week: Object.keys(walletStatsByTimeframe.week).length,
      month: Object.keys(walletStatsByTimeframe.month).length
    });
    
    console.log(`Leaderboard ${type} response:`, {
      totalTimeframes: Object.keys(leaderboardsByTimeframe).length,
      timeframes: Object.keys(leaderboardsByTimeframe),
      requestedTimeframe: timeframe,
      hasRequestedData: !!leaderboardsByTimeframe[timeframe],
      requestedDataLength: leaderboardsByTimeframe[timeframe]?.length || 0
    });
    
    res.json({ 
      leaderboardsByTimeframe,
      requestedTimeframe: timeframe,
      currentLeaderboard: leaderboardsByTimeframe[timeframe] || []
    });
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