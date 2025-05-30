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


const ComparePhilosophies = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
              Kinematic Restoration Conversion Guide
            </Text>
            <Text
              fontSize={{ base: '16px', md: '18px' }}
              fontFamily="body"
              color="gray.600"
              maxW="600px"
              mx="auto"
              lineHeight="1.4"
            >
              The Pathfinder Conversation Guide will help identify your customers alignment philosophy in Total Knee Arthroplasty (TKA).
            </Text>
          </Box>

        </VStack>

      </Container>
    </Box>
  )
}

export default ComparePhilosophies