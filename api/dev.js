// Local development server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiApp = require('./index');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS for local development
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174'
  ],
  credentials: true
}));

// Mount the API app (already has /api prefix in index.js)
app.use('/', apiApp);

// Root health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🏓 TSPC API Development Server',
    api: 'http://localhost:' + PORT + '/api',
    environment: 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
