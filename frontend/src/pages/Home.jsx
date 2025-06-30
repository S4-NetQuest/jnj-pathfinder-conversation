
// frontend/src/pages/Home.jsx (updated to include dev login)
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import ConversationModal from '../components/ConversationModal'
import LoadConversationModal from '../components/LoadConversationModal'
import ComparePhilosophiesModal from '../components/ComparePhilosophiesModal'
import DevLogin from '../components/DevLogin'

const Home = () => {
  const { user, logout, isSalesRep } = useAuth()

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure()

  const {
    isOpen: isLoadOpen,
    onOpen: onLoadOpen,
    onClose: onLoadClose
  } = useDisclosure()

  const {
    isOpen: isCompareOpen,
    onOpen: onCompareOpen,
    onClose: onCompareClose
  } = useDisclosure()

  const {
    isOpen: isQuestionsOpen,
    onOpen: onQuestionsOpen,
    onClose: onQuestionsClose
  } = useDisclosure()

  const handleConversationCreated = (conversationId) => {
    onCreateClose()
    // Navigate to conversation or show success message
    console.log('Created conversation:', conversationId)
  }

  const handleConversationSelected = (conversationId) => {
    onLoadClose()
    // Navigate to conversation
    console.log('Selected conversation:', conversationId)
  }

  // Show dev login if not authenticated
  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading color="red.500" mb={4}>
              Pathfinder Conversation Guide
            </Heading>
            <Text color="gray.600">
              Kinematic Restoration Conversion Guide
            </Text>
          </Box>

          <DevLogin />
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex align="center">
          <Box>
            <Heading color="red.500" fontSize="2xl">
              Pathfinder Conversation Guide
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Kinematic Restoration Conversion Guide
            </Text>
          </Box>
        </Flex>

        {/* Welcome Message */}
        <Box textAlign="center" py={6}>
          <Text fontSize="lg" color="gray.700">
            The Pathfinder Conversation Guide will help identify your customer's alignment philosophy in Total Knee Arthroplasty (TKA).
          </Text>
        </Box>

        {/* Action Buttons */}
        <VStack spacing={4} align="stretch" maxW="400px" mx="auto">
          {isSalesRep ? (
            <>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="red"
                size="lg"
                onClick={onCreateOpen}
              >
                Start New Conversation
              </Button>

              <Button
                leftIcon={<SearchIcon />}
                colorScheme="red"
                size="lg"
                onClick={onLoadOpen}
              >
                Load Existing Conversation
              </Button>
            </>
          ) : (<></>)}

          <Button
            size="lg"
          >
            Review Content
          </Button>

          <Button
              colorScheme="red"
              size="lg"
          >
            Compare Philosophies Tool
          </Button>

          {isSalesRep && (
            <Button
              colorScheme="red"
              size="lg"
            >
              Challenger Selling Philosophy Questions
            </Button>
          )}
        </VStack>

        {/* Development Info */}
        {process.env.NODE_ENV !== 'production' && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Development Mode:</strong> You are logged in as {user.role.replace('_', ' ')} using development authentication.
            </Text>
          </Alert>
        )}
      </VStack>

      {/* Modals */}
      <ConversationModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onConversationCreated={handleConversationCreated}
      />

      <LoadConversationModal
        isOpen={isLoadOpen}
        onClose={onLoadClose}
        onConversationSelected={handleConversationSelected}
      />

    </Container>
  )
}

export default Home