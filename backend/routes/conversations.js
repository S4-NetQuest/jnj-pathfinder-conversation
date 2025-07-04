// backend/routes/conversations.js (Complete file with KA/iKA/FA/MA updates)
import express from 'express'
import dbConfig from '../config/database.js'
import { requireSalesRep, isAuthenticated, getCurrentUser } from '../middleware/auth.js'
import {
  createConversationSchema,
  updateConversationSchema,
  responseSchema,
  transformRoboticsValue,
  getAlignmentDisplayName,
  getAlignmentColorScheme,
  validators,
  CONSTANTS
} from '../validation/schemas.js'

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

// Test endpoint
router.get('/test', (req, res) => {
  console.log('=== CONVERSATION TEST ENDPOINT ===')
  const currentUser = getCurrentUser(req)
  res.json({
    message: 'Conversations route is working!',
    timestamp: new Date().toISOString(),
    user: currentUser,
    authenticated: !!currentUser,
    sessionId: req.sessionID,
    alignmentOptions: CONSTANTS.ALIGNMENT_OPTIONS,
    volumeOptions: CONSTANTS.VOLUME_OPTIONS
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
               sc.name as surgery_center_name,
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
               sc.name as surgery_center_name,
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
      // Use the joined data from hospitals/surgery_centers tables
      hospital_name: conv.hospital_name || '',
      surgery_center_name: conv.surgery_center_name || '',
      // New fields
      surgeon_volume_per_year: conv.surgeon_volume_per_year || '',
      uses_robotics: conv.uses_robotics,
      current_alignment: conv.current_alignment || '',
      // Other conversation fields
      conversation_date: conv.conversation_date ? new Date(conv.conversation_date).toISOString() : null,
      created_at: conv.created_at ? new Date(conv.created_at).toISOString() : null,
      updated_at: conv.updated_at ? new Date(conv.updated_at).toISOString() : null,
      status: conv.status || 'in_progress',
      notes: conv.notes || '',
      recommended_approach: conv.recommended_approach || '',
      // Updated alignment scores with new field names (KA/iKA/FA/MA)
      alignment_score_ka: conv.alignment_score_ka || 0,
      alignment_score_ika: conv.alignment_score_ika || 0,
      alignment_score_fa: conv.alignment_score_fa || 0,
      alignment_score_ma: conv.alignment_score_ma || 0,
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
               sc.name as surgery_center_name
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
               sc.name as surgery_center_name
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

    // Get conversation responses with updated field names (KA/iKA/FA/MA)
    const responsesQuery = `
      SELECT question_id, response_value, scores_ka, scores_ika,
             scores_fa, scores_ma, created_at
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
        // Use joined data
        hospital_name: conversation.hospital_name,
        surgery_center_name: conversation.surgery_center_name,
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

    const {
      surgeon_name,
      hospital_name,
      surgery_center_name,
      surgeon_volume_per_year,
      uses_robotics,
      current_alignment,
      conversation_date
    } = value

    console.log('Validated data:', value)

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
          INSERT INTO hospitals (name, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES (@hospitalName, GETDATE(), GETDATE())
        `

        const newHospitalResult = await transaction.request()
          .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
          .query(insertHospitalQuery)

        hospitalId = newHospitalResult.recordset[0].id
        console.log('Created hospital with ID:', hospitalId)
      } else {
        hospitalId = hospitalResult.recordset[0].id
        console.log('Found existing hospital with ID:', hospitalId)
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
          INSERT INTO surgery_centers (name, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES (@surgeryCenterName, GETDATE(), GETDATE())
        `

        const newSurgeryCenterResult = await transaction.request()
          .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
          .query(insertSurgeryCenterQuery)

        surgeryCenterId = newSurgeryCenterResult.recordset[0].id
        console.log('Created surgery center with ID:', surgeryCenterId)
      } else {
        surgeryCenterId = surgeryCenterResult.recordset[0].id
        console.log('Found existing surgery center with ID:', surgeryCenterId)
      }

      // Transform robotics value
      const roboticsValue = transformRoboticsValue(uses_robotics)

      // Create conversation with new fields
      console.log('Creating conversation for user role:', currentUser.role)
      let insertQuery, insertValues

      if (currentUser.role === 'sales_rep') {
        // Sales rep creating conversation with surgeon
        console.log('Creating sales rep conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, surgery_center_id,
            surgeon_volume_per_year, uses_robotics, current_alignment, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            @salesRepId, @surgeonName, @hospitalId, @surgeryCenterId,
            @surgeonVolumePerYear, @usesRobotics, @currentAlignment, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('salesRepId', dbConfig.sql.Int, currentUser.id)
          .input('surgeonName', dbConfig.sql.VarChar, surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeonVolumePerYear', dbConfig.sql.VarChar, surgeon_volume_per_year)
          .input('usesRobotics', dbConfig.sql.Bit, roboticsValue ? 1 : 0)
          .input('currentAlignment', dbConfig.sql.VarChar, current_alignment)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else if (currentUser.role === 'surgeon') {
        // Surgeon creating conversation for themselves
        console.log('Creating surgeon conversation')
        insertQuery = `
          INSERT INTO conversations (
            sales_rep_id, surgeon_name, hospital_id, surgery_center_id,
            surgeon_volume_per_year, uses_robotics, current_alignment, conversation_date,
            status, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            NULL, @surgeonName, @hospitalId, @surgeryCenterId,
            @surgeonVolumePerYear, @usesRobotics, @currentAlignment, @conversationDate,
            'in_progress', GETDATE(), GETDATE()
          )
        `

        insertValues = await transaction.request()
          .input('surgeonName', dbConfig.sql.VarChar, currentUser.name || surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeonVolumePerYear', dbConfig.sql.VarChar, surgeon_volume_per_year)
          .input('usesRobotics', dbConfig.sql.Bit, roboticsValue ? 1 : 0)
          .input('currentAlignment', dbConfig.sql.VarChar, current_alignment)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else {
        throw new Error('Invalid user role')
      }

      console.log('Insert query result:', insertValues.recordset[0])

      await transaction.commit()
      console.log('Transaction committed successfully')

      const newConversation = insertValues.recordset[0]

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        conversation: {
          ...newConversation,
          hospital_name,
          surgery_center_name,
          // Initialize scores to 0
          alignment_score_ka: 0,
          alignment_score_ika: 0,
          alignment_score_fa: 0,
          alignment_score_ma: 0
        }
      })
    } catch (transactionError) {
      console.error('Transaction error:', transactionError)
      await transaction.rollback()
      throw transactionError
    }
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Update conversation
router.patch('/:id', async (req, res) => {
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

    // Validate request body
    const { error, value } = updateConversationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      })
    }

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation
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

    // Build update query dynamically
    const updateFields = []
    const request = pool.request()
    request.input('conversationId', dbConfig.sql.Int, conversationId)

    if (value.status !== undefined) {
      updateFields.push('status = @status')
      request.input('status', dbConfig.sql.VarChar, value.status)
    }

    // Notes can only be updated by sales reps
    if (value.notes !== undefined) {
      if (currentUser.role !== 'sales_rep') {
        return res.status(403).json({
          success: false,
          error: 'Only sales representatives can update notes'
        })
      }
      updateFields.push('notes = @notes')
      request.input('notes', dbConfig.sql.Text, value.notes || '')
    }

    if (value.recommended_approach !== undefined) {
      updateFields.push('recommended_approach = @recommendedApproach')
      request.input('recommendedApproach', dbConfig.sql.VarChar, value.recommended_approach)
    }

    if (value.surgeon_volume_per_year !== undefined) {
      updateFields.push('surgeon_volume_per_year = @surgeonVolumePerYear')
      request.input('surgeonVolumePerYear', dbConfig.sql.VarChar, value.surgeon_volume_per_year)
    }

    if (value.uses_robotics !== undefined) {
      updateFields.push('uses_robotics = @usesRobotics')
      const roboticsValue = transformRoboticsValue(value.uses_robotics)
      request.input('usesRobotics', dbConfig.sql.Bit, roboticsValue ? 1 : 0)
    }

    if (value.current_alignment !== undefined) {
      updateFields.push('current_alignment = @currentAlignment')
      request.input('currentAlignment', dbConfig.sql.VarChar, value.current_alignment)
    }

    // Handle alignment scores with new field names (KA/iKA/FA/MA)
    if (value.alignment_scores) {
      if (value.alignment_scores.ka !== undefined) {
        updateFields.push('alignment_score_ka = @alignmentScoreKA')
        request.input('alignmentScoreKA', dbConfig.sql.Int, value.alignment_scores.ka)
      }
      if (value.alignment_scores.ika !== undefined) {
        updateFields.push('alignment_score_ika = @alignmentScoreiKA')
        request.input('alignmentScoreiKA', dbConfig.sql.Int, value.alignment_scores.ika)
      }
      if (value.alignment_scores.fa !== undefined) {
        updateFields.push('alignment_score_fa = @alignmentScoreFA')
        request.input('alignmentScoreFA', dbConfig.sql.Int, value.alignment_scores.fa)
      }
      if (value.alignment_scores.ma !== undefined) {
        updateFields.push('alignment_score_ma = @alignmentScoreMA')
        request.input('alignmentScoreMA', dbConfig.sql.Int, value.alignment_scores.ma)
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      })
    }

    // Add updated_at field
    updateFields.push('updated_at = GETDATE()')

    const updateQuery = `
      UPDATE conversations
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @conversationId
    `

    const result = await request.query(updateQuery)

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      conversation: result.recordset[0]
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

// Add this PUT endpoint to your backend/routes/conversations.js file
// Place it after the PATCH endpoint

// Update conversation (PUT - complete update)
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

    console.log('=== UPDATE CONVERSATION (PUT) ===')
    console.log('Conversation ID:', conversationId)
    console.log('Current user:', currentUser)
    console.log('Request body:', req.body)

    // Validate request body using the same schema as PATCH
    const { error, value } = updateConversationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      })
    }

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation
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

    // Build update query dynamically
    const updateFields = []
    const request = pool.request()
    request.input('conversationId', dbConfig.sql.Int, conversationId)

    if (value.status !== undefined) {
      updateFields.push('status = @status')
      request.input('status', dbConfig.sql.VarChar, value.status)
    }

    // Handle recommendedApproach (camelCase from frontend) - normalize to uppercase
    if (value.recommendedApproach !== undefined) {
      updateFields.push('recommended_approach = @recommendedApproach')
      const normalizedValue = validators.normalizeAlignment(value.recommendedApproach)
      request.input('recommendedApproach', dbConfig.sql.VarChar, normalizedValue)
    }

    // Also handle recommended_approach (snake_case) for consistency - normalize to uppercase
    if (value.recommended_approach !== undefined) {
      updateFields.push('recommended_approach = @recommendedApproach')
      const normalizedValue = validators.normalizeAlignment(value.recommended_approach)
      request.input('recommendedApproach', dbConfig.sql.VarChar, normalizedValue)
    }

    // Notes can only be updated by sales reps
    if (value.notes !== undefined) {
      if (currentUser.role !== 'sales_rep') {
        return res.status(403).json({
          success: false,
          error: 'Only sales representatives can update notes'
        })
      }
      updateFields.push('notes = @notes')
      request.input('notes', dbConfig.sql.Text, value.notes || '')
    }

    if (value.surgeon_volume_per_year !== undefined) {
      updateFields.push('surgeon_volume_per_year = @surgeonVolumePerYear')
      request.input('surgeonVolumePerYear', dbConfig.sql.VarChar, value.surgeon_volume_per_year)
    }

    if (value.uses_robotics !== undefined) {
      updateFields.push('uses_robotics = @usesRobotics')
      const roboticsValue = transformRoboticsValue(value.uses_robotics)
      request.input('usesRobotics', dbConfig.sql.Bit, roboticsValue ? 1 : 0)
    }

    if (value.current_alignment !== undefined) {
      updateFields.push('current_alignment = @currentAlignment')
      request.input('currentAlignment', dbConfig.sql.VarChar, value.current_alignment)
    }

    // Handle alignment scores with new field names (KA/iKA/FA/MA)
    if (value.alignment_scores) {
      if (value.alignment_scores.ka !== undefined) {
        updateFields.push('alignment_score_ka = @alignmentScoreKA')
        request.input('alignmentScoreKA', dbConfig.sql.Int, value.alignment_scores.ka)
      }
      if (value.alignment_scores.ika !== undefined) {
        updateFields.push('alignment_score_ika = @alignmentScoreiKA')
        request.input('alignmentScoreiKA', dbConfig.sql.Int, value.alignment_scores.ika)
      }
      if (value.alignment_scores.fa !== undefined) {
        updateFields.push('alignment_score_fa = @alignmentScoreFA')
        request.input('alignmentScoreFA', dbConfig.sql.Int, value.alignment_scores.fa)
      }
      if (value.alignment_scores.ma !== undefined) {
        updateFields.push('alignment_score_ma = @alignmentScoreMA')
        request.input('alignmentScoreMA', dbConfig.sql.Int, value.alignment_scores.ma)
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      })
    }

    // Add updated_at field
    updateFields.push('updated_at = GETDATE()')

    const updateQuery = `
      UPDATE conversations
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @conversationId
    `

    console.log('Update query:', updateQuery)
    console.log('Update fields:', updateFields)

    const result = await request.query(updateQuery)

    console.log('Update result:', result.recordset[0])

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      conversation: result.recordset[0]
    })
  } catch (error) {
    console.error('Error updating conversation (PUT):', error)
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

    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Validate request body
    const { error, value } = responseSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      })
    }

    const { questionId, responseValue, scores } = value

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation
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

    // Insert or update response with new score field names (KA/iKA/FA/MA)
    const responseQuery = `
      MERGE conversation_responses AS target
      USING (VALUES (@conversationId, @questionId)) AS source (conversation_id, question_id)
      ON target.conversation_id = source.conversation_id AND target.question_id = source.question_id
      WHEN MATCHED THEN
        UPDATE SET
          response_value = @responseValue,
          scores_ka = @scoresKA,
          scores_ika = @scoresiKA,
          scores_fa = @scoresFA,
          scores_ma = @scoresMA,
          updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (conversation_id, question_id, response_value, scores_ka, scores_ika, scores_fa, scores_ma, created_at, updated_at)
        VALUES (@conversationId, @questionId, @responseValue, @scoresKA, @scoresiKA, @scoresFA, @scoresMA, GETDATE(), GETDATE())
      OUTPUT $action, INSERTED.*;
    `

    const responseResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('questionId', dbConfig.sql.VarChar, questionId)
      .input('responseValue', dbConfig.sql.VarChar, JSON.stringify(responseValue))
      .input('scoresKA', dbConfig.sql.Int, scores.ka)
      .input('scoresiKA', dbConfig.sql.Int, scores.ika)
      .input('scoresFA', dbConfig.sql.Int, scores.fa)
      .input('scoresMA', dbConfig.sql.Int, scores.ma)
      .query(responseQuery)

    // Update conversation total scores with new field names (KA/iKA/FA/MA)
    const totalScoresQuery = `
      UPDATE conversations
      SET
        alignment_score_ka = (
          SELECT ISNULL(SUM(scores_ka), 0)
          FROM conversation_responses
          WHERE conversation_id = @conversationId
        ),
        alignment_score_ika = (
          SELECT ISNULL(SUM(scores_ika), 0)
          FROM conversation_responses
          WHERE conversation_id = @conversationId
        ),
        alignment_score_fa = (
          SELECT ISNULL(SUM(scores_fa), 0)
          FROM conversation_responses
          WHERE conversation_id = @conversationId
        ),
        alignment_score_ma = (
          SELECT ISNULL(SUM(scores_ma), 0)
          FROM conversation_responses
          WHERE conversation_id = @conversationId
        ),
        updated_at = GETDATE()
      WHERE id = @conversationId
    `

    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query(totalScoresQuery)

    res.json({
      success: true,
      message: 'Response added successfully',
      response: responseResult.recordset[0],
      action: responseResult.recordset[0].$action
    })
  } catch (error) {
    console.error('Error adding response:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add response',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Delete conversation
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

    // Check if conversation exists and belongs to the sales rep
    const checkQuery = 'SELECT id FROM conversations WHERE id = @conversationId AND sales_rep_id = @userId'
    const checkResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(checkQuery)

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied'
      })
    }

    // Delete responses first
    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query('DELETE FROM conversation_responses WHERE conversation_id = @conversationId')

    // Delete conversation
    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query('DELETE FROM conversations WHERE id = @conversationId')

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})


// Get notes for a conversation
router.get('/:id/notes', async (req, res) => {
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

    // Only sales reps can access notes
    if (currentUser.role !== 'sales_rep') {
      return res.status(403).json({
        success: false,
        error: 'Only sales representatives can access notes'
      })
    }

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation
    const accessQuery = 'SELECT id FROM conversations WHERE id = @conversationId AND sales_rep_id = @userId'
    const accessResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(accessQuery)

    if (accessResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied'
      })
    }

    // Get notes for this conversation
    const notesQuery = `
      SELECT id, conversation_id, content, created_at, updated_at
      FROM conversation_notes
      WHERE conversation_id = @conversationId AND sales_rep_id = @userId
      ORDER BY updated_at DESC
    `

    const notesResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(notesQuery)

    res.json({
      success: true,
      notes: notesResult.recordset
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Create or update notes for a conversation
router.post('/:id/notes', async (req, res) => {
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

    // Only sales reps can create/update notes
    if (currentUser.role !== 'sales_rep') {
      return res.status(403).json({
        success: false,
        error: 'Only sales representatives can create notes'
      })
    }

    const { content } = req.body
    if (typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Notes content must be a string'
      })
    }

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation
    const accessQuery = 'SELECT id FROM conversations WHERE id = @conversationId AND sales_rep_id = @userId'
    const accessResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(accessQuery)

    if (accessResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied'
      })
    }

    // Create or update notes using MERGE
    const notesQuery = `
      MERGE conversation_notes AS target
      USING (VALUES (@conversationId, @salesRepId)) AS source (conversation_id, sales_rep_id)
      ON target.conversation_id = source.conversation_id AND target.sales_rep_id = source.sales_rep_id
      WHEN MATCHED THEN
        UPDATE SET
          content = @content,
          updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (conversation_id, sales_rep_id, content, created_at, updated_at)
        VALUES (@conversationId, @salesRepId, @content, GETDATE(), GETDATE())
      OUTPUT $action, INSERTED.*;
    `

    const notesResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('salesRepId', dbConfig.sql.Int, currentUser.id)
      .input('content', dbConfig.sql.Text, content)
      .query(notesQuery)

    const savedNote = notesResult.recordset[0]
    const action = savedNote.$action

    res.json({
      success: true,
      message: `Notes ${action === 'INSERT' ? 'created' : 'updated'} successfully`,
      note: {
        id: savedNote.id,
        conversation_id: savedNote.conversation_id,
        content: savedNote.content,
        created_at: savedNote.created_at,
        updated_at: savedNote.updated_at
      },
      action
    })
  } catch (error) {
    console.error('Error saving notes:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save notes',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Delete notes for a conversation
router.delete('/:id/notes', async (req, res) => {
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

    // Only sales reps can delete notes
    if (currentUser.role !== 'sales_rep') {
      return res.status(403).json({
        success: false,
        error: 'Only sales representatives can delete notes'
      })
    }

    const pool = dbConfig.getPool()

    // Check if user has access to this conversation and notes exist
    const checkQuery = `
      SELECT cn.id
      FROM conversation_notes cn
      INNER JOIN conversations c ON cn.conversation_id = c.id
      WHERE cn.conversation_id = @conversationId
        AND cn.sales_rep_id = @userId
        AND c.sales_rep_id = @userId
    `

    const checkResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(checkQuery)

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notes not found or access denied'
      })
    }

    // Delete notes
    const deleteQuery = `
      DELETE FROM conversation_notes
      WHERE conversation_id = @conversationId AND sales_rep_id = @userId
    `

    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('userId', dbConfig.sql.Int, currentUser.id)
      .query(deleteQuery)

    res.json({
      success: true,
      message: 'Notes deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notes:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete notes',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

export default router