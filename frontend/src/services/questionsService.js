import api from './api'

let cachedQuestions = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const loadQuestions = async () => {
  // Return cached data if still valid
  if (cachedQuestions && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('Using cached questions')
    return cachedQuestions
  }

  try {
    console.log('Loading questions from API...')
    const response = await api.get('/questions')

    if (response.data.success) {
      cachedQuestions = response.data.questions
      cacheTimestamp = Date.now()
      console.log('Questions loaded successfully from API')
      return cachedQuestions
    } else {
      throw new Error('API returned success: false')
    }
  } catch (error) {
    console.error('Error loading questions from API:', error)

    // Fallback to local file if API fails
    try {
      console.log('Falling back to local questions file...')
      const localQuestions = await import('../data/questions.json')
      console.log('Using local questions as fallback')
      return localQuestions.default
    } catch (localError) {
      console.error('Error loading local questions:', localError)
      throw new Error('Failed to load questions from both API and local file')
    }
  }
}

// Clear cache (useful for testing or when questions are updated)
export const clearQuestionsCache = () => {
  cachedQuestions = null
  cacheTimestamp = null
  console.log('Questions cache cleared')
}

// Preload questions (call this in your App.js)
export const preloadQuestions = async () => {
  try {
    await loadQuestions()
    console.log('Questions preloaded successfully')
  } catch (error) {
    console.error('Failed to preload questions:', error)
  }
}