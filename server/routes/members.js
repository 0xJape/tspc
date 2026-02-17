const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// GET /api/members - Get all members
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

// GET /api/members/:id - Get member by ID
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

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const { full_name, email, age, skill_level, profile_photo } = req.body

    const { data, error } = await supabase
      .from('members')
      .insert([{ full_name, email, age, skill_level, profile_photo }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /api/members/:id - Update member
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

// DELETE /api/members/:id - Delete member
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
