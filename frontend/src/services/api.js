import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)

    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error - Backend may not be running or CORS issue')
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Don't redirect here since we might not be authenticated yet
    }
    return Promise.reject(error)
  }
)

export default api