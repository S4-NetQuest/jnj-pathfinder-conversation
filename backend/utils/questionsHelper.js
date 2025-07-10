// backend/utils/questionsHelper.js
// Utility functions for loading and processing questions data

const { readFile } = require('fs').promises
const path = require('path')

let questionsDataCache = null

/**
 * Load questions data from JSON file with fallback to default values
 */
const loadQuestionsData = async () => {
  if (questionsDataCache) {
    return questionsDataCache
  }

  try {
    // Try to load from the data directory
    const questionsPath = path.join(__dirname, '../data/questions.json')
    const questionsContent = await readFile(questionsPath, 'utf8')
    questionsDataCache = JSON.parse(questionsContent)

    console.log('Successfully loaded questions data from file')
    return questionsDataCache
  } catch (fileError) {
    console.warn('Could not load questions.json file, using default configuration:', fileError.message)

    // Fallback to default configuration
    questionsDataCache = {
      questions: [
        // Placeholder questions structure - replace with your actual questions
        {
          id: "q1",
          question: "Sample question for scoring calculation",
          options: [
            {
              id: "q1_opt1",
              text: "Option 1",
              scores: { ka: 4, ika: 2, fa: 1, ma: 0 }
            },
            {
              id: "q1_opt2",
              text: "Option 2",
              scores: { ka: 0, ika: 1, fa: 2, ma: 4 }
            }
          ]
        }
        // Add more sample questions or load from database
      ],
      metadata: {
        alignmentCategories: {
          ka: { name: "Kinematic Alignment", color: "#eb1700" },
          ika: { name: "Inverse Kinematic Alignment", color: "#ff6017" },
          fa: { name: "Functional Alignment", color: "#0f68b2" },
          ma: { name: "Mechanical Alignment", color: "#328714" }
        },
        // Default max scores - these will be calculated from actual questions
        maxScores: {
          ka: 20,
          ika: 20,
          fa: 20,
          ma: 20
        }
      }
    }

    return questionsDataCache
  }
}

/**
 * Calculate maximum possible scores for each alignment type
 */
const calculateMaxScores = (questions) => {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.warn('No questions provided, using default max scores')
    return {
      ka: 20,
      ika: 20,
      fa: 20,
      ma: 20
    }
  }

  const maxScores = questions.reduce((totals, question) => {
    if (question.options && Array.isArray(question.options)) {
      const maxForQuestion = {
        ka: Math.max(...question.options.map(opt => (opt.scores?.ka || 0))),
        ika: Math.max(...question.options.map(opt => (opt.scores?.ika || 0))),
        fa: Math.max(...question.options.map(opt => (opt.scores?.fa || 0))),
        ma: Math.max(...question.options.map(opt => (opt.scores?.ma || 0)))
      }

      totals.ka += maxForQuestion.ka
      totals.ika += maxForQuestion.ika
      totals.fa += maxForQuestion.fa
      totals.ma += maxForQuestion.ma
    }
    return totals
  }, { ka: 0, ika: 0, fa: 0, ma: 0 })

  console.log('Calculated max scores from questions:', maxScores)
  return maxScores
}

/**
 * Calculate percentage scores based on raw scores and max possible scores
 */
const calculatePercentageScores = (rawScores, maxScores) => {
  return {
    ka: maxScores.ka > 0 ? Math.round((rawScores.ka / maxScores.ka) * 100) : 0,
    ika: maxScores.ika > 0 ? Math.round((rawScores.ika / maxScores.ika) * 100) : 0,
    fa: maxScores.fa > 0 ? Math.round((rawScores.fa / maxScores.fa) * 100) : 0,
    ma: maxScores.ma > 0 ? Math.round((rawScores.ma / maxScores.ma) * 100) : 0
  }
}

/**
 * Determine recommended approach based on percentage scores
 * In case of ties, prioritize in order: KA, iKA, FA, MA
 */
const getRecommendedApproachFromPercentages = (percentageScores) => {
  const { ka, ika, fa, ma } = percentageScores
  const maxPercentage = Math.max(ka, ika, fa, ma)

  // Find the alignment with the highest percentage
  // Priority order in case of ties: KA > iKA > FA > MA
  if (ka === maxPercentage) return 'KA'
  if (ika === maxPercentage) return 'iKA'
  if (fa === maxPercentage) return 'FA'
  if (ma === maxPercentage) return 'MA'

  // Fallback (shouldn't happen)
  console.warn('Could not determine recommended approach, defaulting to KA')
  return 'KA'
}

/**
 * Get alignment display information
 */
const getAlignmentInfo = (alignmentKey) => {
  const alignmentMap = {
    'KA': { name: 'Kinematic Alignment', color: '#eb1700', colorScheme: 'red' },
    'ka': { name: 'Kinematic Alignment', color: '#eb1700', colorScheme: 'red' },
    'iKA': { name: 'Inverse Kinematic Alignment', color: '#ff6017', colorScheme: 'orange' },
    'ika': { name: 'Inverse Kinematic Alignment', color: '#ff6017', colorScheme: 'orange' },
    'FA': { name: 'Functional Alignment', color: '#0f68b2', colorScheme: 'blue' },
    'fa': { name: 'Functional Alignment', color: '#0f68b2', colorScheme: 'blue' },
    'MA': { name: 'Mechanical Alignment', color: '#328714', colorScheme: 'green' },
    'ma': { name: 'Mechanical Alignment', color: '#328714', colorScheme: 'green' }
  }

  return alignmentMap[alignmentKey] || {
    name: alignmentKey,
    color: '#6e6259',
    colorScheme: 'gray'
  }
}

/**
 * Validate questions data structure
 */
const validateQuestionsData = (questionsData) => {
  if (!questionsData || typeof questionsData !== 'object') {
    throw new Error('Questions data must be an object')
  }

  if (!Array.isArray(questionsData.questions)) {
    throw new Error('Questions data must contain a questions array')
  }

  for (const question of questionsData.questions) {
    if (!question.id || !question.question || !Array.isArray(question.options)) {
      throw new Error(`Invalid question structure: ${JSON.stringify(question)}`)
    }

    for (const option of question.options) {
      if (!option.id || !option.text || !option.scores) {
        throw new Error(`Invalid option structure: ${JSON.stringify(option)}`)
      }

      const requiredScores = ['ka', 'ika', 'fa', 'ma']
      for (const scoreKey of requiredScores) {
        if (typeof option.scores[scoreKey] !== 'number') {
          throw new Error(`Missing or invalid score for ${scoreKey} in option ${option.id}`)
        }
      }
    }
  }

  return true
}

/**
 * Get questions data with validation and caching
 */
const getQuestionsData = async () => {
  try {
    const questionsData = await loadQuestionsData()
    validateQuestionsData(questionsData)
    return questionsData
  } catch (error) {
    console.error('Error loading/validating questions data:', error)

    // Return minimal fallback data
    return {
      questions: [],
      metadata: {
        alignmentCategories: {
          ka: { name: "Kinematic Alignment", color: "#eb1700" },
          ika: { name: "Inverse Kinematic Alignment", color: "#ff6017" },
          fa: { name: "Functional Alignment", color: "#0f68b2" },
          ma: { name: "Mechanical Alignment", color: "#328714" }
        },
        maxScores: {
          ka: 20,
          ika: 20,
          fa: 20,
          ma: 20
        }
      }
    }
  }
}

/**
 * Clear questions data cache (useful for testing or reloading)
 */
const clearQuestionsCache = () => {
  questionsDataCache = null
}

module.exports = {
  loadQuestionsData,
  calculateMaxScores,
  calculatePercentageScores,
  getRecommendedApproachFromPercentages,
  getAlignmentInfo,
  validateQuestionsData,
  getQuestionsData,
  clearQuestionsCache
}