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
        (conv.recommended_approach && conv.recommended_approach.toLowerCase().includes(query))
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
      case 'mechanical':
        return 'blue.500'
      case 'adjusted':
        return 'green.500'
      case 'restrictive':
        return 'orange.500'
      case 'kinematic':
        return 'red.500'
      default:
        return 'gray.400'
    }
  }

  const formatHospitalSize = (size) => {
    if (!size) return 'Unknown'
    // Convert to string first in case it's a number or other type
    const sizeStr = String(size).toLowerCase()
    return sizeStr.charAt(0).toUpperCase() + sizeStr.slice(1)
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
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack spacing={3}>
            <Icon as={CalendarIcon} color="blue.500" />
            <Text color="red.500" fontSize="lg" fontWeight="bold">
              Load Existing Conversation
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          {/* Filters */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <VStack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by surgeon, hospital, surgery center, or recommendation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  focusBorderColor="red.500"
                />
              </InputGroup>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                focusBorderColor="red.500"
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
                  <Spinner size="lg" color="red.500" />
                  <Text color="gray.600">Loading conversations...</Text>
                </VStack>
              </Center>
            ) : filteredConversations.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500" textAlign="center">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No conversations match your search criteria.'
                      : 'No conversations found. Create your first conversation to get started.'}
                  </Text>
                  {conversations.length === 0 && !searchQuery && statusFilter === 'all' && (
                    <Text fontSize="sm" color="gray.400" textAlign="center">
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
                    borderColor={selectedConversation?.id === conversation.id ? 'red.500' : 'gray.200'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: hoverBg,
                      borderColor: 'red.500',
                      shadow: 'md'
                    }}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Header */}
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="lg" color="gray.700" mb={1}>
                            {conversation.surgeon_name || 'Unknown Surgeon'}
                          </Text>

                          {/* Hospital Information */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              {conversation.hospital_name || 'Unknown Hospital'}
                            </Text>

                            {/* Surgery Center (if different from hospital) */}
                            {conversation.surgery_center_name &&
                             conversation.surgery_center_name !== conversation.hospital_name && (
                              <Text fontSize="xs" color="gray.500">
                                Surgery Center: {conversation.surgery_center_name}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                        <Badge colorScheme={getStatusColor(conversation.status)} variant="subtle">
                          {(conversation.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </Flex>

                      {/* Details */}
                      <HStack spacing={4} fontSize="sm" color="gray.600">
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

                      {/* Hospital Size */}
                      {conversation.hospital_size && (
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.600">Hospital Size:</Text>
                          <Badge variant="outline" colorScheme="blue" size="sm">
                            {formatHospitalSize(conversation.hospital_size)}
                          </Badge>
                        </HStack>
                      )}

                      {/* Recommendation */}
                      {conversation.recommended_approach && (
                        <Flex align="center" justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Recommended Approach:
                          </Text>
                          <Badge
                            bg={getRecommendationColor(conversation.recommended_approach)}
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {conversation.recommended_approach?.replace('_', ' ')}
                          </Badge>
                        </Flex>
                      )}

                      {/* Scores Preview */}
                      {conversation.status === 'completed' && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={2}>
                            Alignment Scores:
                          </Text>
                          <HStack spacing={3} fontSize="xs" color="gray.600">
                            <Text>
                              <Text as="span" fontWeight="medium" color="blue.500">M:</Text> {conversation.alignment_score_mechanical || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="green.500">A:</Text> {conversation.alignment_score_adjusted || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="orange.500">R:</Text> {conversation.alignment_score_restrictive || 0}
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color="red.500">K:</Text> {conversation.alignment_score_kinematic || 0}
                            </Text>
                          </HStack>
                        </Box>
                      )}

                      {/* Sales Rep Info (for surgeons viewing conversations) */}
                      {user.role === 'surgeon' && conversation.sales_rep_name && (
                        <Box pt={2} borderTop="1px solid" borderColor="gray.100">
                          <Text fontSize="xs" color="gray.500">
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

        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
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