import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  useDisclosure,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'


const ExploreKinematicRestoration = () => {
  const { user } = useAuth()
  const isMobile = useBreakpointValue({ base: true, md: false })
  return (
    <Box bg="gray.50" minH="100vh" pt="80px" pb="100px">
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" px={4}>
            <Text
              fontSize={{ base: '24px', md: '32px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="gray.700"
              mb={4}
              lineHeight="1.2"
            >
              Explore Kinematic Restoration
            </Text>
            <Text>
              list of resources to link to: PDF, video, etc
            </Text>
          </Box>

        </VStack>

      </Container>
    </Box>
  )
}

export default ExploreKinematicRestoration