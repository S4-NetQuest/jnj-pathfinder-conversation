// backend/routes/conversations.js (Enhanced with debugging)
import express from 'express'
import Joi from 'joi'
import dbConfig from '../config/database.js'
import { requireSalesRep, isAuthenticated, getCurrentUser } from '../middleware/auth.js'

const router = express.Router()

// Add logging middleware for this route
router.use((req, res, next) => {
  console.log(`=== CONVERSATIONS ROUTE ===`)
  console.log(`${req.method} ${req.originalUrl}`)
  console.log('Body:', req.body)
  console.log('Session:', req.session)
  console.log('User:', getCurrentUser(req))
  console.log('========================')
  next()
})

// Validation schemas
const createConversationSchema = Joi.object({
  surgeon_name: Joi.string().required().min(2).max(255),
  hospital_name: Joi.string().required().min(2).max(255),
  hospital_size: Joi.string().valid('small', 'medium', 'large', 'academic').required(),
  surgery_center_name: Joi.string().required().min(2).max(255),
  conversation_date: Joi.date().required(),
})

const responseSchema = Joi.object({
  questionId: Joi.string().required(),
  responseValue: Joi.any().required(),
  scores: Joi.object({
    mechanical: Joi.number().min(0).max(4).required(),
    adjusted: Joi.number().min(0).max(4).required(),
    restrictive: Joi.number().min(0).max(4).required(),
    kinematic: Joi.number().min(0).max(4).required(),
  }).required(),
})

// Test endpoint
router.get('/test', (req, res) => {
  console.log('=== CONVERSATION TEST ENDPOINT ===')
  const currentUser = getCurrentUser(req)
  res.json({
    message: 'Conversations route is working!',
    timestamp: new Date().toISOString(),
    user: currentUser,
    authenticated: !!currentUser,
    sessionId: req.sessionID
  })
})

// Get conversations (sales rep gets their conversations, surgeons get conversations with their name)
router.get('/', async (req, res) => {
  try {
    console.log('=== GET CONVERSATIONS ===')
    const currentUser = getCurrentUser(req)
    console.log('Current user:', currentUser)

    if (!currentUser) {
      console.log('No authenticated user found')
      return res.status(401).json({ error: 'Authentication required' })
    }

    const pool = dbConfig.getPool()
    let query, request

    if (currentUser.role === 'sales_rep') {
      // Sales rep sees conversations they created
      query = `
        SELECT c.*,
               h.name as hospital_name,
               h.size_category as hospital_size,
               sc.name as surgery_center_name,
               sc.size_category as surgery_center_size
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        WHERE c.sales_rep_id = @userId
        ORDER BY c.conversation_date DESC, c.created_at DESC
      `

      request = pool.request().input('userId', dbConfig.sql.Int, currentUser.id)
    } else if (currentUser.role === 'surgeon') {
      // Surgeon sees conversations where they are the surgeon or where surgeon_name matches their name
      query = `
        SELECT c.*,
               h.name as hospital_name,
               h.size_category as hospital_size,
               sc.name as surgery_center_name,
               sc.size_category as surgery_center_size
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        WHERE c.surgeon_name = @surgeonName OR c.sales_rep_id IS NULL
        ORDER BY c.conversation_date DESC, c.created_at DESC
      `

      request = pool.request().input('surgeonName', dbConfig.sql.VarChar, currentUser.name)
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    const result = await request.query(query)
    console.log(`Found ${result.recordset.length} conversations`)
    res.json({ success: true, conversations: result.recordset })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message })
  }
})

// Create new conversation (sales rep or surgeon)
router.post('/', async (req, res) => {
  try {
    console.log('=== CREATE CONVERSATION ===')
    console.log('Request body:', req.body)

    const currentUser = getCurrentUser(req)
    console.log('Current user:', currentUser)

    if (!currentUser) {
      console.log('No authenticated user found')
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Remove sales_rep_id from request body if present (it should come from auth context)
    const { sales_rep_id, ...requestBody } = req.body

    console.log('Validating request body:', requestBody)
    const { error, value } = createConversationSchema.validate(requestBody)
    if (error) {
      console.log('Validation error:', error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }

    const { surgeon_name, hospital_name, hospital_size, surgery_center_name, conversation_date } = value
    console.log('Validated data:', { surgeon_name, hospital_name, hospital_size, surgery_center_name, conversation_date })

    const pool = dbConfig.getPool()
    console.log('Got database pool')

    // Start transaction
    const transaction = pool.transaction()
    console.log('Starting transaction...')
    await transaction.begin()

    try {
      // Check if hospital exists, create if not
      console.log('Checking for hospital:', hospital_name)
      let hospitalId = null
      const hospitalQuery = 'SELECT id FROM hospitals WHERE name = @hospitalName'
      const hospitalResult = await transaction.request()
        .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
        .query(hospitalQuery)

      if (hospitalResult.recordset.length === 0) {
        console.log('Creating new hospital')
        const insertHospitalQuery = `
          INSERT INTO hospitals (name, size_category, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES (@hospitalName, @hospitalSize, GETDATE(), GETDATE())
        `

        const newHospitalResult = await transaction.request()
          .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .query(insertHospitalQuery)

        hospitalId = newHospitalResult.recordset[0].id
        console.log('Created hospital with ID:', hospitalId)
      } else {
        hospitalId = hospitalResult.recordset[0].id
        console.log('Found existing hospital with ID:', hospitalId)

        // Update hospital size if different
        await transaction.request()
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .query('UPDATE hospitals SET size_category = @hospitalSize, updated_at = GETDATE() WHERE id = @hospitalId')
      }

      // Check if surgery center exists, create if not
      console.log('Checking for surgery center:', surgery_center_name)
      let surgeryCenterId = null
      const surgeryCenterQuery = 'SELECT id FROM surgery_centers WHERE name = @surgeryCenterName'
      const surgeryCenterResult = await transaction.request()
        .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
        .query(surgeryCenterQuery)

      if (surgeryCenterResult.recordset.length === 0) {
        console.log('Creating new surgery center')
        const insertSurgeryCenterQuery = `
          INSERT INTO surgery_centers (name, size_category, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES (@surgeryCenterName, @surgeryCenterSize, GETDATE(), GETDATE())
        `

        const newSurgeryCenterResult = await transaction.request()
          .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
          .input('surgeryCenterSize', dbConfig.sql.VarChar, hospital_size) // Use same size as hospital
          .query(insertSurgeryCenterQuery)

        surgeryCenterId = newSurgeryCenterResult.recordset[0].id
        console.log('Created surgery center with ID:', surgeryCenterId)
      } else {
        surgeryCenterId = surgeryCenterResult.recordset[0].id
        console.log('Found existing surgery center with ID:', surgeryCenterId)

        // Update surgery center size if different
        await transaction.request()
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeryCenterSize', dbConfig.sql.VarChar, hospital_size)
          .query('UPDATE surgery_centers SET size_category = @surgeryCenterSize, updated_at = GETDATE() WHERE id = @surgeryCenterId')
      }

      // Create conversation with different logic for sales rep vs surgeon
      console.log('Creating conversation for user role:', currentUser.role)
      let insertQuery, insertValues

      if (currentUser.role === 'sales_rep') {
        // Sales rep creating conversation with surgeon
        console.log('Creating sales rep conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, hospital_name, hospital_size,
            surgery_center_id, surgery_center_name, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            @salesRepId, @surgeonName, @hospitalId, @hospitalName, @hospitalSize,
            @surgeryCenterId, @surgeryCenterName, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('salesRepId', dbConfig.sql.Int, currentUser.id)
          .input('surgeonName', dbConfig.sql.VarChar, surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else if (currentUser.role === 'surgeon') {
        // Surgeon creating conversation for themselves
        console.log('Creating surgeon conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, hospital_name, hospital_size,
            surgery_center_id, surgery_center_name, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            NULL, @surgeonName, @hospitalId, @hospitalName, @hospitalSize,
            @surgeryCenterId, @surgeryCenterName, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('surgeonName', dbConfig.sql.VarChar, currentUser.name || surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else {
        throw new Error('Invalid user role')
      }

      console.log('Conversation created:', insertValues.recordset[0])
      await transaction.commit()
      console.log('Transaction committed successfully')

      res.status(201).json({
        success: true,
        conversation: insertValues.recordset[0],
        message: 'Conversation created successfully'
      })
    } catch (error) {
      console.error('Transaction error:', error)
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({
      error: 'Failed to create conversation',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    })
  }
})

// Export the router
export default router