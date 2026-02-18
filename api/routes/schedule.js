const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// GET /api/schedule - Get all scheduled events
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

// GET /api/schedule/upcoming - Get upcoming events
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

// POST /api/schedule - Create schedule event
router.post('/', async (req, res) => {
  try {
    const { title, type, date, time, location, description, status } = req.body

    const { data, error } = await supabase
      .from('schedule')
      .insert([{ title, type, date, time, location, description, status: status || 'Upcoming' }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /api/schedule/:id - Update schedule event
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedule')
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

// DELETE /api/schedule/:id - Delete schedule event
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
