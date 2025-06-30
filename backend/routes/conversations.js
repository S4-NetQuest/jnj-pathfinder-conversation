// backend/routes/conversations.js (updated with surgery center support)
import express from 'express'
import Joi from 'joi'
import dbConfig from '../config/database.js'
import { requireSalesRep, isAuthenticated, getCurrentUser } from '../middleware/auth.js'

const router = express.Router()

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

// Get conversations (sales rep gets their conversations, surgeons get conversations with their name)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    let query, request

    if (req.user.role === 'sales_rep') {
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

      request = pool.request().input('userId', dbConfig.sql.Int, req.user.id)
    } else if (req.user.role === 'surgeon') {
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

      request = pool.request().input('surgeonName', dbConfig.sql.VarChar, req.user.name)
    } else {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    const result = await request.query(query)
    res.json({ success: true, conversations: result.recordset })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

// Create new conversation (sales rep or surgeon)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Remove sales_rep_id from request body if present (it should come from auth context)
    const { sales_rep_id, ...requestBody } = req.body

    const { error, value } = createConversationSchema.validate(requestBody)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { surgeon_name, hospital_name, hospital_size, surgery_center_name, conversation_date } = value
    const pool = dbConfig.getPool()

    // Start transaction
    const transaction = pool.transaction()
    await transaction.begin()

    try {
      // Check if hospital exists, create if not
      let hospitalId = null
      const hospitalQuery = 'SELECT id FROM hospitals WHERE name = @hospitalName'
      const hospitalResult = await transaction.request()
        .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
        .query(hospitalQuery)

      if (hospitalResult.recordset.length === 0) {
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
      } else {
        hospitalId = hospitalResult.recordset[0].id

        // Update hospital size if different
        await transaction.request()
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .query('UPDATE hospitals SET size_category = @hospitalSize, updated_at = GETDATE() WHERE id = @hospitalId')
      }

      // Check if surgery center exists, create if not
      let surgeryCenterId = null
      const surgeryCenterQuery = 'SELECT id FROM surgery_centers WHERE name = @surgeryCenterName'
      const surgeryCenterResult = await transaction.request()
        .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
        .query(surgeryCenterQuery)

      if (surgeryCenterResult.recordset.length === 0) {
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
      } else {
        surgeryCenterId = surgeryCenterResult.recordset[0].id

        // Update surgery center size if different
        await transaction.request()
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeryCenterSize', dbConfig.sql.VarChar, hospital_size)
          .query('UPDATE surgery_centers SET size_category = @surgeryCenterSize, updated_at = GETDATE() WHERE id = @surgeryCenterId')
      }

      // Create conversation with different logic for sales rep vs surgeon
      let insertQuery, insertValues

      if (req.user.role === 'sales_rep') {
        // Sales rep creating conversation with surgeon
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
          .input('salesRepId', dbConfig.sql.Int, req.user.id)
          .input('surgeonName', dbConfig.sql.VarChar, surgeon_name)
          .input('hospitalId', dbConfig.sql.Int, hospitalId)
          .input('hospitalName', dbConfig.sql.VarChar, hospital_name)
          .input('hospitalSize', dbConfig.sql.VarChar, hospital_size)
          .input('surgeryCenterId', dbConfig.sql.Int, surgeryCenterId)
          .input('surgeryCenterName', dbConfig.sql.VarChar, surgery_center_name)
          .input('conversationDate', dbConfig.sql.Date, conversation_date)
          .query(insertQuery)
      } else if (req.user.role === 'surgeon') {
        // Surgeon creating conversation for themselves
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
          .input('surgeonName', dbConfig.sql.VarChar, req.user.name || surgeon_name)
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

      await transaction.commit()

      res.status(201).json({
        success: true,
        conversation: insertValues.recordset[0],
        message: 'Conversation created successfully'
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

// Get specific conversation
router.get('/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const pool = dbConfig.getPool()
    const currentUser = getCurrentUser(req)

    // Check if user has access to this conversation
    let query = `
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
      WHERE c.id = @conversationId
    `

    // If authenticated sales rep, check ownership
    if (currentUser?.role === 'sales_rep') {
      query += ' AND c.sales_rep_id = @salesRepId'
    }

    const request = pool.request().input('conversationId', dbConfig.sql.Int, conversationId)

    if (currentUser?.role === 'sales_rep') {
      request.input('salesRepId', dbConfig.sql.Int, currentUser.id)
    }

    const result = await request.query(query)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Get responses
    const responsesQuery = `
      SELECT * FROM conversation_responses
      WHERE conversation_id = @conversationId
      ORDER BY created_at ASC
    `

    const responsesResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query(responsesQuery)

    const conversation = result.recordset[0]
    conversation.responses = responsesResult.recordset

    res.json({ success: true, conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// Save question response
router.post('/:id/responses', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const { error, value } = responseSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { questionId, responseValue, scores } = value
    const pool = dbConfig.getPool()

    // Check if response already exists
    const existingQuery = `
      SELECT id FROM conversation_responses
      WHERE conversation_id = @conversationId AND question_id = @questionId
    `

    const existingResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('questionId', dbConfig.sql.VarChar, questionId)
      .query(existingQuery)

    let result
    if (existingResult.recordset.length > 0) {
      // Update existing response
      const updateQuery = `
        UPDATE conversation_responses
        SET response_value = @responseValue,
            score_mechanical = @scoreMechanical,
            score_adjusted = @scoreAdjusted,
            score_restrictive = @scoreRestrictive,
            score_kinematic = @scoreKinematic,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE conversation_id = @conversationId AND question_id = @questionId
      `

      result = await pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('questionId', dbConfig.sql.VarChar, questionId)
        .input('responseValue', dbConfig.sql.NVarChar, JSON.stringify(responseValue))
        .input('scoreMechanical', dbConfig.sql.Int, scores.mechanical)
        .input('scoreAdjusted', dbConfig.sql.Int, scores.adjusted)
        .input('scoreRestrictive', dbConfig.sql.Int, scores.restrictive)
        .input('scoreKinematic', dbConfig.sql.Int, scores.kinematic)
        .query(updateQuery)
    } else {
      // Insert new response
      const insertQuery = `
        INSERT INTO conversation_responses (
          conversation_id, question_id, response_value,
          score_mechanical, score_adjusted, score_restrictive, score_kinematic,
          created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @conversationId, @questionId, @responseValue,
          @scoreMechanical, @scoreAdjusted, @scoreRestrictive, @scoreKinematic,
          GETDATE(), GETDATE()
        )
      `

      result = await pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('questionId', dbConfig.sql.VarChar, questionId)
        .input('responseValue', dbConfig.sql.NVarChar, JSON.stringify(responseValue))
        .input('scoreMechanical', dbConfig.sql.Int, scores.mechanical)
        .input('scoreAdjusted', dbConfig.sql.Int, scores.adjusted)
        .input('scoreRestrictive', dbConfig.sql.Int, scores.restrictive)
        .input('scoreKinematic', dbConfig.sql.Int, scores.kinematic)
        .query(insertQuery)
    }

    // Update conversation totals
    const updateTotalsQuery = `
      UPDATE conversations
      SET alignment_score_mechanical = (
            SELECT ISNULL(SUM(score_mechanical), 0)
            FROM conversation_responses
            WHERE conversation_id = @conversationId
          ),
          alignment_score_adjusted = (
            SELECT ISNULL(SUM(score_adjusted), 0)
            FROM conversation_responses
            WHERE conversation_id = @conversationId
          ),
          alignment_score_restrictive = (
            SELECT ISNULL(SUM(score_restrictive), 0)
            FROM conversation_responses
            WHERE conversation_id = @conversationId
          ),
          alignment_score_kinematic = (
            SELECT ISNULL(SUM(score_kinematic), 0)
            FROM conversation_responses
            WHERE conversation_id = @conversationId
          ),
          updated_at = GETDATE()
      WHERE id = @conversationId
    `

    await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query(updateTotalsQuery)

    res.json({ success: true, response: result.recordset[0] })
  } catch (error) {
    console.error('Error saving response:', error)
    res.status(500).json({ error: 'Failed to save response' })
  }
})

// Update conversation status
router.put('/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const { status, recommendedApproach } = req.body
    const pool = dbConfig.getPool()
    const currentUser = getCurrentUser(req)

    let updateQuery = `
      UPDATE conversations
      SET status = @status,
          recommended_approach = @recommendedApproach,
          completed_at = CASE WHEN @status = 'completed' THEN GETDATE() ELSE completed_at END,
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @conversationId
    `

    let request = pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('status', dbConfig.sql.VarChar, status)
      .input('recommendedApproach', dbConfig.sql.VarChar, recommendedApproach)

    // If authenticated sales rep, check ownership
    if (currentUser?.role === 'sales_rep') {
      updateQuery += ' AND sales_rep_id = @salesRepId'
      request = request.input('salesRepId', dbConfig.sql.Int, currentUser.id)
    }

    const result = await request.query(updateQuery)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied' })
    }

    res.json({ success: true, conversation: result.recordset[0] })
  } catch (error) {
    console.error('Error updating conversation:', error)
    res.status(500).json({ error: 'Failed to update conversation' })
  }
})

// Delete conversation (sales rep only)
router.delete('/:id', requireSalesRep, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const pool = dbConfig.getPool()
    const deleteQuery = `
      DELETE FROM conversations
      WHERE id = @conversationId AND sales_rep_id = @salesRepId
    `

    const result = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('salesRepId', dbConfig.sql.Int, req.user.id)
      .query(deleteQuery)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    res.json({ success: true, message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
})

// Get conversation notes
router.get('/:id/notes', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const pool = dbConfig.getPool()
    const query = `
      SELECT cn.*, u.name as author_name
      FROM conversation_notes cn
      INNER JOIN users u ON cn.sales_rep_id = u.id
      WHERE cn.conversation_id = @conversationId
      ORDER BY cn.updated_at DESC
    `

    const result = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .query(query)

    res.json({ success: true, notes: result.recordset })
  } catch (error) {
    console.error('Error fetching notes:', error)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// Create/update conversation notes (sales rep only)
router.post('/:id/notes', requireSalesRep, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id)
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    const { content } = req.body
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' })
    }

    const pool = dbConfig.getPool()

    // Check if note already exists for this conversation and sales rep
    const existingQuery = `
      SELECT id FROM conversation_notes
      WHERE conversation_id = @conversationId AND sales_rep_id = @salesRepId
    `

    const existingResult = await pool.request()
      .input('conversationId', dbConfig.sql.Int, conversationId)
      .input('salesRepId', dbConfig.sql.Int, req.user.id)
      .query(existingQuery)

    let result
    if (existingResult.recordset.length > 0) {
      // Update existing note
      const updateQuery = `
        UPDATE conversation_notes
        SET content = @content, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE conversation_id = @conversationId AND sales_rep_id = @salesRepId
      `

      result = await pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('salesRepId', dbConfig.sql.Int, req.user.id)
        .input('content', dbConfig.sql.NVarChar, content)
        .query(updateQuery)
    } else {
      // Create new note
      const insertQuery = `
        INSERT INTO conversation_notes (conversation_id, sales_rep_id, content, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@conversationId, @salesRepId, @content, GETDATE(), GETDATE())
      `

      result = await pool.request()
        .input('conversationId', dbConfig.sql.Int, conversationId)
        .input('salesRepId', dbConfig.sql.Int, req.user.id)
        .input('content', dbConfig.sql.NVarChar, content)
        .query(insertQuery)
    }

    res.json({ success: true, note: result.recordset[0] })
  } catch (error) {
    console.error('Error saving note:', error)
    res.status(500).json({ error: 'Failed to save note' })
  }
})

export default router