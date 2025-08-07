# 🚀 Rollio Deployment Guide

This guide will help you deploy Rollio so anyone can play without you running the app locally.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier)

## 🎯 Deployment Strategy

**Frontend**: Vercel (React app)  
**Backend**: Render (Node.js/Socket.io server)

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   - **Name**: `rollio-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables:**

   - `NODE_ENV` = `production`
   - `PORT` = `10000`

6. **Click "Create Web Service"**

7. **Wait for deployment** and copy the URL (e.g., `https://rollio-backend.onrender.com`)

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Configure Environment Variables

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Import your GitHub repository**
3. **Configure the project:**

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable:**

   - `REACT_APP_BACKEND_URL` = `https://your-backend-url.onrender.com` (from Step 1)

5. **Click "Deploy"**

### 2.2 Update Backend CORS

After getting your Vercel URL, update the backend CORS settings:

1. **Go back to Render dashboard**
2. **Find your backend service**
3. **Go to "Environment" tab**
4. **Add environment variable:**

   - `FRONTEND_URL` = `https://your-app-name.vercel.app`

5. **Redeploy the backend**

## 🔄 Step 3: Update CORS Configuration

Update `src/server/server.ts` with your actual URLs:

```typescript
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://your-app-name.vercel.app"]
        : ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
```

## 🎮 Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Try creating a multiplayer room**
3. **Test with multiple browser tabs**
4. **Verify WebSocket connections work**

## 🔧 Alternative: Single-Service Deployment

If you prefer to deploy everything to one service:

### Option A: Render (Full Stack)

- Deploy the entire app to Render
- Use the built frontend files
- Configure as a web service

### Option B: Railway

- Similar to Render but with better free tier
- Supports both frontend and backend

### Option C: Heroku

- More expensive but very reliable
- Good for production apps

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**

   - Check that frontend URL is in backend CORS config
   - Verify environment variables are set correctly

2. **WebSocket Connection Fails**

   - Ensure backend URL is correct in frontend
   - Check that Render service is running

3. **Build Failures**

   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation

4. **Environment Variables**
   - Make sure `NODE_ENV=production` is set
   - Verify `REACT_APP_BACKEND_URL` is correct

### Debug Commands:

```bash
# Test backend locally
npm run server

# Test frontend locally
npm run app

# Build for production
./scripts/build-for-production.sh
```

## 📊 Monitoring

- **Vercel**: Check deployment status and logs
- **Render**: Monitor service health and logs
- **Browser DevTools**: Check WebSocket connections

## 🔄 Updates

To update your deployed app:

1. **Make changes locally**
2. **Test locally**
3. **Push to GitHub**
4. **Vercel and Render will auto-deploy**

## 💰 Costs

**Free Tier Limits:**

- **Vercel**: 100GB bandwidth/month
- **Render**: 750 hours/month (sleeps after 15min inactivity)

**Upgrade when needed:**

- More concurrent users
- Higher bandwidth usage
- Always-on backend (Render)

## 🎉 Success!

Once deployed, anyone can:

1. Visit your Vercel URL
2. Create or join multiplayer rooms
3. Play the game without you running anything locally!

Your game is now live and accessible worldwide! 🌍
