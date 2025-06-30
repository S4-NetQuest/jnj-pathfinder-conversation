// backend/routes/glossary.js
import express from 'express'
import dbConfig from '../config/database.js'

const router = express.Router()

// Get all glossary terms
router.get('/', async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms, created_at, updated_at
      FROM glossary
      ORDER BY term ASC
    `

    const result = await pool.request().query(query)
    res.json(result.recordset)
  } catch (error) {
    console.error('Error fetching glossary terms:', error)
    res.status(500).json({ error: 'Failed to fetch glossary terms' })
  }
})

// Get specific glossary term by ID
router.get('/:id', async (req, res) => {
  try {
    const termId = parseInt(req.params.id)
    if (isNaN(termId)) {
      return res.status(400).json({ error: 'Invalid term ID' })
    }

    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms, created_at, updated_at
      FROM glossary
      WHERE id = @termId
    `

    const result = await pool.request()
      .input('termId', dbConfig.sql.Int, termId)
      .query(query)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Term not found' })
    }

    res.json(result.recordset[0])
  } catch (error) {
    console.error('Error fetching glossary term:', error)
    res.status(500).json({ error: 'Failed to fetch glossary term' })
  }
})

// Search glossary terms
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms, created_at, updated_at
      FROM glossary
      WHERE term LIKE @searchQuery
         OR definition LIKE @searchQuery
         OR synonyms LIKE @searchQuery
      ORDER BY
        CASE
          WHEN term LIKE @exactMatch THEN 1
          WHEN term LIKE @startsWith THEN 2
          ELSE 3
        END,
        term ASC
    `

    const searchPattern = `%${searchQuery}%`
    const exactMatch = searchQuery
    const startsWith = `${searchQuery}%`

    const result = await pool.request()
      .input('searchQuery', dbConfig.sql.VarChar, searchPattern)
      .input('exactMatch', dbConfig.sql.VarChar, exactMatch)
      .input('startsWith', dbConfig.sql.VarChar, startsWith)
      .query(query)

    res.json(result.recordset)
  } catch (error) {
    console.error('Error searching glossary terms:', error)
    res.status(500).json({ error: 'Failed to search glossary terms' })
  }
})

export default router