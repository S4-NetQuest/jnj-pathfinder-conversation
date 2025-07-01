import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  HStack,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const ConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [formData, setFormData] = useState({
    surgeon_name: user?.role === 'surgeon' ? user.name || '' : '',
    hospital_name: '',
    surgery_center_name: '',
    surgeon_volume_per_year: '',
    uses_robotics: '',
    current_alignment: '',
    conversation_date: new Date().toISOString().split('T')[0] // Today's date
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    console.log('=== CONVERSATION CREATION DEBUG START ===')
    console.log('User:', user)
    console.log('Form Data:', formData)

    // Clear previous debug info
    setDebugInfo(null)

    // Validation
    const validationErrors = []
    if (!formData.surgeon_name.trim()) {
      validationErrors.push('Surgeon name is required')
    }
    if (!formData.hospital_name.trim()) {
      validationErrors.push('Hospital name is required')
    }
    if (!formData.surgery_center_name.trim()) {
      validationErrors.push('Surgery Center name is required')
    }
    if (!formData.surgeon_volume_per_year) {
      validationErrors.push('Surgeon knee arthroplasty volume per year is required')
    }
    if (!formData.uses_robotics) {
      validationErrors.push('Robotics usage information is required')
    }
    if (!formData.current_alignment) {
      validationErrors.push('Current alignment approach is required')
    }
    if (!formData.conversation_date) {
      validationErrors.push('Conversation date is required')
    }

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors)
      setDebugInfo({ type: 'validation', errors: validationErrors })
      toast({
        title: 'Validation Error',
        description: validationErrors.join(', '),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    setDebugInfo({ type: 'loading', message: 'Starting request...' })

    try {
      console.log('Making API request to /api/conversations')
      console.log('Request payload:', formData)

      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      })

      const apiPromise = api.post('/conversations', formData)

      const response = await Promise.race([apiPromise, timeoutPromise])

      console.log('API Response received:', response)
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)

      setDebugInfo({ type: 'response', data: response.data })

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Conversation created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Reset form
        setFormData({
          surgeon_name: user?.role === 'surgeon' ? user.name || '' : '',
          hospital_name: '',
          surgery_center_name: '',
          surgeon_volume_per_year: '',
          uses_robotics: '',
          current_alignment: '',
          conversation_date: new Date().toISOString().split('T')[0]
        })

        // Call the callback with the new conversation ID
        console.log('Calling onConversationCreated with ID:', response.data.conversation.id)
        onConversationCreated(response.data.conversation.id)
      } else {
        throw new Error(`API returned success: false - ${response.data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('=== ERROR DETAILS ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error response status:', error.response?.status)
      console.error('Error response headers:', error.response?.headers)
      console.error('=== END ERROR DETAILS ===')

      const errorMessage = error.response?.data?.error || error.message || 'Failed to create conversation'

      setDebugInfo({
        type: 'error',
        error: errorMessage,
        status: error.response?.status,
        fullError: error
      })

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      console.log('=== CONVERSATION CREATION DEBUG END ===')
    }
  }

  const handleClose = () => {
    // Reset form and debug info when closing
    setFormData({
      surgeon_name: user?.role === 'surgeon' ? user.name || '' : '',
      hospital_name: '',
      surgery_center_name: '',
      surgeon_volume_per_year: '',
      uses_robotics: '',
      current_alignment: '',
      conversation_date: new Date().toISOString().split('T')[0]
    })
    setDebugInfo(null)
    onClose()
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Authentication Required</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error">
              <AlertIcon />
              You must be logged in to create a conversation.
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
      size={{ base: 'full', md: 'lg' }}
      closeOnOverlayClick={!loading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="#f1efed" borderBottom="1px solid" borderColor="#e8e6e3">
          <Text color="#eb1700" fontSize="lg" fontWeight="bold">
            Create New Conversation
          </Text>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <Alert status={debugInfo.type === 'error' ? 'error' : 'info'} fontSize="sm">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Debug Info:</Text>
                  <Text>{JSON.stringify(debugInfo, null, 2)}</Text>
                </VStack>
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                {user?.role === 'surgeon' ? 'Your Name' : 'Surgeon Name(s)'}
              </FormLabel>
              <Input
                value={formData.surgeon_name}
                onChange={(e) => handleInputChange('surgeon_name', e.target.value)}
                placeholder={user?.role === 'surgeon' ? 'Your name' : 'Enter Surgeon name'}
                focusBorderColor="#eb1700"
                bg="white"
                isReadOnly={user?.role === 'surgeon'}
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Affiliated Hospital
              </FormLabel>
              <Input
                value={formData.hospital_name}
                onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                placeholder="Enter Hospital name"
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Affiliated Surgery Center
              </FormLabel>
              <Input
                value={formData.surgery_center_name}
                onChange={(e) => handleInputChange('surgery_center_name', e.target.value)}
                placeholder="Enter Surgery Center name"
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Surgeon Knee Arthroplasty Volume / Year
              </FormLabel>
              <Select
                value={formData.surgeon_volume_per_year}
                onChange={(e) => handleInputChange('surgeon_volume_per_year', e.target.value)}
                placeholder="Select volume range"
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={loading}
              >
                <option value="< 50">&lt; 50</option>
                <option value="< 100">&lt; 100</option>
                <option value="< 200">&lt; 200</option>
                <option value="> 200">&gt; 200</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Is the surgeon currently using robotics?
              </FormLabel>
              <RadioGroup
                value={formData.uses_robotics}
                onChange={(value) => handleInputChange('uses_robotics', value)}
                isDisabled={loading}
              >
                <HStack spacing={6}>
                  <Radio value="true" colorScheme="red">
                    Yes
                  </Radio>
                  <Radio value="false" colorScheme="red">
                    No
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Current Alignment
              </FormLabel>
              <Select
                value={formData.current_alignment}
                onChange={(e) => handleInputChange('current_alignment', e.target.value)}
                placeholder="Select current alignment approach"
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={loading}
              >
                <option value="KA">KA (Kinematic Alignment)</option>
                <option value="iKA">iKA (Inverse Kinematic Alignment)</option>
                <option value="FA">FA (Functional Alignment)</option>
                <option value="MA">MA (Manual Alignment)</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Conversation Date
              </FormLabel>
              <Input
                type="date"
                value={formData.conversation_date}
                onChange={(e) => handleInputChange('conversation_date', e.target.value)}
                focusBorderColor="#eb1700"
                bg="white"
                isDisabled={loading}
              />
            </FormControl>

            {/* User Info Debug (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <Alert status="info" fontSize="xs">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Current User:</Text>
                  <Text>Role: {user?.role}</Text>
                  <Text>Name: {user?.name}</Text>
                  <Text>ID: {user?.id}</Text>
                </VStack>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="#e8e6e3">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            bg="#eb1700"
            color="white"
            _hover={{ bg: "#9e0000" }}
            _active={{ bg: "#9e0000" }}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
            isDisabled={loading}
          >
            Create Conversation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConversationModal