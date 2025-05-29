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
} from '@chakra-ui/react'
import { SearchIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const LoadConversationModal = ({ isOpen, onClose, onConversationSelect }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState(null)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('jj.gray.50', 'gray.700')

  useEffect(() => {
    if (isOpen && user?.role === 'sales_rep') {
      fetchConversations()
    }
  }, [isOpen, user])

  useEffect(() => {
    filterConversations()
  }, [conversations, searchQuery, statusFilter])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/conversations')
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
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
        conv.surgeon_name.toLowerCase().includes(query) ||
        conv.hospital_name?.toLowerCase().includes(query) ||
        conv.recommended_approach?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.conversation_date) - new Date(a.conversation_date))

    setFilteredConversations(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
        return 'jj.blue.300'
      case 'adjusted':
        return 'jj.green.300'
      case 'restrictive':
        return 'jj.orange.300'
      case 'kinematic':
        return 'jj.red'
      default:
        return 'gray.400'
    }
  }

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleLoadConversation = () => {
    if (selectedConversation) {
      onConversationSelect(selectedConversation.id)
    }
  }

  const handleClose = () => {
    setSelectedConversation(null)
    setSearchQuery('')
    setStatusFilter('all')
    onClose()
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
        <ModalHeader bg="jj.gray.50" borderBottom="1px solid" borderColor="jj.gray.200">
          <HStack spacing={3}>
            <Icon as={CalendarIcon} color="jj.blue.300" />
            <Text color="jj.red" fontSize="lg" fontWeight="bold">
              Load Existing Conversation
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          {!user || user.role !== 'sales_rep' ? (
            <Box p={6}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  You must be logged in as a sales representative to access conversations.
                </Text>
              </Alert>
            </Box>
          ) : (
            <>
              {/* Filters */}
              <Box p={4} borderBottom="1px solid" borderColor="jj.gray.200">
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="jj.gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by surgeon name, hospital, or recommendation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      focusBorderColor="jj.red"
                    />
                  </InputGroup>
                  
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    focusBorderColor="jj.red"
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
                      <Spinner size="lg" color="jj.red" />
                      <Text color="jj.gray.600">Loading conversations...</Text>
                    </VStack>
                  </Center>
                ) : filteredConversations.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Text color="jj.gray.500" textAlign="center">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'No conversations match your search criteria.' 
                          : 'No conversations found. Create your first conversation to get started.'}
                      </Text>
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
                        borderColor={selectedConversation?.id === conversation.id ? 'jj.red' : 'jj.gray.200'}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          bg: hoverBg,
                          borderColor: 'jj.red',
                          shadow: 'md'
                        }}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <VStack align="stretch" spacing={3}>
                          {/* Header */}
                          <Flex justify="space-between" align="start">
                            <Box flex={1}>
                              <Text fontWeight="bold" fontSize="lg" color="jj.gray.700" mb={1}>
                                {conversation.surgeon_name}
                              </Text>
                              <Text fontSize="sm" color="jj.gray.600">
                                {conversation.hospital_name}
                              </Text>
                            </Box>
                            <Badge colorScheme={getStatusColor(conversation.status)} variant="subtle">
                              {conversation.status.replace('_', ' ')}
                            </Badge>
                          </Flex>

                          {/* Details */}
                          <HStack spacing={4} fontSize="sm" color="jj.gray.600">
                            <HStack spacing={1}>
                              <Icon as={CalendarIcon} boxSize={3} />
                              <Text>{formatDate(conversation.conversation_date)}</Text>
                            </HStack>
                            {conversation.created_at !== conversation.updated_at && (
                              <HStack spacing={1}>
                                <Icon as={TimeIcon} boxSize={3} />
                                <Text>Updated {formatDate(conversation.updated_at)}</Text>
                              </HStack>
                            )}
                          </HStack>

                          {/* Recommendation */}
                          {conversation.recommended_approach && (
                            <Flex align="center" justify="space-between">
                              <Text fontSize="sm" color="jj.gray.600">
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
                              <Text fontSize="xs" color="jj.gray.500" mb={2}>
                                Alignment Scores:
                              </Text>
                              <HStack spacing={3} fontSize="xs">
                                <Text>
                                  <Text as="span" fontWeight="medium">M:</Text> {conversation.alignment_score_mechanical || 0}
                                </Text>
                                <Text>
                                  <Text as="span" fontWeight="medium">A:</Text> {conversation.alignment_score_adjusted || 0}
                                </Text>
                                <Text>
                                  <Text as="span" fontWeight="medium">R:</Text> {conversation.alignment_score_restrictive || 0}
                                </Text>
                                <Text>
                                  <Text as="span" fontWeight="medium">K:</Text> {conversation.alignment_score_kinematic || 0}
                                </Text>
                              </HStack>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="jj.gray.200">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
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
                          