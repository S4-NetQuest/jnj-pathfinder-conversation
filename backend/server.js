// backend/server.js (Fixed CORS Configuration)
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Import routes
import authRoutes from './routes/auth.js'
import conversationRoutes from './routes/conversations.js'
import userRoutes from './routes/users.js'
import glossaryRoutes from './routes/glossary.js'

// Import database configuration
import dbConfig from './config/database.js'

// Only import passport if SAML is enabled
let passport = null
if (process.env.ENABLE_SAML === 'true') {
  try {
    const passportModule = await import('passport')
    passport = passportModule.default
    // Import passport configuration only if SAML is enabled
    await import('./config/passport.js')
  } catch (error) {
    console.warn('SAML not configured, using manual authentication only')
  }
}

config() // Load environment variables

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// IMPORTANT: Set up CORS BEFORE other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    ]

    // In production, use environment variable
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL)
    }

    console.log('CORS Check - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin))

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
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
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

// Handle preflight requests explicitly
app.options('*', cors(corsOptions))

// Helmet configuration (relaxed for development)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}))

app.use(limiter)
app.use(morgan('combined'))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pathfinder-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'pathfinder.session', // Custom session name
  cookie: {
    secure: false, // Set to false for development (HTTP)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Important for cross-origin requests
  },
  // Uncomment and configure for production SQL Server session store
  //   store: new (require('connect-mssql-v2'))(session)({
  //     server: process.env.DB_SERVER,
  //     user: process.env.DB_USER,
  //     password: process.env.DB_PASSWORD,
  //     database: process.env.DB_NAME,
  //     options: {
  //       encrypt: process.env.DB_ENCRYPT === 'true',
  //       trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  //     },
  //   }),
}))

// Passport middleware (only if SAML is enabled)
if (passport) {
  app.use(passport.initialize())
  app.use(passport.session())
}

// Middleware to log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  console.log('Headers:', req.headers)
  console.log('Origin:', req.get('Origin'))
  console.log('Session ID:', req.sessionID)
  console.log('Session:', req.session)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    session: !!req.sessionID
  })
})

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.get('Origin'),
    sessionId: req.sessionID,
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/glossary', glossaryRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../frontend/dist')))

  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  console.error('Request URL:', req.url)
  console.error('Request Method:', req.method)
  console.error('Request Headers:', req.headers)

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin request blocked',
      origin: req.get('Origin')
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

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

// 404 handler
app.use((req, res) => {
  console.log('404 - Not Found:', req.method, req.url)
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    url: req.url,
    method: req.method
  })
})

// Start server and initialize database
const startServer = async () => {
  try {
    // Initialize database connection
    await dbConfig.connectDB()
    console.log('Database connection established')

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`CORS enabled for development origins`)
      console.log(`Health check: http://localhost:${PORT}/health`)
      console.log(`CORS test: http://localhost:${PORT}/api/test-cors`)
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()