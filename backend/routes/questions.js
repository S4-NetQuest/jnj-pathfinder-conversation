const express = require('express');
const router = express.Router();

// Import questions from backend data folder
const questionsData = require('../data/questions.json');

// Serve questions data to frontend
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      questions: questionsData
    });
  } catch (error) {
    console.error('Error serving questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load questions data'
    });
  }
});

module.exports = router;