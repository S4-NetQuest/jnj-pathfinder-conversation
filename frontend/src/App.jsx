import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Flex, useToast } from '@chakra-ui/react'
import Header from './components/Header'
import Home from './pages/Home'
import Conversation from './pages/Conversation'
import Login from './pages/Login'
import AuthContext from './contexts/AuthContext'
import api from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/status')
      if (response.data.user) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.log('No active session')
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
    toast({
      title: 'Welcome!',
      description: `Logged in as ${userData.name || userData.role}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Box>Loading...</Box>
      </Flex>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Box minHeight="100vh" bg="jj.gray.50">
        <Header />
        <Box pt="60px"> {/* Account for fixed header */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/conversation/:id?" 
              element={<Conversation />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </AuthContext.Provider>
  )
}

export default App