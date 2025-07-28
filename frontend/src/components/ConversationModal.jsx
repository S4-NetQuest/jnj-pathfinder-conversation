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
  Box,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const ConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
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

  // Function to get user-friendly error message
  const getUserFriendlyErrorMessage = (error) => {
    // If the error is from validation, it's already user-friendly
    if (error.response?.data?.error) {
      const errorMessage = error.response.data.error

      // Check if it's a validation error (these are already user-friendly)
      if (errorMessage.includes('required') ||
          errorMessage.includes('must be') ||
          errorMessage.includes('cannot be') ||
          errorMessage.includes('select a valid') ||
          errorMessage.includes('Please')) {
        return errorMessage
      }
    }

    // Handle network and other errors with user-friendly messages
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }

    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return 'The server is currently unavailable. Please try again in a few moments.'
    }

    if (error.response?.status === 500) {
      return 'A server error occurred. Please try again or contact support if the problem persists.'
    }

    if (error.response?.status === 401) {
      return 'Your session has expired. Please refresh the page and log in again.'
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.'
    }

    if (error.response?.status === 400) {
      return 'Please check your input and try again.'
    }

    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.'
    }

    // Default user-friendly message
    return 'An unexpected error occurred. Please try again or contact support if the problem continues.'
  }

  const handleSubmit = async () => {
    console.log('=== CONVERSATION CREATION DEBUG START ===')
    console.log('User:', user)
    console.log('Form Data:', formData)

    // Basic client-side validation for better UX
    const clientValidationErrors = []
    if (!formData.surgeon_name.trim()) {
      clientValidationErrors.push('Surgeon name is required')
    }
    if (!formData.hospital_name.trim()) {
      clientValidationErrors.push('Hospital name is required')
    }
    if (!formData.surgery_center_name.trim()) {
      clientValidationErrors.push('Surgery Center name is required')
    }
    if (!formData.surgeon_volume_per_year) {
      clientValidationErrors.push('Please select surgeon volume per year')
    }
    if (!formData.uses_robotics) {
      clientValidationErrors.push('Please select whether the surgeon uses robotics')
    }
    if (!formData.current_alignment) {
      clientValidationErrors.push('Please select current alignment approach')
    }
    if (!formData.conversation_date) {
      clientValidationErrors.push('Conversation date is required')
    }

    if (clientValidationErrors.length > 0) {
      console.log('Client validation errors:', clientValidationErrors)
      toast({
        title: 'Please Complete All Fields',
        description: clientValidationErrors[0], // Show the first error
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      /*
      console.log('Making API request to /api/conversations')
      console.log('Request payload:', formData)
      */
      const response = await api.post('/conversations', formData)

      /*
      console.log('API Response received:', response)
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)
      */
      if (response.data.success) {
        toast({
          title: 'Success!',
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
      console.error('=== END ERROR DETAILS ===')

      const userFriendlyMessage = getUserFriendlyErrorMessage(error)

      toast({
        title: 'Unable to Create Conversation',
        description: userFriendlyMessage,
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
    // Reset form when closing
    setFormData({
      surgeon_name: user?.role === 'surgeon' ? user.name || '' : '',
      hospital_name: '',
      surgery_center_name: '',
      surgeon_volume_per_year: '',
      uses_robotics: '',
      current_alignment: '',
      conversation_date: new Date().toISOString().split('T')[0]
    })
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
          <Text color="#eb1700" fontSize="lg" fontWeight="500">
            Create New Conversation
          </Text>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
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
                Current Alignment Philosophy
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
                <option value="MA">MA (Mechanical Alignment)</option>
                <option value="Unknown">unknown</option>
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
              <Text fontSize="xs" color="#6e6259" mt={1}>
                You can schedule conversations for future dates
              </Text>
            </FormControl>

            {/* User Info for development only */}
            {process.env.NODE_ENV === 'development' && (
              <Box p={3} bg="#f1efed" borderRadius="md" fontSize="xs">
                <Text fontWeight="bold" color="#312c2a">Development Info:</Text>
                <Text color="#6e6259">Role: {user?.role}</Text>
                <Text color="#6e6259">Name: {user?.name}</Text>
                <Text color="#6e6259">ID: {user?.id}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="#e8e6e3">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
            isDisabled={loading}
            borderColor="#d5cfc9"
            color="#312c2a"
            _hover={{ borderColor: "#cbc4bc", bg: "#f1efed" }}
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