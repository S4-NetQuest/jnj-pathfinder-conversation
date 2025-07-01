import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Divider,
  Icon,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { LockIcon, ViewIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSamlLogin = () => {
    // Redirect to SAML SSO endpoint
    window.location.href = '/api/auth/saml'
  }

  const handleSurgeonAccess = async () => {
    try {
      const response = await fetch('/api/auth/surgeon', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        login(data.user)
        navigate('/')
      } else {
        console.error('Surgeon access failed')
      }
    } catch (error) {
      console.error('Error accessing as surgeon:', error)
    }
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <Container maxW="container.sm" py={8} px={4}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color="jj.red"
            mb={2}
          >
            Kinematic Restoration
          </Text>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="jj.gray.600"
            mb={4}
          >
            Conversation Guide
          </Text>
          <Text fontSize="md" color="jj.gray.600" maxW="md" mx="auto">
            Choose your role to access the Pathfinder Conversation Guide
          </Text>
        </Box>

        {/* Login Options */}
        <VStack spacing={6} align="stretch">
          {/* Sales Rep Login */}
          <Card
            _hover={{ shadow: 'lg', borderColor: 'jj.red' }}
            transition="all 0.2s"
            borderWidth="2px"
            borderColor="transparent"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={4} align="stretch">
                <Flex align="center" justify="center" mb={2}>
                  <Icon as={LockIcon} color="jj.red" boxSize={8} />
                </Flex>

                <Box textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="jj.gray.700" mb={2}>
                    J&J Sales Representative
                  </Text>
                  <Text fontSize="sm" color="jj.gray.600" mb={4}>
                    Access with your corporate credentials via Single Sign-On
                  </Text>
                </Box>

                <VStack spacing={2} fontSize="sm" color="jj.gray.600" align="start">
                  <HStack>
                    <Text>✓</Text>
                    <Text>Create and manage conversations</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>Add notes and documentation</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>Access conversation history</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>Generate PDF reports</Text>
                  </HStack>
                </VStack>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSamlLogin}
                  rightIcon={<ExternalLinkIcon />}
                  width="full"
                  mt={4}
                >
                  Sign in with SSO
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Divider */}
          <Flex align="center">
            <Divider borderColor="jj.gray.300" />
            <Text px={4} color="jj.gray.500" fontSize="sm" whiteSpace="nowrap">
              OR
            </Text>
            <Divider borderColor="jj.gray.300" />
          </Flex>

          {/* Surgeon Access */}
          <Card
            _hover={{ shadow: 'lg', borderColor: 'jj.blue.300' }}
            transition="all 0.2s"
            borderWidth="2px"
            borderColor="transparent"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={4} align="stretch">
                <Flex align="center" justify="center" mb={2}>
                  <Icon as={ViewIcon} color="jj.blue.300" boxSize={8} />
                </Flex>

                <Box textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="jj.gray.700" mb={2}>
                    Surgeon
                  </Text>
                  <Text fontSize="sm" color="jj.gray.600" mb={4}>
                    Take the assessment to discover your alignment philosophy
                  </Text>
                </Box>

                <VStack spacing={2} fontSize="sm" color="jj.gray.600" align="start">
                  <HStack>
                    <Text>✓</Text>
                    <Text>Complete alignment assessment</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>View personalized recommendations</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>Access medical glossary</Text>
                  </HStack>
                  <HStack>
                    <Text>✓</Text>
                    <Text>No registration required</Text>
                  </HStack>
                </VStack>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleSurgeonAccess}
                  width="full"
                  mt={4}
                >
                  Continue as Surgeon
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Footer Info */}
        <Box
          textAlign="center"
          pt={6}
          borderTop="1px solid"
          borderColor="jj.gray.200"
        >
          <Text fontSize="xs" color="jj.gray.500">
            Having trouble signing in? Contact your system administrator.
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default Login