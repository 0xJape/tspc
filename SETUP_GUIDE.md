# 🚀 Quick Start Guide - React + Node.js + Supabase + Vercel

Complete step-by-step guide to get your pickleball club website running.

---

## ⚡ Quick Setup (5 minutes)

### 1. Initialize Project
```bash
# Create main folder
mkdir pickleball-club
cd pickleball-club

# Create React frontend with Vite
npm create vite@latest client -- --template react
cd client
npm install

# Install frontend dependencies
npm install react-router-dom axios lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

cd ..

# Create Node.js backend
mkdir server
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js
npm install -D nodemon

cd ..
```

---

## 🎨 Frontend Setup (React + Vite + Tailwind)

### Step 1: Configure Tailwind CSS

**`client/tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        baseline: {
          green: '#10b981',
          'green-dark': '#059669',
          'green-light': '#d1fae5',
        }
      }
    },
  },
  plugins: [],
}
```

**`client/src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 2: Create Supabase Client

**`client/src/utils/supabase.js`**
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3: Create API Service

**`client/src/services/api.js`**
```js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Members API
export const membersAPI = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
}

// Rankings API
export const rankingsAPI = {
  getAll: () => api.get('/rankings'),
  getBySkillLevel: (level) => api.get(`/rankings?skillLevel=${level}`),
}

// Schedule API
export const scheduleAPI = {
  getAll: () => api.get('/schedule'),
  getUpcoming: () => api.get('/schedule/upcoming'),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`),
}

// Tournaments API
export const tournamentsAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  getUpcoming: () => api.get('/tournaments/upcoming'),
  create: (data) => api.post('/tournaments', data),
  register: (tournamentId, memberId) => api.post(`/tournaments/${tournamentId}/register`, { memberId }),
}

export default api
```

### Step 4: Setup React Router

**`client/src/App.jsx`**
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Members from './pages/Members'
import Rankings from './pages/Rankings'
import Schedule from './pages/Schedule'
import Tournaments from './pages/Tournaments'
import MemberProfile from './pages/MemberProfile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberProfile />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/tournaments" element={<Tournaments />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

### Step 5: Environment Variables

**`client/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

---

## 🖥️ Backend Setup (Node.js + Express + Supabase)

### Step 1: Main Server File

**`server/index.js`**
```js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/members', require('./routes/members'))
app.use('/api/rankings', require('./routes/rankings'))
app.use('/api/schedule', require('./routes/schedule'))
app.use('/api/tournaments', require('./routes/tournaments'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Pickleball Club API is running!' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
```

### Step 2: Supabase Config

**`server/config/supabase.js`**
```js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
```

### Step 3: Members Route

**`server/routes/members.js`**
```js
const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Get all members
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('ranking_position', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: 'Member not found' })
  }
})

// Create new member
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update member
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Member deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
```

### Step 4: Rankings Route

**`server/routes/rankings.js`**
```js
const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Get all rankings
router.get('/', async (req, res) => {
  try {
    const { skillLevel } = req.query

    let query = supabase
      .from('members')
      .select('*')
      .order('points', { ascending: false })

    if (skillLevel) {
      query = query.eq('skill_level', skillLevel)
    }

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

### Step 5: Schedule Route

**`server/routes/schedule.js`**
```js
const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Get all schedule
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .gte('date', today)
      .eq('status', 'Upcoming')
      .order('date', { ascending: true })
      .limit(5)

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create schedule
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedule')
      .insert([req.body])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
```

### Step 6: Tournaments Route

**`server/routes/tournaments.js`**
```js
const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get upcoming tournaments
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .gte('date', today)
      .in('status', ['Upcoming', 'Ongoing'])
      .order('date', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Register for tournament
router.post('/:id/register', async (req, res) => {
  try {
    const { memberId } = req.body
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([{
        tournament_id: req.params.id,
        member_id: memberId
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
```

### Step 7: Package.json Scripts

**`server/package.json`**
```json
{
  "name": "pickleball-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Step 8: Environment Variables

**`server/.env`**
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: "pickleball-club"
4. Database password: (save this!)
5. Region: Choose closest to you

### 2. Run Database Schema
1. Go to SQL Editor
2. Copy content from `SUPABASE_SCHEMA.sql`
3. Click "Run"
4. Verify tables are created

### 3. Get API Keys
1. Go to Settings > API
2. Copy Project URL
3. Copy `anon` key (for frontend)
4. Copy `service_role` key (for backend)

---

## 🚀 Vercel Deployment

### Frontend Deployment

**`client/vercel.json`**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Deploy:**
```bash
cd client
npm run build
vercel --prod
```

**Set Environment Variables in Vercel:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

### Backend Deployment

**`server/vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

**Deploy:**
```bash
cd server
vercel --prod
```

**Set Environment Variables in Vercel:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

---

## ✅ Testing Locally

### Start Backend
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### Start Frontend
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Test API Endpoints
```bash
# Get members
curl http://localhost:3001/api/members

# Get rankings
curl http://localhost:3001/api/rankings

# Get schedule
curl http://localhost:3001/api/schedule

# Get tournaments
curl http://localhost:3001/api/tournaments
```

---

## 📦 Next Steps

1. ✅ Follow this guide to set up project
2. ✅ Create Supabase database
3. ✅ Build React components (see BASELINE_DESIGN_GUIDE.md)
4. ✅ Test locally
5. ✅ Deploy to Vercel
6. 🎨 Customize design
7. 🔐 Add authentication (optional)
8. 📱 Make it responsive
9. ✨ Add real-time features

---

## 🆘 Troubleshooting

**CORS Error:**
```js
// Add to server/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.vercel.app']
}))
```

**Supabase Connection Error:**
- Check environment variables
- Verify API keys are correct
- Check RLS policies in Supabase

**Build Error:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

🎉 **You're ready to build!** Start with the frontend components and connect them to your API.
