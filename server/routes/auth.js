const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const supabase = require('../config/supabase')

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, age, gender, skill_level } = req.body

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' })
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create new member
    const { data, error } = await supabase
      .from('members')
      .insert([{
        full_name,
        email,
        password_hash,
        age: age || null,
        gender: gender || null,
        skill_level: skill_level || 'Beginner',
        is_admin: false
      }])
      .select('id, full_name, email, age, gender, skill_level, is_admin, date_joined')
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      user: data,
      message: 'Registration successful'
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('members')
      .select('id, full_name, email, password_hash, age, gender, skill_level, is_admin, date_joined')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/auth/change-password - Change user password
router.put('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Email, current password, and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from('members')
      .select('id, password_hash')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(newPassword, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('members')
      .update({ password_hash: new_password_hash })
      .eq('id', user.id)

    if (updateError) throw updateError

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/auth/verify - Verify user session (optional)
router.get('/verify', async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const { data: user, error } = await supabase
      .from('members')
      .select('id, full_name, email, age, gender, skill_level, is_admin, date_joined')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
