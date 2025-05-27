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

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true,
}))

app.use(limiter)
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pathfinder-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
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
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)

  // Test database connection
  dbConfig.testConnection()
    .then(() => console.log('Database connection successful'))
    .catch(err => console.error('Database connection failed:', err.message))
})