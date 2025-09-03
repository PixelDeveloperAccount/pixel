# Deployment Guide for Pixel App

## Overview
This guide will help you deploy your pixel app to production with both frontend and backend running on live servers.

## Frontend Deployment (Vercel - Recommended)

### 1. Prepare for Vercel
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Build your app locally to test:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - `VITE_BACKEND_URL`: Your backend server URL

### 2. Alternative: Deploy to Netlify
1. Push your code to GitHub
2. Connect your repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_BACKEND_URL`

## Backend Deployment (Railway - Recommended)

### 1. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select your backend folder
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `REDIS_URL=your-redis-url`
   - `HELIUS_API_KEY=your-helius-key`
   - `FRONTEND_URL=your-frontend-url`

### 2. Alternative: Deploy to Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables

### 3. Alternative: Deploy to DigitalOcean
1. Create a Droplet
2. Install Docker and Docker Compose
3. Copy your backend files
4. Run: `docker-compose -f docker-compose.prod.yml up -d`

## Redis Setup

### Option 1: Railway Redis
1. Create Redis service in Railway
2. Copy the connection URL to your backend environment

### Option 2: Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection URL

### Option 3: Redis Cloud
1. Go to [redis.com](https://redis.com)
2. Create free database
3. Copy connection details

## Environment Variables

### Frontend (.env.production)
```
VITE_BACKEND_URL=https://your-backend-domain.com
```

### Backend
```
NODE_ENV=production
PORT=3001
REDIS_URL=redis://your-redis-url
HELIUS_API_KEY=your-helius-api-key
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing Deployment

1. Test frontend loads
2. Test wallet connection
3. Test pixel placement
4. Test real-time updates
5. Check console for errors

## Monitoring

1. Set up logging (Railway/Render provide this)
2. Monitor Redis memory usage
3. Check API response times
4. Monitor WebSocket connections

## SSL/HTTPS

- Vercel/Netlify provide automatic HTTPS
- Railway/Render provide automatic HTTPS
- For custom domains, ensure SSL is configured

## Troubleshooting

### Common Issues:
1. CORS errors - Check FRONTEND_URL in backend
2. Redis connection - Verify REDIS_URL
3. Environment variables - Ensure they're set in hosting platform
4. Build errors - Check TypeScript compilation

### Debug Steps:
1. Check hosting platform logs
2. Verify environment variables
3. Test endpoints with Postman
4. Check browser console for errors
