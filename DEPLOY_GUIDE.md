# Deployment Guide - Separate Vercel Projects

This guide walks you through deploying the frontend and backend as **two separate Vercel projects**.

## Overview

- **Backend API**: Deployed from `api/` folder → Gets URL like `tspc-api.vercel.app`
- **Frontend**: Deployed from `client/` folder → Gets URL like `tspc.vercel.app`

---

## Step 1: Deploy Backend (API)

### 1.1 Create New Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`0xJape/tspc`)
3. **IMPORTANT**: Set **Root Directory** to `api`
4. Click "Continue"

### 1.2 Configure Backend Project

**Framework Preset**: Other (leave as is)

**Build Settings**:
- Build Command: (leave empty)
- Output Directory: (leave empty)  
- Install Command: `npm install`

### 1.3 Add Environment Variables

Click "Environment Variables" and add:

```
SUPABASE_URL=https://zstqercpkvvwooqwgyeg.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdHFlcmNwa3Z2d29vcXdneWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNjE2NjcsImV4cCI6MjA1NDkzNzY2N30.v8tPcFRCOwp8m30m66xnr8aDUYp9SBmgwLfjSUPU_XM
NODE_ENV=production
```

### 1.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (1-2 minutes)
3. **Copy the deployment URL** (e.g., `https://tspc-api.vercel.app`)

### 1.5 Test Backend

Visit: `https://YOUR-BACKEND-URL.vercel.app/`

You should see:
```json
{
  "message": "🏓 Tupi Smash Pickleball Club API",
  "status": "online",
  "version": "1.0.0"
}
```

Test an endpoint: `https://YOUR-BACKEND-URL.vercel.app/api/tournaments`

---

## Step 2: Deploy Frontend

### 2.1 Update Frontend Environment

1. Edit `client/.env.production`
2. Replace `YOUR-BACKEND-URL` with your actual backend URL:
   ```
   VITE_API_URL=https://tspc-api.vercel.app/api
   ```
3. Commit and push this change:
   ```bash
   git add client/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### 2.2 Create New Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the SAME GitHub repository (`0xJape/tspc`)
3. **IMPORTANT**: Set **Root Directory** to `client`
4. Click "Continue"

### 2.3 Configure Frontend Project

**Framework Preset**: Vite

**Build Settings** (auto-detected):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.4 Add Environment Variables

Click "Environment Variables" and add:

```
VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api
```

(Replace with your actual backend URL from Step 1)

### 2.5 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Visit your frontend URL (e.g., `https://tspc.vercel.app`)

---

## Step 3: Configure CORS (if needed)

If you see CORS errors in the browser console:

1. Go to your **backend** Vercel project settings
2. The backend is already configured to allow all origins with `cors()`
3. If issues persist, update `api/index.js` line 8:
   ```javascript
   app.use(cors({
     origin: ['https://YOUR-FRONTEND-URL.vercel.app'],
     credentials: true
   }));
   ```
4. Commit and push to redeploy backend

---

## Verification Checklist

### Backend ✓
- [ ] Health check at `/` returns JSON
- [ ] `/api/tournaments` returns tournament data
- [ ] `/api/members` returns member data
- [ ] No 404 errors in Vercel logs

### Frontend ✓
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Tournaments page shows data
- [ ] Members page shows data
- [ ] Rankings page shows data
- [ ] No CORS errors in browser console

---

## Troubleshooting

### Backend Issues

**Problem**: 404 on all routes  
**Solution**: Verify Root Directory is set to `api` in Vercel project settings

**Problem**: 500 errors  
**Solution**: Check Vercel function logs, verify environment variables are set

**Problem**: Supabase connection fails  
**Solution**: Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in environment variables

### Frontend Issues

**Problem**: Can't fetch data from API  
**Solution**: 
1. Check browser console for errors
2. Verify `VITE_API_URL` environment variable is set correctly
3. Verify backend URL is accessible

**Problem**: Build fails  
**Solution**: Check that `client/dist` folder is in `.gitignore` (it should be)

**Problem**: Blank page after deployment  
**Solution**: Check browser console for errors, verify routes in vite.config.js

---

## Local Development

After this setup, local development continues to work normally:

```bash
# Terminal 1 - Backend
cd api
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - Frontend  
cd client
npm run dev
# Runs on http://localhost:5173
```

The frontend will use `VITE_API_URL` from `.env.development` (localhost:3001) in development.

---

## Production URLs

After deployment, you'll have:

- **Backend API**: `https://tspc-api.vercel.app`
- **Frontend**: `https://tspc.vercel.app`

Update these in your documentation and share with users!
