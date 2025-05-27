import express from 'express'
import dbConfig from '../config/database.js'

const router = express.Router()

// Get all glossary terms
router.get('/', async (req, res) => {
  try {
    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms
      FROM glossary_terms 
      WHERE is_active = 1
      ORDER BY term ASC
    `
    
    const result = await pool.request().query(query)
    res.json(result.recordset)
  } catch (error) {
    console.error('Error fetching glossary terms:', error)
    res.status(500).json({ error: 'Failed to fetch glossary terms' })
  }
})

// Search glossary terms
router.get('/search', async (req, res) => {
  try {
    const { term } = req.query
    if (!term || term.trim().length === 0) {
      return res.status(400).json({ error: 'Search term is required' })
    }

    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms
      FROM glossary_terms 
      WHERE is_active = 1
        AND (
          term LIKE @searchTerm 
          OR definition LIKE @searchTerm 
          OR synonyms LIKE @searchTerm
        )
      ORDER BY 
        CASE 
          WHEN term LIKE @exactTerm THEN 1
          WHEN term LIKE @startsWith THEN 2
          ELSE 3
        END,
        term ASC
    `
    
    const searchTerm = `%${term.trim()}%`
    const exactTerm = term.trim()
    const startsWith = `${term.trim()}%`
    
    const result = await pool.request()
      .input('searchTerm', dbConfig.sql.NVarChar, searchTerm)
      .input('exactTerm', dbConfig.sql.NVarChar, exactTerm)
      .input('startsWith', dbConfig.sql.NVarChar, startsWith)
      .query(query)
    
    res.json(result.recordset)
  } catch (error) {
    console.error('Error searching glossary terms:', error)
    res.status(500).json({ error: 'Failed to search glossary terms' })
  }
})

// Get glossary term by ID
router.get('/:id', async (req, res) => {
  try {
    const termId = parseInt(req.params.id)
    if (isNaN(termId)) {
      return res.status(400).json({ error: 'Invalid term ID' })
    }

    const pool = dbConfig.getPool()
    const query = `
      SELECT id, term, definition, category, synonyms
      FROM glossary_terms 
      WHERE id = @termId AND is_active = 1
    `
    
    const result = await pool.request()
      .input('termId', dbConfig.sql.Int, termId)
      .query(query)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Glossary term not found' })
    }

    res.json(result.recordset[0])
  } catch (error) {
    console.error('Error fetching glossary term:', error)
    res.status(500).json({ error: 'Failed to fetch glossary term' })
  }
})

export default router