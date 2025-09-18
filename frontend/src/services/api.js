// frontend/src/services/api.js
import axios from 'axios'
import config from '../config/config.js'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      })
    }

    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }

    return response
  },
  (error) => {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    const errorStatus = error.response?.status

    console.error('API Response Error:', {
      message: errorMessage,
      status: errorStatus,
      url: error.config?.url,
      method: error.config?.method
    })

    // Handle specific error cases
    if (errorStatus === 401) {
      // Unauthorized - redirect to login or clear auth state
      console.warn('Unauthorized access - user may need to re-authenticate')
    } else if (errorStatus === 403) {
      // Forbidden
      console.warn('Access forbidden - insufficient permissions')
    } else if (errorStatus >= 500) {
      // Server error
      console.error('Server error - please try again later')
    }

    return Promise.reject(error)
  }
)

export default api