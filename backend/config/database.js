import sql from 'mssql'
import { config } from 'dotenv'

config()

const dbConfig = {
  user: process.env.DB_USER || 'pathfinder_user',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'JNJ-PATHFINDER-CONVERSATION',
  port: parseInt(process.env.DB_PORT) || 1434,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// Connection pool
let pool = null

const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig)
      console.log('Connected to SQL Server database')
    }
    return pool
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

const closeDB = async () => {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('Database connection closed')
    }
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.')
  }
  return pool
}

const testConnection = async () => {
  try {
    const testPool = await connectDB()
    const result = await testPool.request().query('SELECT 1 as test')
    return result.recordset[0].test === 1
  } catch (error) {
    throw new Error(`Database connection test failed: ${error.message}`)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await closeDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await closeDB()
  process.exit(0)
})

export default {
  connectDB,
  closeDB,
  getPool,
  testConnection,
  sql,
}

export { sql }