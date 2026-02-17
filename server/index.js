const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production (same domain on Vercel)
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL
      ].filter(Boolean),
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/members', require('./routes/members'))
app.use('/api/rankings', require('./routes/rankings'))
app.use('/api/schedule', require('./routes/schedule'))
app.use('/api/tournaments', require('./routes/tournaments'))
app.use('/api/matches', require('./routes/matches'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🏓 Tupi Smash Club API is running!' })
})

app.get('/api', (req, res) => {
  res.json({ message: '🏓 Tupi Smash Club API is running!' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

module.exports = app
