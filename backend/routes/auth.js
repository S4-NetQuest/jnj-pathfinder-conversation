import express from 'express'
import passport from 'passport'

const router = express.Router()

// Manual Sales Rep Login (for testing - remove in production)
router.post('/sales-rep', async (req, res) => {
  try {
    const { email, name } = req.body
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' })
    }

    const pool = dbConfig.getPool()
    
    // Check if user exists, create if not
    let userQuery = 'SELECT * FROM users WHERE email = @email AND role = @role'
    let result = await pool.request()
      .input('email', dbConfig.sql.VarChar, email)
      .input('role', dbConfig.sql.VarChar, 'sales_rep')
      .query(userQuery)

    let user
    if (result.recordset.length === 0) {
      // Create new test user
      const insertQuery = `
        INSERT INTO users (email, name, role, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@email, @name, 'sales_rep', GETDATE(), GETDATE())
      `
      
      result = await pool.request()
        .input('email', dbConfig.sql.VarChar, email)
        .input('name', dbConfig.sql.VarChar, name)
        .query(insertQuery)
      
      user = result.recordset[0]
    } else {
      user = result.recordset[0]
    }

    // Create session
    req.session.user = user
    req.session.authenticated = true

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Manual login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// SAML SSO Routes for Sales Reps (disabled for testing)
router.get('/saml', (req, res) => {
  res.status(501).json({ 
    error: 'SAML SSO not configured. Use manual login for testing.',
    message: 'Configure SAML in production environment'
  })
})

router.post('/saml/callback', (req, res) => {
  res.status(501).json({ 
    error: 'SAML SSO not configured',
    message: 'Configure SAML in production environment'
  })
})

// Check authentication status
router.get('/status', (req, res) => {
  // Check session-based auth first (for manual and surgeon logins)
  if (req.session?.authenticated && req.session?.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email,
        role: req.session.user.role,
      }
    })
  } 
  // Check passport auth (for future SAML implementation)
  else if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      }
    })
  } else {
    res.json({
      authenticated: false,
      user: null
    })
  }
})

// Surgeon access (no authentication required)
router.post('/surgeon', (req, res) => {
  // Create a temporary session for surgeon
  req.session.user = {
    role: 'surgeon',
    name: 'Surgeon User',
    authenticated: false
  }
  
  res.json({
    success: true,
    user: req.session.user
  })
})

// Logout
router.post('/logout', (req, res) => {
  // Handle session-based logout
  if (req.session?.user) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' })
      }
      
      res.clearCookie('connect.sid')
      res.json({ success: true, message: 'Logged out successfully' })
    })
  }
  // Handle passport-based logout (for future SAML)  
  else if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' })
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Session destruction failed' })
        }
        
        res.clearCookie('connect.sid')
        res.json({ success: true, message: 'Logged out successfully' })
      })
    })
  } else {
    res.json({ success: true, message: 'Already logged out' })
  }
})

// SAML metadata endpoint (for IdP configuration)
router.get('/saml/metadata', (req, res) => {
  const strategy = passport._strategy('saml')
  if (strategy) {
    res.type('application/xml')
    res.send(strategy.generateServiceProviderMetadata())
  } else {
    res.status(500).json({ error: 'SAML strategy not configured' })
  }
})

export default router