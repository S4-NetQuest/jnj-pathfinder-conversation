import { useState, useEffect } from 'react'
import { loadQuestions } from '../services/questionsService'

export const useQuestions = () => {
  const [questionsData, setQuestionsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeQuestions = async () => {
      try {
        setLoading(true)
        setError(null)
        const questions = await loadQuestions()
        setQuestionsData(questions)
      } catch (err) {
        console.error('Failed to load questions:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeQuestions()
  }, [])

  const refresh = async () => {
    // Clear cache and reload
    const { clearQuestionsCache } = await import('../services/questionsService')
    clearQuestionsCache()

    try {
      setLoading(true)
      setError(null)
      const questions = await loadQuestions()
      setQuestionsData(questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    questionsData,
    questions: questionsData?.questions || [],
    alignmentTypes: questionsData?.metadata?.alignmentCategories || {},
    loading,
    error,
    refresh
  }
}