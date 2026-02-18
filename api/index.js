// Vercel Serverless Function Handler
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Import routes (they will use server/config/supabase.js)
const authRoutes = require('../server/routes/auth');
const membersRoutes = require('../server/routes/members');
const rankingsRoutes = require('../server/routes/rankings');
const scheduleRoutes = require('../server/routes/schedule');
const tournamentsRoutes = require('../server/routes/tournaments');
const matchesRoutes = require('../server/routes/matches');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/matches', matchesRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({
    message: '🏓 Tupi Smash Club API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    supabase: {
      url: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      key: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for Vercel
module.exports = app;
