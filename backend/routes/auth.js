// backend/routes/auth.js
const express = require('express')
const bcrypt = require('bcryptjs')
const Joi = require('joi')
const dbConfig = require('../config/database')
const { getCurrentUser } = require('../middleware/auth')

const router = express.Router()

// Import passport only if SAML is enabled
let passport = null
if (process.env.ENABLE_SAML === 'true') {
  try {
    passport = require('passport')
  } catch (error) {
    console.warn('Passport not available for SAML routes')
  }
}

// Validation schemas
const devLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('sales_rep', 'surgeon').required(),
  password: Joi.string().required(),
})

// Development login endpoint
router.post('/dev-login', async (req, res) => {
  console.log('=== DEV LOGIN REQUEST ===')
  console.log('Request body (password hidden):', {
    ...req.body,
    password: req.body.password ? '[HIDDEN]' : undefined
  })
  console.log('Session before:', req.session)

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Development login not available in production' })
  }

  try {
    const { error, value } = devLoginSchema.validate(req.body)
    if (error) {
      console.log('Validation error:', error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, password, role } = value
    const pool = dbConfig.getPool()

    // Check if user exists and get password
    const userQuery = 'SELECT * FROM users WHERE email = @email AND role = @role'

    console.log('Executing user query with:', { email, role })

    const result = await pool.request()
      .input('email', dbConfig.sql.VarChar, email)
      .input('role', dbConfig.sql.VarChar, role)
      .query(userQuery)

    console.log('User query result count:', result.recordset.length)

    if (result.recordset.length === 0) {
      console.log('User not found')
      return res.status(401).json({
        error: 'Invalid email, password, or role. Please check your credentials.'
      })
    }

    const user = result.recordset[0]
    console.log('Found user:', { ...user, password: '[HIDDEN]' })

    // Validate password (plain text comparison for development)
    if (user.password !== password) {
      console.log('Password validation failed')
      return res.status(401).json({
        error: 'Invalid email, password, or role. Please check your credentials.'
      })
    }

    console.log('Password validation successful')

    // Create session
    req.session.authenticated = true
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    }

    console.log('Session after login:', req.session)

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err)
        return res.status(500).json({ error: 'Failed to save session' })
      }

      console.log('Session saved successfully')
      res.json({
        success: true,
        user: req.session.user,
        message: 'Development login successful'
      })
    })

  } catch (error) {
    console.error('Dev login error:', error)
    res.status(500).json({ error: 'Login failed. Please try again.', details: error.message })
  }
})

// SAML login initiation (only if SAML is enabled)
if (passport) {
  router.get('/saml', passport.authenticate('saml'))

  // SAML callback
  router.post('/saml/callback',
    passport.authenticate('saml', { failureRedirect: '/login?error=saml_failed' }),
    (req, res) => {
      console.log('SAML authentication successful for user:', req.user)
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001')
    }
  )
}

// SAML login initiation (only if SAML is enabled)
if (passport) {
  router.get('/saml', passport.authenticate('saml'))

  // SAML callback
  router.post('/saml/callback',
    passport.authenticate('saml', { failureRedirect: '/login?error=saml_failed' }),
    (req, res) => {
      console.log('SAML authentication successful for user:', req.user)
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001')
    }
  )
}

// Get current user
router.get('/me', (req, res) => {
  console.log('=== GET CURRENT USER ===')
  console.log('Session:', req.session)
  console.log('Passport user:', req.user)

  const user = getCurrentUser(req)
  console.log('Current user:', user)

  if (user) {
    res.json({ success: true, user })
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  console.log('=== LOGOUT REQUEST ===')
  console.log('Session before logout:', req.session)

  // Passport logout (if available)
  if (typeof req.logout === 'function') {
    req.logout((err) => {
      if (err) {
        console.error('Passport logout error:', err)
      }
    })
  }

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err)
      return res.status(500).json({ error: 'Failed to logout' })
    }

    console.log('Session destroyed successfully')
    res.clearCookie('connect.sid') // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' })
  })
})

// Debug endpoint to check authentication state
router.get('/debug', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoint not available in production' })
  }

  res.json({
    session: req.session,
    sessionID: req.sessionID,
    passportUser: req.user,
    cookies: req.cookies,
    headers: req.headers,
    isAuthenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
    currentUser: getCurrentUser(req)
  })
})

module.exports = router