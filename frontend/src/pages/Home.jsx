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
} from '@chakra-ui/react'
import { AddIcon, CalendarIcon, EditIcon, ViewIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import ConversationModal from '../components/ConversationModal'
import LoadConversationModal from '../components/LoadConversationModal'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const isMobile = useBreakpointValue({ base: true, md: false })
  const cardDirection = useBreakpointValue({ base: 'column', md: 'row' })

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

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="jj.red" mb={2}>
            Pathfinder Conversation Guide
          </Text>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="jj.gray.600" maxW="2xl" mx="auto">
            Help identify alignment philosophy in Total Knee Arthroplasty (TKA) through guided conversations.
          </Text>
        </Box>

        {/* User Info */}
        {user && (
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Icon as={user.role === 'sales_rep' ? EditIcon : ViewIcon} color="jj.blue.300" />
                <Box>
                  <Text fontWeight="medium">
                    Welcome, {user.name || `${user.role.replace('_', ' ')} user`}
                  </Text>
                  <Text fontSize="sm" color="jj.gray.600">
                    {user.role === 'sales_rep' ? 'Sales Representative' : 'Surgeon Access'}
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Action Cards */}
        <VStack spacing={6} align="stretch">
          {user?.role === 'sales_rep' ? (
            // Sales Rep Options
            <>
              <Card _hover={{ shadow: 'lg' }} transition="all 0.2s">
                <CardBody>
                  <Flex 
                    direction={cardDirection} 
                    align="center" 
                    justify="space-between"
                    gap={4}
                  >
                    <HStack spacing={4} flex={1}>
                      <Icon as={AddIcon} color="jj.green.300" boxSize={6} />
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold" color="jj.gray.700">
                          Start New Conversation
                        </Text>
                        <Text fontSize="sm" color="jj.gray.600">
                          Create a new conversation with a surgeon
                        </Text>
                      </Box>
                    </HStack>
                    <Button
                      variant="primary"
                      onClick={handleCreateConversation}
                      size={isMobile ? 'sm' : 'md'}
                      minW={isMobile ? 'full' : 'auto'}
                    >
                      Create New
                    </Button>
                  </Flex>
                </CardBody>
              </Card>

              <Card _hover={{ shadow: 'lg' }} transition="all 0.2s">
                <CardBody>
                  <Flex 
                    direction={cardDirection} 
                    align="center" 
                    justify="space-between"
                    gap={4}
                  >
                    <HStack spacing={4} flex={1}>
                      <Icon as={CalendarIcon} color="jj.blue.300" boxSize={6} />
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold" color="jj.gray.700">
                          Load Existing Conversation
                        </Text>
                        <Text fontSize="sm" color="jj.gray.600">
                          Continue a previously started conversation
                        </Text>
                      </Box>
                    </HStack>
                    <Button
                      variant="secondary"
                      onClick={handleLoadConversation}
                      size={isMobile ? 'sm' : 'md'}
                      minW={isMobile ? 'full' : 'auto'}
                    >
                      Load Existing
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </>
          ) : (
            // Surgeon/Unauthenticated Options
            <Card _hover={{ shadow: 'lg' }} transition="all 0.2s">
              <CardBody>
                <Flex 
                  direction={cardDirection} 
                  align="center" 
                  justify="space-between"
                  gap={4}
                >
                  <HStack spacing={4} flex={1}>
                    <Icon as={ViewIcon} color="jj.red" boxSize={6} />
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" color="jj.gray.700">
                        Take Assessment
                      </Text>
                      <Text fontSize="sm" color="jj.gray.600">
                        Discover your alignment philosophy through guided questions
                      </Text>
                    </Box>
                  </HStack>
                  <Button
                    variant="primary"
                    onClick={handleStartSurgeonConversation}
                    size={isMobile ? 'sm' : 'md'}
                    minW={isMobile ? 'full' : 'auto'}
                  >
                    Start Assessment
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Additional Options */}
        <Card bg="jj.gray.50">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" fontWeight="semibold" color="jj.gray.700">
                Additional Resources
              </Text>
              <VStack spacing={2} align="start">
                <Button variant="ghost" size="sm" leftIcon={<ViewIcon />}>
                  Review Content
                </Button>
                {user?.role === 'sales_rep' && (
                  <Button variant="ghost" size="sm" leftIcon={<EditIcon />}>
                    Compare Philosophies Tool
                  </Button>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
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
  )
}

export default Home