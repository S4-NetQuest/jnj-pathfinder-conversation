import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  Text,
  Box,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'


const ComparePhilosophies = () => {
  const { user } = useAuth()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  return (
    <Box bg={bgColor} minH="100vh" pt="0px" pb="100px">
      <Container maxW="container.lg" py={4}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" px={4}>
            <Text
              fontSize={{ base: '24px', md: '32px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="jj.red"
              mb={2}
              lineHeight="1.2"
            >
              Compare Philosophies Tool
            </Text>
            <Text>
              Select 1 – 4 of the philosophies and get a comparison in a modal
            </Text>
          </Box>
        </VStack>

      </Container>
    </Box>
  )
}

export default ComparePhilosophies