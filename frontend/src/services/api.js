// frontend/src/services/api.js
import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for session cookies
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers,
    })
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or show auth error
      console.warn('Unauthorized access - user may need to log in')
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.warn('Access forbidden - insufficient permissions')
    } else if (error.response?.status === 404) {
      // Not found
      console.warn('Resource not found')
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred')
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Request timeout')
    } else if (error.message === 'Network Error') {
      // Network error (CORS, server down, etc.)
      console.error('Network error - check if server is running and CORS is configured')
    }

    return Promise.reject(error)
  }
)

// Helper functions for common API operations
export const apiHelpers = {
  // Get request with error handling
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Post request with error handling
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Put request with error handling
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Delete request with error handling
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // Centralized error handling
  handleError(error) {
    let message = 'An unexpected error occurred'
    let details = {}

    if (error.response) {
      // Server responded with error status
      message = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`
      details = {
        status: error.response.status,
        data: error.response.data,
      }
    } else if (error.request) {
      // Request was made but no response received
      message = 'Unable to connect to server. Please check your internet connection.'
      details = { request: error.request }
    } else {
      // Something else happened
      message = error.message || 'An unexpected error occurred'
      details = { error: error.message }
    }

    // Create enhanced error object
    const enhancedError = new Error(message)
    enhancedError.details = details
    enhancedError.originalError = error

    return enhancedError
  }
}

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/test-cors')
    return {
      healthy: true,
      data: response.data,
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      details: error.response?.data,
    }
  }
}

// Test authentication
export const testAuth = async () => {
  try {
    const response = await api.get('/auth/me')
    return {
      authenticated: true,
      user: response.data.user,
    }
  } catch (error) {
    return {
      authenticated: false,
      error: error.message,
    }
  }
}

// Default export is the axios instance
export default api