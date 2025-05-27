// SAML SSO Configuration (Optional - only loads if dependencies are available)
import { config } from 'dotenv'
import dbConfig from './database.js'

config()

let passport = null
let SamlStrategy = null

// Only initialize SAML if explicitly enabled and dependencies are available
if (process.env.ENABLE_SAML === 'true') {
  try {
    const passportModule = await import('passport')
    const samlModule = await import('passport-saml')
    
    passport = passportModule.default
    SamlStrategy = samlModule.Strategy

    console.log('SAML authentication enabled')
    
    // SAML Configuration
    const samlConfig = {
      callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:5000/api/auth/saml/callback',
      entryPoint: process.env.SAML_ENTRY_POINT || 'https://your-idp.com/sso/saml',
      issuer: process.env.SAML_ISSUER || 'pathfinder-app',
      cert: process.env.SAML_CERT || null, // IdP certificate
      privateCert: process.env.SAML_PRIVATE_CERT || null, // Optional: private certificate for signing
      signatureAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      wantAssertionsSigned: false,
      wantAuthnResponseSigned: false,
      acceptedClockSkewMs: -1,
      attributeConsumingServiceIndex: false,
      disableRequestedAuthnContext: true,
      race: false,
      validateInResponseTo: false,
    }

    // SAML Strategy
    passport.use('saml', new SamlStrategy(
      samlConfig,
      async (profile, done) => {
        try {
          // Extract user information from SAML profile
          const userData = {
            id: profile.nameID || profile.email,
            email: profile.email || profile.nameID,
            name: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName,
            firstName: profile.firstName || profile.givenName,
            lastName: profile.lastName || profile.surname,
            role: 'sales_rep', // All SAML users are sales reps
            department: profile.department,
            company: profile.company,
          }

          // Check if user exists in database, create if not
          const pool = dbConfig.getPool()
          const userQuery = `
            SELECT * FROM users 
            WHERE email = @email AND role = 'sales_rep'
          `
          
          let result = await pool.request()
            .input('email', dbConfig.sql.VarChar, userData.email)
            .query(userQuery)

          if (result.recordset.length === 0) {
            // Create new user
            const insertQuery = `
              INSERT INTO users (email, name, first_name, last_name, role, department, company, created_at, updated_at)
              OUTPUT INSERTED.*
              VALUES (@email, @name, @firstName, @lastName, @role, @department, @company, GETDATE(), GETDATE())
            `
            
            result = await pool.request()
              .input('email', dbConfig.sql.VarChar, userData.email)
              .input('name', dbConfig.sql.VarChar, userData.name)
              .input('firstName', dbConfig.sql.VarChar, userData.firstName)
              .input('lastName', dbConfig.sql.VarChar, userData.lastName)
              .input('role', dbConfig.sql.VarChar, userData.role)
              .input('department', dbConfig.sql.VarChar, userData.department)
              .input('company', dbConfig.sql.VarChar, userData.company)
              .query(insertQuery)
          } else {
            // Update existing user
            const updateQuery = `
              UPDATE users 
              SET name = @name, first_name = @firstName, last_name = @lastName, 
                  department = @department, company = @company, updated_at = GETDATE()
              OUTPUT INSERTED.*
              WHERE email = @email AND role = 'sales_rep'
            `
            
            result = await pool.request()
              .input('email', dbConfig.sql.VarChar, userData.email)
              .input('name', dbConfig.sql.VarChar, userData.name)
              .input('firstName', dbConfig.sql.VarChar, userData.firstName)
              .input('lastName', dbConfig.sql.VarChar, userData.lastName)
              .input('department', dbConfig.sql.VarChar, userData.department)
              .input('company', dbConfig.sql.VarChar, userData.company)
              .query(updateQuery)
          }

          const user = result.recordset[0]
          return done(null, user)
        } catch (error) {
          console.error('SAML authentication error:', error)
          return done(error, null)
        }
      }
    ))

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, { id: user.id, role: user.role })
    })

    // Deserialize user from session
    passport.deserializeUser(async (sessionUser, done) => {
      try {
        const pool = dbConfig.getPool()
        const query = 'SELECT * FROM users WHERE id = @id'
        
        const result = await pool.request()
          .input('id', dbConfig.sql.Int, sessionUser.id)
          .query(query)

        if (result.recordset.length > 0) {
          done(null, result.recordset[0])
        } else {
          done(new Error('User not found'), null)
        }
      } catch (error) {
        console.error('User deserialization error:', error)
        done(error, null)
      }
    })

  } catch (error) {
    console.warn('SAML dependencies not available:', error.message)
    console.log('Running in manual authentication mode only')
  }
} else {
  console.log('SAML authentication disabled - using manual authentication only')
}

export default passport