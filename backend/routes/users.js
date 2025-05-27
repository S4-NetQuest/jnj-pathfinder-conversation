import express from 'express'
import dbConfig from '../config/database.js'

const router = express.Router()

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  // Check session-based auth first
  if (req.session?.authenticated && req.session?.user) {
    req.user = req.session.user // Set req.user for compatibility
    return next()
  }
  // Check passport auth (for future SAML)
  else if (req.isAuthenticated()) {
    return next()
  }
  
  return res.status(401).json({ error: 'Authentication required' })
}

// Middleware to check if user is sales rep
const requireSalesRep = (req, res, next) => {
  // Check session-based auth first
  if (req.session?.authenticated && req.session?.user?.role === 'sales_rep') {
    req.user = req.session.user // Set req.user for compatibility
    return next()
  }
  // Check passport auth (for future SAML)
  else if (req.isAuthenticated() && req.user.role === 'sales_rep') {
    return next()
  }
  
  return res.status(403).json({ error: 'Sales representative access required' })
}

// Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    const query = `
      SELECT id, email, name, first_name, last_name, role, department, company, created_at, updated_at
      FROM users 
      WHERE id = @userId
    `
    
    const result = await pool.request()
      .input('userId', dbConfig.sql.Int, req.user.id)
      .query(query)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.recordset[0])
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, firstName, lastName, department, company } = req.body
    
    const pool = dbConfig.getPool()
    const query = `
      UPDATE users 
      SET name = @name,
          first_name = @firstName,
          last_name = @lastName,
          department = @department,
          company = @company,
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @userId
    `
    
    const result = await pool.request()
      .input('userId', dbConfig.sql.Int, req.user.id)
      .input('name', dbConfig.sql.VarChar, name)
      .input('firstName', dbConfig.sql.VarChar, firstName)
      .input('lastName', dbConfig.sql.VarChar, lastName)
      .input('department', dbConfig.sql.VarChar, department)
      .input('company', dbConfig.sql.VarChar, company)
      .query(query)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.recordset[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Failed to update user profile' })
  }
})

// Get user statistics (sales rep only)
router.get('/stats', requireSalesRep, async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    const query = `
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_conversations,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_conversations,
        COUNT(CASE WHEN recommended_approach = 'mechanical' THEN 1 END) as mechanical_recommendations,
        COUNT(CASE WHEN recommended_approach = 'adjusted' THEN 1 END) as adjusted_recommendations,
        COUNT(CASE WHEN recommended_approach = 'restrictive' THEN 1 END) as restrictive_recommendations,
        COUNT(CASE WHEN recommended_approach = 'kinematic' THEN 1 END) as kinematic_recommendations,
        MIN(conversation_date) as first_conversation_date,
        MAX(conversation_date) as last_conversation_date
      FROM conversations 
      WHERE sales_rep_id = @userId
    `
    
    const result = await pool.request()
      .input('userId', dbConfig.sql.Int, req.user.id)
      .query(query)
    
    res.json(result.recordset[0])
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    res.status(500).json({ error: 'Failed to fetch user statistics' })
  }
})

// Get hospitals list (for dropdowns)
router.get('/hospitals', async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    const query = `
      SELECT id, name, size_category, city, state
      FROM hospitals 
      ORDER BY name ASC
    `
    
    const result = await pool.request().query(query)
    res.json(result.recordset)
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    res.status(500).json({ error: 'Failed to fetch hospitals' })
  }
})

export default router