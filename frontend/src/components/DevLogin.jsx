// frontend/src/components/DevLogin.jsx
import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const DevLogin = () => {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: 'test@jj.com',
    role: 'sales_rep'
  })

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await api.post('/auth/dev-login', formData)

      if (response.data.success) {
        login(response.data.user)
        toast({
          title: 'Login Successful',
          description: `Logged in as ${response.data.user.name} (${response.data.user.role})`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Dev login error:', error)
      toast({
        title: 'Login Failed',
        description: error.response?.data?.error || 'Failed to login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="400px" mx="auto" mt={8}>
      <Card>
        <CardHeader bg="yellow.100" borderBottom="1px solid" borderColor="yellow.300">
          <Heading size="md" color="yellow.800">
            🚧 Development Login
          </Heading>
        </CardHeader>

        <CardBody>
          <Alert status="warning" mb={4} borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              This login is for development only and bypasses SAML authentication.
            </Text>
          </Alert>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Email
              </FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                focusBorderColor="red.500"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Role
              </FormLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                focusBorderColor="red.500"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="surgeon">Surgeon</option>
              </Select>
            </FormControl>

            <Button
              colorScheme="red"
              onClick={handleLogin}
              isLoading={loading}
              loadingText="Logging in..."
              size="lg"
              mt={2}
            >
              Dev Login
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default DevLogin