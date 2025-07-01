import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react'
import { SearchIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const LoadConversationModal = ({ isOpen, onClose, onConversationSelected }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState(null)

  const cardBg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
    }
  }, [isOpen, user])

  useEffect(() => {
    filterConversations()
  }, [conversations, searchQuery, statusFilter])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      console.log('Fetching conversations...')
      const response = await api.get('/conversations')
      console.log('API Response:', response.data)

      // Handle both response formats: { success: true, conversations: [...] } or direct array
      let conversationData = []
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          conversationData = response.data
        } else if (response.data.conversations && Array.isArray(response.data.conversations)) {
          conversationData = response.data.conversations
        } else if (response.data.success && response.data.conversations) {
          conversationData = response.data.conversations
        }
      }

      console.log('Processed conversations:', conversationData)
      setConversations(conversationData)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: 'Error Loading Conversations',
        description: error.response?.data?.error || 'Failed to load conversations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const filterConversations = () => {
    let filtered = [...conversations]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(conv =>
        (conv.surgeon_name && conv.surgeon_name.toLowerCase().includes(query)) ||
        (conv.hospital_name && conv.hospital_name.toLowerCase().includes(query)) ||
        (conv.surgery_center_name && conv.surgery_center_name.toLowerCase().includes(query)) ||
        (conv.recommended_approach && conv.recommended_approach.toLowerCase().includes(query)) ||
        (conv.current_alignment && conv.current_alignment.toLowerCase().includes(query)) ||
        (conv.surgeon_volume_per_year && conv.surgeon_volume_per_year.toLowerCase().includes(query))
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.conversation_date || a.created_at)
      const dateB = new Date(b.conversation_date || b.created_at)
      return dateB - dateA
    })

    setFilteredConversations(filtered)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'in_progress':
        return 'blue'
      case 'abandoned':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getRecommendationColor = (approach) => {
    switch (approach) {
      case 'KA':
        return '#eb1700'
      case 'iKA':
        return '#ff6017'
      case 'FA':
        return '#0f68b2'
      case 'MA':
        return '#328714'
      default:
        return '#6e6259'
    }
  }

  const getAlignmentColor = (alignment) => {
    switch (alignment) {
      case 'KA':
        return 'red'
      case 'iKA':
        return 'orange'
      case 'FA':
        return 'blue'
      case 'MA':
        return 'green'
      default:
        return 'gray'
    }
  }

  const getAlignmentDisplayName = (alignment) => {
    switch (alignment) {
      case 'KA':
        return 'Kinematic Alignment'
      case 'iKA':
        return 'Inverse Kinematic Alignment'
      case 'FA':
        return 'Functional Alignment'
      case 'MA':
        return 'Manual Alignment'
      default:
        return alignment
    }
  }

  const formatRoboticsUsage = (usesRobotics) => {
    if (usesRobotics === true || usesRobotics === 'true') return 'Yes'
    if (usesRobotics === false || usesRobotics === 'false') return 'No'
    return 'Unknown'
  }

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleLoadConversation = () => {
    if (selectedConversation && onConversationSelected) {
      onConversationSelected(selectedConversation.id)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedConversation(null)
    setSearchQuery('')
    setStatusFilter('all')
    onClose()
  }

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Authentication Required</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              You must be logged in to access conversations.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="#f1efed" borderBottom="1px solid" borderColor="#e8e6e3">
          <HStack spacing={3}>
            <Icon as={CalendarIcon} color="#eb1700" />
            <Text color="#eb1700" fontSize="lg" fontWeight="bold">
              Load Existing Conversation
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          {/* Filters */}
          <Box p={4} borderBottom="1px solid" borderColor="#e8e6e3">
            <VStack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="#6e6259" />
                </InputLeftElement>
                <Input
                  placeholder="Search by surgeon, hospital, surgery center, alignment, or volume..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  focusBorderColor="#eb1700"
                  bg="white"
                />
              </InputGroup>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                focusBorderColor="#eb1700"
                bg="white"
              >
                <option value="all">All Conversations</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </Select>
            </VStack>
          </Box>

          {/* Conversations List */}
          <Box p={4}>
            {loading ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Spinner size="lg" color="#eb1700" />
                  <Text color="#6e6259">Loading conversations...</Text>
                </VStack>
              </Center>
            ) : filteredConversations.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="#6e6259" textAlign="center">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No conversations match your search criteria.'
                      : 'No conversations found. Create your first conversation to get started.'}
                  </Text>
                  {conversations.length === 0 && !searchQuery && statusFilter === 'all' && (
                    <Text fontSize="sm" color="#a39992" textAlign="center">
                      Click "Start New Conversation" to create your first conversation.
                    </Text>
                  )}
                </VStack>
              </Center>
            ) : (
              <VStack align="stretch" spacing={3}>
                {filteredConversations.map((conversation) => (
                  <Box
                    key={conversation.id}
                    p={4}
                    bg={cardBg}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={selectedConversation?.id === conversation.id ? '#eb1700' : '#e8e6e3'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: hoverBg,
                      borderColor: '#eb1700',
                      shadow: 'md'
                    }}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Header */}
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="lg" color="#312c2a" mb={1}>
                            {conversation.surgeon_name || 'Unknown Surgeon'}
                          </Text>

                          {/* Hospital and Surgery Center Information */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="#6e6259" fontWeight="medium">
                              Hospital: {conversation.hospital_name || 'Unknown Hospital'}
                            </Text>
                            <Text fontSize="sm" color="#6e6259">
                              Surgery Center: {conversation.surgery_center_name || 'Unknown Surgery Center'}
                            </Text>
                          </VStack>
                        </Box>
                        <Badge colorScheme={getStatusColor(conversation.status)} variant="subtle">
                          {(conversation.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </Flex>

                      {/* Details */}
                      <HStack spacing={4} fontSize="sm" color="#6e6259">
                        <HStack spacing={1}>
                          <Icon as={CalendarIcon} boxSize={3} />
                          <Text>{formatDate(conversation.conversation_date)}</Text>
                        </HStack>
                        {conversation.updated_at && conversation.created_at !== conversation.updated_at && (
                          <HStack spacing={1}>
                            <Icon as={TimeIcon} boxSize={3} />
                            <Text>Updated {formatDate(conversation.updated_at)}</Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* Surgeon information */}
                      <VStack align="stretch" spacing={2}>
                        {/* Volume and Robotics */}
                        <HStack spacing={4} fontSize="sm">
                          {conversation.surgeon_volume_per_year && (
                            <HStack spacing={2}>
                              <Text color="#6e6259">Volume/Year:</Text>
                              <Badge variant="outline" colorScheme="purple" size="sm">
                                {conversation.surgeon_volume_per_year}
                              </Badge>
                            </HStack>
                          )}

                          {conversation.uses_robotics !== undefined && conversation.uses_robotics !== null && (
                            <HStack spacing={2}>
                              <Text color="#6e6259">Robotics:</Text>
                              <Badge
                                variant="outline"
                                colorScheme={formatRoboticsUsage(conversation.uses_robotics) === 'Yes' ? 'green' : 'orange'}
                                size="sm"
                              >
                                {formatRoboticsUsage(conversation.uses_robotics)}
                              </Badge>
                            </HStack>
                          )}
                        </HStack>

                        {/* Current Alignment */}
                        {conversation.current_alignment && (
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="#6e6259">Current Alignment:</Text>
                            <Badge
                              colorScheme={getAlignmentColor(conversation.current_alignment)}
                              variant="solid"
                              size="sm"
                            >
                              {conversation.current_alignment}
                            </Badge>
                            <Text fontSize="xs" color="#a39992">
                              ({getAlignmentDisplayName(conversation.current_alignment)})
                            </Text>
                          </HStack>
                        )}
                      </VStack>

                      {/* Recommendation */}
                      {conversation.recommended_approach && (
                        <Flex align="center" justify="space-between">
                          <Text fontSize="sm" color="#6e6259">
                            Recommended Approach:
                          </Text>
                          <HStack spacing={2}>
                            <Badge
                              bg={getRecommendationColor(conversation.recommended_approach)}
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                            >
                              {conversation.recommended_approach}
                            </Badge>
                            <Text fontSize="xs" color="#a39992">
                              ({getAlignmentDisplayName(conversation.recommended_approach)})
                            </Text>
                          </HStack>
                        </Flex>
                      )}

                      {/* Scores Preview - Updated with KA/iKA/FA/MA */}
                      {conversation.status === 'completed' && (
                        <Box>
                          <Text fontSize="xs" color="#a39992" mb={2}>
                            Alignment Scores:
                          </Text>
                          <HStack spacing={3} fontSize="xs" color="#6e6259">
                            <Text>
                              <Text as="span" fontWeight="medium" color="#eb1700">KA:</Text> {conversation.alignment_score_ka || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="#ff6017">iKA:</Text> {conversation.alignment_score_ika || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="#0f68b2">FA:</Text> {conversation.alignment_score_fa || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="#328714">MA:</Text> {conversation.alignment_score_ma || 0}
                            </Text>
                          </HStack>
                        </Box>
                      )}

                      {/* Sales Rep Info (for surgeons viewing conversations) */}
                      {user.role === 'surgeon' && conversation.sales_rep_name && (
                        <Box pt={2} borderTop="1px solid" borderColor="#f1efed">
                          <Text fontSize="xs" color="#a39992">
                            Sales Representative: <Text as="span" fontWeight="medium">{conversation.sales_rep_name}</Text>
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="#e8e6e3">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            bg="#eb1700"
            color="white"
            _hover={{ bg: "#9e0000" }}
            _active={{ bg: "#9e0000" }}
            onClick={handleLoadConversation}
            isDisabled={!selectedConversation}
          >
            Load Conversation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LoadConversationModal