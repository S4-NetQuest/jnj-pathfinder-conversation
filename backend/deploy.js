#!/usr/bin/env node

/**
 * Deployment helper script for Pathfinder Backend
 * Helps with environment-specific deployments and custom Node.js versions
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const os = require('os')

const environments = {
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production'
}

// Custom Node.js paths for different environments
const nodePathConfig = {
  development: {
    nodePath: null, // Use system default
    npmPath: null   // Use system default
  },
  staging: {
    nodePath: 'C:\\Program Files\\nodejs_other\\nodejs_v22.16.0\\node.exe',
    npmPath: 'C:\\Program Files\\nodejs_other\\nodejs_v22.16.0\\npm.cmd'
  },
  production: {
    nodePath: null, // Configure as needed for production
    npmPath: null   // Configure as needed for production
  }
}

function getNodePaths(env) {
  const config = nodePathConfig[env] || {}
  
  // For Windows, use .cmd extension for npm, otherwise use default
  const isWindows = os.platform() === 'win32'
  
  return {
    node: config.nodePath || 'node',
    npm: config.npmPath || (isWindows ? 'npm.cmd' : 'npm')
  }
}

function executeCommand(command, env = 'development', options = {}) {
  const paths = getNodePaths(env)
  
  // Replace npm/node commands with custom paths
  let finalCommand = command
  if (command.startsWith('npm ')) {
    finalCommand = command.replace(/^npm /, `"${paths.npm}" `)
  } else if (command.startsWith('node ')) {
    finalCommand = command.replace(/^node /, `"${paths.node}" `)
  }
  
  console.log(`🔧 Executing: ${finalCommand}`)
  
  try {
    const result = execSync(finalCommand, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    })
    return result
  } catch (error) {
    console.error(`❌ Command failed: ${finalCommand}`)
    throw error
  }
}

function checkNodeVersion(env) {
  const paths = getNodePaths(env)
  
  console.log(`🔍 Checking Node.js version for ${env} environment...`)
  
  try {
    // Check if custom Node.js path exists
    if (paths.node !== 'node' && !fs.existsSync(paths.node)) {
      console.error(`❌ Custom Node.js binary not found: ${paths.node}`)
      console.log('Please verify the Node.js installation path.')
      return false
    }
    
    // Check if custom NPM path exists
    if (paths.npm !== 'npm' && paths.npm !== 'npm.cmd' && !fs.existsSync(paths.npm)) {
      console.error(`❌ Custom NPM binary not found: ${paths.npm}`)
      console.log('Please verify the NPM installation path.')
      return false
    }
    
    // Get Node.js version
    const nodeVersion = executeCommand(`node --version`, env, { silent: true }).trim()
    console.log(`✅ Node.js version: ${nodeVersion}`)
    console.log(`📍 Node.js path: ${paths.node}`)
    
    // Get NPM version
    const npmVersion = executeCommand(`npm --version`, env, { silent: true }).trim()
    console.log(`✅ NPM version: ${npmVersion}`)
    console.log(`📍 NPM path: ${paths.npm}`)
    
    // Check if this is a supported Node.js version
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0])
    if (majorVersion < 18) {
      console.warn(`⚠️  Warning: Node.js ${nodeVersion} is older than recommended (18+)`)
    }
    
    return true
  } catch (error) {
    console.error(`❌ Failed to check Node.js version:`, error.message)
    return false
  }
}

function showUsage() {
  console.log('\n🚀 Pathfinder Backend Deployment Helper\n')
  console.log('Usage: node deploy.js [command] [environment]\n')
  console.log('Commands:')
  console.log('  install     - Install dependencies')
  console.log('  start       - Start server with specified environment')
  console.log('  build       - Prepare for deployment')
  console.log('  validate    - Validate environment configuration')
  console.log('  check-node  - Check Node.js/NPM versions for environment')
  console.log('  config      - Show Node.js path configuration')
  console.log('  help        - Show this help message\n')
  console.log('Environments:')
  console.log('  development - Local development (system Node.js)')
  console.log('  staging     - Staging server (custom Node.js v22.16.0)')
  console.log('  production  - Production server\n')
  console.log('Examples:')
  console.log('  node deploy.js install')
  console.log('  node deploy.js start development')
  console.log('  node deploy.js check-node staging')
  console.log('  node deploy.js validate staging')
  console.log('  node deploy.js build production\n')
  console.log('Custom Node.js Paths:')
  Object.entries(nodePathConfig).forEach(([env, config]) => {
    console.log(`  ${env}:`)
    console.log(`    Node: ${config.nodePath || 'system default'}`)
    console.log(`    NPM:  ${config.npmPath || 'system default'}`)
  })
}

function showNodeConfig() {
  console.log('\n🔧 Node.js Path Configuration\n')
  
  Object.entries(nodePathConfig).forEach(([env, config]) => {
    console.log(`📁 ${env.toUpperCase()} Environment:`)
    console.log(`   Node.js: ${config.nodePath || 'system default'}`)
    console.log(`   NPM:     ${config.npmPath || 'system default'}`)
    
    if (config.nodePath || config.npmPath) {
      console.log(`   Status:  Custom paths configured`)
    } else {
      console.log(`   Status:  Using system defaults`)
    }
    console.log('')
  })
  
  console.log('💡 To modify paths, edit the nodePathConfig object in deploy.js')
}

function validateEnvironment(env) {
  const envFile = environments[env]
  if (!envFile) {
    console.error(`❌ Invalid environment: ${env}`)
    console.log('Valid environments:', Object.keys(environments).join(', '))
    process.exit(1)
  }

  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`)
    console.log('Please create this file based on the template.')
    process.exit(1)
  }

  console.log(`✅ Environment file found: ${envFile}`)
  
  // Read and validate key environment variables
  const envContent = fs.readFileSync(envFile, 'utf8')
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_SERVER',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'SESSION_SECRET'
  ]

  const missingVars = []
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables in ${envFile}:`)
    missingVars.forEach(varName => console.error(`  - ${varName}`))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present')
  return true
}

function installDependencies(env = 'development') {
  console.log(`📦 Installing dependencies for ${env} environment...`)
  
  // Check Node.js version first
  if (!checkNodeVersion(env)) {
    console.error('❌ Node.js version check failed. Cannot proceed with installation.')
    process.exit(1)
  }
  
  try {
    if (env === 'production') {
      executeCommand('npm install --production --no-optional', env)
    } else {
      executeCommand('npm install', env)
    }
    console.log('✅ Dependencies installed successfully')
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message)
    process.exit(1)
  }
}

function startServer(env) {
  validateEnvironment(env)
  
  // Check Node.js version
  if (!checkNodeVersion(env)) {
    console.error('❌ Node.js version check failed. Cannot start server.')
    process.exit(1)
  }
  
  console.log(`🚀 Starting server in ${env} mode...`)
  
  const command = env === 'development' 
    ? `npm run dev` 
    : `npm run start:${env}`
  
  try {
    executeCommand(command, env)
  } catch (error) {
    console.error(`❌ Failed to start server:`, error.message)
    process.exit(1)
  }
}

function buildForDeployment(env) {
  validateEnvironment(env)
  
  console.log(`🔨 Building for ${env} deployment...`)
  
  // Check Node.js version first
  if (!checkNodeVersion(env)) {
    console.error('❌ Node.js version check failed. Cannot proceed with build.')
    process.exit(1)
  }
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found')
    process.exit(1)
  }

  // Install production dependencies
  console.log('📦 Installing production dependencies...')
  try {
    executeCommand('npm install --production --no-optional', env)
    console.log('✅ Production dependencies installed')
  } catch (error) {
    console.error('❌ Failed to install production dependencies:', error.message)
    process.exit(1)
  }

  // Copy environment file
  const envFile = environments[env]
  const targetEnvFile = '.env'
  
  if (fs.existsSync(envFile)) {
    fs.copyFileSync(envFile, targetEnvFile)
    console.log(`✅ Copied ${envFile} to ${targetEnvFile}`)
  }

  // Copy web.config for IIS if it exists
  if (fs.existsSync('web.config')) {
    console.log('✅ web.config found - ready for IIS deployment')
  } else {
    console.log('⚠️  web.config not found - create one for IIS deployment')
  }

  // Create a startup script for the target environment
  const startupScript = createStartupScript(env)
  fs.writeFileSync(`start-${env}.cmd`, startupScript)
  console.log(`✅ Created start-${env}.cmd with correct Node.js paths`)

  console.log('🎉 Build completed successfully!')
  console.log('\nDeployment checklist:')
  console.log('  ✅ Dependencies installed')
  console.log('  ✅ Environment variables configured')
  console.log('  ✅ Startup script created')
  console.log('  📋 Manual steps:')
  console.log('    - Copy files to target server')
  console.log('    - Verify database connectivity')
  console.log('    - Update CORS origins for your domain')
  console.log('    - Configure SSL certificates (production)')
  console.log('    - Set up monitoring and logging')
  console.log('    - Update IIS web.config with correct Node.js path')
}

function createStartupScript(env) {
  const paths = getNodePaths(env)
  
  if (os.platform() === 'win32') {
    return `@echo off
REM Startup script for ${env} environment
REM Generated by deploy.js

echo Starting Pathfinder Backend in ${env} mode...
echo Node.js: ${paths.node}
echo NPM: ${paths.npm}

"${paths.node}" server.js
`
  } else {
    return `#!/bin/bash
# Startup script for ${env} environment
# Generated by deploy.js

echo "Starting Pathfinder Backend in ${env} mode..."
echo "Node.js: ${paths.node}"
echo "NPM: ${paths.npm}"

"${paths.node}" server.js
`
  }
}

function validateConfig(env) {
  console.log(`🔍 Validating ${env} configuration...\n`)
  
  validateEnvironment(env)
  
  // Check Node.js version
  console.log('Node.js Environment Check:')
  console.log('=========================')
  if (!checkNodeVersion(env)) {
    console.error('❌ Node.js configuration invalid')
    process.exit(1)
  }
  
  // Load environment variables
  require('dotenv').config({ path: environments[env] })
  
  const config = {
    'Node Environment': process.env.NODE_ENV,
    'Server Port': process.env.PORT,
    'Frontend URL': process.env.FRONTEND_URL,
    'Database Server': process.env.DB_SERVER,
    'Database Name': process.env.DB_NAME,
    'Database User': process.env.DB_USER,
    'SAML Enabled': process.env.ENABLE_SAML,
    'Manual Login': process.env.ENABLE_MANUAL_LOGIN,
    'Rate Limiting': process.env.ENABLE_RATE_LIMITING,
    'HTTPS Enabled': process.env.HTTPS_ENABLED
  }
  
  console.log('\nConfiguration Summary:')
  console.log('=====================')
  for (const [key, value] of Object.entries(config)) {
    console.log(`${key.padEnd(20)}: ${value || 'Not set'}`)
  }
  
  // Security checks
  console.log('\n🔒 Security Checks:')
  console.log('==================')
  
  if (env === 'production') {
    const checks = [
      { 
        name: 'Session Secret', 
        check: process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32,
        message: 'Should be at least 32 characters long'
      },
      {
        name: 'Database Encryption',
        check: process.env.DB_ENCRYPT === 'true',
        message: 'Should be enabled in production'
      },
      {
        name: 'HTTPS Enabled',
        check: process.env.HTTPS_ENABLED === 'true',
        message: 'Should be enabled in production'
      },
      {
        name: 'Default Passwords',
        check: !process.env.DB_PASSWORD.includes('password') && !process.env.DB_PASSWORD.includes('admin'),
        message: 'Should not use default passwords'
      }
    ]
    
    checks.forEach(({ name, check, message }) => {
      const status = check ? '✅' : '❌'
      console.log(`${status} ${name}: ${message}`)
    })
  } else {
    console.log('✅ Security checks skipped for non-production environment')
  }
  
  console.log('\n✅ Configuration validation completed')
}

// Main execution
const [,, command, environment] = process.argv

switch (command) {
  case 'install':
    installDependencies(environment || 'development')
    break
    
  case 'start':
    if (!environment) {
      console.error('❌ Environment required for start command')
      showUsage()
      process.exit(1)
    }
    startServer(environment)
    break
    
  case 'build':
    if (!environment) {
      console.error('❌ Environment required for build command')
      showUsage()
      process.exit(1)
    }
    buildForDeployment(environment)
    break
    
  case 'validate':
    if (!environment) {
      console.error('❌ Environment required for validate command')
      showUsage()
      process.exit(1)
    }
    validateConfig(environment)
    break
    
  case 'check-node':
    if (!environment) {
      console.error('❌ Environment required for check-node command')
      showUsage()
      process.exit(1)
    }
    if (!checkNodeVersion(environment)) {
      process.exit(1)
    }
    console.log(`✅ Node.js configuration for ${environment} is valid`)
    break
    
  case 'config':
    showNodeConfig()
    break
    
  case 'help':
  case '--help':
  case '-h':
    showUsage()
    break
    
  default:
    console.error(`❌ Unknown command: ${command || 'none'}`)
    showUsage()
    process.exit(1)
}

function showUsage() {
  console.log('\n🚀 Pathfinder Backend Deployment Helper\n')
  console.log('Usage: node deploy.js [command] [environment]\n')
  console.log('Commands:')
  console.log('  install     - Install dependencies')
  console.log('  start       - Start server with specified environment')
  console.log('  build       - Prepare for deployment')
  console.log('  validate    - Validate environment configuration')
  console.log('  help        - Show this help message\n')
  console.log('Environments:')
  console.log('  development - Local development')
  console.log('  staging     - Staging server')
  console.log('  production  - Production server\n')
  console.log('Examples:')
  console.log('  node deploy.js install')
  console.log('  node deploy.js start development')
  console.log('  node deploy.js validate staging')
  console.log('  node deploy.js build production\n')
}

function validateEnvironment(env) {
  const envFile = environments[env]
  if (!envFile) {
    console.error(`❌ Invalid environment: ${env}`)
    console.log('Valid environments:', Object.keys(environments).join(', '))
    process.exit(1)
  }

  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`)
    console.log('Please create this file based on the template.')
    process.exit(1)
  }

  console.log(`✅ Environment file found: ${envFile}`)
  
  // Read and validate key environment variables
  const envContent = fs.readFileSync(envFile, 'utf8')
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_SERVER',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'SESSION_SECRET'
  ]

  const missingVars = []
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables in ${envFile}:`)
    missingVars.forEach(varName => console.error(`  - ${varName}`))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present')
  return true
}

function installDependencies() {
  console.log('📦 Installing dependencies...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencies installed successfully')
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message)
    process.exit(1)
  }
}

function startServer(env) {
  validateEnvironment(env)
  
  console.log(`🚀 Starting server in ${env} mode...`)
  
  const command = env === 'development' 
    ? `npm run dev` 
    : `npm run start:${env}`
  
  try {
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    console.error(`❌ Failed to start server:`, error.message)
    process.exit(1)
  }
}

function buildForDeployment(env) {
  validateEnvironment(env)
  
  console.log(`🔨 Building for ${env} deployment...`)
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found')
    process.exit(1)
  }

  // Install production dependencies
  console.log('📦 Installing production dependencies...')
  try {
    execSync('npm install --production', { stdio: 'inherit' })
    console.log('✅ Production dependencies installed')
  } catch (error) {
    console.error('❌ Failed to install production dependencies:', error.message)
    process.exit(1)
  }

  // Copy environment file
  const envFile = environments[env]
  const targetEnvFile = '.env'
  
  if (fs.existsSync(envFile)) {
    fs.copyFileSync(envFile, targetEnvFile)
    console.log(`✅ Copied ${envFile} to ${targetEnvFile}`)
  }

  // Copy web.config for IIS if it exists
  if (fs.existsSync('web.config')) {
    console.log('✅ web.config found - ready for IIS deployment')
  } else {
    console.log('⚠️  web.config not found - create one for IIS deployment')
  }

  console.log('🎉 Build completed successfully!')
  console.log('\nDeployment checklist:')
  console.log('  ✅ Dependencies installed')
  console.log('  ✅ Environment variables configured')
  console.log('  📋 Manual steps:')
  console.log('    - Verify database connectivity')
  console.log('    - Update CORS origins for your domain')
  console.log('    - Configure SSL certificates (production)')
  console.log('    - Set up monitoring and logging')
}

function validateConfig(env) {
  console.log(`🔍 Validating ${env} configuration...\n`)
  
  validateEnvironment(env)
  
  // Load environment variables
  require('dotenv').config({ path: environments[env] })
  
  const config = {
    'Node Environment': process.env.NODE_ENV,
    'Server Port': process.env.PORT,
    'Frontend URL': process.env.FRONTEND_URL,
    'Database Server': process.env.DB_SERVER,
    'Database Name': process.env.DB_NAME,
    'Database User': process.env.DB_USER,
    'SAML Enabled': process.env.ENABLE_SAML,
    'Manual Login': process.env.ENABLE_MANUAL_LOGIN,
    'Rate Limiting': process.env.ENABLE_RATE_LIMITING,
    'HTTPS Enabled': process.env.HTTPS_ENABLED
  }
  
  console.log('Configuration Summary:')
  console.log('=====================')
  for (const [key, value] of Object.entries(config)) {
    console.log(`${key.padEnd(20)}: ${value || 'Not set'}`)
  }
  
  // Security checks
  console.log('\n🔒 Security Checks:')
  console.log('==================')
  
  if (env === 'production') {
    const checks = [
      { 
        name: 'Session Secret', 
        check: process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32,
        message: 'Should be at least 32 characters long'
      },
      {
        name: 'Database Encryption',
        check: process.env.DB_ENCRYPT === 'true',
        message: 'Should be enabled in production'
      },
      {
        name: 'HTTPS Enabled',
        check: process.env.HTTPS_ENABLED === 'true',
        message: 'Should be enabled in production'
      },
      {
        name: 'Default Passwords',
        check: !process.env.DB_PASSWORD.includes('password') && !process.env.DB_PASSWORD.includes('admin'),
        message: 'Should not use default passwords'
      }
    ]
    
    checks.forEach(({ name, check, message }) => {
      const status = check ? '✅' : '❌'
      console.log(`${status} ${name}: ${message}`)
    })
  } else {
    console.log('✅ Security checks skipped for non-production environment')
  }
  
  console.log('\n✅ Configuration validation completed')
}

// Main execution
const [,, command, environment] = process.argv

switch (command) {
  case 'install':
    installDependencies()
    break
    
  case 'start':
    if (!environment) {
      console.error('❌ Environment required for start command')
      showUsage()
      process.exit(1)
    }
    startServer(environment)
    break
    
  case 'build':
    if (!environment) {
      console.error('❌ Environment required for build command')
      showUsage()
      process.exit(1)
    }
    buildForDeployment(environment)
    break
    
  case 'validate':
    if (!environment) {
      console.error('❌ Environment required for validate command')
      showUsage()
      process.exit(1)
    }
    validateConfig(environment)
    break
    
  case 'help':
  case '--help':
  case '-h':
    showUsage()
    break
    
  default:
    console.error(`❌ Unknown command: ${command || 'none'}`)
    showUsage()
    process.exit(1)
}