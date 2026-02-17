# 🏓 Pickleball Club - Full Stack Project Structure

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Frontend) + Vercel Serverless (Backend)
- **Design**: Baseline.live inspired

---

## 📁 Project Structure

```
pickleball-club/
├── client/                      # React Frontend
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── RankingTable.jsx
│   │   │   ├── ScheduleCard.jsx
│   │   │   ├── TournamentCard.jsx
│   │   │   └── PlayerProfile.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── Rankings.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Tournaments.jsx
│   │   │   └── MemberProfile.jsx
│   │   ├── services/
│   │   │   └── api.js          # API calls to backend
│   │   ├── utils/
│   │   │   └── supabase.js     # Supabase client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Node.js Backend (API)
│   ├── routes/
│   │   ├── members.js
│   │   ├── rankings.js
│   │   ├── schedule.js
│   │   └── tournaments.js
│   ├── controllers/
│   │   ├── memberController.js
│   │   ├── rankingController.js
│   │   ├── scheduleController.js
│   │   └── tournamentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── config/
│   │   └── supabase.js
│   ├── index.js                # Main Express server
│   └── package.json
│
├── database/
│   └── schema.sql              # Supabase database schema
│
└── README.md
```

---

## 🚀 Setup Steps

### 1. Create Project
```bash
# Create main folder
mkdir pickleball-club
cd pickleball-club

# Create frontend
npm create vite@latest client -- --template react
cd client
npm install

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install dependencies
npm install react-router-dom axios lucide-react
cd ..

# Create backend
mkdir server
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js
npm install -D nodemon
```

### 2. Configure Supabase
- Go to [supabase.com](https://supabase.com)
- Create new project
- Get your API URL and anon key
- Create database tables (see schema.sql)

### 3. Configure Vercel
- Install Vercel CLI: `npm install -g vercel`
- Deploy frontend: `cd client && vercel`
- Deploy backend: `cd server && vercel`
- Set environment variables in Vercel dashboard

---

## 🎨 Baseline Design System

### Colors
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        baseline: {
          green: '#10b981',      // Primary green
          darkGreen: '#059669',  // Hover state
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            500: '#6b7280',
            900: '#111827'
          }
        }
      }
    }
  }
}
```

### Design Principles
- ✅ Clean white backgrounds
- ✅ Rounded corners (rounded-lg, rounded-xl)
- ✅ Subtle shadows (shadow-sm, hover:shadow-md)
- ✅ Card-based layouts
- ✅ Player avatars (circular)
- ✅ Status badges
- ✅ Minimal, professional
- ✅ Mobile-first responsive

---

## 📦 Key Features to Implement

### Phase 1: Basic Setup
- [x] Project structure
- [ ] Supabase setup
- [ ] Basic frontend layout
- [ ] Backend API setup

### Phase 2: Core Features
- [ ] Members CRUD
- [ ] Rankings system
- [ ] Schedule management
- [ ] Tournament creation

### Phase 3: Advanced
- [ ] User authentication
- [ ] Real-time updates
- [ ] Admin dashboard
- [ ] Match scoring

---

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_backend_url
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=3001
```
