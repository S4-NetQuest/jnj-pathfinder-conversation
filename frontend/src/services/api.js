// frontend/src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST ===')
    console.log('URL:', config.url)
    console.log('Method:', config.method?.toUpperCase())
    console.log('Base URL:', config.baseURL)
    console.log('Full URL:', `${config.baseURL}${config.url}`)
    console.log('Headers:', config.headers)
    console.log('Data:', config.data)
    console.log('Params:', config.params)
    console.log('With Credentials:', config.withCredentials)
    console.log('=== END REQUEST ===')
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Headers:', response.headers)
    console.log('Data:', response.data)
    console.log('=== END RESPONSE ===')
    return response
  },
  (error) => {
    console.error('=== API ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Request config:', error.config)

    if (error.response) {
      // Server responded with error status
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received')
      console.error('Request:', error.request)
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message)
    }
    console.error('=== END API ERROR ===')

    return Promise.reject(error)
  }
)

export default api