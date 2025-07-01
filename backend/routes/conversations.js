// backend/routes/conversations.js (Complete file with proper validation import)
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
      // Updated alignment scores with new field names
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

    // Get conversation responses with updated field names
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
          .input('surgeonVolumePerYear', dbConfig.sql.Var