// backend/server.js (CommonJS with env-cmd support)
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const session = require('express-session')
const rateLimit = require('express-rate-limit')
const path = require('path')

// Load environment variables - dotenv is still needed for fallback
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/auth')
const conversationRoutes = require('./routes/conversations')
const userRoutes = require('./routes/users')
const glossaryRoutes = require('./routes/glossary')

// Import database configuration
const dbConfig = require('./config/database')

// Only import passport if SAML is enabled
let passport = null
if (process.env.ENABLE_SAML === 'true') {
  try {
    passport = require('passport')
    // Import passport configuration only if SAML is enabled
    require('./config/passport')
    console.log('SAML authentication initialized')
  } catch (error) {
    console.warn('SAML not configured, using manual authentication only:', error.message)
  }
} else {
  console.log('SAML authentication disabled - using manual authentication only')
}

const app = express()
const PORT = process.env.PORT || 5000

// Read environment variables from IIS appSettings if available
if (process.platform === 'win32' && process.env.IISNODE_VERSION) {
  console.log('Running under IIS, reading appSettings...')
  // IIS automatically maps appSettings to process.env
}

// Environment logging
console.log('=== ENVIRONMENT CONFIGURATION ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', PORT)
console.log('FRONTEND_URL:', process.env.FRONTEND_URL)
console.log('DB_SERVER:', process.env.DB_SERVER)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('ENABLE_MANUAL_LOGIN:', process.env.ENABLE_MANUAL_LOGIN)
console.log('ENABLE_SAML:', process.env.ENABLE_SAML)
console.log('================================')

// Rate limiting configuration from environment
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000 // 15 minutes default
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // 100 requests default

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// SIMPLIFIED CORS configuration to prevent duplicate headers
const getStagingOrigin = () => {
  // Extract just the origin from FRONTEND_URL if it exists
  if (process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL)
      return `${url.protocol}//${url.host}`
    } catch (error) {
      console.warn('Invalid FRONTEND_URL:', process.env.FRONTEND_URL)
    }
  }

  // Default staging origin
  return 'https://previews.s4stage.com'
}

// Simple CORS configuration - single origin for staging
const corsOptions = {
  origin: getStagingOrigin(), // Single origin, not an array or function
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
}

console.log('=== CORS CONFIGURATION ===')
console.log('CORS Origin:', corsOptions.origin)
console.log('===========================')

// Apply CORS middleware
app.use(cors(corsOptions))

// Explicit preflight handling
app.options('*', cors(corsOptions))

// Helmet configuration - more restrictive in production
const helmetOptions = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}

if (process.env.NODE_ENV === 'development') {
  // More relaxed security for development
  helmetOptions.hsts = false
}

app.use(helmet(helmetOptions))

// Apply rate limiting (skip in development if desired)
if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_RATE_LIMITING === 'true') {
  app.use(limiter)
  console.log(`Rate limiting enabled: ${rateLimitMaxRequests} requests per ${rateLimitWindowMs}ms`)
} else {
  console.log('Rate limiting disabled for development')
}

// Logging configuration
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(morgan(morganFormat))

// Body parsing middleware
const maxFileSize = process.env.MAX_FILE_SIZE || '10mb'
app.use(express.json({ limit: maxFileSize }))
app.use(express.urlencoded({ extended: true, limit: maxFileSize }))

// Session configuration with environment-specific settings
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'pathfinder-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'pathfinder.session',
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.HTTPS_ENABLED === 'true',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}

// For production, you might want to use SQL Server session store
if (process.env.NODE_ENV === 'production' && process.env.USE_SQL_SESSION_STORE === 'true') {
  try {
    const MSSQLStore = require('connect-mssql-v2')(session)
    sessionConfig.store = new MSSQLStore({
      server: process.env.DB_SERVER,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 1433,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
      },
    })
    console.log('Using SQL Server session store')
  } catch (error) {
    console.warn('Could not initialize SQL Server session store, using memory store:', error.message)
  }
}

app.use(session(sessionConfig))

// Passport middleware (only if SAML is enabled)
if (passport) {
  app.use(passport.initialize())
  app.use(passport.session())
  console.log('Passport middleware initialized')
}

// Request logging middleware (only in development unless explicitly enabled)
if (process.env.NODE_ENV === 'development' || process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('Headers:', req.headers)
      console.log('Origin:', req.get('Origin'))
      console.log('Session ID:', req.sessionID)
      console.log('Session:', req.session)
    }
    next()
  })
}

// Health check endpoint with environment info
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version,
    cors: 'enabled',
    session: !!req.sessionID,
    database: 'connected', // You could add actual DB health check here
    saml: process.env.ENABLE_SAML === 'true' ? 'enabled' : 'disabled'
  })
})

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.get('Origin'),
    sessionId: req.sessionID,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// Simplified debug CORS endpoint
app.get('/api/debug-cors', (req, res) => {
  res.json({
    message: 'Simplified CORS Debug',
    configuredOrigin: corsOptions.origin,
    requestOrigin: req.get('Origin'),
    nodeEnv: process.env.NODE_ENV,
    frontendUrlRaw: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString()
  })
})

// Environment info endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/env-info', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      FRONTEND_URL: process.env.FRONTEND_URL,
      DB_SERVER: process.env.DB_SERVER,
      DB_NAME: process.env.DB_NAME,
      ENABLE_MANUAL_LOGIN: process.env.ENABLE_MANUAL_LOGIN,
      ENABLE_SAML: process.env.ENABLE_SAML,
      corsOrigin: corsOptions.origin
    })
  })
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/glossary', glossaryRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(staticPath))
  console.log('Serving static files from:', staticPath)

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== ERROR ===')
  console.error('Error:', err.message)
  console.error('Stack:', err.stack)
  console.error('Request URL:', req.url)
  console.error('Request Method:', req.method)

  if (process.env.LOG_LEVEL === 'debug') {
    console.error('Request Headers:', req.headers)
  }
  console.error('=============')

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin request blocked',
      origin: req.get('Origin'),
      allowedOrigin: corsOptions.origin
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message,
    })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication credentials',
    })
  }

  const isDevelopment = process.env.NODE_ENV !== 'production'

  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && {
      stack: err.stack,
      details: err.details
    }),
  })
})

// 404 handler
app.use((req, res) => {
  console.log('404 - Not Found:', req.method, req.url)
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Start server and initialize database
const startServer = async () => {
  try {
    console.log('=== STARTING SERVER ===')
    console.log('Environment:', process.env.NODE_ENV || 'development')
    console.log('Port:', PORT)

    // Initialize database connection
    console.log('Connecting to database...')
    await dbConfig.connectDB()
    console.log('✅ Database connection established')

    // Test database connection
    const isConnected = await dbConfig.testConnection()
    if (isConnected) {
      console.log('✅ Database connection test passed')
    } else {
      throw new Error('Database connection test failed')
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server running successfully!')
      console.log(`📡 Port: ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/health`)
      console.log(`🧪 CORS test: http://localhost:${PORT}/api/test-cors`)
      if (process.env.FRONTEND_URL) {
        console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`)
      }
      console.log('======================')
    })

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`)

      server.close(async (err) => {
        if (err) {
          console.error('Error during server shutdown:', err)
          process.exit(1)
        }

        console.log('HTTP server closed.')

        try {
          await dbConfig.closeDB()
          console.log('Database connection closed.')
          console.log('Graceful shutdown completed.')
          process.exit(0)
        } catch (dbError) {
          console.error('Error closing database:', dbError)
          process.exit(1)
        }
      })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

startServer()