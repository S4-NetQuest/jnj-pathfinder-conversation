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
  FormControl,
  FormLabel,
  IconButton,
  Collapse,
  Divider,
} from '@chakra-ui/react'
import {
  SearchIcon,
  CalendarIcon,
  TimeIcon,
  EditIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { getPhilosophyColor, getPhilosophyVariant } from '../theme/theme'
import questionsData from '../data/questions.json'

const LoadConversationModal = ({ isOpen, onClose, onConversationSelected }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Edit state
  const [editingCard, setEditingCard] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  const cardBg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const editBg = useColorModeValue('#f8f9fa', 'gray.700')

  // Volume options for dropdown
  const volumeOptions = ['< 50', '< 100', '< 200', '> 200']

  // Alignment options for dropdown
  const alignmentOptions = [
    { value: 'KA', label: 'KA - Kinematic Alignment' },
    { value: 'iKA', label: 'iKA - Inverse Kinematic Alignment' },
    { value: 'FA', label: 'FA - Functional Alignment' },
    { value: 'MA', label: 'MA - Mechanical Alignment' },
    { value: 'UNKNOWN', label: 'Unknown' }
  ]

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
    }
  }, [isOpen, user])

  useEffect(() => {
    filterConversations()
  }, [conversations, searchQuery, statusFilter])

  // Helper function to calculate max possible score for an alignment
  const calculateMaxPossibleScore = (alignmentKey) => {
    return questionsData.questions.reduce((total, question) => {
      const maxForQuestion = Math.max(...question.options.map(opt => opt.scores[alignmentKey]))
      return total + maxForQuestion
    }, 0)
  }

  // Helper function to calculate percentage
  const calculatePercentage = (score, alignmentKey) => {
    const maxScore = calculateMaxPossibleScore(alignmentKey)
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

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

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      return ''
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

  const getAlignmentDisplayName = (alignment) => {
    switch (alignment) {
      case 'KA':
        return 'Kinematic Alignment'
      case 'iKA':
        return 'Inverse Kinematic Alignment'
      case 'FA':
        return 'Functional Alignment'
      case 'MA':
        return 'Mechanical Alignment'
      default:
        return alignment
    }
  }

  const formatRoboticsUsage = (usesRobotics) => {
    if (usesRobotics === true || usesRobotics === 'true') return 'Yes'
    if (usesRobotics === false || usesRobotics === 'false') return 'No'
    return 'Unknown'
  }

  // Edit functions
  const handleEditClick = (conversation) => {
    setEditingCard(conversation.id)
    // Initialize data for all editable fields
    setEditData({
      surgeon_name: conversation.surgeon_name || '',
      hospital_name: conversation.hospital_name || '',
      surgery_center_name: conversation.surgery_center_name || '',
      conversation_date: formatDateForInput(conversation.conversation_date),
      surgeon_volume_per_year: conversation.surgeon_volume_per_year || '',
      uses_robotics: conversation.uses_robotics ? 'true' : 'false',
      current_alignment: conversation.current_alignment || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingCard(null)
    setEditData({})
  }

  const handleSaveEdit = async (conversationId) => {
    setSaving(true)
    try {
      // Prepare update data with proper formatting
      // Note: hospital_name and surgery_center_name updates would require backend changes
      // since they're stored as foreign keys. For now, we'll include them and let the backend
      // handle them appropriately (they may be ignored or cause an error)
      const updateData = {
        surgeon_name: editData.surgeon_name?.trim(),
        hospital_name: editData.hospital_name?.trim(),
        surgery_center_name: editData.surgery_center_name?.trim(),
        conversation_date: editData.conversation_date || null,
        surgeon_volume_per_year: editData.surgeon_volume_per_year || null,
        uses_robotics: editData.uses_robotics === 'true' ? true : false,
        current_alignment: editData.current_alignment || null
      }

      // Remove empty/null values to avoid validation issues
      const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      console.log('=== FRONTEND SAVE DEBUG ===')
      console.log('Conversation ID:', conversationId)
      console.log('Raw edit data:', editData)
      console.log('Prepared update data:', updateData)
      console.log('Cleaned data being sent:', cleanedData)
      console.log('API URL:', `/conversations/${conversationId}`)
      console.log('============================')

      // Make the API call
      console.log('Making API call...')
      const response = await api.put(`/conversations/${conversationId}`, cleanedData)
      console.log('API call successful:', response.data)

      if (response.data.success) {
        toast({
          title: 'Conversation Updated',
          description: 'Changes saved successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Refresh conversations list
        await fetchConversations()

        // Exit edit mode
        setEditingCard(null)
        setEditData({})
      }
    } catch (error) {
      console.log('=== FRONTEND ERROR DEBUG ===')
      console.error('Full error object:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error response:', error.response)

      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response statusText:', error.response.statusText)
        console.error('Response data:', error.response.data)
        console.error('Response headers:', error.response.headers)
      }

      if (error.request) {
        console.error('Request config:', error.config)
        console.error('Request object:', error.request)
      }
      console.log('=============================')

      let errorMessage = 'Failed to save changes'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: 'Error Saving Changes',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLoadConversation = (conversationId) => {
    if (onConversationSelected) {
      onConversationSelected(conversationId)
      handleClose()
    }
  }

  const handleClose = () => {
    setEditingCard(null)
    setEditData({})
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
      size={{ base: 'full', md: 'xl', lg: '2xl' }}
      scrollBehavior="inside"
      closeOnOverlayClick={editingCard === null} // Prevent closing when editing
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="#f1efed" borderBottom="1px solid" borderColor="#e8e6e3">
          <HStack spacing={3}>
            <Icon as={CalendarIcon} color="#eb1700" />
            <Text color="#eb1700" fontSize="lg" fontWeight="500">
              Load Existing Conversation
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={editingCard !== null} />

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
                  isDisabled={editingCard !== null}
                />
              </InputGroup>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={editingCard !== null}
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
                    bg={editingCard === conversation.id ? editBg : cardBg}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={editingCard === conversation.id ? '#eb1700' : '#e8e6e3'}
                    transition="all 0.2s"
                    opacity={editingCard !== null && editingCard !== conversation.id ? 0.5 : 1}
                    _hover={editingCard === null ? {
                      bg: hoverBg,
                      borderColor: '#eb1700',
                      shadow: 'md'
                    } : {}}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Header with Status Badge */}
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          {editingCard === conversation.id ? (
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Surgeon Name</FormLabel>
                              <Input
                                value={editData.surgeon_name}
                                onChange={(e) => setEditData(prev => ({ ...prev, surgeon_name: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              />
                            </FormControl>
                          ) : (
                            <Text fontWeight="500" fontSize="lg" color="#312c2a" mb={1}>
                              {conversation.surgeon_name || 'Unknown Surgeon'}
                            </Text>
                          )}
                        </Box>
                        <Badge colorScheme={getStatusColor(conversation.status)} variant="subtle" fontWeight={500} fontSize="xs">
                          {(conversation.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </Flex>

                      {/* Hospital and Surgery Center Information */}
                      <VStack align="start" spacing={2}>
                        {editingCard === conversation.id ? (
                          <>
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Hospital</FormLabel>
                              <Input
                                value={editData.hospital_name}
                                onChange={(e) => setEditData(prev => ({ ...prev, hospital_name: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Surgery Center</FormLabel>
                              <Input
                                value={editData.surgery_center_name}
                                onChange={(e) => setEditData(prev => ({ ...prev, surgery_center_name: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Conversation Date</FormLabel>
                              <Input
                                type="date"
                                value={editData.conversation_date}
                                onChange={(e) => setEditData(prev => ({ ...prev, conversation_date: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              />
                            </FormControl>
                          </>
                        ) : (
                          <>
                            <Text fontSize="sm" color="#6e6259" fontWeight="medium">
                              Hospital: {conversation.hospital_name || 'Unknown Hospital'}
                            </Text>
                            <Text fontSize="sm" color="#6e6259">
                              Surgery Center: {conversation.surgery_center_name || 'Unknown Surgery Center'}
                            </Text>
                          </>
                        )}

                        {/* Only show conversation date editor in edit mode */}
                        {editingCard !== conversation.id && (
                          <></>
                        )}
                      </VStack>

                      {/* Date and Time Info */}
                      {editingCard !== conversation.id && (
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
                      )}

                      {/* Surgeon Information */}
                      <VStack align="stretch" spacing={2}>
                        {editingCard === conversation.id ? (
                          <HStack spacing={3}>
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Volume/Year</FormLabel>
                              <Select
                                value={editData.surgeon_volume_per_year}
                                onChange={(e) => setEditData(prev => ({ ...prev, surgeon_volume_per_year: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              >
                                <option value="">Select volume...</option>
                                {volumeOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color="#6e6259">Uses Robotics</FormLabel>
                              <Select
                                value={editData.uses_robotics}
                                onChange={(e) => setEditData(prev => ({ ...prev, uses_robotics: e.target.value }))}
                                focusBorderColor="#eb1700"
                                size="sm"
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </Select>
                            </FormControl>
                          </HStack>
                        ) : (
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
                        )}

                        {/* Current Alignment */}
                        {editingCard === conversation.id ? (
                          <FormControl>
                            <FormLabel fontSize="sm" color="#6e6259">Current Alignment Philosophy</FormLabel>
                            <Select
                              value={editData.current_alignment}
                              onChange={(e) => setEditData(prev => ({ ...prev, current_alignment: e.target.value }))}
                              focusBorderColor="#eb1700"
                              size="sm"
                            >
                              <option value="">Select alignment...</option>
                              {alignmentOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </Select>
                          </FormControl>
                        ) : conversation.current_alignment && (
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="#6e6259">Current Alignment Philosophy:</Text>
                            <Badge
                              variant={getPhilosophyVariant(conversation.current_alignment)}
                              size="sm"
                              px={2}
                              py={0}
                              fontWeight={500}
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
                      {editingCard !== conversation.id && conversation.recommended_approach && (
                        <Flex align="center" justify="space-between">
                          <Text fontSize="sm" color="#6e6259">
                            Recommended Approach:
                          </Text>
                          <HStack spacing={2}>
                            <Badge
                              variant={getPhilosophyVariant(conversation.recommended_approach)}
                              color="white"
                              px={2}
                              py={0}
                              borderRadius="xs"
                              fontSize="xs"
                              fontWeight={500}
                            >
                              {conversation.recommended_approach}
                            </Badge>
                            <Text fontSize="xs" color="#a39992">
                              ({getAlignmentDisplayName(conversation.recommended_approach)})
                            </Text>
                          </HStack>
                        </Flex>
                      )}

                      {/* Scores Preview */}
                      {editingCard !== conversation.id && conversation.status === 'completed' && (
                        <Box>
                          <Text fontSize="xs" color="#a39992" mb={2}>
                            Alignment Scores:
                          </Text>
                          <HStack spacing={3} fontSize="xs" color="#6e6259">
                            <Text>
                              <Text as="span" fontWeight="medium" color={getPhilosophyColor("ka")}>KA:</Text> {calculatePercentage(conversation.alignment_score_ka || 0, 'ka')}%
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color={getPhilosophyColor("ika")}>iKA:</Text> {calculatePercentage(conversation.alignment_score_ika || 0, 'ika')}%
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color={getPhilosophyColor("fa")}>FA:</Text> {calculatePercentage(conversation.alignment_score_fa || 0, 'fa')}%
                            </Text>
                            <Text>
                              <Text as="span" fontWeight="medium" color={getPhilosophyColor("ma")}>MA:</Text> {calculatePercentage(conversation.alignment_score_ma || 0, 'ma')}%
                            </Text>
                          </HStack>
                        </Box>
                      )}

                      {/* Sales Rep Info (for surgeons viewing conversations) */}
                      {editingCard !== conversation.id && user.role === 'surgeon' && conversation.sales_rep_name && (
                        <Box pt={2} borderTop="1px solid" borderColor="#f1efed">
                          <Text fontSize="xs" color="#a39992">
                            Sales Representative: <Text as="span" fontWeight="medium">{conversation.sales_rep_name}</Text>
                          </Text>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Divider />
                      <HStack justify="flex-end" spacing={2}>
                        {editingCard === conversation.id ? (
                          // Edit mode buttons
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              isDisabled={saving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              bg="#eb1700"
                              color="white"
                              _hover={{ bg: "#9e0000" }}
                              onClick={() => handleSaveEdit(conversation.id)}
                              isLoading={saving}
                              loadingText="Saving..."
                              leftIcon={<CheckIcon />}
                            >
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          // Display mode buttons
                          <>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<EditIcon />}
                              onClick={() => handleEditClick(conversation)}
                              isDisabled={editingCard !== null}
                              aria-label="Edit conversation"
                            />
                            <Button
                              size="sm"
                              bg="#eb1700"
                              color="white"
                              _hover={{ bg: "#9e0000" }}
                              onClick={() => handleLoadConversation(conversation.id)}
                              isDisabled={editingCard !== null}
                              leftIcon={<ExternalLinkIcon />}
                            >
                              Load Conversation
                            </Button>
                          </>
                        )}
                      </HStack>
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
            onClick={handleClose}
            isDisabled={editingCard !== null}
          >
            {editingCard !== null ? 'Complete editing to close' : 'Close'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LoadConversationModal