# TSPC - Tupi Smash Pickleball Club

## Vercel Deployment Guide

### Prerequisites
✅ GitHub repository: https://github.com/0xJape/tspc.git  
✅ Supabase project: zstqercpkvvwooqwgyeg  
✅ Vercel account

---

## Step-by-Step Deployment

### 1. Delete Old Project (if exists)
- Go to https://vercel.com/dashboard
- Find any existing TSPC project
- Settings → Delete Project

### 2. Create New Deployment
- Go to https://vercel.com/new
- Import `0xJape/tspc` from GitHub
- Click "Import"

### 3. Configure Project Settings

**Framework Preset:** Other (not Vite!)

**Root Directory:** `.` or leave empty ⬅️ **IMPORTANT - DO NOT set to "client"**

**Build Command:** (leave as auto-detected, will use vercel.json)

**Output Directory:** (leave as auto-detected, will use vercel.json)

**Install Command:** (leave as auto-detected, will use vercel.json)

### 4. Add Environment Variables

Click "Environment Variables" and add these **3 variables**:

```
Name: SUPABASE_URL
Value: https://zstqercpkvvwooqwgyeg.supabase.co
Apply to: Production, Preview, Development (all)
```

```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdHFlcmNwa3Z2d29vcXdneWVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2ODIyMCwiZXhwIjoyMDg2ODQ0MjIwfQ.pjumdPgO5mFIcxooN1pi6vtOKkNSIlj5JfrlRSlPjiY
Apply to: Production, Preview, Development (all)
```

```
Name: NODE_ENV
Value: production
Apply to: Production (only)
```

### 5. Deploy
Click **"Deploy"** button and wait 2-3 minutes

---

## Verification

After deployment completes:

1. **Test API Health:**
   - Visit: `https://your-project.vercel.app/api`
   - Should see: `"supabaseUrl": "✓ configured"` and `"supabaseKey": "✓ configured"`

2. **Test Frontend:**
   - Visit: `https://your-project.vercel.app`
   - Should see all tournament data loading

---

## Supabase Configuration

⚠️ **IMPORTANT:** Make sure Row Level Security (RLS) is disabled on your tables.

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants DISABLE ROW LEVEL SECURITY;
```

---

## Troubleshooting

### No data showing up?
1. Check `/api` endpoint shows environment variables are configured
2. Verify RLS is disabled in Supabase
3. Check browser console (F12) for errors
4. Verify environment variables in Vercel Settings → Environment Variables

### Build failing?
1. Make sure **Root Directory is NOT set** (should be empty or `.`)
2. Framework should be "Other" not "Vite"
3. Redeploy after changing settings

### API not working?
1. Check Vercel Functions logs in deployment details
2. Verify Supabase credentials are correct
3. Make sure `api/` folder exists in repository

---

## Local Development

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

Frontend will use `http://localhost:3001/api` in development (from `.env.development`)

---

## Project Structure

```
tspc/
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API handler
│   └── package.json       # API dependencies
├── client/                # React frontend (Vite)
│   ├── src/
│   ├── .env              # Production env (no API URL)
│   ├── .env.development  # Local dev (localhost API)
│   └── package.json
├── server/                # Backend code
│   ├── routes/           # API routes
│   ├── config/           # Supabase config
│   └── index.js          # Local server
└── vercel.json           # Vercel configuration
```

---

## Quick Reference

**Production Site:**  https://your-project.vercel.app  
**API Endpoint:**     https://your-project.vercel.app/api  
**Supabase:**         https://zstqercpkvvwooqwgyeg.supabase.co  
**GitHub:**           https://github.com/0xJape/tspc

---

✅ Everything is now configured for successful deployment!
