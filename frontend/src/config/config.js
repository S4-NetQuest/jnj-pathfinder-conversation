// frontend/src/config/config.js
const config = {
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Pathfinder Conversation Guide',
  BASE_URL: import.meta.env.VITE_BASE_URL || '/',

  // Derived properties
  get isDevelopment() {
    return this.NODE_ENV === 'development'
  },

  get isStaging() {
    return this.NODE_ENV === 'staging'
  },

  get isProduction() {
    return this.NODE_ENV === 'production'
  },

  get showDevFeatures() {
    return false
    /* return this.isDevelopment || this.isStaging */
  }
}

// Validate required environment variables
const requiredVars = ['VITE_API_URL']
const missingVars = requiredVars.filter(varName => !import.meta.env[varName])

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
}

// Log config in non-production environments
if (!config.isProduction) {
  console.log('App Config:', {
    NODE_ENV: config.NODE_ENV,
    API_URL: config.API_URL,
    BASE_URL: config.BASE_URL,
    APP_TITLE: config.APP_TITLE
  })
}

export default config