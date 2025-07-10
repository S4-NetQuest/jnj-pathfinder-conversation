# Pathfinder Backend Deployment Guide

## Overview

The Pathfinder Backend has been converted to CommonJS format to be compatible with iisnode on IIS. This guide covers deployment for different environments.

## Environment Configuration

The application uses `env-cmd` to manage environment-specific configurations. Three environment files are supported:

- `.env.development` - Local development
- `.env.staging` - Staging server
- `.env.production` - Production server

## Package.json Scripts

```bash
# Development
npm run dev              # Start with nodemon using .env.development
npm run dev:local        # Start without nodemon using .env.development

# Staging
npm run start:staging    # Start using .env.staging

# Production
npm start               # Start using default .env or environment variables
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the appropriate environment file and update the values:

```bash
# For development
cp .env.development.example .env.development
# Edit .env.development with your local database settings

# For staging
cp .env.staging.example .env.staging
# Edit .env.staging with your staging database settings
```

### 3. Start the Server

```bash
# Development
npm run dev

# Staging
npm run start:staging
```

## Deployment Helper Script

A deployment helper script is provided to streamline common tasks:

```bash
# Install dependencies
node deploy.js install

# Validate environment configuration
node deploy.js validate development
node deploy.js validate staging

# Start server
node deploy.js start development
node deploy.js start staging

# Build for deployment
node deploy.js build production

# Show help
node deploy.js help
```

## IIS Deployment (Windows Server)

### Prerequisites

1. **Windows Server** with IIS installed
2. **Node.js** installed on the server
3. **iisnode** module installed
4. **SQL Server** accessible from the server

### Steps

1. **Prepare the Application**

```bash
# Build for production
node deploy.js build production

# Or manually:
npm install --production
cp .env.production .env
```

2. **Copy Files to Server**

Copy the following files/folders to your IIS application directory:
- All `.js` files
- `package.json`
- `node_modules/` folder
- `.env` file (configured for production)
- `web.config` file

3. **Configure web.config**

The provided `web.config` file includes:
- iisnode configuration
- URL rewriting rules
- CORS headers
- Error handling

Key settings in web.config:
```xml
<iisnode
  node_env="production"
  debuggingEnabled="false"
  loggingEnabled="true"
  watchedFiles="web.config;*.js;*.json"
/>
```

4. **Set Up IIS Application**

- Create a new application in IIS Manager
- Point it to your application directory
- Ensure the application pool uses "No Managed Code"
- Verify iisnode is handling `.js` files

5. **Configure Database Connection**

Update `.env.production` with your production database settings:
```bash
DB_SERVER=your-production-sql-server
DB_PORT=1433
DB_NAME=JNJ-PATHFINDER-CONVERSATION
DB_USER=your-production-db-user
DB_PASSWORD=your-secure-password
DB_ENCRYPT=true
DB_TRUST_CERT=false
```

6. **Test the Deployment**

Visit `http://your-server/health` to verify the application is running.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `80` or `4343` |
| `DB_SERVER` | SQL Server instance | `MYSERVER\\SQLEXPRESS` |
| `DB_PORT` | Database port | `1433` |
| `DB_NAME` | Database name | `JNJ-PATHFINDER-CONVERSATION` |
| `DB_USER` | Database username | `sa` |
| `DB_PASSWORD` | Database password | `SecurePassword123!` |
| `SESSION_SECRET` | Session encryption key | `32+ character random string` |

### Optional Variables

| Variable | Description | Default | Production Recommended |
|----------|-------------|---------|----------------------|
| `FRONTEND_URL` | Frontend application URL | - | `https://your-domain.com` |
| `DB_ENCRYPT` | Enable SQL encryption | `false` | `true` |
| `DB_TRUST_CERT` | Trust self-signed certs | `true` | `false` |
| `ENABLE_SAML` | Enable SAML SSO | `false` | `true` |
| `ENABLE_MANUAL_LOGIN` | Enable dev login | `true` | `false` |
| `HTTPS_ENABLED` | Enable HTTPS features | `false` | `true` |
| `USE_SQL_SESSION_STORE` | Use SQL for sessions | `false` | `true` |
| `ENABLE_RATE_LIMITING` | Enable rate limiting | `false` | `true` |
| `LOG_LEVEL` | Logging verbosity | `info` | `warn` |

## Security Checklist

### Development
- [ ] Database accessible from development machine
- [ ] Session secret set (can be simple)
- [ ] CORS configured for localhost

### Staging
- [ ] Database accessible from staging server
- [ ] Unique session secret
- [ ] CORS configured for staging domain
- [ ] Rate limiting enabled
- [ ] HTTPS configured (recommended)

### Production
- [ ] Secure database connection (encrypted)
- [ ] Strong session secret (32+ characters)
- [ ] CORS limited to production domain only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] SQL session store enabled
- [ ] SAML SSO configured
- [ ] Manual login disabled
- [ ] Monitoring and logging configured
- [ ] Regular security updates planned

## Troubleshooting

### Common Issues

1. **Database Connection Fails**
   - Verify SQL Server is running and accessible
   - Check firewall settings
   - Validate connection string format
   - Test with SQL Management Studio

2. **CORS Errors**
   - Update `FRONTEND_URL` in environment file
   - Check browser network tab for exact origin
   - Verify IIS CORS headers in web.config

3. **Session Issues**
   - Ensure `SESSION_SECRET` is set
   - Check cookie settings for HTTPS
   - Verify session store configuration

4. **iisnode Errors**
   - Check iisnode logs in `/iisnode` folder
   - Verify Node.js is properly installed
   - Ensure web.config is correctly configured
   - Check application pool settings

### Logging

Logs are available in different locations:

- **Development**: Console output
- **IIS**: Check `iisnode` folder in application directory
- **Application logs**: Configured via `LOG_LEVEL` environment variable

### Health Checks

Monitor these endpoints:

- `/health` - Basic health check
- `/api/test-cors` - CORS configuration test
- `/api/env-info` - Environment info (development only)

## Updates and Maintenance

1. **Regular Updates**
   - Update Node.js dependencies: `npm update`
   - Review security advisories: `npm audit`
   - Test in staging before production deployment

2. **Database Migrations**
   - Plan and test database schema changes
   - Backup database before major updates
   - Use transaction-based migrations

3. **Monitoring**
   - Set up application performance monitoring
   - Monitor database connection health
   - Track error rates and response times
   - Set up alerts for critical issues

## Support

For deployment issues:

1. Check the logs first
2. Verify environment configuration with `node deploy.js validate [env]`
3. Test database connectivity separately
4. Review IIS and iisnode documentation
5. Consult the main application README for application-specific issues