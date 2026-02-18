// Vercel Serverless Function Handler
const express = require('express');
const cors = require('cors');

const app = express();

// CORS - allow all origins
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('../server/routes/auth');
const membersRoutes = require('../server/routes/members');
const rankingsRoutes = require('../server/routes/rankings');
const scheduleRoutes = require('../server/routes/schedule');
const tournamentsRoutes = require('../server/routes/tournaments');
const matchesRoutes = require('../server/routes/matches');

// Mount routes (Vercel routes /api/* to this handler, so we don't need /api prefix)
app.use('/auth', authRoutes);
app.use('/members', membersRoutes);
app.use('/rankings', rankingsRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/tournaments', tournamentsRoutes);
app.use('/matches', matchesRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({
    message: '🏓 Tupi Smash Pickleball Club API',
    status: 'online',
    version: '1.0.0',
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      supabaseUrl: process.env.SUPABASE_URL ? '✓ configured' : '✗ missing',
      supabaseKey: process.env.SUPABASE_SERVICE_KEY ? '✓ configured' : '✗ missing'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Export for Vercel
module.exports = app;
