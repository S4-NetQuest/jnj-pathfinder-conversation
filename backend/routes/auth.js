import express from 'express'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import dbConfig from '../config/database.js'

const router = express.Router()

// Local development authentication (bypasses SAML)
router.post('/dev-login', async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  const { email, role } = req.body

  // Create a fake user for testing
  const fakeUser = {
    id: 1,
    email: email || 'test@jj.com',
    name: 'Test Sales Rep',
    role: role || 'sales_rep'
  }

  // Set session
  req.session.authenticated = true
  req.session.user = fakeUser

  res.json({
    success: true,
    user: fakeUser,
    message: 'Development login successful'
  })
})

// Get current user
router.get('/me', (req, res) => {
  // Check session-based auth first
  if (req.session?.authenticated && req.session?.user) {
    return res.json({ user: req.session.user })
  }

  // Check passport auth (if available)
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user) {
    return res.json({ user: req.user })
  }

  res.status(401).json({ error: 'Not authenticated' })
})

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err)
      return res.status(500).json({ error: 'Failed to logout' })
    }

    res.clearCookie('connect.sid') // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' })
  })
})

// SAML routes (only if passport is available)
if (process.env.ENABLE_SAML === 'true') {
  // These will be added when SAML is properly configured
  router.get('/saml', (req, res) => {
    res.redirect('/api/auth/saml/login')
  })
}

export default router