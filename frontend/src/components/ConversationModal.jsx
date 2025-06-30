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
    hospital_size: '',
    surgery_center_name: '',
    conversation_date: new Date().toISOString().split('T')[0] // Today's date
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.surgeon_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Surgeon name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!formData.hospital_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Hospital name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!formData.hospital_size) {
      toast({
        title: 'Validation Error',
        description: 'Hospital size is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!formData.surgery_center_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Affiliated Ambulatory Surgery Center name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      // Don't include sales_rep_id in the request - it comes from the authenticated user
      const response = await api.post('/conversations', formData)

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
          hospital_size: '',
          surgery_center_name: '',
          conversation_date: new Date().toISOString().split('T')[0]
        })

        // Call the callback with the new conversation ID
        onConversationCreated(response.data.conversation.id)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create conversation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      surgeon_name: user?.role === 'surgeon' ? user.name || '' : '',
      hospital_name: '',
      hospital_size: '',
      surgery_center_name: '',
      conversation_date: new Date().toISOString().split('T')[0]
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'lg' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="#f1efed" borderBottom="1px solid" borderColor="#e8e6e3">
          <Text color="#eb1700" fontSize="lg" fontWeight="bold">
            Create New Conversation
          </Text>
        </ModalHeader>
        <ModalCloseButton />

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
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Affiliated Ambulatory Surgery Center (ASC)
              </FormLabel>
              <Input
                value={formData.surgery_center_name}
                onChange={(e) => handleInputChange('surgery_center_name', e.target.value)}
                placeholder="Enter Ambulatory Surgery Center name"
                focusBorderColor="#eb1700"
                bg="white"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="#312c2a">
                Hospital Size
              </FormLabel>
              <Select
                value={formData.hospital_size}
                onChange={(e) => handleInputChange('hospital_size', e.target.value)}
                placeholder="Select hospital size"
                focusBorderColor="#eb1700"
                bg="white"
              >
                <option value="small">Small (&lt; 200 beds)</option>
                <option value="medium">Medium (200-400 beds)</option>
                <option value="large">Large (400-600 beds)</option>
                <option value="academic">Academic Medical Center (&gt; 600 beds)</option>
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
              />
            </FormControl>
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
          >
            Create Conversation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConversationModal