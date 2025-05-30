import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Card,
  CardBody,
  useDisclosure,
  Flex,
  Icon,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import ConversationModal from '../components/ConversationModal'
import LoadConversationModal from '../components/LoadConversationModal'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleCreateConversation = () => {
    setModalType('create')
    onOpen()
  }

  const handleLoadConversation = () => {
    setModalType('load')
    onOpen()
  }

  const handleStartSurgeonConversation = () => {
    // For surgeons, start conversation directly without creating a record
    navigate('/conversation')
  }

  const handleModalClose = () => {
    setModalType(null)
    onClose()
  }

  const handleConversationSelect = (conversationId) => {
    navigate(`/conversation/${conversationId}`)
    handleModalClose()
  }

  const handleReviewContent = () => {
    navigate('/review-content')
  }

  const handleComparePhilosophies = () => {
    navigate('/compare-philosophies')
  }

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

          {/* Role Selection Header */}
          <Box textAlign="center" mb={4}>
            <Text
              fontSize={{ base: '18px', md: '20px' }}
              fontFamily="body"
              fontWeight="medium"
              color="gray.700"
              mb={2}
            >
              Choose your role:
            </Text>
            <HStack spacing={4} justify="center" flexWrap="wrap">
              <Text
                fontSize="16px"
                fontFamily="body"
                color="jj.red"
                textDecor="underline"
                cursor="pointer"
              >
                J & J Sales Rep
              </Text>
              <Text fontSize="16px" color="gray.400">|</Text>
              <Text
                fontSize="16px"
                fontFamily="body"
                color={user?.role !== 'sales_rep' ? 'jj.red' : 'gray.600'}
                textDecor={user?.role !== 'sales_rep' ? 'underline' : 'none'}
                cursor="pointer"
              >
                Surgeon
              </Text>
            </HStack>
          </Box>

          {/* Main Action Cards */}
          <VStack spacing={4} align="stretch">
            {user?.role === 'sales_rep' ? (
              // Sales Rep Options
              <>
                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleCreateConversation}
                  justifyContent="flex-start"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Start New Conversation
                  </Text>
                </Button>

                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleLoadConversation}
                  justifyContent="flex-start"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Load Existing Conversation
                  </Text>
                </Button>

                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleReviewContent}
                  justifyContent="flex-start"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Review Content
                  </Text>
                </Button>

                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleComparePhilosophies}
                  justifyContent="space-between"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Compare Philosophies Tool
                  </Text>
                  <Text
                    fontSize="14px"
                    fontFamily="body"
                    color="gray.500"
                  >
                    [Sales reps only] →
                  </Text>
                </Button>
              </>
            ) : (
              // Surgeon Options
              <>
                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleStartSurgeonConversation}
                  justifyContent="flex-start"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Start New Conversation
                  </Text>
                </Button>

                <Button
                  h="60px"
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  _hover={{
                    borderColor: 'jj.red',
                    shadow: 'md'
                  }}
                  onClick={handleReviewContent}
                  justifyContent="flex-start"
                  px={6}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.700"
                    textAlign="left"
                  >
                    Review Content
                  </Text>
                </Button>

                <Button
                  h="60px"
                  bg="gray.200"
                  border="2px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  cursor="not-allowed"
                  justifyContent="space-between"
                  px={6}
                  _hover={{}}
                >
                  <Text
                    fontSize="18px"
                    fontFamily="body"
                    fontWeight="medium"
                    color="gray.500"
                    textAlign="left"
                  >
                    Compare Philosophies Tool
                  </Text>
                  <Text
                    fontSize="14px"
                    fontFamily="body"
                    color="gray.400"
                  >
                    [Sales reps only] →
                  </Text>
                </Button>
              </>
            )}
          </VStack>
        </VStack>

        {/* Modals */}
        {modalType === 'create' && (
          <ConversationModal
            isOpen={isOpen}
            onClose={handleModalClose}
            onConversationCreated={handleConversationSelect}
          />
        )}

        {modalType === 'load' && (
          <LoadConversationModal
            isOpen={isOpen}
            onClose={handleModalClose}
            onConversationSelect={handleConversationSelect}
          />
        )}
      </Container>
    </Box>
  )
}

export default Home