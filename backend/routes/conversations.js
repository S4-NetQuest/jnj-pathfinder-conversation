// backend/routes/conversations.js (Fixed to eliminate duplication)
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
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
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
               sc.size_category as surgery_center_size,
               u.name as sales_rep_name,
               u.email as sales_rep_email
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        LEFT JOIN users u ON c.sales_rep_id = u.id
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
               sc.size_category as surgery_center_size,
               u.name as sales_rep_name,
               u.email as sales_rep_email
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        LEFT JOIN users u ON c.sales_rep_id = u.id
        WHERE c.surgeon_name = @surgeonName OR c.sales_rep_id IS NULL
        ORDER BY c.conversation_date DESC, c.created_at DESC
      `

      request = pool.request().input('surgeonName', dbConfig.sql.VarChar, currentUser.name)
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      })
    }

    const result = await request.query(query)
    console.log(`Found ${result.recordset.length} conversations`)

    // Process the results to ensure proper data formatting
    const conversations = result.recordset.map(conv => ({
      id: conv.id,
      surgeon_name: conv.surgeon_name || '',
      sales_rep_id: conv.sales_rep_id,
      hospital_id: conv.hospital_id,
      surgery_center_id: conv.surgery_center_id,
      // Use the joined data from hospitals/surgery_centers tables, not the duplicate fields
      hospital_name: conv.hospital_name || '',
      hospital_size: conv.hospital_size || conv.size_category || 'unknown',
      surgery_center_name: conv.surgery_center_name || '',
      surgery_center_size: conv.surgery_center_size || 'unknown',
      // Other conversation fields
      conversation_date: conv.conversation_date ? new Date(conv.conversation_date).toISOString() : null,
      created_at: conv.created_at ? new Date(conv.created_at).toISOString() : null,
      updated_at: conv.updated_at ? new Date(conv.updated_at).toISOString() : null,
      status: conv.status || 'in_progress',
      notes: conv.notes || '',
      recommended_approach: conv.recommended_approach || '',
      alignment_score_mechanical: conv.alignment_score_mechanical || 0,
      alignment_score_adjusted: conv.alignment_score_adjusted || 0,
      alignment_score_restrictive: conv.alignment_score_restrictive || 0,
      alignment_score_kinematic: conv.alignment_score_kinematic || 0,
      sales_rep_name: conv.sales_rep_name || '',
      sales_rep_email: conv.sales_rep_email || '',
    }))

    res.json({
      success: true,
      conversations: conversations,
      count: conversations.length
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Get specific conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID'
      })
    }

    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const pool = dbConfig.getPool()

    // Build query based on user role
    let query, request

    if (currentUser.role === 'sales_rep') {
      query = `
        SELECT c.*,
               h.name as hospital_name,
               h.size_category as hospital_size,
               sc.name as surgery_center_name,
               sc.size_category as surgery_center_size
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        WHERE c.id = @conversationId AND c.sales_rep_id = @userId
      `
      request = pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('userId', dbConfig.sql.Int, currentUser.id)
    } else if (currentUser.role === 'surgeon') {
      query = `
        SELECT c.*,
               h.name as hospital_name,
               h.size_category as hospital_size,
               sc.name as surgery_center_name,
               sc.size_category as surgery_center_size
        FROM conversations c
        LEFT JOIN hospitals h ON c.hospital_id = h.id
        LEFT JOIN surgery_centers sc ON c.surgery_center_id = sc.id
        WHERE c.id = @conversationId AND (c.surgeon_name = @surgeonName OR c.sales_rep_id IS NULL)
      `
      request = pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('surgeonName', dbConfig.sql.VarChar, currentUser.name)
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      })
    }

    const result = await request.query(query)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      })
    }

    const conversation = result.recordset[0]

    // Get conversation responses
    const responsesQuery = `
      SELECT question_id, response_value, scores_mechanical, scores_adjusted,
             scores_restrictive, scores_kinematic, created_at
      FROM conversation_responses
      WHERE conversation_id = @conversationId
      ORDER BY created_at ASC
    `

    const responsesResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query(responsesQuery)

    res.json({
      success: true,
      conversation: {
        ...conversation,
        // Use joined data, not duplicate fields
        hospital_name: conversation.hospital_name,
        hospital_size: conversation.hospital_size,
        surgery_center_name: conversation.surgery_center_name,
        surgery_center_size: conversation.surgery_center_size,
        responses: responsesResult.recordset
      }
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
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
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Remove sales_rep_id from request body if present (it should come from auth context)
    const { sales_rep_id, ...requestBody } = req.body

    console.log('Validating request body:', requestBody)
    const { error, value } = createConversationSchema.validate(requestBody)
    if (error) {
      console.log('Validation error:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      })
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

      // Create conversation - ONLY store IDs, not duplicate names/sizes
      console.log('Creating conversation for user role:', currentUser.role)
      let insertQuery, insertValues

      if (currentUser.role === 'sales_rep') {
        // Sales rep creating conversation with surgeon
        console.log('Creating sales rep conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, surgery_center_id, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            @salesRepId, @surgeonName, @hospitalId, @surgeryCenterId, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('salesRepId', dbConfig.sql.Int, currentUser.id)
          .input('surgeonName', dbConfig.sql.VarChar, surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else if (currentUser.role === 'surgeon') {
        // Surgeon creating conversation for themselves
        console.log('Creating surgeon conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, surgery_center_id, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            NULL, @surgeonName, @hospitalId, @surgeryCenterId, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('surgeonName', dbConfig.sql.VarChar, currentUser.name || surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else {
        throw new Error('Invalid user role')
      }

      console.log('Conversation created:', insertValues.recordset[0])
      await transaction.commit()
      console.log('Transaction committed successfully')

      // Return the conversation with joined hospital/surgery center data
      const createdConversation = insertValues.recordset[0]

      // Get the hospital and surgery center names for the response
      const hospitalData = await pool.request()
        .input('hospitalId', dbConfig.sql.Int, hospitalId)
        .query('SELECT name, size_category FROM hospitals WHERE id = @hospitalId')

      const surgeryCenterData = await pool.request()
        .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
        .query('SELECT name, size_category FROM surgery_centers WHERE id = @surgeryCenterId')

      res.status(201).json({
        success: true,
        conversation: {
          ...createdConversation,
          hospital_name: hospitalData.recordset[0]?.name || '',
          hospital_size: hospitalData.recordset[0]?.size_category || '',
          surgery_center_name: surgeryCenterData.recordset[0]?.name || '',
          surgery_center_size: surgeryCenterData.recordset[0]?.size_category || '',
        },
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
      success: false,
      error: 'Failed to create conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    })
  }
})

// Rest of the routes remain the same...
// Update conversation status or notes
router.put('/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID'
      })
    }

    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { status, notes, recommended_approach, alignment_scores } = req.body
    const pool = dbConfig.getPool()

    // Build update query based on what fields are provided
    let updateFields = []
    let request = pool.request().input('conversationId', dbConfig.sql.Int, conversationId)

    if (status) {
      updateFields.push('status = @status')
      request.input('status', dbConfig.sql.VarChar, status)
    }

    if (notes !== undefined && currentUser.role === 'sales_rep') {
      updateFields.push('notes = @notes')
      request.input('notes', dbConfig.sql.Text, notes)
    }

    if (recommended_approach) {
      updateFields.push('recommended_approach = @recommendedApproach')
      request.input('recommendedApproach', dbConfig.sql.VarChar, recommended_approach)
    }

    if (alignment_scores) {
      if (alignment_scores.mechanical !== undefined) {
        updateFields.push('alignment_score_mechanical = @scoreMechanical')
        request.input('scoreMechanical', dbConfig.sql.Int, alignment_scores.mechanical)
      }
      if (alignment_scores.adjusted !== undefined) {
        updateFields.push('alignment_score_adjusted = @scoreAdjusted')
        request.input('scoreAdjusted', dbConfig.sql.Int, alignment_scores.adjusted)
      }
      if (alignment_scores.restrictive !== undefined) {
        updateFields.push('alignment_score_restrictive = @scoreRestrictive')
        request.input('scoreRestrictive', dbConfig.sql.Int, alignment_scores.restrictive)
      }
      if (alignment_scores.kinematic !== undefined) {
        updateFields.push('alignment_score_kinematic = @scoreKinematic')
        request.input('scoreKinematic', dbConfig.sql.Int, alignment_scores.kinematic)
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields provided for update'
      })
    }

    updateFields.push('updated_at = GETDATE()')

    // Build the complete query with appropriate WHERE clause based on user role
    let whereClause
    if (currentUser.role === 'sales_rep') {
      whereClause = 'WHERE id = @conversationId AND sales_rep_id = @userId'
      request.input('userId', dbConfig.sql.Int, currentUser.id)
    } else if (currentUser.role === 'surgeon') {
      whereClause = 'WHERE id = @conversationId AND (surgeon_name = @surgeonName OR sales_rep_id IS NULL)'
      request.input('surgeonName', dbConfig.sql.VarChar, currentUser.name)
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      })
    }

    const query = `
      UPDATE conversations
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      ${whereClause}
    `

    const result = await request.query(query)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied'
      })
    }

    res.json({
      success: true,
      conversation: result.recordset[0],
      message: 'Conversation updated successfully'
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Add response to conversation
router.post('/:id/responses', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID'
      })
    }

    const { error, value } = responseSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      })
    }

    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const { questionId, responseValue, scores } = value
    const pool = dbConfig.getPool()

    // Verify user has access to this conversation
    let accessQuery, accessRequest
    if (currentUser.role === 'sales_rep') {
      accessQuery = 'SELECT id FROM conversations WHERE id = @conversationId AND sales_rep_id = @userId'
      accessRequest = pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('userId', dbConfig.sql.Int, currentUser.id)
    } else if (currentUser.role === 'surgeon') {
      accessQuery = 'SELECT id FROM conversations WHERE id = @conversationId AND (surgeon_name = @surgeonName OR sales_rep_id IS NULL)'
      accessRequest = pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('surgeonName', dbConfig.sql.VarChar, currentUser.name)
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      })
    }

    const accessResult = await accessRequest.query(accessQuery)
    if (accessResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied'
      })
    }

    // Insert or update response
    const upsertQuery = `
      MERGE conversation_responses AS target
      USING (VALUES (@conversationId, @questionId, @responseValue, @scoresMechanical, @scoresAdjusted, @scoresRestrictive, @scoresKinematic)) AS source (conversation_id, question_id, response_value, scores_mechanical, scores_adjusted, scores_restrictive, scores_kinematic)
      ON target.conversation_id = source.conversation_id AND target.question_id = source.question_id
      WHEN MATCHED THEN
        UPDATE SET response_value = source.response_value, scores_mechanical = source.scores_mechanical, scores_adjusted = source.scores_adjusted, scores_restrictive = source.scores_restrictive, scores_kinematic = source.scores_kinematic, updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (conversation_id, question_id, response_value, scores_mechanical, scores_adjusted, scores_restrictive, scores_kinematic, created_at, updated_at)
        VALUES (source.conversation_id, source.question_id, source.response_value, source.scores_mechanical, source.scores_adjusted, source.scores_restrictive, source.scores_kinematic, GETDATE(), GETDATE())
      OUTPUT $action, INSERTED.*;
    `

    const result = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('questionId', dbConfig.sql.VarChar, questionId)
      .input('responseValue', dbConfig.sql.Text, JSON.stringify(responseValue))
      .input('scoresMechanical', dbConfig.sql.Int, scores.mechanical)
      .input('scoresAdjusted', dbConfig.sql.Int, scores.adjusted)
      .input('scoresRestrictive', dbConfig.sql.Int, scores.restrictive)
      .input('scoresKinematic', dbConfig.sql.Int, scores.kinematic)
      .query(upsertQuery)

    // Update conversation updated_at timestamp
    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query('UPDATE conversations SET updated_at = GETDATE() WHERE id = @conversationId')

    res.status(201).json({
      success: true,
      response: result.recordset[0],
      message: 'Response saved successfully'
    })
  } catch (error) {
    console.error('Error saving response:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save response',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Delete conversation (sales rep only)
router.delete('/:id', requireSalesRep, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID'
      })
    }

    const currentUser = getCurrentUser(req)
    const pool = dbConfig.getPool()

    // Start transaction
    const transaction = pool.transaction()
    await transaction.begin()

    try {
      // Delete conversation responses first
      await transaction.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .query('DELETE FROM conversation_responses WHERE conversation_id = @conversationId')

      // Delete conversation
      const result = await transaction.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('salesRepId', dbConfig.sql.Int, currentUser.id)
        .query('DELETE FROM conversations WHERE id = @conversationId AND sales_rep_id = @salesRepId')

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback()
        return res.status(404).json({
          success: false,
          error: 'Conversation not found or access denied'
        })
      }

      await transaction.commit()

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

export default router