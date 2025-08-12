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
const pdfRoutes = require('./routes/pdf')
const questionsRoutes = require('./routes/questions');

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

// Dynamic CORS configuration based on environment
const getCorsOrigins = () => {
  const nodeEnv = process.env.NODE_ENV || 'development'

  switch (nodeEnv) {
    case 'development':
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite default
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173'
      ]

    case 'staging':
      const stagingOrigins = [
        'https://previews.s4stage.com',
        'http://previews.s4stage.com'
      ]

      // Add frontend URL if specified and different from defaults
      if (process.env.FRONTEND_URL) {
        try {
          const frontendUrl = new URL(process.env.FRONTEND_URL)
          const frontendOrigin = `${frontendUrl.protocol}//${frontendUrl.host}`

          if (!stagingOrigins.includes(frontendOrigin)) {
            stagingOrigins.push(frontendOrigin)
          }
        } catch (error) {
          console.warn('Invalid FRONTEND_URL in staging:', process.env.FRONTEND_URL)
        }
      }

      return stagingOrigins

    case 'production':
      const productionOrigins = []

      // In production, only allow specified frontend URL
      if (process.env.FRONTEND_URL) {
        try {
          const frontendUrl = new URL(process.env.FRONTEND_URL)
          const frontendOrigin = `${frontendUrl.protocol}//${frontendUrl.host}`
          productionOrigins.push(frontendOrigin)
        } catch (error) {
          console.error('Invalid FRONTEND_URL in production:', process.env.FRONTEND_URL)
        }
      }

      // Fallback for production if no frontend URL specified
      if (productionOrigins.length === 0) {
        console.warn('No valid FRONTEND_URL specified for production, using default')
        productionOrigins.push('https://your-production-domain.com')
      }

      return productionOrigins

    default:
      console.warn(`Unknown NODE_ENV: ${nodeEnv}, using development origins`)
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
      ]
  }
}

// CORS configuration with environment-based origins
const allowedOrigins = getCorsOrigins()

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS: Origin not allowed: ${origin}`)
      console.warn(`CORS: Allowed origins:`, allowedOrigins)
      callback(new Error(`Origin ${origin} not allowed by CORS policy`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  optionsSuccessStatus: 200
}

console.log('=== CORS CONFIGURATION ===')
console.log('Environment:', process.env.NODE_ENV || 'development')
console.log('Allowed Origins:', allowedOrigins)
console.log('Frontend URL:', process.env.FRONTEND_URL)
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
    rolling: true, // Extend session on each request
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

// Enhanced debug CORS endpoint
app.get('/api/debug-cors', (req, res) => {
  res.json({
    message: 'Dynamic CORS Debug',
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowedOrigins,
    requestOrigin: req.get('Origin'),
    frontendUrlRaw: process.env.FRONTEND_URL,
    corsOriginAllowed: allowedOrigins.includes(req.get('Origin')),
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
      allowedOrigins: allowedOrigins
    })
  })
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/glossary', glossaryRoutes)
app.use('/api/pdf', pdfRoutes)
app.use('/api/questions', questionsRoutes)

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
      allowedOrigins: allowedOrigins
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
      console.log(`🔍 CORS debug: http://localhost:${PORT}/api/debug-cors`)
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