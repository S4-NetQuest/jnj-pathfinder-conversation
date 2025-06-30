export const requireSalesRep = (req, res, next) => {
  // Check session-based auth first
  if (req.session?.authenticated && req.session?.user?.role === 'sales_rep') {
    req.user = req.session.user // Set req.user for compatibility
    return next()
  }

  // Check passport auth (for SAML) - only if passport is available
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user?.role === 'sales_rep') {
    return next()
  }

  return res.status(403).json({ error: 'Sales representative access required' })
}

// Helper function to check if user is authenticated (any method)
export const isAuthenticated = (req) => {
  // Session-based auth
  if (req.session?.authenticated && req.session?.user) {
    return true
  }

  // Passport auth (if available)
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return true
  }

  return false
}

// Helper function to get current user
export const getCurrentUser = (req) => {
  // Session-based auth
  if (req.session?.authenticated && req.session?.user) {
    return req.session.user
  }

  // Passport auth
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user) {
    return req.user
  }

  return null
}