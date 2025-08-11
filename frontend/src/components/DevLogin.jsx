// frontend/src/components/DevLogin.jsx
import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Select,
  HStack,
  VStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { LuConstruction } from "react-icons/lu";
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import config from '../config/config'

const DevLogin = () => {
  const { login } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'sales_rep'
  })

  // Only show in development or staging
  if (config.isProduction) {
    return null
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogin = async () => {
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/dev-login', formData)

      if (response.data.success) {
        login(response.data.user)
        toast({
          title: 'Login Successful',
          description: `Welcome ${response.data.user.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Dev login error:', error)

      // Handle specific error messages from the API
      const errorMessage = error.response?.data?.error || 'Failed to login'

      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <Box maxW="400px" mx="auto">
      <Card>
        <CardHeader
          bg={config.isStaging ? "red.100" : "red.100"}
          borderBottom="1px solid"
          borderColor={config.isStaging ? "red.300" : "red.300"}
        >
        <HStack spacing={2}>
          <Icon as={LuConstruction} />
          <Heading
            size="md"
            fontWeight={"500"}
          >
            {config.NODE_ENV.charAt(0).toUpperCase() + config.NODE_ENV.slice(1)} Login
          </Heading>
        </HStack>
        </CardHeader>

        <CardBody>
          <Alert status="info" mb={4} borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              This login is for {config.NODE_ENV} only and bypasses SAML authentication.
            </Text>
          </Alert>
          <Alert status="warning" mb={4} borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              This site is currently under active development. Access is granted exclusively to your profile and must not be shared under any circumstances. Thank you.
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
                onKeyPress={handleKeyPress}
                focusBorderColor="red.500"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  focusBorderColor="red.500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isDisabled>
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
              isDisabled={!formData.email || !formData.password}
            >
              {config.NODE_ENV.charAt(0).toUpperCase() + config.NODE_ENV.slice(1)} Login
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default DevLogin