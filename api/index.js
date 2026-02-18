// Vercel Serverless Function Handler
const express = require('express');
const cors = require('cors');

const app = express();

// CORS - allow all origins
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const rankingsRoutes = require('./routes/rankings');
const scheduleRoutes = require('./routes/schedule');
const tournamentsRoutes = require('./routes/tournaments');
const matchesRoutes = require('./routes/matches');

// Mount routes with /api prefix for standalone deployment
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/matches', matchesRoutes);

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
