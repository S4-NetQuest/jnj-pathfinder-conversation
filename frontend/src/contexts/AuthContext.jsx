import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isSalesRep: false,
  login: () => {},
  logout: () => {},
  loading: true
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false) // Set to false initially for development

  // For development - simulate different user types
  useEffect(() => {
    // Uncomment one of these for testing:
    
    // Simulate sales rep login
    // setUser({ 
    //   id: 1, 
    //   name: 'John Doe', 
    //   email: 'john@jnj.com', 
    //   role: 'sales_rep' 
    // })
    
    // Simulate surgeon (unauthenticated but identified)
    // setUser({ 
    //   id: null, 
    //   name: 'Dr. Smith', 
    //   role: 'surgeon' 
    // })
    
    // Or leave commented for completely unauthenticated access
  }, [])

  const checkAuthStatus = async () => {
    try {
      // For now, skip the API call during development
      // const response = await fetch('/api/auth/status', {
      //   credentials: 'include'
      // })
      
      // if (response.ok) {
      //   const userData = await response.json()
      //   setUser(userData)
      // }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData) => {
    setUser(userData)
    setLoading(false)
  }

  const logout = async () => {
    try {
      // await fetch('/api/auth/logout', {
      //   method: 'POST',
      //   credentials: 'include'
      // })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  // Allow surgeon access (unauthenticated) or sales rep access (authenticated)
  const allowAccess = !user || user.role === 'sales_rep' || user.role === 'surgeon'

  const value = {
    user,
    isAuthenticated: !!user && user.role === 'sales_rep',
    isSalesRep: user?.role === 'sales_rep',
    isSurgeon: user?.role === 'surgeon',
    allowAccess,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext